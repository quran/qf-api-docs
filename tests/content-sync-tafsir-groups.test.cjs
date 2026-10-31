const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const contentApi = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'openAPI', 'content', 'v4.json'),
    'utf8',
  ),
);

const readDoc = (...segments) =>
  fs.readFileSync(path.join(__dirname, '..', ...segments), 'utf8');

const snapshotOperation =
  contentApi.paths['/resources/snapshots/{resource_group}/{id}'].get;

test('documents that one tafsir snapshot row can cover a verse range', () => {
  const { description } = snapshotOperation;

  assert.match(description, /tafsir snapshot may not have one row per verse/);
  assert.match(description, /use the row with non-empty `text` whose range contains that verse's ID/);
  assert.match(description, /full-copies-and-recovery#tafsir-records/);
});

test('tafsir snapshot example shows the grouped range fields', () => {
  const tafsirExample =
    snapshotOperation.responses['200'].content['application/json'].examples
      .tafsir_snapshot.value;
  const [record] = tafsirExample.records;

  assert.equal(tafsirExample.resource_id, 164);
  assert.equal(record.verse_key, '108:1');
  assert.equal(record.group_verse_key_from, '108:1');
  assert.equal(record.group_verse_key_to, '108:3');
  assert.equal(record.group_verses_count, 3);
  assert.equal(record.end_verse_id - record.start_verse_id + 1, 3);
});

test('generated snapshot pages and tutorial explain tafsir verse ranges', () => {
  for (const docPath of [
    ['docs', 'content_apis_versioned', 'resources-snapshot.api.mdx'],
    ['docs', 'content_apis_versioned', '4.0.0', 'resources-snapshot.api.mdx'],
  ]) {
    const doc = readDoc(...docPath);

    assert.ok(doc.includes(snapshotOperation.description.split('\n\n')[1]));
    assert.ok(doc.includes('"group_verse_key_to":"108:3"'));
  }

  const fullCopies = readDoc(
    'docs',
    'tutorials',
    'content-sync',
    'full-copies-and-recovery.mdx',
  );

  assert.match(fullCopies, /### Tafsir Records/);
  assert.match(fullCopies, /use the row with non-empty `text`\nwhose `start_verse_id` to `end_verse_id` range contains that verse's ID/);
  assert.match(fullCopies, /Last verse in tafsir `818`/);
  assert.match(fullCopies, /Do not use `group_tafsir_id` to find the range/);
});
