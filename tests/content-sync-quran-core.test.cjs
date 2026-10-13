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
  for (const type of ['chapter', 'verse', 'word', 'juz', 'hizb', 'rub_el_hizb']) {
    assert.ok(types.includes(type));
  }
  assert.equal(example.resource_group, 'quran_core');
  assert.equal(example.resource_id, 1);
  assert.equal(example.resource_content_id, null);
  assert.deepEqual(example.records.map((record) => record.record_type), ['chapter', 'verse', 'word', 'juz']);
  assert.equal(example.records[1].text_uthmani, 'بِسْمِ ٱللَّهِ');
  assert.equal(example.records[2].text_indopak, 'بِسْمِ');
  assert.equal(example.records[2].text_uthmani_tajweed, 'بِسْمِ');
  assert.ok(!('pages' in example.records[0]));
  assert.match(snapshot.description, /Use of the canonical text remains subject to the Developer Terms and attribution requirements\./);
  assert.doesNotMatch(snapshot.description, /source-specific/);
  assert.match(snapshot.description, /The singleton `quran_core:1` snapshot contains/);
  assert.match(snapshot.description, /83,665 word records/);
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
    assert.match(sync, /text_uthmani_tajweed/);
  }
});

test('tutorials and SDK guides distinguish the released canonical text from layout', () => {
  for (const file of [
    ['tutorials', 'content-sync', 'getting-started.mdx'],
    ['tutorials', 'content-sync', 'full-copies-and-recovery.mdx'],
    ['tutorials', 'content-sync', 'client-flow.mdx'],
    ['sdk', 'javascript', 'resources.mdx'],
    ['sdk', 'python', 'resources.mdx'],
  ]) {
    const doc = readDoc(...file);
    assert.match(doc, /quran_core:1/);
    assert.match(doc, /mushafs(?::|`)/);
    assert.doesNotMatch(
      doc,
      /forthcoming|publication pending|once published|when published|after publication|after rollout|approves publication|approved and published|snapshot is unavailable/i,
    );
  }
});

test('Quran core word docs prefer text_indopak_nastaleeq and keep text_indopak as deprecated', () => {
  const fontLink = '/docs/tutorials/fonts/font-rendering#indopak-nastaleeq-font';
  for (const file of [
    ['tutorials', 'content-sync', 'getting-started.mdx'],
    ['tutorials', 'content-sync', 'full-copies-and-recovery.mdx'],
    ['tutorials', 'faq.mdx'],
  ]) {
    const doc = readDoc(...file);
    assert.match(doc, /`text_indopak_nastaleeq`, `text_indopak`, and\s+`text_uthmani_tajweed`/);
    assert.match(doc, /`text_indopak` is deprecated and\s+retained for compatibility/);
    assert.ok(doc.includes(fontLink), `${file.join('/')} links the compatible font`);
    assert.match(doc, /indopak-nastaleeq-waqf-lazim-v4\.2\.1/);
    assert.match(doc, /re-snapshotted or\s+backfilled/);
  }

  const recovery = readDoc('tutorials', 'content-sync', 'full-copies-and-recovery.mdx');
  const example = JSON.parse(recovery.match(/```json\n(\{\s*"resource_group": "quran_core"[\s\S]*?)\n```/)[1]);
  const word = example.records.find((record) => record.record_type === 'word');
  assert.equal(word.text_indopak_nastaleeq, 'بِسْمِ');
  assert.equal(word.text_indopak, 'بِسْمِ');
});

test('field reference lists text_indopak_nastaleeq at verse and word level and deprecates text_indopak', () => {
  const doc = readDoc('api', 'field-reference.mdx');
  const [verseSection, wordSection] = doc
    .split(/^## /m)
    .filter((section) => /`(word_)?fields`/.test(section.split('\n')[0]));
  for (const section of [verseSection, wordSection]) {
    assert.match(section, /\| `text_indopak_nastaleeq` \| .*indopak-nastaleeq-font/);
    assert.match(section, /\| `text_indopak` \| Deprecated/);
  }
});

test('OpenAPI contract lists text_indopak_nastaleeq on Quran core and word records and deprecates text_indopak', () => {
  const recordType = api.components.schemas.ContentSyncRecordType.description;
  assert.match(recordType, /`char_type_name`, `text_indopak_nastaleeq`, `text_indopak`, `text_uthmani_tajweed`, and `updated_at`/);
  assert.match(recordType, /`text_indopak` is deprecated and retained for compatibility/);
  assert.ok(recordType.includes('/docs/tutorials/fonts/font-rendering#indopak-nastaleeq-font'));

  const snapshot = api.paths['/resources/snapshots/{resource_group}/{id}'].get;
  const example = snapshot.responses['200'].content['application/json'].examples.quran_core_snapshot.value;
  const word = example.records.find((record) => record.record_type === 'word');
  assert.equal(word.text_indopak_nastaleeq, 'بِسْمِ');
  assert.equal(word.text_indopak, 'بِسْمِ');

  const wordSchema = api.components.schemas.word.properties;
  assert.equal(wordSchema.text_indopak.deprecated, true);
  assert.equal(wordSchema.text_indopak_nastaleeq.type, 'string');
  assert.equal(wordSchema.text_indopak_nastaleeq.nullable, true);
  assert.match(wordSchema.text_indopak_nastaleeq.description, /indopak-nastaleeq-font/);

  for (const name of ['verse', 'QuranVerseText']) {
    const props = api.components.schemas[name].properties;
    assert.equal(props.text_indopak.deprecated, true, `${name}.text_indopak is deprecated`);
    assert.match(props.text_indopak.description, /Use `text_indopak_nastaleeq`/);
    assert.match(props.text_indopak_nastaleeq.description, /indopak-nastaleeq-font/);
  }
});
