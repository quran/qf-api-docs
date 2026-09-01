const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');

const read = (...segments) => {
  const filePath = path.join(repoRoot, ...segments);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
};

const trees = [
  {
    name: 'pre-live',
    root: 'user_related_apis_prelive',
    guidePath: '/docs/user_related_apis_prelive/app-state/',
    sidebarKey: 'user-related-apis-pre-live',
  },
  {
    name: 'versioned',
    root: 'user_related_apis_versioned',
    guidePath: '/docs/user_related_apis_versioned/1.0.0/app-state/',
    sidebarKey: 'user-related-apis',
  },
];

const operations = [
  ['GET', '/auth/v1/app-state:config'],
  ['GET', '/auth/v1/app-state:bootstrap'],
  ['GET', '/auth/v1/app-state:changes'],
  ['GET', '/auth/v1/app-state/{collection}'],
  ['GET', '/auth/v1/app-state/{collection}/{key}'],
  ['PUT', '/auth/v1/app-state/{collection}/{key}'],
  ['DELETE', '/auth/v1/app-state/{collection}/{key}'],
];

const statusActions = [
  [400, 'Correct the request without discarding valid local state.'],
  [401, 'Refresh or reauthenticate the user, then retry with the same logical request.'],
  [403, 'Stop and resolve scope, user delegation, client ownership, or App State policy.'],
  [404, 'Treat the requested live document as absent.'],
  [409, 'Do not reuse a key for changed bytes; refresh configuration or bootstrap when directed.'],
  [410, 'Preserve pending mutations, bootstrap into staging, drain changes, promote, replay, then pull again.'],
  [412, 'Read current state, preserve complete-replacement intent, update the precondition, rotate the idempotency key, and retry within the bound.'],
  [428, 'Supply exactly one of If-Match or If-None-Match for the strict collection.'],
  [429, 'Wait for Retry-After and retry the same request bytes and idempotency key.'],
  [500, 'Retry an ambiguous mutation with identical bytes, preconditions, and idempotency key.'],
  [503, 'Retry with bounded backoff; preserve pending local state and the original mutation fingerprint.'],
];

const readTree = (root) => ({
  index: read('docs', root, 'app-state', 'index.mdx'),
  reconciliation: read('docs', root, 'app-state', 'reconciliation.mdx'),
  lifecycle: read('docs', root, 'app-state', 'lifecycle.mdx'),
  scopes: read('docs', root, 'scopes.mdx'),
});

const sidebarContainsDoc = (items, docId) =>
  items.some((item) => {
    if (typeof item === 'string') {
      return item === docId;
    }

    if (!item || typeof item !== 'object') {
      return false;
    }

    if (item.type === 'doc' && item.id === docId) {
      return true;
    }

    if (item.link?.type === 'doc' && item.link.id === docId) {
      return true;
    }

    return Array.isArray(item.items) && sidebarContainsDoc(item.items, docId);
  });

test('publishes all seven App State operations with the frozen wire rules in both trees', () => {
  for (const tree of trees) {
    const docs = readTree(tree.root);
    const completeTree = `${docs.index}\n${docs.reconciliation}\n${docs.lifecycle}`;

    assert.notEqual(docs.index, '', `${tree.name} App State overview is missing`);
    assert.notEqual(docs.reconciliation, '', `${tree.name} reconciliation guide is missing`);
    assert.notEqual(docs.lifecycle, '', `${tree.name} lifecycle guide is missing`);

    for (const [method, publicPath] of operations) {
      assert.ok(
        docs.index.includes(`\`${method} ${publicPath}\``),
        `${tree.name} overview must document ${method} ${publicPath}`,
      );
    }

    for (const requiredTerm of [
      'Authorization',
      'x-client-id',
      'Content-Type',
      'Idempotency-Key',
      'If-Match',
      'If-None-Match',
      'ETag',
      'WWW-Authenticate',
      'Retry-After',
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
      'hasMore',
      'nextCursor',
      'nextSyncToken',
    ]) {
      assert.ok(
        completeTree.includes(`\`${requiredTerm}\``),
        `${tree.name} docs must explain ${requiredTerm}`,
      );
    }

    assert.match(completeTree, /opaque quoted validator/i);
    assert.match(completeTree, /never (?:construct|derive).+document.+version/i);
    assert.match(completeTree, /byte-identical/i);
    assert.match(completeTree, /complete replacement/i);
    assert.match(completeTree, /204[^\n]+no (?:response )?body/i);
    assert.match(completeTree, /413/);
    assert.match(completeTree, /422/);
  }
});

test('publishes every frozen status action and the App State security distinction', () => {
  for (const tree of trees) {
    const { index, reconciliation } = readTree(tree.root);
    const completeContract = `${index}\n${reconciliation}`;

    for (const [status, action] of statusActions) {
      assert.match(
        completeContract,
        new RegExp(`\\|\\s*${status}\\s*\\|[^\\n]*${action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        `${tree.name} docs must preserve the frozen ${status} client action`,
      );
    }

    assert.match(completeContract, /401[^\n]+invalid[^\n]+credential/i);
    assert.match(completeContract, /403[^\n]+insufficient[^\n]+scope/i);
    assert.match(completeContract, /WWW-Authenticate[^\n]+Bearer error=&quot;invalid_token&quot;/);
    assert.match(completeContract, /503[^\n]+fail(?:s|ed)? closed/i);
    assert.match(completeContract, /429[^\n]+Retry-After/i);
    assert.match(completeContract, /namespace_resolution_unavailable/);
    assert.match(completeContract, /app_state_unavailable/);
  }
});

test('documents canonical changes, crash-safe recovery, lineage, and account isolation', () => {
  for (const tree of trees) {
    const { index, reconciliation } = readTree(tree.root);
    const completeContract = `${index}\n${reconciliation}`;

    assert.match(completeContract, /`GET \/auth\/v1\/app-state:changes`/);
    assert.match(completeContract, /`:sync`[^\n]+not exposed/i);
    assert.doesNotMatch(completeContract, /\/app-state:sync/);
    assert.match(reconciliation, /Conceptual diagram/i);
    assert.match(reconciliation, /server shadow/i);
    assert.match(reconciliation, /pending (?:local )?mutations/i);
    assert.match(reconciliation, /apply each complete page[^\n]+token[^\n]+one local transaction/i);
    assert.match(reconciliation, /same-version[^\n]+protocol error/i);
    assert.match(reconciliation, /410[^\n]+preserve pending/i);
    assert.match(reconciliation, /staging[^\n]+drain[^\n]+promot/i);
    assert.match(reconciliation, /tombstone/i);
    assert.match(reconciliation, /prun[^\n]+lineage/i);
    assert.match(reconciliation, /recreated[^\n]+greater than[^\n]+tombstone/i);
    assert.match(reconciliation, /version increases on each server mutation/i);
    assert.match(
      reconciliation,
      /tombstone consumption[\s\S]{0,160}retains[^\n]+lineage version/i,
    );
    assert.match(
      reconciliation,
      /payload pruning[\s\S]{0,160}retains[^\n]+lineage version/i,
    );
    assert.doesNotMatch(
      reconciliation,
      /strictly monotonic across put, delete, tombstone consumption,\s*payload pruning/i,
    );
    assert.match(reconciliation, /token[^\n]+advance[^\n]+after[^\n]+appl/i);
    assert.match(reconciliation, /account generation/i);
    assert.match(reconciliation, /late (?:result|response)[^\n]+reject/i);
    assert.match(reconciliation, /low-level HTTP/i);
    assert.match(reconciliation, /reconciler/i);
    assert.match(reconciliation, /JavaScript/i);
    assert.match(reconciliation, /Python/i);
  }
});

test('publishes exact validation, revocation, privacy, and lifecycle launch policy', () => {
  const pendingPolicyRows = [
    'Accountable approver',
    'Retained-state duration',
    'Deletion-completion SLA',
    'Backup expiry and restoration policy',
    'Ownership transfer',
    'App/client removal',
    'Self-service account deletion',
    'Staff account deletion',
    'Disabled, suspended, and archived deletion',
  ];

  for (const tree of trees) {
    const { index, lifecycle } = readTree(tree.root);
    const completeContract = `${index}\n${lifecycle}`;

    assert.match(completeContract, /no Unicode normalization/i);
    assert.match(completeContract, /512 Unicode scalar values/i);
    assert.match(completeContract, /maximum (?:JSON )?(?:nesting )?depth[^\n]+64/i);
    assert.match(completeContract, /canonical UTF-8/i);
    assert.match(completeContract, /positive introspection cache[^\n]+60 seconds/i);
    assert.match(completeContract, /`REVOKE`/);
    assert.match(completeContract, /`DELETE_DATA`/);
    assert.match(completeContract, /`REVOKE_AND_DELETE`/);
    assert.match(completeContract, /disabled[^\n]+suspended[^\n]+archived/i);
    assert.match(completeContract, /self-service/i);
    assert.match(completeContract, /staff/i);

    for (const label of pendingPolicyRows) {
      assert.match(
        lifecycle,
        new RegExp(`\\|\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\|[^\\n]*\\bPending\\b`),
        `${tree.name} lifecycle policy must leave ${label} Pending`,
      );
    }

    assert.match(lifecycle, /NO-LAUNCH/);
    assert.match(lifecycle, /Task 17[^\n]+deployed prelive evidence/i);
    assert.match(lifecycle, /partner traffic[^\n]+disabled/i);
    assert.match(lifecycle, /user interface[^\n]+disabled/i);

    for (const prohibited of [
      'App State bodies',
      'values',
      'tokens',
      'cursors',
      'dynamic key identifiers',
      'namespace identifiers',
      'raw user identifiers',
      'raw client identifiers',
      'deletion reasons',
      'credentials',
      'literal paths',
    ]) {
      assert.match(
        completeContract,
        new RegExp(prohibited, 'i'),
        `${tree.name} docs must prohibit ${prohibited} in telemetry`,
      );
    }
  }
});

test('documents the exact Connected Apps lifecycle envelopes, identifiers, and statuses', () => {
  for (const tree of trees) {
    const { lifecycle } = readTree(tree.root);

    assert.match(lifecycle, /success envelope[^\n]+`\{ success, data \}`/i);
    assert.match(lifecycle, /inventory[\s\S]{0,100}`data\.apps`/i);
    assert.match(lifecycle, /`appId`[\s\S]{0,100}UUID/i);
    assert.match(lifecycle, /`requestId`[\s\S]{0,100}UUID/i);
    assert.match(lifecycle, /POST lifecycle result[\s\S]{0,100}nested under `data`/i);
    assert.match(
      lifecycle,
      /service-error envelope\s+`\{ success: false, error \}`/i,
    );

    for (const status of [400, 401, 404, 409, 500, 503]) {
      assert.match(
        lifecycle,
        new RegExp(`\\|\\s*${status}\\s*\\|`),
        `${tree.name} lifecycle docs must include ${status}`,
      );
    }

    assert.doesNotMatch(lifecycle, /-->\|(?:Partial|Complete)\|/);
  }
});

test('uses route-correct sibling links between nested App State guide pages', () => {
  for (const tree of trees) {
    const { lifecycle, reconciliation } = readTree(tree.root);

    assert.match(lifecycle, /\]\(\.\.\/reconciliation\/\)/);
    assert.match(reconciliation, /\]\(\.\.\/lifecycle\/\)/);
    assert.doesNotMatch(lifecycle, /\]\(\.\/reconciliation\/?\)/);
    assert.doesNotMatch(reconciliation, /\]\(\.\/lifecycle\/?\)/);
  }
});

test('links the scopes pages and both API sidebars to the complete App State guides', () => {
  const sidebars = require(path.join(repoRoot, 'sidebars.js'));

  for (const tree of trees) {
    const docs = readTree(tree.root);
    const sidebarItems = sidebars[tree.sidebarKey];

    assert.ok(Array.isArray(sidebarItems), `${tree.sidebarKey} must be an exported sidebar`);

    assert.match(
      docs.scopes,
      new RegExp(`${tree.guidePath.replaceAll('/', '\\/')}`),
    );

    for (const page of ['index', 'reconciliation', 'lifecycle']) {
      const docId = `${tree.root}/app-state/${page}`;
      assert.ok(
        sidebarContainsDoc(sidebarItems, docId),
        `${tree.sidebarKey} must include ${docId}`,
      );
    }
  }
});

test('does not publish frozen fixture payloads or opaque continuation examples', () => {
  const docs = trees
    .flatMap(({ root }) => Object.values(readTree(root)))
    .join('\n');

  for (const sensitiveLiteral of [
    'app-state-fixture-client',
    'v2.opaque-',
    'strict-conflict-key-',
    'lineage-sync-',
    '"mode"',
    '"fontScale"',
  ]) {
    assert.doesNotMatch(docs, new RegExp(sensitiveLiteral, 'i'));
  }
});
