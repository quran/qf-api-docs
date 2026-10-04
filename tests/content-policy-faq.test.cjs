const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generateLlmsTxt } = require('../plugins/llms-txt-plugin');

const repositoryRoot = path.join(__dirname, '..');
const docsDir = path.join(repositoryRoot, 'docs');
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
const removedMushafImagesPage = path.join(
  repositoryRoot,
  'src',
  'pages',
  'legal',
  'mushaf-fonts-and-images.mdx',
);
const fontRendering = fs.readFileSync(
  path.join(repositoryRoot, 'docs', 'tutorials', 'fonts', 'font-rendering.md'),
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
  assert.match(developerTerms, /\*\*Last updated:\*\* 2026-10-04/);
  assert.match(developerTerms, /Cache or store QF Content longer than \*\*1 week\*\*/);
  assert.doesNotMatch(developerTerms, /QF has expressly permitted longer storage/);
  assert.match(
    developerTerms,
    /commercial license:\*\* A Developer may charge for an Application, offer subscriptions or in-app purchases, display advertising, accept donations, or use a freemium model/,
  );
  assert.match(
    developerTerms,
    /A Developer must obtain a signed commercial license before selling, sublicensing, or redistributing QF Content or raw API data/,
  );
  assert.match(
    developerTerms,
    /Social-media videos are not redistribution/,
  );
  assert.match(
    developerTerms,
    /Serving QF Content from a Developer-controlled backend within the Application's end-user experience is not, by itself, redistribution/,
  );
  assert.match(
    developerTerms,
    /may cache or bundle font files and Mushaf images obtained through QF APIs or documented CDN URLs[\s\S]*active account in the \[Developer Console\][\s\S]*credits Quran Foundation/,
  );
  assert.match(developerTerms, /the Application complies with these Terms\./);
  assert.match(faq, /the Application complies with the \[Developer Terms\]\(\/legal\/developer-terms\)\./);
  assert.match(faq, /The files may be distributed only as an integrated part of your application, not through your own API/);
  assert.doesNotMatch(faq, /integrated part of your application, subject to source-specific terms/);
});

test('documents the required content policy FAQ questions and links', () => {
  const requiredQuestions = [
    'Can I use QF Content in a commercial or freemium app?',
    'Why do I need Content Sync?',
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
    commercialAnswer,
    /Using QF Content in a social-media video is not redistribution if you credit Quran Foundation/,
  );
  assert.match(
    storageAnswer,
    /Do not cache or store QF Content for more than 1 week unless it is obtained and maintained through the Content Sync APIs/,
  );
  assert.match(
    storageAnswer,
    /perform a next sync at least every 7 days when connectivity to QF permits and apply all available changes/,
  );
  assert.match(storageAnswer, /Previously synced content may remain available while connectivity to QF is unavailable, even beyond seven days/);
  assert.match(storageAnswer, /sync promptly when connectivity returns/);
  assert.match(storageAnswer, /Content Sync exception covers the rows returned by that API; recitation rows contain audio URLs, not the underlying recording files/);
  assert.match(
    storageAnswer,
    /Font files and Mushaf images obtained through Quran Foundation APIs or documented CDN URLs may be cached or bundled[\s\S]*active Developer Console account and credit Quran Foundation/,
  );
  assert.match(
    contentSyncAnswer,
    /^Content Sync supports `quran_core`, approved public Quran layouts through `mushafs`/,
  );
  assert.match(
    contentSyncAnswer,
    /Use the relevant regular content endpoint for unsupported Quran text variants and other data\./,
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

test('requires Content Sync as the only offline path for available resources', () => {
  const offlineGuide = fs.readFileSync(
    path.join(repositoryRoot, 'docs', 'tutorials', 'content-sync', 'offline-cache-patterns.mdx'),
    'utf8',
  );

  for (const document of [developerTerms, faq, contentSync, offlineGuide]) {
    assert.match(
      document,
      /If a content resource is available through Content Sync, \*\*Content Sync is the only permitted path for obtaining and maintaining an offline copy\*\* of that resource; do not build an offline copy from regular API responses\./,
    );
    assert.match(document, /at least every (?:\*\*)?7 days when connectivity to QF permits/);
    assert.match(document, /apply all available changes/);
    assert.doesNotMatch(document, /QF (?:has )?expressly permit(?:ted|s)? longer storage/);
  }

  assert.match(
    developerTerms,
    /longer than \*\*1 week\*\* unless it is obtained and maintained through the Content Sync APIs/,
  );
  assert.match(
    developerTerms,
    /or consists of font files or Mushaf images cached or bundled as described below/,
  );
  assert.match(
    faqSection('Can I use Content Sync for Quran text or word-by-word data?'),
    /one-week storage limit still applies to content that is not available through Content Sync, except for font files and Mushaf images/,
  );
});

test('omits source-specific licensing caveats while preserving source attribution', () => {
  const connectedApps = fs.readFileSync(path.join(docsDir, 'connected-apps.mdx'), 'utf8');
  const recoveryGuide = fs.readFileSync(
    path.join(docsDir, 'tutorials', 'content-sync', 'full-copies-and-recovery.mdx'),
    'utf8',
  );
  for (const document of [developerTerms, faq, connectedApps, recoveryGuide]) {
    assert.doesNotMatch(normalize(document), /source-specific|underlying rights holders|within their licensing terms/i);
  }
  assert.doesNotMatch(developerTerms, /additional restrictions/i);
  assert.match(
    normalize(connectedApps),
    /Commercial use of Quranic content\*\* within an app's end-user experience is permitted under the Developer Terms/,
  );

  assert.match(
    faqSection('What attribution or copyright information should I show?'),
    /Also credit translations, tafsir editions, and recitations by their named source or edition\./,
  );
});

test('highlights the scholarly-review rationale alongside the offline Terms', () => {
  const acceptableUse = developerTerms.split('### 3.1 Acceptable use')[1]?.split('### 3.2 Security & privacy')[0];
  assert.ok(acceptableUse, 'expected the acceptable-use section containing the offline policy');
  const callout = acceptableUse.match(/:::important Offline content: scholarly review and corrections\n\n([\s\S]*?)\n\n:::/);
  assert.ok(callout, 'expected a prominent Important callout for offline content');
  assert.match(callout[1], /^\*\*Providing scholarly-verified Quranic content is one of Quran Foundation's core goals\.\*\*/);
  assert.match(callout[1], /Our scholarly team reviews our content/);
  assert.match(callout[1], /For resources available through Content Sync, syncing delivers those updates and corrections to your Application's offline copy/);
  assert.match(callout[1], /Follow the synchronization requirements above/);
  assert.ok(acceptableUse.indexOf('When using Content Sync, you must') < acceptableUse.indexOf(callout[0]));
  assert.ok(acceptableUse.indexOf(callout[0]) < acceptableUse.indexOf('**Prepackaged content.**'));
});

test('explains Content Sync and scholarly review in a plain FAQ answer', () => {
  const answer = faqSectionSource('Why do I need Content Sync?');
  assert.ok(answer, 'expected a dedicated Content Sync rationale FAQ answer');
  assert.match(answer, /Providing scholarly-verified Quranic content is one of Quran Foundation's core goals/);
  assert.match(answer, /Our scholarly team reviews our content/);
  assert.match(answer, /updates and corrections/);
  assert.match(answer, /offline copy when it syncs/);
  assert.match(answer, /For resources available through Content Sync, use it to obtain and maintain offline copies/);
  assert.match(answer, /at least every seven days when connectivity to QF permits/);
  assert.match(answer, /sync promptly when connectivity returns after an outage/);
  assert.doesNotMatch(answer, /:::|\*\*|<aside/i);
});

test('scopes the seven-day sync duty to Content Sync users', () => {
  assert.match(
    normalize(developerTerms),
    /When using Content Sync, you must perform a next sync at least every \*\*7 days when connectivity to QF permits\*\* and apply all available changes\./,
  );
  assert.match(
    faqSection('How long can I cache or store QF Content?'),
    /When using Content Sync, perform a next sync at least every 7 days when connectivity to QF permits/,
  );
});

test('aligns the Connected Apps charging answer with the Developer Terms', () => {
  const connectedApps = fs.readFileSync(path.join(docsDir, 'connected-apps.mdx'), 'utf8');
  const chargingAnswer = connectedApps.split('**Can my app charge for a service?**')[1]?.split('**Can we show ads or accept donations?**')[0];
  assert.ok(chargingAnswer, 'expected the Connected Apps charging FAQ answer');
  assert.match(
    normalize(chargingAnswer),
    /Charging for an app's end-user experience does not require a separate commercial license under the Developer Terms\./,
  );
  assert.match(
    normalize(chargingAnswer),
    /Selling, sublicensing, or redistributing QF Content or raw API data as a separately distributed product requires a signed commercial license\./,
  );
  assert.doesNotMatch(normalize(chargingAnswer), /Commercial content use may require separate written permission/);
});

test('describes font and Mushaf-image caching without a separate-permission label', () => {
  for (const document of [developerTerms, faq, contentSync, fontRendering]) {
    assert.doesNotMatch(normalize(document), /separate (?:permission|exception)|permission below/i);
  }
  assert.match(contentSync, /See the \[Developer Terms\]\(\/legal\/developer-terms\/\) for the full storage conditions\./);
  assert.match(
    developerTerms,
    /may cache or bundle font files and Mushaf images obtained through QF APIs or documented CDN URLs/,
  );
});

test('keeps resource descriptions consistent without source-uncertainty caveats', () => {
  const contentSpec = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'openAPI', 'content', 'v4.json'), 'utf8'));
  const resources = [
    ['translation-info', '/resources/translations/{translation_id}/info'],
    ['tafsir-info', '/resources/tafsirs/{tafsir_id}/info'],
    ['recitation-info', '/resources/recitations/{recitation_id}/info'],
    ['resources-snapshot', '/resources/snapshots/{resource_group}/{id}'],
  ];

  for (const [name, endpoint] of resources) {
    const description = contentSpec.paths[endpoint].get.description;
    assert.doesNotMatch(description, /Could include|source-specific|underlying rights holders/i);
    for (const version of ['', '4.0.0']) {
      const generated = fs.readFileSync(path.join(docsDir, 'content_apis_versioned', version, `${name}.api.mdx`), 'utf8');
      const apiLine = generated.split('\n').find((line) => line.startsWith('api: '));
      const api = JSON.parse(apiLine.slice('api: '.length));
      assert.equal(api.description, description);
      assert.equal(api.postman.description.content, description);
      assert.ok(generated.includes(`\n${description}\n`));
      assert.doesNotMatch(generated, /Could include|source-specific|underlying rights holders/i);
    }
  }
});

test('offline cache guidance preserves reading while scheduling catch-up sync', () => {
  const guide = fs.readFileSync(
    path.join(repositoryRoot, 'docs', 'tutorials', 'content-sync', 'offline-cache-patterns.mdx'),
    'utf8',
  );
  assert.match(guide, /previously synced Content Sync content may remain available beyond seven days/);
  assert.match(guide, /sync promptly when connectivity returns/);
  assert.doesNotMatch(guide, /stop serving\/displaying that filter's content once it is overdue/);
});

test('does not describe Mushaf snapshots as font or image packages', () => {
  for (const document of [contentSync, faq]) {
    assert.doesNotMatch(document, /publicly distributable font assets/i);
    assert.doesNotMatch(document, /font asset metadata/i);
  }

  assert.match(
    contentSync,
    /Mushaf metadata, page mappings, and positioned words\. Font files and images are not included\./,
  );
});

test('documents font and Mushaf-image caching and bundling conditions consistently', () => {
  for (const document of [developerTerms, faq]) {
    assert.match(
      document,
      /font files and Mushaf images obtained through (?:QF|Quran Foundation) APIs or documented CDN URLs/i,
    );
    assert.match(document, /Developer Console/);
    assert.match(document, /credits? Quran Foundation/);
  }

  assert.match(fontRendering, /Font Caching and App Bundling/);
  assert.match(
    fontRendering,
    /Local font caching and bundling font files with your application are also allowed/,
  );
  assert.match(fontRendering, /active account in the \[Developer Console\]/);
  assert.match(
    fontRendering,
    /credit Quran Foundation somewhere reasonably accessible/,
  );
  assert.match(
    fontRendering,
    /files may be distributed only as an integrated part of your application/,
  );

  assert.match(
    contentSync,
    /font files or Mushaf image files[\s\S]*may be cached or bundled[\s\S]*active Developer Console account and credit Quran Foundation/,
  );
});

test('removes the standalone Mushaf images page from docs and discovery', () => {
  assert.equal(fs.existsSync(removedMushafImagesPage), false);

  const { content } = generateLlmsTxt(docsDir);
  assert.doesNotMatch(content, /Mushaf Fonts and Images/);
  assert.doesNotMatch(content, /legal\/mushaf-fonts-and-images/);
  assert.match(
    content,
    /\[Developer Terms\]\(https:\/\/api-docs\.quran\.foundation\/legal\/developer-terms\/\)/,
  );
  assert.match(
    content,
    /\[Font Rendering\]\(https:\/\/api-docs\.quran\.foundation\/docs\/tutorials\/fonts\/font-rendering\/\)/,
  );
});

test('synchronizes the exact Content Sync groups', () => {
  const expectedGroups = [
    'mushafs',
    'quran_core',
    'translations',
    'word_by_word_translations',
    'word_by_word_transliterations',
    'tafsirs',
    'recitations',
    'chapter_recitations',
    'articles',
  ];
  const sourceSupportStatement = contentSync.match(
    /Content Sync supports these resource groups:\s*([^\.\r\n]+)\./,
  );
  assert.ok(
    sourceSupportStatement,
    'expected the Content Sync tutorial to declare its supported groups',
  );
  const sourceGroups = extractBacktickedValues(sourceSupportStatement[1]);
  const faqGroups = [
    ...new Set(
      extractBacktickedValues(
        faqSectionSource('Can I use Content Sync for Quran text or word-by-word data?'),
      ).filter((value) => expectedGroups.includes(value)),
    ),
  ];

  assert.deepEqual(
    [...sourceGroups].sort(),
    [...expectedGroups].sort(),
    'the source support matrix must include exactly nine released groups',
  );
  assert.deepEqual(
    [...faqGroups].sort(),
    [...sourceGroups].sort(),
    'the FAQ Content Sync groups must match the source support matrix',
  );
});
