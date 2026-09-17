const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generateLlmsTxt } = require('../plugins/llms-txt-plugin');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const wording = 'The prelive environment is for testing and development only. Its Quran content dataset includes only Al-Fatihah (surah 1) and Al-Baqarah (surah 2). Test content requests using these surahs. For the complete Quran dataset, use the production environment after production access is approved.';

test('documents the same prelive Content API limitation at all four entry points', () => {
  const spec = JSON.parse(read('openAPI/content/v4.json'));
  const { content } = generateLlmsTxt(path.join(root, 'docs'));
  for (const document of [
    read('docs/quickstart/index.md'),
    read('docs/tutorials/faq.mdx'),
    spec.info.description,
    content,
  ]) {
    assert.ok(document.includes(wording));
  }
  assert.equal(read('static/llms.txt'), content);
  assert.ok(content.indexOf(wording) < content.indexOf('## OpenAPI Specifications'));
  assert.match(
    spec.servers.find((server) => server.url === 'https://apis-prelive.quran.foundation/content/api/v4').description,
    /testing and development only; Quran content is limited to Al-Fatihah \(surah 1\) and Al-Baqarah \(surah 2\)/,
  );
});

test('scopes the troubleshooting answer to Content APIs rather than User APIs', () => {
  const faq = read('docs/tutorials/faq.mdx');
  assert.match(faq, /^## Why is content unavailable for surahs 3–114 in prelive\?$/m);
  assert.match(faq, /This limitation applies to Quran content in the Content API, not to User-related APIs\./);
});
