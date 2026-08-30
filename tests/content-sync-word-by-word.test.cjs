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
  assert.deepEqual(
    Object.keys(wordSnapshot.records[0]).sort(),
    [
      'id',
      'resource_content_id',
      'resource_id',
      'word_id',
      'language_id',
      'language_name',
      'text',
      'priority',
      'updated_at',
    ].sort(),
  );
});

test('publishes word-by-word transliterations as a separate resource contract', () => {
  const resourceGroups =
    contentApi.components.schemas.ContentSyncResourceGroup.enum;
  const recordTypes = contentApi.components.schemas.ContentSyncRecordType.enum;
  const snapshotOperation =
    contentApi.paths['/resources/snapshots/{resource_group}/{id}'].get;
  const resourceGroupParameter = snapshotOperation.parameters.find(
    (parameter) => parameter.name === 'resource_group',
  );
  const snapshotExamples =
    snapshotOperation.responses['200'].content['application/json'].examples;
  const transliterationSnapshot =
    snapshotExamples.word_by_word_transliteration_snapshot.value;
  const record = transliterationSnapshot.records[0];

  assert.ok(resourceGroups.includes('word_by_word_transliterations'));
  assert.ok(recordTypes.includes('word_transliteration'));
  assert.match(
    resourceGroupParameter.description,
    /word_by_word_transliterations/,
  );
  assert.equal(transliterationSnapshot.resource_id, 60);
  assert.equal(transliterationSnapshot.resource_content_id, 60);
  assert.match(snapshotOperation.description, /77,431 records/);
  assert.match(snapshotOperation.description, /ordered by `word_id` and then `id`/);
  assert.equal(record.id, 1);
  assert.equal(record.resource_id, 60);
  assert.equal(record.resource_content_id, 60);
  assert.equal(record.word_id, 60);
  assert.equal(record.text, "bis'mi");
  assert.deepEqual(
    Object.keys(record).sort(),
    [
      'id',
      'resource_content_id',
      'resource_id',
      'word_id',
      'language_id',
      'language_name',
      'text',
      'updated_at',
    ].sort(),
  );
});

test('documents production transliteration facts and SDK field casing', () => {
  const tutorial = readDoc(
    'docs',
    'tutorials',
    'content-sync',
    'getting-started.mdx',
  );
  const javascriptGuide = readDoc(
    'docs',
    'sdk',
    'javascript',
    'resources.mdx',
  );
  const pythonGuide = readDoc('docs', 'sdk', 'python', 'resources.mdx');

  assert.match(tutorial, /resource `60` currently contains 77,431 records/);
  assert.match(tutorial, /ordered by `word_id`, then `id`/);
  assert.match(
    javascriptGuide,
    /resourceContentId.*resourceId.*wordId.*languageId.*languageName.*updatedAt/s,
  );
  assert.match(
    javascriptGuide,
    /resource `60`\s+currently contains 77,431 records/,
  );
  assert.match(
    pythonGuide,
    /resource_content_id.*resource_id.*word_id.*language_id.*language_name.*updated_at/s,
  );
  assert.match(
    pythonGuide,
    /resource `60`\s+currently contains 77,431 records/,
  );
});
