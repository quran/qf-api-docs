'use strict';

/**
 * T09 acceptance tests: OpenAPI scope metadata and the published scope documentation.
 *
 * The SDK operation catalogs are generated from these OpenAPI documents, so the tests below are
 * what stops a scope from reaching an SDK without also being in the contract, and what stops the
 * metadata work from quietly changing the documents in some other way.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  EXTENSION,
  contractHash,
} = require('../scripts/apply-content-scope-openapi-metadata.cjs');

const repoRoot = path.join(__dirname, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));

const contract = readJson('contracts/content-scopes/v1.json');
const contentApi = readJson('openAPI/content/v4.json');
const scopesDoc = fs.readFileSync(
  path.join(repoRoot, 'docs/user_related_apis_versioned/scopes.mdx'),
  'utf8',
);

const GRANULAR = contract.scopes.map((scope) => scope.machineName);

const allOperations = () => {
  const entries = [];
  for (const [pathKey, pathItem] of Object.entries(contentApi.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation !== 'object' || operation === null) continue;
      entries.push({ pathKey, method: method.toUpperCase(), operation });
    }
  }
  return entries;
};

test('every content operation carries scope metadata pinned to the contract', () => {
  const annotated = allOperations().filter(({ operation }) => operation[EXTENSION]);
  assert.equal(annotated.length, 95);

  for (const { pathKey, method, operation } of annotated) {
    const meta = operation[EXTENSION];
    assert.equal(meta.contractVersion, 'content-scopes/v1', `${method} ${pathKey}`);
    assert.equal(meta.contractSha256, contractHash, `${method} ${pathKey}`);
    assert.equal(meta.contractStatus, 'proposed-pending-approval', `${method} ${pathKey}`);
  }
});

test('metadata matches the contract operation for the same path and method', () => {
  const byKey = new Map(
    contract.operations.map((operation) => [
      `${operation.method} ${operation.openApiPath}`,
      operation,
    ]),
  );

  for (const { pathKey, method, operation } of allOperations()) {
    const meta = operation[EXTENSION];
    if (!meta) continue;

    const expected = byKey.get(`${method} ${pathKey}`);
    assert.ok(expected, `${method} ${pathKey} has metadata but is not in the contract`);
    assert.equal(meta.routeId, expected.routeId);
    assert.equal(operation.operationId, expected.operationId);
    assert.deepEqual(meta.legacyAnyOf, expected.legacyAnyOf);
    assert.deepEqual(meta.granularAnyOf, expected.granularAnyOf);
    assert.deepEqual(meta.quotaBuckets, expected.quotaBuckets);
    assert.deepEqual(meta.anyOf, [...expected.legacyAnyOf, ...expected.granularAnyOf]);
  }
});

test('anyOf lists legacy alternatives first so an existing token still matches', () => {
  for (const { operation } of allOperations()) {
    const meta = operation[EXTENSION];
    if (!meta) continue;
    assert.deepEqual(meta.anyOf.slice(0, meta.legacyAnyOf.length), meta.legacyAnyOf);
    assert.equal(meta.anyOf.length, meta.legacyAnyOf.length + 1);
  }
});

test('quota metadata never carries a granular scope', () => {
  for (const { operation } of allOperations()) {
    const meta = operation[EXTENSION];
    if (!meta) continue;
    for (const scope of GRANULAR) {
      assert.ok(
        !meta.quotaBuckets.includes(scope),
        `${meta.routeId} must not charge ${scope} as a quota bucket`,
      );
    }
    assert.ok(meta.rateLimitPolicyId);
  }
});

test('no unknown scope reaches the OpenAPI documents', () => {
  const allowed = new Set([
    ...GRANULAR,
    ...contract.legacyScopes.map((scope) => scope.machineName),
    'post',
    'post.read',
    'comment',
    'comment.read',
  ]);

  for (const { operation } of allOperations()) {
    const meta = operation[EXTENSION];
    if (!meta) continue;
    for (const scope of meta.anyOf) {
      assert.ok(allowed.has(scope), `${meta.routeId} references unknown scope ${scope}`);
    }
  }
});

test('the transport is described accurately, not as OAuth2 bearer auth', () => {
  assert.deepEqual(contentApi.security, [{ 'x-auth-token': [], 'x-client-id': [] }]);
  assert.equal(contentApi.components.securitySchemes['x-auth-token'].type, 'apiKey');
  assert.equal(contentApi.components.securitySchemes['x-auth-token'].in, 'header');
  assert.equal(contentApi.components.securitySchemes['x-client-id'].type, 'apiKey');

  for (const { operation } of allOperations()) {
    const meta = operation[EXTENSION];
    if (!meta) continue;
    assert.deepEqual(meta.transport.headers, ['x-auth-token', 'x-client-id']);
    assert.match(meta.transport.note, /not OAuth2 bearer/iu);
  }
});

test('no empty security alternative is ever introduced', () => {
  // An empty requirement object in the `security` array advertises unauthenticated access,
  // because entries in that array are alternatives.
  const check = (security, where) => {
    if (!Array.isArray(security)) return;
    for (const requirement of security) {
      assert.notEqual(Object.keys(requirement).length, 0, `${where} has an empty alternative`);
    }
  };

  check(contentApi.security, 'root');
  for (const { pathKey, method, operation } of allOperations()) {
    check(operation.security, `${method} ${pathKey}`);
  }
});

test('the metadata pass changes nothing else in the document', () => {
  // Operation identity, transport and paths are what SDKs and existing integrations depend on.
  assert.equal(Object.keys(contentApi.paths).length, 95);

  const operationIds = allOperations().map(({ operation }) => operation.operationId);
  assert.equal(new Set(operationIds).size, operationIds.length, 'operationIds must stay unique');

  // The public server URLs must not be rewritten. In particular `content` appears inside these
  // URLs and must never be replaced by a scope name.
  assert.deepEqual(
    contentApi.servers.map((server) => server.url),
    [
      'https://apis-prelive.quran.foundation/content/api/v4',
      'https://apis.quran.foundation/content/api/v4',
    ],
  );
  // The five public reflection operations override the server, dropping the /content/api/v4 base.
  const reflect = contentApi.paths['/quran-reflect/v1/posts/feed'].get;
  assert.deepEqual(
    reflect.servers.map((server) => server.url),
    ['https://apis-prelive.quran.foundation', 'https://apis.quran.foundation'],
  );
});

test('generated metadata is idempotent and detectable when stale', () => {
  const { apply } = require('../scripts/apply-content-scope-openapi-metadata.cjs');
  const first = apply().document;
  const second = apply().document;
  assert.deepEqual(first, second);
  assert.deepEqual(first, contentApi, 'committed document is stale: re-run the metadata script');
});

test('documentation states the scopes are not yet issued', () => {
  assert.match(scopesDoc, /Not yet available/iu);
  assert.match(scopesDoc, /proposal under review/iu);
  assert.match(scopesDoc, /`content` is the scope to request today/u);
});

test('documentation lists all nine scopes', () => {
  for (const scope of GRANULAR) {
    assert.ok(scopesDoc.includes(`\`${scope}\``), `scopes.mdx does not document ${scope}`);
  }
});

test('documentation corrects the parent/child assumption for content scopes', () => {
  // The page above this section tells readers a parent scope authorizes child actions. That is
  // true for note/post/collection and must not be carried over to the flat content scopes.
  assert.match(scopesDoc, /flat, not a hierarchy/iu);
  assert.match(scopesDoc, /does not grant `content\.audio\.read`/u);
  assert.match(scopesDoc, /shared `content\.` prefix\s+is never authorization/u);
});

test('documentation covers the compatibility promises integrators depend on', () => {
  assert.match(scopesDoc, /No secret rotation, no re-authorization, no new client, and no forced user login/iu);
  assert.match(scopesDoc, /`content` stays broad/u);
  assert.match(scopesDoc, /no sunset date/iu);
  assert.match(scopesDoc, /Rate limits are unchanged/iu);
  assert.match(scopesDoc, /never a\s+wider set/u);
  assert.match(scopesDoc, /invalid_scope/u);
  assert.match(scopesDoc, /403/u);
});

test('documentation keeps content.sync.read distinct from the user sync scope', () => {
  assert.match(scopesDoc, /different permission from the user-data\s+`sync` scope/u);
  assert.match(scopesDoc, /neither implies the other/iu);
});

test('documentation scopes the reflection successor to public reads only', () => {
  assert.match(scopesDoc, /five public QuranReflect/u);
  assert.match(scopesDoc, /no private posts, no\s+my-posts, no private rooms/u);
  assert.match(scopesDoc, /visibility rules still apply/iu);
});

test('documentation records the endpoint-family limitation', () => {
  assert.match(scopesDoc, /Endpoint families, not data filtering/iu);
  assert.match(scopesDoc, /Response shapes are unchanged/iu);
});

test('documentation explains why the scopes live in an extension', () => {
  assert.match(scopesDoc, /x-qf-scopes/u);
  assert.match(scopesDoc, /not `Authorization: Bearer` credentials|not `Authorization: Bearer`/u);
});
