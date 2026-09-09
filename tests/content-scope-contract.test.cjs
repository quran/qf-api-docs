'use strict';

/**
 * T01 acceptance tests for the pinned content scope contract.
 *
 * These are the shared "golden fixtures" the plan requires: they assert the contract's
 * counts, mappings, precedence and migration rules, and they assert the safety properties
 * that other repositories depend on (no read expansion for content.create, no reflection
 * grant from `content` alone, no granular scope in a quota bucket, no overlap with the
 * user-data `sync` scope or the restricted Qiraat scopes).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validate } = require('../scripts/lib/json-schema-lite.cjs');
const { build, parseCsv, resolveGatewayPath, resolveService } = require('../scripts/build-content-scope-contract.cjs');

const contractDir = path.join(__dirname, '..', 'contracts', 'content-scopes');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(contractDir, file), 'utf8'));

const contract = readJson('v1.json');
const schema = readJson('v1.schema.json');
const provenance = readJson('provenance.json');
const policy = readJson('policy.json');

const GRANULAR = [
  'content.audio.read',
  'content.quran.read',
  'content.hadith.read',
  'content.translations.read',
  'content.tafsirs.read',
  'content.metadata.read',
  'content.sync.read',
  'content.reflections.read',
  'content.answers.read',
];

const REFLECTION_ROUTES = [
  '/v1/posts/feed',
  '/v1/posts/:id',
  '/v1/posts/user-posts/:id',
  '/v1/posts/:id/comments',
  '/v1/posts/:id/all-comments',
];

/** The migration equivalence rule, implemented exactly as the contract states it. */
const equivalentSuccessors = (scopeSet) => {
  const held = new Set(scopeSet);
  const granted = new Set();

  if (contract.migration.c8Rule.requiresIntersectionWith.some((scope) => held.has(scope))) {
    for (const scope of contract.migration.c8) granted.add(scope);
  }

  const coversEveryReflectionRoute = contract.migration.reflectionsRule.requiredRouteCoverage.every(
    (route) => route.legacyAnyOf.some((scope) => held.has(scope)),
  );
  if (coversEveryReflectionRoute) granted.add('content.reflections.read');

  return granted;
};

test('contract validates against its committed JSON schema', () => {
  assert.deepEqual(validate(contract, schema), []);
});

test('committed artifacts match a fresh build from snapshot + policy', () => {
  const { contract: rebuilt, provenanceDoc } = build();
  assert.deepEqual(rebuilt, contract, 'v1.json is stale or was hand-edited');
  assert.deepEqual(provenanceDoc, provenance, 'provenance.json is stale or was hand-edited');
});

test('contract pins the hashes of both of its inputs', () => {
  const crypto = require('node:crypto');
  const digest = (file) =>
    crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(contractDir, file), 'utf8'))
      .digest('hex');

  assert.equal(contract.inputs.sourceSnapshot.sha256, digest('source/QF_API_Endpoints.snapshot.csv'));
  assert.equal(contract.inputs.policy.sha256, digest('policy.json'));
});

test('all 208 sheet rows are retained with an explicit disposition', () => {
  assert.equal(provenance.rows.length, 208);
  assert.equal(contract.counts.sheetRowsTotal, 208);

  const rowNumbers = provenance.rows.map((row) => row.sheetRow);
  assert.deepEqual(rowNumbers, [...Array(208)].map((_, i) => i + 2), 'rows 2..209 must all be present exactly once');

  for (const row of provenance.rows) {
    assert.ok(row.disposition, `row ${row.sheetRow} has no disposition`);
    assert.ok(
      ['mapped', 'mapped-with-approved-override', 'regression-inventory-not-migrated'].includes(
        row.disposition,
      ),
      `row ${row.sheetRow} has unknown disposition ${row.disposition}`,
    );
  }

  const mapped = provenance.rows.filter((row) => row.disposition.startsWith('mapped'));
  assert.equal(mapped.length, 95, 'all 95 Content entries must be mapped or explicitly blocked');
  assert.equal(contract.counts.regressionInventoryRows, 113);
});

test('family counts match the plan (95 Content / 106 User / 6 OAuth2 / 1 Search)', () => {
  const counts = provenance.rows.reduce((acc, row) => {
    acc[row.family] = (acc[row.family] ?? 0) + 1;
    return acc;
  }, {});

  assert.deepEqual(counts, {
    'Content APIs (v4)': 95,
    'User APIs (v1)': 106,
    'OAuth2 APIs (v1)': 6,
    'Search APIs (v1)': 1,
  });
});

test('nine scopes with the Appendix A1 post-correction operation counts', () => {
  assert.deepEqual(
    contract.scopes.map((scope) => scope.machineName).sort(),
    [...GRANULAR].sort(),
  );

  assert.deepEqual(contract.counts.byScope, {
    'content.audio.read': 18,
    'content.quran.read': 37,
    'content.hadith.read': 3,
    'content.translations.read': 13,
    'content.tafsirs.read': 12,
    'content.metadata.read': 2,
    'content.sync.read': 2,
    'content.reflections.read': 5,
    'content.answers.read': 3,
  });

  const total = Object.values(contract.counts.byScope).reduce((a, b) => a + b, 0);
  assert.equal(total, 95, 'per-scope counts must sum to the 95 source entries');
});

test('display labels stay distinct from machine names', () => {
  for (const scope of contract.scopes) {
    assert.notEqual(scope.displayLabel, scope.machineName);
    assert.equal(
      policy.scopeMap[scope.displayLabel],
      scope.machineName,
      `label ${scope.displayLabel} must map to ${scope.machineName} in policy.json`,
    );
  }
});

test('no unknown machine scope appears anywhere in the contract', () => {
  const allowed = new Set([...GRANULAR, 'content', 'content.read', 'post', 'post.read', 'comment', 'comment.read']);
  for (const op of contract.operations) {
    for (const scope of [...op.granularAnyOf, ...op.legacyAnyOf, ...op.quotaBuckets]) {
      assert.ok(allowed.has(scope), `operation ${op.routeId} references unknown scope ${scope}`);
    }
  }
});

test('D2: rows 47 and 48 are corrected while preserving the original sheet label', () => {
  const byRow = (row) => contract.operations.find((op) => op.sourceRows.includes(row));

  const translations = byRow(47);
  assert.equal(translations.gatewayPath, '/api/v4/quran/translations/:translation_id');
  assert.equal(translations.granularAnyOf[0], 'content.translations.read');
  assert.equal(translations.sheetLabelOriginal, 'Quran Scope');
  assert.equal(translations.labelOverride.requiresDecision, 'D2');

  const tafsirs = byRow(48);
  assert.equal(tafsirs.gatewayPath, '/api/v4/quran/tafsirs/:tafsir_id');
  assert.equal(tafsirs.granularAnyOf[0], 'content.tafsirs.read');
  assert.equal(tafsirs.sheetLabelOriginal, 'Quran Scope');
  assert.equal(tafsirs.labelOverride.requiresDecision, 'D2');

  // Every other operation keeps column F untouched.
  for (const op of contract.operations) {
    if (op.sourceRows.some((row) => [47, 48].includes(row))) continue;
    assert.equal(op.labelOverride, null, `${op.routeId} has an unreviewed override`);
    assert.equal(op.sheetLabel, op.sheetLabelOriginal);
  }
});

test('D2 rejected: without the override, rows 47/48 stay on the Quran scope', () => {
  // Proves the corrections are policy-driven, not hard-coded, and that the un-approved
  // mapping is exactly the sheet's original.
  const original = provenance.rows.filter((row) => [47, 48].includes(row.sheetRow));
  assert.deepEqual(
    original.map((row) => row.sheetLabel),
    ['Quran Scope', 'Quran Scope'],
  );
  assert.deepEqual(
    original.map((row) => row.approvedLabel),
    ['Translation Scope', 'Tafsir Scope'],
  );
  assert.equal(policy.scopeMap['Quran Scope'], 'content.quran.read');
});

test('every operation carries exactly one granular successor and no implied hierarchy', () => {
  for (const op of contract.operations) {
    assert.equal(op.granularAnyOf.length, 1, `${op.routeId} must have exactly one successor`);
  }

  // A scope must never appear as an alternative on an operation it does not own: no granular
  // scope implies another, and a shared `content.` prefix is not authorization.
  for (const op of contract.operations) {
    const others = GRANULAR.filter((scope) => scope !== op.granularAnyOf[0]);
    for (const scope of others) {
      assert.ok(
        !op.granularAnyOf.includes(scope),
        `${op.routeId} must not accept ${scope}`,
      );
    }
  }
});

test('normalized route keys are unique and route ids are stable', () => {
  const keys = new Set();
  const ids = new Set();
  for (const op of contract.operations) {
    const key = `${op.service}|${op.method}|${op.gatewayPath}|${op.environments.join(',')}`;
    assert.ok(!keys.has(key), `duplicate normalized key ${key}`);
    keys.add(key);
    assert.ok(!ids.has(op.routeId), `duplicate routeId ${op.routeId}`);
    ids.add(op.routeId);
  }
  assert.equal(keys.size, 95);
});

test('public reflection operations and the user-token surface stay separate', () => {
  const reflect = contract.operations.filter((op) => op.service === 'quran-reflect');
  assert.equal(reflect.length, 5);
  assert.deepEqual(reflect.map((op) => op.gatewayPath).sort(), [...REFLECTION_ROUTES].sort());

  for (const op of reflect) {
    assert.equal(op.granularAnyOf[0], 'content.reflections.read');
    assert.equal(op.authContext, 'app-compatible-public-read');
    // The same controller operations also appear in the sheet's User family under an
    // OAuth2 user token. They are NOT merged: same operationId, different auth context.
    const userTwin = provenance.rows.find(
      (row) => row.family === 'User APIs (v1)' && row.operationId === op.operationId,
    );
    assert.ok(userTwin, `expected a User-family twin for ${op.operationId}`);
    assert.equal(userTwin.disposition, 'regression-inventory-not-migrated');
  }
});

test('reflection routes keep their real legacy alternatives, not a rewritten post/comment scope', () => {
  const byPath = (p) => contract.operations.find((op) => op.gatewayPath === p);
  assert.deepEqual(byPath('/v1/posts/feed').legacyAnyOf, ['post.read', 'post']);
  assert.deepEqual(byPath('/v1/posts/:id').legacyAnyOf, ['post.read', 'post']);
  assert.deepEqual(byPath('/v1/posts/user-posts/:id').legacyAnyOf, ['post.read', 'post']);
  assert.deepEqual(byPath('/v1/posts/:id/comments').legacyAnyOf, ['comment.read', 'comment', 'post']);
  assert.deepEqual(byPath('/v1/posts/:id/all-comments').legacyAnyOf, ['comment.read', 'comment', 'post']);
});

test('content operations keep the legacy wildcard alternatives and never accept content.create', () => {
  for (const op of contract.operations.filter((o) => o.service === 'content')) {
    assert.deepEqual(op.legacyAnyOf, ['content.read', 'content'], op.routeId);
    assert.ok(!op.legacyAnyOf.includes('content.create'), `${op.routeId} must not accept content.create`);
    assert.deepEqual(op.deprecatedForNewClients, ['content.read', 'content']);
  }
});

test('MIGRATION: legacy content client gains C8 and nothing else', () => {
  for (const legacy of [['content'], ['content.read'], ['content', 'offline_access']]) {
    const granted = equivalentSuccessors(legacy);
    assert.deepEqual([...granted].sort(), [...contract.migration.c8].sort(), `for ${legacy}`);
    assert.ok(!granted.has('content.reflections.read'), '`content` alone must never grant reflections');
  }
});

test('MIGRATION: content.create-only client gains no read scopes', () => {
  assert.deepEqual([...equivalentSuccessors(['content.create'])], []);
});

test('MIGRATION: partial reflection rights are preserved, never completed', () => {
  assert.ok(!equivalentSuccessors(['post.read']).has('content.reflections.read'));
  assert.ok(!equivalentSuccessors(['comment.read']).has('content.reflections.read'));
  assert.ok(!equivalentSuccessors(['content', 'post.read']).has('content.reflections.read'));
  assert.ok(!equivalentSuccessors(['content', 'comment.read']).has('content.reflections.read'));
});

test('MIGRATION: both public read rights grant the reflection successor', () => {
  assert.ok(equivalentSuccessors(['post.read', 'comment.read']).has('content.reflections.read'));
  // The `post` umbrella is genuinely accepted on all five routes today, so it qualifies.
  // This follows from actual route alternatives, not an assumed hierarchy: see D3.
  assert.ok(equivalentSuccessors(['post']).has('content.reflections.read'));
  assert.ok(equivalentSuccessors(['comment', 'post.read']).has('content.reflections.read'));
});

test('MIGRATION: no client gains out-of-scope permissions', () => {
  const forbidden = new Set(contract.outOfScopeScopes);
  for (const legacy of [['content'], ['content.read'], ['post.read', 'comment.read'], ['content', 'post']]) {
    for (const scope of equivalentSuccessors(legacy)) {
      assert.ok(!forbidden.has(scope), `${legacy} must not gain ${scope}`);
    }
  }
  // content.sync.read must never be confused with the user-data `sync` scope.
  assert.ok(forbidden.has('sync'));
  assert.ok(!contract.migration.c8.includes('sync'));
  assert.ok(contract.migration.c8.includes('content.sync.read'));
  for (const scope of ['qiraat', 'qiraat.read', 'search', 'analytics.events.write']) {
    assert.ok(forbidden.has(scope), `${scope} must be listed out of scope`);
  }
});

test('QUOTA: buckets are frozen to the pre-migration alternatives', () => {
  for (const op of contract.operations) {
    assert.deepEqual(
      op.quotaBuckets,
      op.legacyAnyOf,
      `${op.routeId} quota buckets must equal the pre-migration alternatives`,
    );
    for (const scope of GRANULAR) {
      assert.ok(
        !op.quotaBuckets.includes(scope),
        `${op.routeId} must not add granular scope ${scope} as a quota bucket`,
      );
    }
    assert.ok(op.rateLimitPolicyId, `${op.routeId} has no rateLimitPolicyId`);
  }
  assert.equal(contract.quotaPolicy.globalBucketAlwaysCharged, true);
});

test('aliases resolve to the same scope as the route they mirror', () => {
  assert.ok(contract.aliasReconciliation.length >= 4);
  for (const group of contract.aliasReconciliation) {
    assert.equal(group.equivalentPolicy, true);
    assert.ok(group.members.length >= 2);
  }
  const shapes = contract.aliasReconciliation.map((group) => group.shape);
  assert.ok(shapes.includes('/api/v4/verses/by_rub/:p'), 'by_rub / by_rub_el_hizb pair must be reconciled');
});

test('literal routes that shadow a dynamic sibling resolve to the same scope', () => {
  assert.ok(contract.precedencePairs.length > 0);
  for (const pair of contract.precedencePairs) {
    assert.equal(pair.winner, 'literal');
    const literal = contract.operations.find((op) => op.gatewayPath === pair.literal.gatewayPath);
    const dynamic = contract.operations.find((op) => op.gatewayPath === pair.dynamic.gatewayPath);
    assert.equal(literal.granularAnyOf[0], dynamic.granularAnyOf[0], `${pair.literal.gatewayPath} vs ${pair.dynamic.gatewayPath}`);
  }
  // The generic script route and its eight concrete siblings are the case Appendix A2 names.
  const scriptPairs = contract.precedencePairs.filter(
    (pair) => pair.dynamic.gatewayPath === '/api/v4/quran/verses/:script',
  );
  assert.equal(scriptPairs.length, 8);
});

test('gateway paths are derived per service, not by substring replacement', () => {
  assert.equal(resolveService('/chapters'), 'content');
  assert.equal(resolveService('/quran-reflect/v1/posts/feed'), 'quran-reflect');
  assert.equal(resolveGatewayPath('content', '/chapters'), '/api/v4/chapters');
  assert.equal(
    resolveGatewayPath('content', '/audio/reciters/{reciter_id}/timestamp'),
    '/api/v4/audio/reciters/:reciter_id/timestamp',
  );
  assert.equal(resolveGatewayPath('quran-reflect', '/quran-reflect/v1/posts/feed'), '/v1/posts/feed');

  // A content path that merely contains the word "content" must not be mangled.
  assert.equal(resolveGatewayPath('content', '/resources/content'), '/api/v4/resources/content');
});

test('every content operation matches a path in the content OpenAPI document', () => {
  const openApi = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'openAPI', 'content', 'v4.json'), 'utf8'),
  );
  for (const op of contract.operations) {
    const node = openApi.paths[op.openApiPath];
    assert.ok(node, `${op.routeId}: ${op.openApiPath} is missing from ${op.openApiDocument}`);
    const operation = node[op.method.toLowerCase()];
    assert.ok(operation, `${op.routeId}: no ${op.method} on ${op.openApiPath}`);
    assert.equal(operation.operationId, op.operationId, `${op.routeId}: operationId drift`);
  }
});

test('environments come from the sheet, never from a branch name', () => {
  for (const op of contract.operations) {
    for (const environment of op.environments) {
      assert.ok(['production', 'prelive'].includes(environment));
    }
  }
  // Branch spellings must never appear as environment values.
  const serialized = JSON.stringify(contract.operations);
  for (const branchish of ['testing-warsh', 'do-staging', '"pre-live"', '"testing"', '"main"', '"do"']) {
    assert.ok(!serialized.includes(branchish), `branch-like value ${branchish} leaked into operations`);
  }
});

test('contract stays inert until the decisions are approved', () => {
  assert.equal(contract.status, 'proposed-pending-approval');
  assert.equal(contract.responseBoundary.requiresDecision, 'D4');
  assert.equal(contract.migration.reflectionsRule.requiresDecision, 'D3');
  assert.equal(contract.newClientBaseline.requiresDecision, 'D5');

  const decisions = fs.readFileSync(path.join(contractDir, 'decisions.md'), 'utf8');
  for (const id of ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']) {
    assert.ok(decisions.includes(`## ${id} `), `decisions.md must carry a ${id} section`);
  }
});

test('legacy umbrella is documented as still broad, with no sunset date', () => {
  const umbrella = contract.legacyScopes.find((scope) => scope.machineName === 'content');
  assert.equal(umbrella.deprecatedForNewClients, true);
  assert.equal(umbrella.stillValidForExistingIdentities, true);
  assert.match(umbrella.note, /remains broad/iu);
  assert.ok(!JSON.stringify(contract).match(/sunset(Date)?"\s*:/u), 'no sunset date may be assumed');
});

test('the CSV parser handles quoted fields containing commas and quotes', () => {
  const rows = parseCsv('a,b\n"x,1","he said ""hi"""\n');
  assert.deepEqual(rows, [{ a: 'x,1', b: 'he said "hi"' }]);
});
