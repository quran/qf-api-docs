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
});

test('keeps the legacy recitations compatibility distinction in the API docs', () => {
  const syncDescription = contentApi.paths['/resources/sync'].get.description;
  const snapshotDescription = snapshotOperation.description;

  assert.match(syncDescription, /legacy.*recitations/i);
  assert.match(syncDescription, /chapter_recitations/);
  assert.match(snapshotDescription, /backward compatibility/i);
});
