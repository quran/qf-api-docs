const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const api = JSON.parse(fs.readFileSync(path.join(root, 'openAPI/content/v4.json'), 'utf8'));
const readDoc = (...parts) => fs.readFileSync(path.join(root, 'docs', ...parts), 'utf8');

test('the OpenAPI contract exposes only the canonical singleton alongside Mushaf layout', () => {
  const groups = api.components.schemas.ContentSyncResourceGroup.enum;
  const types = api.components.schemas.ContentSyncRecordType.enum;
  const snapshot = api.paths['/resources/snapshots/{resource_group}/{id}'].get;
  const example = snapshot.responses['200'].content['application/json'].examples.quran_core_snapshot.value;

  assert.ok(groups.includes('quran_core'));
  for (const type of ['chapter', 'verse', 'juz', 'hizb', 'rub_el_hizb']) {
    assert.ok(types.includes(type));
  }
  assert.equal(example.resource_group, 'quran_core');
  assert.equal(example.resource_id, 1);
  assert.equal(example.resource_content_id, null);
  assert.deepEqual(example.records.map((record) => record.record_type), ['chapter', 'verse', 'juz']);
  assert.equal(example.records[1].text_uthmani, 'بِسْمِ ٱللَّهِ');
  assert.ok(!('pages' in example.records[0]));
  assert.match(snapshot.description, /redistribution terms/);
  assert.match(snapshot.description, /The singleton `quran_core:1` snapshot contains/);
  assert.doesNotMatch(snapshot.description, /forthcoming|publication pending|once published|after publication/i);
  assert.match(api.paths['/resources/sync'].get.description, /quran_core:1/);
});

test('generated endpoint pages reflect the new group and record types', () => {
  for (const prefix of [[], ['4.0.0']]) {
    const snapshot = readDoc('content_apis_versioned', ...prefix, 'resources-snapshot.api.mdx');
    const sync = readDoc('content_apis_versioned', ...prefix, 'resources-sync.api.mdx');
    assert.match(snapshot, /quran_core:1/);
    assert.match(snapshot, /quran_core_snapshot/);
    assert.match(sync, /quran_core:1/);
    assert.match(sync, /rub_el_hizb/);
  }
});

test('tutorials and SDK guides distinguish the released canonical text from layout', () => {
  for (const file of [
    ['tutorials', 'content-sync', 'getting-started.mdx'],
    ['tutorials', 'content-sync', 'full-copies-and-recovery.mdx'],
    ['sdk', 'javascript', 'resources.mdx'],
    ['sdk', 'python', 'resources.mdx'],
  ]) {
    const doc = readDoc(...file);
    assert.match(doc, /quran_core:1/);
    assert.match(doc, /mushafs:/);
    assert.doesNotMatch(
      doc,
      /forthcoming|publication pending|once published|after publication|approved before publication/i,
    );
  }
});
