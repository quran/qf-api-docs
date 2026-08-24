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
const normalize = (value) =>
  value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
const extractBacktickedValues = (value) =>
  [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
const faqSectionSource = (heading) => {
  const headingIndex = faq.indexOf(`## ${heading}`);
  if (headingIndex < 0) return '';

  const contentStart = faq.indexOf('\n', headingIndex) + 1;
  const nextHeading = faq.indexOf('\n## ', contentStart);
  return faq.slice(contentStart, nextHeading < 0 ? faq.length : nextHeading);
};
const faqSection = (heading) => normalize(faqSectionSource(heading));

test('keeps the FAQ policy answers grounded in the current source terms', () => {
  assert.match(developerTerms, /\*\*Last updated:\*\* 2026-08-18/);
  assert.match(developerTerms, /Cache or store QF Content longer than \*\*1 week\*\*/);
  assert.match(developerTerms, /QF has expressly permitted longer storage/);
  assert.match(
    developerTerms,
    /commercial license:\*\* A Developer may charge for an Application, offer subscriptions or in-app purchases, display advertising, accept donations, or use a freemium model/,
  );
  assert.match(
    developerTerms,
    /A Developer must obtain a signed commercial license before selling, sublicensing, or redistributing QF Content or raw API data/,
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

test('locks the safety-critical FAQ policy qualifiers', () => {
  const commercialAnswer = faqSection(
    'Can I use QF Content in a commercial or freemium app?',
  );
  const storageAnswer = faqSection('How long can I cache or store QF Content?');
  const contentSyncAnswer = faqSection(
    'Can I use Content Sync for Quran text or word-by-word data?',
  );
  const attributionAnswer = faqSection(
    'What attribution or copyright information should I show?',
  );
  const helpAnswer = faqSection(
    'How do I get help with licensing, attribution, or a policy question?',
  );

  assert.match(commercialAnswer, /^Yes\./);
  assert.match(
    commercialAnswer,
    /A Developer may charge for an Application, offer subscriptions or in-app purchases, display advertising, accept donations, or use a freemium model without a separate commercial license/,
  );
  assert.match(
    commercialAnswer,
    /QF Content is displayed only as part of the Application’s end-user experience/,
  );
  assert.match(
    commercialAnswer,
    /QF Content and raw API data are not sold, sublicensed, or redistributed/,
  );
  assert.match(
    commercialAnswer,
    /A Developer must obtain a signed commercial license before selling, sublicensing, or redistributing QF Content or raw API data/,
  );
  assert.match(
    commercialAnswer,
    /dataset, data feed, API, content package, or other separately distributed product/,
  );
  assert.match(
    storageAnswer,
    /Do not cache or store QF Content for more than 1 week unless QF has expressly permitted longer storage/,
  );
  assert.match(
    storageAnswer,
    /perform a next sync at least every 7 days and apply all available changes\./,
  );
  assert.match(
    contentSyncAnswer,
    /^Content Sync does not support Quran text, but it supports/,
  );
  assert.match(
    contentSyncAnswer,
    /Use the relevant regular content endpoint for Quran text and other unsupported data\./,
  );
  assert.match(
    attributionAnswer,
    /For Connected Apps, display attribution wherever Quranic content is surfaced:/,
  );
  assert.match(
    attributionAnswer,
    /Quran data provided by Quran Foundation\./,
  );
  assert.match(
    helpAnswer,
    /Report actual or suspected unauthorised API-related access, security breach, or data exposure within 24 hours\./,
  );
  assert.match(helpAnswer, /Do not include client secrets or access tokens\./);
});

test('synchronizes the exact Content Sync groups', () => {
  const expectedGroups = [
    'translations',
    'word_by_word_translations',
    'tafsirs',
    'recitations',
    'articles',
  ];
  const sourceSupportStatement = contentSync.match(
    /Content Sync currently supports these resource groups:\s*([^\.\r\n]+)\./,
  );
  assert.ok(
    sourceSupportStatement,
    'expected the Content Sync tutorial to declare its supported groups',
  );
  const sourceGroups = extractBacktickedValues(sourceSupportStatement[1]);
  const faqGroups = extractBacktickedValues(
    faqSectionSource('Can I use Content Sync for Quran text or word-by-word data?'),
  );

  assert.deepEqual(
    [...sourceGroups].sort(),
    [...expectedGroups].sort(),
    'the source support matrix must remain exactly five groups',
  );
  assert.deepEqual(
    [...faqGroups].sort(),
    [...sourceGroups].sort(),
    'the FAQ Content Sync groups must match the source support matrix',
  );
});
