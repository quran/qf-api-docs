const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const headersPath = path.join(repoRoot, 'static', '_headers');
const cardPath = path.join(
  repoRoot,
  'static',
  '.well-known',
  'mcp',
  'server-card.json',
);
const packageJsonPath = path.join(repoRoot, 'package.json');

const headers = fs.readFileSync(headersPath, 'utf8');
const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

test('publishes a well-known MCP server card with discovery metadata', () => {
  assert.equal(
    card.$schema,
    'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
  );
  assert.equal(card.version, '1.0');
  assert.equal(card.protocolVersion, '2025-11-25');
  assert.deepEqual(card.serverInfo, {
    name: 'api-docs.quran.foundation',
    title: 'Quran Foundation API Docs',
    version: packageJson.version,
  });
  assert.deepEqual(card.transport, {
    type: 'streamable-http',
    endpoint: '/mcp',
  });
  assert.deepEqual(card.capabilities, {
    resources: {},
  });
  assert.ok(Array.isArray(card.resources));
  assert.ok(card.resources.length >= 9);
  for (const resource of card.resources) {
    assert.match(resource.uri, /^https:\/\/api-docs\.quran\.foundation\//);
    assert.equal(typeof resource.name, 'string');
    assert.equal(typeof resource.title, 'string');
    assert.equal(typeof resource.description, 'string');
    assert.equal(typeof resource.mimeType, 'string');
  }
});

test('includes curated onboarding pages alongside API resources', () => {
  const resourceUris = new Set(card.resources.map((resource) => resource.uri));

  assert.ok(
    resourceUris.has('https://api-docs.quran.foundation/docs/quickstart/'),
  );
  assert.ok(
    resourceUris.has(
      'https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/',
    ),
  );
  assert.ok(
    resourceUris.has(
      'https://api-docs.quran.foundation/docs/tutorials/oidc/user-apis-quickstart/',
    ),
  );
  assert.ok(
    resourceUris.has('https://api-docs.quran.foundation/request-access/'),
  );
});

test('adds homepage link discovery for the MCP server card', () => {
  assert.match(
    headers,
    /^  Link: <\/\.well-known\/mcp\/server-card\.json>; rel="service-desc"; type="application\/json"$/m,
  );
});

test('serves the MCP server card route with CORS and cache headers', () => {
  const match = headers.match(
    /^\/\.well-known\/mcp\/server-card\.json\r?\n((?:  .*\r?\n?)*)/m,
  );

  assert.ok(match, 'missing /.well-known/mcp/server-card.json header block');

  const block = match[1];
  assert.match(block, /^  ! Cache-Control$/m);
  assert.match(block, /^  Access-Control-Allow-Origin: \*$/m);
  assert.match(block, /^  Access-Control-Allow-Methods: GET$/m);
  assert.match(block, /^  Access-Control-Allow-Headers: Content-Type$/m);
  assert.match(block, /^  Cache-Control: public, max-age=3600$/m);
});
