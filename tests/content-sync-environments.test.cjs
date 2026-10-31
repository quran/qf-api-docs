const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const guide = fs.readFileSync(
  path.join(root, 'docs', 'tutorials', 'content-sync', 'getting-started.mdx'),
  'utf8',
);
const contentApi = JSON.parse(
  fs.readFileSync(path.join(root, 'openAPI', 'content', 'v4.json'), 'utf8'),
);
const syncOperation = contentApi.paths['/resources/sync'].get;

function assertEnvironmentAwarePaths(description) {
  assert.match(description, /https:\/\/apis-prelive\.quran\.foundation\/content` for prelive/);
  assert.match(description, /https:\/\/apis\.quran\.foundation\/content` for production/);
  assert.match(description, /Always use the environment that returned the path/);
  assert.match(description, /using that environment's credentials/);
}

test('distinguishes Content Sync API support from environment-specific publication', () => {
  assert.match(guide, /Content Sync is available in prelive and production/);
  assert.match(guide, /https:\/\/apis-prelive\.quran\.foundation\/content\/api\/v4/);
  assert.match(guide, /https:\/\/apis\.quran\.foundation\/content\/api\/v4/);
  assert.match(guide, /Resource publication and sync history are environment-specific/);
  assert.match(guide, /Bootstrap returns only public resources matching your filter/);
  assert.match(guide, /snapshot_not_found.*404/);
});

test('does not describe a partial prelive dataset as the canonical Quran core', () => {
  assert.match(guide, /Al-Fatihah \(surah 1\) and Al-Baqarah \(surah 2\)/);
  assert.match(guide, /quran_core:1.*complete canonical Quran/);
  assert.match(guide, /all 114 surahs, 6,236 verses/);
  assert.match(guide, /not a partial two-surah resource/);
  assert.match(guide, /use the complete production resource with approved production access/);
});

test('keeps pagination, snapshots, credentials, and checkpoints in the same environment', () => {
  assert.match(guide, /Keep sync tokens, cursors, and local caches separate for each environment/);
  assert.match(guide, /same environment that returned them, using that environment's credentials/);
  assert.match(guide, /https:\/\/apis-prelive\.quran\.foundation\/content` for prelive/);
  assert.match(guide, /Always use the environment that returned the path/);
});

test('keeps offline snapshot URL guidance in the originating environment', () => {
  const offlineGuide = fs.readFileSync(
    path.join(root, 'docs', 'tutorials', 'content-sync', 'offline-cache-patterns.mdx'),
    'utf8',
  );
  assertEnvironmentAwarePaths(offlineGuide);
});

test('keeps the OpenAPI sync description and cursor guidance environment-aware', () => {
  const cursor = syncOperation.parameters.find((parameter) => parameter.name === 'cursor');
  assertEnvironmentAwarePaths(syncOperation.description);
  assertEnvironmentAwarePaths(cursor.description);
});

test('keeps shared pagination and snapshot schema descriptions environment-aware', () => {
  const schemas = contentApi.components.schemas;
  assertEnvironmentAwarePaths(schemas.ContentSyncResponse.properties.sync.properties.next_page_url.description);
  assertEnvironmentAwarePaths(schemas.ContentSyncMutation.properties.snapshot_url.description);
});

test('regenerates both sync references from the environment-aware OpenAPI source', () => {
  for (const relativePath of [
    'docs/content_apis_versioned/resources-sync.api.mdx',
    'docs/content_apis_versioned/4.0.0/resources-sync.api.mdx',
  ]) {
    const doc = fs.readFileSync(path.join(root, relativePath), 'utf8');
    const apiLine = doc.split('\n').find((line) => line.startsWith('api: '));
    const generatedApi = JSON.parse(apiLine.slice('api: '.length));
    assert.equal(generatedApi.description, syncOperation.description);
    assertEnvironmentAwarePaths(generatedApi.description);
    assertEnvironmentAwarePaths(generatedApi.parameters.find((parameter) => parameter.name === 'cursor').description);
    const sync = generatedApi.responses['200'].content['application/json'].schema.properties.sync;
    assertEnvironmentAwarePaths(sync.properties.next_page_url.description);
    assertEnvironmentAwarePaths(sync.properties.mutations.items.properties.snapshot_url.description);
    assert.ok(doc.includes(syncOperation.description), 'Rendered operation prose must match its OpenAPI description');
  }
});
