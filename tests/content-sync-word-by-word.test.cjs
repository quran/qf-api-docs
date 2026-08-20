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

test('publishes word-by-word translations as a content sync resource group', () => {
  const resourceGroups =
    contentApi.components.schemas.ContentSyncResourceGroup.enum;
  const snapshotOperation =
    contentApi.paths['/resources/snapshots/{resource_group}/{id}'].get;
  const resourceGroupParameter = snapshotOperation.parameters.find(
    (parameter) => parameter.name === 'resource_group',
  );

  assert.ok(resourceGroups.includes('word_by_word_translations'));
  assert.match(
    resourceGroupParameter.description,
    /word_by_word_translations/,
  );
});

test('publishes the word translation mutation and snapshot record contract', () => {
  const recordTypes = contentApi.components.schemas.ContentSyncRecordType.enum;
  const snapshotExamples =
    contentApi.paths['/resources/snapshots/{resource_group}/{id}'].get.responses[
      '200'
    ].content['application/json'].examples;

  assert.ok(recordTypes.includes('word_translation'));
  assert.ok(snapshotExamples.word_by_word_translation_snapshot);

  const wordSnapshot = snapshotExamples.word_by_word_translation_snapshot.value;

  assert.equal(wordSnapshot.resource_group, 'word_by_word_translations');
  assert.deepEqual(Object.keys(wordSnapshot.records[0]), [
    'id',
    'resource_content_id',
    'resource_id',
    'word_id',
    'language_id',
    'language_name',
    'text',
    'priority',
    'updated_at',
  ]);
});
