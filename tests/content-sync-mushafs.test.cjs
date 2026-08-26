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

test('publishes Mushafs as a content sync resource group', () => {
  const resourceGroups =
    contentApi.components.schemas.ContentSyncResourceGroup.enum;
  const snapshotOperation =
    contentApi.paths['/resources/snapshots/{resource_group}/{id}'].get;
  const resourceGroupParameter = snapshotOperation.parameters.find(
    (parameter) => parameter.name === 'resource_group',
  );

  assert.ok(resourceGroups.includes('mushafs'));
  assert.match(resourceGroupParameter.description, /mushafs/);
});

test('publishes the Mushaf snapshot record contract', () => {
  const recordTypes = contentApi.components.schemas.ContentSyncRecordType.enum;
  const snapshotExamples =
    contentApi.paths['/resources/snapshots/{resource_group}/{id}'].get.responses[
      '200'
    ].content['application/json'].examples;

  for (const recordType of [
    'mushaf',
    'mushaf_page',
    'font_asset',
    'mushaf_word',
  ]) {
    assert.ok(recordTypes.includes(recordType));
  }

  assert.ok(snapshotExamples.mushaf_snapshot);
  const mushafSnapshot = snapshotExamples.mushaf_snapshot.value;

  assert.equal(mushafSnapshot.resource_group, 'mushafs');
  assert.deepEqual(
    mushafSnapshot.records.map((record) => record.record_type),
    ['mushaf', 'mushaf_page', 'mushaf_word'],
  );
  assert.equal(mushafSnapshot.records[0].mapping_mode, 'reference');
  assert.equal(mushafSnapshot.records[2].position_in_page, 1);
});
