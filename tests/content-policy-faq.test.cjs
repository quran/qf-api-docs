const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.join(__dirname, '..');
const faq = fs.readFileSync(
  path.join(repositoryRoot, 'docs', 'tutorials', 'faq.mdx'),
  'utf8',
);
const developerTerms = fs.readFileSync(
  path.join(repositoryRoot, 'src', 'pages', 'legal', 'developer-terms.mdx'),
  'utf8',
);
const contentSync = fs.readFileSync(
  path.join(
    repositoryRoot,
    'docs',
    'tutorials',
    'content-sync',
    'getting-started.mdx',
  ),
  'utf8',
);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('keeps the FAQ policy answers grounded in the current source terms', () => {
  assert.match(developerTerms, /\*\*Last updated:\*\* 2026-08-10/);
  assert.match(developerTerms, /Cache or store QF Content longer than \*\*1 week\*\*/);
  assert.match(developerTerms, /QF has expressly permitted longer storage/);
  assert.match(
    developerTerms,
    /separate written commercial license agreement with QF/,
  );
});

test('documents the required content policy FAQ questions and links', () => {
  const requiredQuestions = [
    'Can I use QF Content in a commercial or freemium app?',
    'How long can I cache or store QF Content?',
    'Can I use Content Sync for Quran text or word-by-word data?',
    'What attribution or copyright information should I show?',
    'How do I get help with licensing, attribution, or a policy question?',
  ];

  for (const question of requiredQuestions) {
    assert.match(faq, new RegExp(`^## ${escapeRegExp(question)}$`, 'm'));
  }

  for (const link of [
    '/legal/developer-terms',
    '/docs/tutorials/content-sync/getting-started#content-available-for-offline-sync',
    '/docs/tutorials/content-sync/getting-started#next-sync',
    '/docs/content_apis_versioned/4.0.0/content-apis/',
    '/docs/connected-apps#content-and-attribution-requirements',
    'mailto:developers@quran.com',
  ]) {
    assert.match(faq, new RegExp(escapeRegExp(link)));
  }
});

test('states Content Sync coverage and excludes community Discord guidance', () => {
  for (const group of ['translations', 'tafsirs', 'recitations', 'articles']) {
    assert.match(contentSync, new RegExp('`' + group + '`'));
    assert.match(faq, new RegExp('`' + group + '`'));
  }

  assert.match(
    faq,
    /## Can I use Content Sync for Quran text or word-by-word data\?[\s\S]*?\n\nNo\. Content Sync currently supports[\s\S]*?for other data\./,
  );
  assert.doesNotMatch(faq, /discord\.gg|discord\.com/i);
});
