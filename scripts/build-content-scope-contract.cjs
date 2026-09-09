#!/usr/bin/env node
/**
 * Build the pinned content-scopes contract from the immutable spreadsheet snapshot
 * plus the reviewed policy inputs.
 *
 * Inputs (both committed, both hashed into the output):
 *   contracts/content-scopes/source/QF_API_Endpoints.snapshot.csv
 *   contracts/content-scopes/policy.json
 *
 * Outputs:
 *   contracts/content-scopes/v1.json                 the contract consumers pin
 *   contracts/content-scopes/provenance.json         all 208 rows, mapped or explicitly not
 *
 * Nothing here reads a live spreadsheet, and nothing here decides policy: policy.json
 * carries the owner decisions and the observed gateway behavior, each with its source.
 *
 * Usage:
 *   node scripts/build-content-scope-contract.cjs [--check]
 *
 * --check re-generates in memory and fails if the committed artifacts differ, which is
 * what CI runs so a stale contract or an edited-by-hand contract cannot merge.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const repoRoot = path.join(__dirname, '..');
const contractDir = path.join(repoRoot, 'contracts', 'content-scopes');
const snapshotPath = path.join(contractDir, 'source', 'QF_API_Endpoints.snapshot.csv');
const policyPath = path.join(contractDir, 'policy.json');
const contractPath = path.join(contractDir, 'v1.json');
const provenancePath = path.join(contractDir, 'provenance.json');
// Canonical hash consumers pin. Every consumer repository vendors the contract and records this
// value; CI in each consumer fails when its recorded hash drifts from the contract it ships.
const hashPath = path.join(contractDir, 'v1.sha256');

const CONTENT_FAMILY = 'Content APIs (v4)';
const CONTENT_UPSTREAM_PREFIX = '/api/v4';
const REFLECT_SHEET_PREFIX = '/quran-reflect/';

/**
 * Normalize line endings before hashing or parsing.
 *
 * The repository is checked out with core.autocrlf on some platforms, so the same committed
 * blob can reach disk as LF or CRLF. The contract pins the sha256 of its inputs and consumers
 * pin the contract hash, so hashing raw bytes would make those hashes platform-dependent and
 * break `contract:check` on a fresh Windows checkout. .gitattributes also pins these paths to
 * eol=lf; this keeps the hash correct even in a tree that predates that.
 */
const normalizeEol = (text) => text.split('\r\n').join('\n');

const sha256 = (value) => crypto.createHash('sha256').update(normalizeEol(value)).digest('hex');

/**
 * policy.json carries `$comment` keys so every policy input can cite its owner decision or
 * source file inline. They are documentation, never data: strip them before use so a comment
 * can never be mistaken for a scope label, a scope name or a route.
 */
const withoutComments = (object) =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !key.startsWith('$')));

/** Minimal RFC 4180 CSV parser: the snapshot is committed, so this only needs to be correct. */
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body
    .filter((cells) => cells.some((cell) => cell !== ''))
    .map((cells) => Object.fromEntries(header.map((key, idx) => [key, cells[idx] ?? ''])));
};

/** `{reciter_id}` -> `:reciter_id`, matching the gateway's dynamic-segment spelling. */
const toGatewayTemplate = (openApiPath) => openApiPath.replace(/\{([^}]+)\}/gu, ':$1');

/** Path parameter names, in order, so aliases can be compared on shape rather than spelling. */
const pathParams = (openApiPath) =>
  [...openApiPath.matchAll(/\{([^}]+)\}/gu)].map((match) => match[1]);

const resolveService = (sheetPath) =>
  sheetPath.startsWith(REFLECT_SHEET_PREFIX) ? 'quran-reflect' : 'content';

/**
 * Gateway route key path: what remains after the gateway strips the leading service segment.
 * content        https://apis.quran.foundation/content/api/v4/chapters   -> /api/v4/chapters
 * quran-reflect  https://apis.quran.foundation/quran-reflect/v1/posts/feed -> /v1/posts/feed
 * Derived per service, never by unrestricted substring replacement (Appendix A2).
 */
const resolveGatewayPath = (service, sheetPath) => {
  if (service === 'quran-reflect') {
    return toGatewayTemplate(sheetPath.slice('/quran-reflect'.length));
  }
  return toGatewayTemplate(`${CONTENT_UPSTREAM_PREFIX}${sheetPath}`);
};

const resolveRouteId = (service, operationId) =>
  service === 'quran-reflect'
    ? `quran-reflect.v1.public.${operationId}`
    : `content.v4.${operationId}`;

/** Pick the observed legacy rule for an operation. Exact route rules win over the wildcard. */
const matchLegacyRule = (rules, { gatewayService, method, gatewayPath }) => {
  const routeRule = rules.find(
    (rule) =>
      rule.appliesTo.gatewayService === gatewayService &&
      rule.appliesTo.method === method &&
      Array.isArray(rule.appliesTo.gatewayPaths) &&
      rule.appliesTo.gatewayPaths.includes(gatewayPath),
  );
  if (routeRule) return routeRule;

  return rules.find(
    (rule) =>
      rule.appliesTo.gatewayService === gatewayService &&
      rule.appliesTo.method === method &&
      !rule.appliesTo.gatewayPaths,
  );
};

const build = () => {
  const snapshotRaw = normalizeEol(fs.readFileSync(snapshotPath, 'utf8'));
  const policyRaw = normalizeEol(fs.readFileSync(policyPath, 'utf8'));
  const policy = JSON.parse(policyRaw);
  const scopeMap = withoutComments(policy.scopeMap);
  const labelOverrides = withoutComments(policy.labelOverrides);
  const rows = parseCsv(snapshotRaw);

  const errors = [];
  const fail = (message) => errors.push(message);

  if (rows.length !== 208) {
    fail(`snapshot must hold 208 data rows, found ${rows.length}`);
  }

  const operations = [];
  const provenance = [];
  const seenNormalizedKeys = new Map();
  const seenRouteIds = new Map();

  for (const row of rows) {
    const sheetRow = Number(row.sheet_row);
    const family = row['API Family'];
    const method = row.Method.toUpperCase();
    const sheetPath = row['API Path'];
    const operationId = row['Operation ID'];
    const labelOriginal = row['Proposed scope'];
    const environment = policy.environmentMap[row.Environment];

    if (!environment) {
      fail(`row ${sheetRow}: unmapped Environment ${JSON.stringify(row.Environment)}`);
    }

    if (family !== CONTENT_FAMILY) {
      // Appendix A3: User / OAuth2 / Search rows are regression inventory. They keep full
      // provenance, they are never migrated, and their permissions are never merged with the
      // new content scopes.
      provenance.push({
        sheetRow,
        family,
        method,
        sheetPath,
        operationId,
        sheetLabel: labelOriginal,
        authType: row['Auth Type'],
        consentCategory: row['Consent category'],
        environment,
        disposition: 'regression-inventory-not-migrated',
        dispositionReason:
          'Non-content API family. Appendix A3: preserve existing independent policy; requires separate approval to change.',
      });
      continue;
    }

    const override = labelOverrides[String(sheetRow)];
    const label = override ? override.label : labelOriginal;
    const granular = scopeMap[label];

    if (!granular) {
      fail(`row ${sheetRow}: no machine scope mapped for label ${JSON.stringify(label)}`);
      continue;
    }

    const service = resolveService(sheetPath);
    const gatewayPath = resolveGatewayPath(service, sheetPath);
    const routeId = resolveRouteId(service, operationId);
    const legacyRule = matchLegacyRule(policy.observedLegacyPolicy.rules, {
      gatewayService: service,
      method,
      gatewayPath,
    });

    if (!legacyRule) {
      fail(
        `row ${sheetRow}: no observed legacy authorization rule for ${service} ${method} ${gatewayPath}`,
      );
      continue;
    }

    // A2: conflicting normalized keys are build failures, never last-row-wins.
    const normalizedKey = `${service}|${method}|${gatewayPath}|${environment}`;
    if (seenNormalizedKeys.has(normalizedKey)) {
      fail(
        `row ${sheetRow}: normalized key collision with row ${seenNormalizedKeys.get(normalizedKey)} (${normalizedKey})`,
      );
      continue;
    }
    seenNormalizedKeys.set(normalizedKey, sheetRow);

    if (seenRouteIds.has(routeId)) {
      fail(`row ${sheetRow}: routeId collision with row ${seenRouteIds.get(routeId)} (${routeId})`);
      continue;
    }
    seenRouteIds.set(routeId, sheetRow);

    const operation = {
      routeId,
      service,
      gatewayService: service,
      method,
      gatewayPath,
      upstreamPath: service === 'content' ? `${CONTENT_UPSTREAM_PREFIX}${sheetPath}` : gatewayPath,
      openApiPath: service === 'content' ? sheetPath : sheetPath,
      openApiDocument:
        service === 'content' ? 'openAPI/content/v4.json' : 'openAPI/content/v4.json',
      operationId,
      pathParams: pathParams(sheetPath),
      sourceRows: [sheetRow],
      sheetLabel: label,
      sheetLabelOriginal: labelOriginal,
      labelOverride: override
        ? { from: labelOriginal, to: label, reason: override.reason, requiresDecision: override.requiresDecision }
        : null,
      environments: [environment],
      authContext: policy.authContexts[service],
      legacyAnyOf: legacyRule.anyOf,
      legacyMatchSource: legacyRule.source,
      legacyRuleId: legacyRule.id,
      granularAnyOf: [granular],
      quotaBuckets: legacyRule.anyOf,
      rateLimitPolicyId: policy.quotaPolicy.rateLimitPolicyIds[legacyRule.id],
      responseBoundary: policy.responseBoundary.value,
      deprecatedForNewClients: legacyRule.anyOf.filter((scope) =>
        policy.deprecatedForNewClients.scopes.includes(scope),
      ),
    };

    operations.push(operation);
    provenance.push({
      sheetRow,
      family,
      method,
      sheetPath,
      operationId,
      sheetLabel: labelOriginal,
      approvedLabel: label,
      authType: row['Auth Type'],
      consentCategory: row['Consent category'],
      environment,
      disposition: override ? 'mapped-with-approved-override' : 'mapped',
      dispositionReason: override ? override.reason : null,
      routeId,
      granularAnyOf: [granular],
      legacyAnyOf: legacyRule.anyOf,
    });
  }

  operations.sort((a, b) => a.sourceRows[0] - b.sourceRows[0]);
  provenance.sort((a, b) => a.sheetRow - b.sheetRow);

  // ---- alias reconciliation (A2) -------------------------------------------------
  // Routes whose path differs only in an aliased segment must resolve to the same scope,
  // otherwise the alias silently grants different rights than the route it mirrors.
  const aliasGroups = new Map();
  for (const op of operations) {
    if (op.service !== 'content') continue;
    const shape = op.gatewayPath
      .replace(/\/by_rub_el_hizb\//u, '/by_rub/')
      .replace(/:[^/]+/gu, ':p');
    if (!aliasGroups.has(shape)) aliasGroups.set(shape, []);
    aliasGroups.get(shape).push(op);
  }
  const aliasReconciliation = [];
  for (const [shape, group] of [...aliasGroups].sort(([a], [b]) => a.localeCompare(b))) {
    if (group.length < 2) continue;
    const scopes = [...new Set(group.map((op) => op.granularAnyOf[0]))];
    if (scopes.length !== 1) {
      fail(
        `alias group ${shape} resolves to conflicting scopes ${scopes.join(', ')} (rows ${group
          .map((op) => op.sourceRows[0])
          .join(', ')})`,
      );
    }
    aliasReconciliation.push({
      shape,
      members: group.map((op) => ({ sheetRow: op.sourceRows[0], gatewayPath: op.gatewayPath })),
      resolvedScope: scopes[0],
      equivalentPolicy: scopes.length === 1,
    });
  }

  // ---- dynamic-vs-literal precedence (A2) ---------------------------------------
  // The gateway checks exact keys before dynamic ones (src/libs/oauth.ts), so a literal
  // route always wins over a dynamic sibling. Record every such pair explicitly and require
  // that both sides resolve to the same scope, so precedence can never change effective rights.
  const precedencePairs = [];
  for (const dynamic of operations) {
    if (!dynamic.gatewayPath.includes(':')) continue;
    const prefix = dynamic.gatewayPath.slice(0, dynamic.gatewayPath.lastIndexOf('/') + 1);
    if (dynamic.gatewayPath.slice(prefix.length).includes('/')) continue;
    for (const literal of operations) {
      if (literal === dynamic || literal.service !== dynamic.service) continue;
      if (literal.gatewayPath.includes(':')) continue;
      if (!literal.gatewayPath.startsWith(prefix)) continue;
      if (literal.gatewayPath.slice(prefix.length).includes('/')) continue;
      if (literal.granularAnyOf[0] !== dynamic.granularAnyOf[0]) {
        fail(
          `precedence hazard: literal ${literal.gatewayPath} (row ${literal.sourceRows[0]}, ${literal.granularAnyOf[0]}) ` +
            `shadows dynamic ${dynamic.gatewayPath} (row ${dynamic.sourceRows[0]}, ${dynamic.granularAnyOf[0]}) with a different scope`,
        );
      }
      precedencePairs.push({
        literal: { sheetRow: literal.sourceRows[0], gatewayPath: literal.gatewayPath },
        dynamic: { sheetRow: dynamic.sourceRows[0], gatewayPath: dynamic.gatewayPath },
        resolvedScope: literal.granularAnyOf[0],
        winner: 'literal',
        winnerSource: 'src/libs/oauth.ts :: getOauth2ScopeMatch checks exact keys before dynamic keys',
      });
    }
  }

  // ---- scope catalog -------------------------------------------------------------
  const scopeCatalog = Object.entries(scopeMap).map(([label, machineName]) => {
    const owned = operations.filter((op) => op.granularAnyOf[0] === machineName);
    return {
      machineName,
      displayLabel: label,
      description: policy.scopeDescriptions[machineName],
      grantType: 'read',
      operationCount: owned.length,
      sourceRows: owned.map((op) => op.sourceRows[0]),
      partOfC8: machineName !== 'content.reflections.read',
    };
  });

  const c8 = scopeCatalog.filter((s) => s.partOfC8).map((s) => s.machineName);
  const reflectionRoutes = operations.filter(
    (op) => op.granularAnyOf[0] === 'content.reflections.read',
  );

  const contract = {
    contractVersion: policy.contractVersion,
    status: policy.status,
    statusNote:
      'Proposed. D1-D5 must be approved and recorded in decisions.md before any token is issued with these scopes. See Appendix A callout.',
    generatedBy: 'scripts/build-content-scope-contract.cjs',
    inputs: {
      sourceSnapshot: {
        path: 'contracts/content-scopes/source/QF_API_Endpoints.snapshot.csv',
        sha256: sha256(snapshotRaw),
        rowCount: rows.length,
      },
      policy: {
        path: 'contracts/content-scopes/policy.json',
        sha256: sha256(policyRaw),
      },
    },
    responseBoundary: {
      value: policy.responseBoundary.value,
      requiresDecision: 'D4',
      note: policy.responseBoundary.$comment.join(' '),
    },
    scopes: scopeCatalog,
    legacyScopes: policy.deprecatedForNewClients.scopes.map((scope) => ({
      machineName: scope,
      deprecatedForNewClients: true,
      stillValidForExistingIdentities: true,
      note:
        scope === 'content'
          ? 'Umbrella. Remains broad after migration: removing one granular successor does not narrow a client that still holds it. Retirement is a separate, unscheduled project with no assumed sunset date.'
          : 'Legacy read alternative. Continues to authorize every previously covered read.',
    })),
    outOfScopeScopes: policy.outOfScope.scopes,
    migration: {
      c8,
      c8Rule: policy.migration.c8Rule,
      reflectionsRule: {
        ...policy.migration.reflectionsRule,
        requiredRouteCoverage: reflectionRoutes.map((op) => ({
          routeId: op.routeId,
          gatewayPath: op.gatewayPath,
          legacyAnyOf: op.legacyAnyOf,
        })),
      },
      equivalentSuccessors: {
        $comment:
          "A' = A union equivalentSuccessors_v1(A). Finite and approved; never 'every scope starting with content.'",
        rules: [
          {
            id: 'c8-from-legacy-content-read',
            whenScopeSetIntersects: policy.migration.c8Rule.requiresIntersectionWith,
            grants: c8,
          },
          {
            id: 'reflections-from-full-public-coverage',
            whenScopeSetCoversAllOf: reflectionRoutes.map((op) => op.legacyAnyOf),
            grants: ['content.reflections.read'],
            requiresDecision: 'D3',
          },
        ],
      },
      preservedFields: [
        'clientId',
        'clientSecret',
        'redirectUris',
        'audience',
        'grantTypes',
        'responseTypes',
        'tokenEndpointAuthMethod',
        'metadata',
        'lifecycleState',
        'quotaConfiguration',
      ],
    },
    newClientBaseline: policy.newClientBaseline,
    quotaPolicy: {
      globalBucketAlwaysCharged: policy.quotaPolicy.globalBucketAlwaysCharged,
      note: policy.quotaPolicy.$comment.join(' '),
    },
    aliasReconciliation,
    precedencePairs,
    counts: {
      sheetRowsTotal: rows.length,
      contentRowsMapped: operations.length,
      regressionInventoryRows: provenance.filter(
        (p) => p.disposition === 'regression-inventory-not-migrated',
      ).length,
      byScope: Object.fromEntries(scopeCatalog.map((s) => [s.machineName, s.operationCount])),
    },
    operations,
  };

  const provenanceDoc = {
    contractVersion: policy.contractVersion,
    sourceSnapshotSha256: sha256(snapshotRaw),
    sheetUrl:
      'https://docs.google.com/spreadsheets/d/1eyyhzsAq925Hj9mE-FgvncOoENVLxZdqV3NB9s4fNhI/edit',
    sheetTab: 'QF_API_Endpoints.csv',
    rows: provenance,
  };

  if (errors.length > 0) {
    const err = new Error(`contract build failed:\n  - ${errors.join('\n  - ')}`);
    err.buildErrors = errors;
    throw err;
  }

  return { contract, provenanceDoc };
};

const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`;

const main = () => {
  const checkOnly = process.argv.includes('--check');
  const { contract, provenanceDoc } = build();
  const nextContract = serialize(contract);
  const nextProvenance = serialize(provenanceDoc);

  const nextHash = `${sha256(nextContract)}  contracts/content-scopes/v1.json
`;

  if (checkOnly) {
    const drift = [];
    for (const [file, next] of [
      [contractPath, nextContract],
      [provenancePath, nextProvenance],
      [hashPath, nextHash],
    ]) {
      const current = fs.existsSync(file) ? normalizeEol(fs.readFileSync(file, 'utf8')) : null;
      if (current !== next) drift.push(path.relative(repoRoot, file));
    }
    if (drift.length > 0) {
      console.error(
        `Committed contract artifacts are stale or hand-edited: ${drift.join(', ')}\n` +
          'Run: node scripts/build-content-scope-contract.cjs',
      );
      process.exit(1);
    }
    console.log(`content-scopes contract up to date (${contract.operations.length} operations)`);
    return;
  }

  fs.writeFileSync(contractPath, nextContract);
  fs.writeFileSync(provenancePath, nextProvenance);
  fs.writeFileSync(hashPath, nextHash);
  console.log(
    `wrote ${path.relative(repoRoot, contractPath)} ` +
      `(${contract.operations.length} operations, contract sha256 ${sha256(nextContract)})`,
  );
  console.log(`wrote ${path.relative(repoRoot, provenancePath)} (${provenanceDoc.rows.length} rows)`);
  console.log(`wrote ${path.relative(repoRoot, hashPath)}`);
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { build, parseCsv, toGatewayTemplate, resolveGatewayPath, resolveService, sha256, normalizeEol };
