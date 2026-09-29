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

const snapshotOperation =
  contentApi.paths['/resources/snapshots/{resource_group}/{id}'].get;
const snapshotExamples =
  snapshotOperation.responses['200'].content['application/json'].examples;

test('publishes chapter recitations as a first-class Content Sync group', () => {
  const resourceGroups =
    contentApi.components.schemas.ContentSyncResourceGroup.enum;
  const resourceGroupParameter = snapshotOperation.parameters.find(
    (parameter) => parameter.name === 'resource_group',
  );

  assert.ok(resourceGroups.includes('chapter_recitations'));
  assert.match(resourceGroupParameter.description, /chapter_recitations/);
  assert.match(
    snapshotOperation.description,
    /Audio::Recitation\.id/,
  );
});

test('documents the chapter-recitation snapshot record shape and identity', () => {
  const recordTypes = contentApi.components.schemas.ContentSyncRecordType.enum;
  const chapterSnapshot = snapshotExamples.chapter_recitation_snapshot?.value;

  assert.ok(recordTypes.includes('chapter_audio_file'));
  assert.ok(recordTypes.includes('audio_segment'));
  assert.ok(chapterSnapshot);
  assert.equal(chapterSnapshot.resource_group, 'chapter_recitations');
  assert.equal(chapterSnapshot.resource_id, 159);
  assert.deepEqual(Object.keys(chapterSnapshot.records[0]).sort(), [
    'audio_recitation_id',
    'audio_url',
    'chapter_id',
    'id',
    'record_type',
  ]);
  assert.equal(chapterSnapshot.records[0].record_type, 'chapter_audio_file');
  assert.equal(chapterSnapshot.records[0].audio_recitation_id, 159);
  assert.deepEqual(Object.keys(chapterSnapshot.records[1]).sort(), [
    'audio_file_id',
    'audio_recitation_id',
    'chapter_id',
    'duration',
    'duration_ms',
    'id',
    'record_type',
    'segments',
    'timestamp_from',
    'timestamp_median',
    'timestamp_to',
    'updated_at',
    'verse_id',
    'verse_key',
    'verse_number',
  ]);
  assert.equal(chapterSnapshot.records[1].record_type, 'audio_segment');
  assert.equal(chapterSnapshot.records[1].audio_recitation_id, 159);
  assert.deepEqual(chapterSnapshot.records[1].segments[0], [1, 120, 810]);
});

test('publishes audio segments in generated snapshot reference pages', () => {
  for (const docPath of [
    ['docs', 'content_apis_versioned', 'resources-snapshot.api.mdx'],
    ['docs', 'content_apis_versioned', '4.0.0', 'resources-snapshot.api.mdx'],
  ]) {
    const doc = fs.readFileSync(path.join(__dirname, '..', ...docPath), 'utf8');

    assert.ok(doc.includes('"record_type":"audio_segment"'));
    assert.match(doc, /associated audio segment verse and word timings/);
  }
});

test('keeps the legacy recitations compatibility distinction in the API docs', () => {
  const syncDescription = contentApi.paths['/resources/sync'].get.description;
  const snapshotDescription = snapshotOperation.description;

  assert.match(syncDescription, /legacy.*recitations/i);
  assert.match(syncDescription, /chapter_recitations/);
  assert.match(snapshotDescription, /backward compatibility/i);
  assert.match(snapshotDescription, /audio segment rows/i);
});
