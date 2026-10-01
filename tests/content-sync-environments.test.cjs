const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const guide = fs.readFileSync(
  path.join(__dirname, '..', 'docs', 'tutorials', 'content-sync', 'getting-started.mdx'),
  'utf8',
);

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
