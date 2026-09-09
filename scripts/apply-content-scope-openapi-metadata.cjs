#!/usr/bin/env node
/**
 * Add machine-readable content scope metadata to the OpenAPI source documents.
 *
 * SDK operation catalogs are generated from these documents, so the scope an operation needs has
 * to live here rather than in a rendered page. Each covered operation gains an `x-qf-scopes`
 * extension recording the legacy alternatives, the single granular successor, and the quota
 * policy that stays unchanged.
 *
 * Why an extension rather than `security`:
 *
 * These endpoints authenticate with the `x-auth-token` and `x-client-id` headers, modelled as two
 * `apiKey` schemes in one security requirement object -- which is correct, because both headers
 * are *jointly* required. OpenAPI can only attach scopes to an `oauth2` or `openIdConnect` scheme,
 * so an apiKey scheme has nowhere to put them. The options were to relabel the transport as OAuth2
 * bearer auth (false: the headers are not `Authorization: Bearer`), to add a second requirement
 * object (wrong: entries in the `security` array are *alternatives*, so that would advertise a way
 * to call the endpoint without the headers), or to carry the scopes in a documented extension.
 * This takes the third option and leaves `security` exactly as it was.
 *
 * Run:
 *   node scripts/apply-content-scope-openapi-metadata.cjs
 *   node scripts/apply-content-scope-openapi-metadata.cjs --check     (CI: fails when stale)
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const repoRoot = path.join(__dirname, '..');
const contractDir = path.join(repoRoot, 'contracts', 'content-scopes');
const contractPath = path.join(contractDir, 'v1.json');
const openApiPath = path.join(repoRoot, 'openAPI', 'content', 'v4.json');

const EXTENSION = 'x-qf-scopes';

const normalizeEol = (text) => text.split('\r\n').join('\n');
const sha256 = (text) => crypto.createHash('sha256').update(normalizeEol(text)).digest('hex');

const contractRaw = normalizeEol(fs.readFileSync(contractPath, 'utf8'));
const contract = JSON.parse(contractRaw);
const contractHash = sha256(contractRaw);

/**
 * Build the extension payload for one operation.
 *
 * @param {object} operation - contract operation entry.
 * @returns {object} extension value.
 */
const extensionFor = (operation) => ({
  contractVersion: contract.contractVersion,
  contractSha256: contractHash,
  contractStatus: contract.status,
  routeId: operation.routeId,
  service: operation.service,
  // Any ONE of these authorizes the call. Legacy first: an existing token keeps working.
  anyOf: [...operation.legacyAnyOf, ...operation.granularAnyOf],
  legacyAnyOf: operation.legacyAnyOf,
  granularAnyOf: operation.granularAnyOf,
  // Deprecated for newly issued clients; still valid for existing identities. No sunset date.
  deprecatedForNewClients: operation.deprecatedForNewClients,
  // Rate limiting is unchanged by the split and is deliberately not derived from `anyOf`.
  quotaBuckets: operation.quotaBuckets,
  rateLimitPolicyId: operation.rateLimitPolicyId,
  responseBoundary: operation.responseBoundary,
  transport: {
    note: 'Both headers are required together. These are not OAuth2 bearer credentials.',
    headers: ['x-auth-token', 'x-client-id'],
  },
});

const apply = () => {
  const raw = normalizeEol(fs.readFileSync(openApiPath, 'utf8'));
  const document = JSON.parse(raw);
  const errors = [];

  const byPath = new Map();
  for (const operation of contract.operations) {
    byPath.set(`${operation.method} ${operation.openApiPath}`, operation);
  }

  let applied = 0;
  for (const [pathKey, pathItem] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation !== 'object' || operation === null) continue;
      if (!operation.operationId) continue;

      const contractOperation = byPath.get(`${method.toUpperCase()} ${pathKey}`);
      if (!contractOperation) {
        errors.push(`${method.toUpperCase()} ${pathKey} is not covered by the contract`);
        continue;
      }
      if (contractOperation.operationId !== operation.operationId) {
        errors.push(
          `${method.toUpperCase()} ${pathKey}: operationId drift, contract says ` +
            `${contractOperation.operationId} but the document says ${operation.operationId}`,
        );
        continue;
      }

      operation[EXTENSION] = extensionFor(contractOperation);
      applied += 1;
    }
  }

  if (applied !== contract.operations.length) {
    errors.push(
      `applied metadata to ${applied} operations but the contract holds ${contract.operations.length}`,
    );
  }

  // Guard the two things that would break clients if this script ever got them wrong.
  for (const [pathKey, pathItem] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation !== 'object' || operation === null) continue;
      const security = operation.security ?? document.security;
      if (!Array.isArray(security)) continue;
      for (const requirement of security) {
        if (Object.keys(requirement).length === 0) {
          errors.push(
            `${method.toUpperCase()} ${pathKey}: an empty security alternative would advertise ` +
              'unauthenticated access',
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`OpenAPI metadata failed:\n  - ${errors.join('\n  - ')}`);
  }

  return { document, applied };
};

const main = () => {
  const checkOnly = process.argv.includes('--check');
  const { document, applied } = apply();
  const next = `${JSON.stringify(document, null, 2)}\n`;

  if (checkOnly) {
    const current = normalizeEol(fs.readFileSync(openApiPath, 'utf8'));
    if (current !== next) {
      console.error(
        'openAPI/content/v4.json is missing or has stale content scope metadata.\n' +
          'Run: node scripts/apply-content-scope-openapi-metadata.cjs',
      );
      process.exit(1);
    }
    console.log(`content scope OpenAPI metadata up to date (${applied} operations)`);
    return;
  }

  fs.writeFileSync(openApiPath, next);
  console.log(
    `wrote openAPI/content/v4.json (${applied} operations, contract ${contractHash.slice(0, 12)})`,
  );
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { apply, EXTENSION, contractHash };
