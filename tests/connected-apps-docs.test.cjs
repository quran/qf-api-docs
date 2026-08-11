const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const docsDir = path.join(repoRoot, 'docs');
const docPath = path.join(docsDir, 'connected-apps.mdx');
const doc = fs.readFileSync(docPath, 'utf8');
const oauthGuide = fs.readFileSync(
  path.join(docsDir, 'tutorials', 'oidc', 'getting-started-with-oauth2.mdx'),
  'utf8',
);
const customCss = fs.readFileSync(
  path.join(repoRoot, 'src', 'css', 'custom.css'),
  'utf8',
);
const packageJson = require(path.join(repoRoot, 'package.json'));
const sidebars = require(path.join(repoRoot, 'sidebars.js'));
const docusaurusConfig = require(path.join(repoRoot, 'docusaurus.config.js'));
const { generateLlmsTxt } = require(path.join(
  repoRoot,
  'plugins',
  'llms-txt-plugin.js',
));

const findSidebarDoc = (sidebarName, docId) => {
  const sidebar = sidebars[sidebarName];
  assert.ok(sidebar, `expected ${sidebarName} to exist`);

  return sidebar.find(
    (item) => item && item.type === 'doc' && item.id === docId,
  );
};

test('adds a production Connected Apps docs page', () => {
  assert.match(doc, /^title: "Connected Apps"$/m);
  assert.match(doc, /^sidebar_label: "Connected Apps"$/m);
  assert.match(doc, /^displayed_sidebar: "APIsSidebar"$/m);

  for (const prototypeOnlyText of [
    'Atlas Docs Hub',
    'Concept 01',
    'body.dark',
    'mobile-nav',
    'Quran.Foundation / Connected Apps',
    'Boundaries to communicate',
    'Internal visibility controls',
    'teams need',
    'promoting apps',
    'planned partner workspace',
    'not just a page of links',
    'when enabled',
  ]) {
    assert.doesNotMatch(
      doc,
      new RegExp(prototypeOnlyText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `expected page to exclude prototype-only text: ${prototypeOnlyText}`,
    );
  }

  assert.doesNotMatch(
    doc,
    /\[FILL:|ƒ|Â|â|�/,
    'expected production page to exclude placeholders and mojibake',
  );
});

test('documents the core Connected Apps production concepts', () => {
  const requiredPatterns = [
    /\*\*Policy version:\*\* 1\.1/,
    /\*\*Last updated:\*\* 2026-08-10/,
    /\*\*Effective date:\*\* 2026-08-10/,
    /source of truth for the Connected Apps program/,
    /The Developer Console/,
    /https:\/\/dev-console\.quran\.foundation\/projects/,
    /listing package/i,
    /What review looks at/i,
    /homepage/i,
    /directory/i,
    /does not mean\s+Quran Foundation owns the app/,
    /do not describe a directory listing as broad\s+endorsement/i,
    /Quran\.com\/apps/,
    /Connect Quran\.com user accounts/,
    /What your app must tell users/,
    /Tell us before shipping material changes/,
    /Commercial changes/,
    /AI explanations/,
    /developers@quran\.com/,
    /Check whether your app is eligible/,
    /\*\*pass\/fail\*\*,\s+and they are the baseline protections/,
    /No app may be indexed or\s+listed, receive a reviewed label, reach Transformational status, or receive\s+featured placement/,
    /App statuses/,
    /Higher levels of visibility, trust, and ecosystem participation/,
    /Indexed \(searchable\) App/,
    /Verified Listing App/,
    /Vision Aligned App/,
    /Transformational \(user enabled\) App/,
    /Featured placement \(temporary editorial promotion\)/,
    /Visibility is not for sale/,
    /Connect Quran\.com user accounts/,
    /Terms and compliance/,
    /Quran\.com Terms &(?:amp;)? Conditions/,
    /Quran Foundation Developer Terms/,
    /Card specs/,
    /40 characters maximum/,
    /60 characters maximum/,
    /160 characters maximum/,
    /minimum 512 x 512 px/,
    /Content and attribution requirements/,
    /Quran data provided by \[Quran Foundation\]\(https:\/\/quran\.foundation\/\)/,
    /Gamification/,
    /AI must never replace or modify canonical source material/,
    /Human oversight/,
    /Grounding/,
    /Resolve compliance issues/,
    /Get help/,
    /Partner office hours[\s\S]*available at various times throughout the week/,
    /Change log/,
    /14-day notice period/,
  ];

  for (const pattern of requiredPatterns) {
    assert.match(doc, pattern);
  }
});

test('orders the guide around the developer journey', () => {
  const consoleIndex = doc.indexOf('## The Developer Console');
  const processIndex = doc.indexOf('## Follow the Connected Apps process');
  const eligibilityIndex = doc.indexOf('## Check whether your app is eligible');
  const listingIndex = doc.indexOf('## Prepare your listing');
  const statusesIndex = doc.indexOf('## App statuses');

  assert.ok(consoleIndex >= 0, 'expected Developer Console heading');
  assert.ok(processIndex >= 0, 'expected Connected Apps process heading');
  assert.ok(eligibilityIndex >= 0, 'expected eligibility heading');
  assert.ok(listingIndex >= 0, 'expected listing preparation heading');
  assert.ok(statusesIndex >= 0, 'expected app statuses heading');
  assert.ok(
    consoleIndex < processIndex,
    'expected the Developer Console before the process',
  );
  assert.ok(
    processIndex < eligibilityIndex,
    'expected eligibility after the process',
  );
  assert.ok(
    eligibilityIndex < listingIndex,
    'expected listing preparation after eligibility',
  );
  assert.ok(
    listingIndex < statusesIndex,
    'expected app statuses after listing preparation',
  );
});

test('routes self-service setup through the Developer Console', () => {
  assert.doesNotMatch(doc, /to="\/request-access"/);
  assert.doesNotMatch(doc, /\[FILL: Developer Console URL\]/);
  assert.match(
    doc,
    /\[Developer Console\]\(https:\/\/dev-console\.quran\.foundation\/projects\)/,
  );
  assert.match(doc, /\[four eligibility gates\]\(#check-whether-your-app-is-eligible\)/);
  assert.match(doc, /\[prepare and submit a listing package\]\(#prepare-your-listing\)/);
});

test('uses the current Quran Foundation name in hand-authored guides', () => {
  for (const [name, source] of [
    ['Connected Apps', doc],
    ['OAuth getting started', oauthGuide],
  ]) {
    assert.doesNotMatch(
      source,
      /Quran\.Foundation/,
      `${name} should use the current Quran Foundation name`,
    );
  }
});

test('surfaces Connected Apps in navbar and shared sidebars', () => {
  const navbarItems = docusaurusConfig.themeConfig.navbar.items;
  const updatesIndex = navbarItems.findIndex(
    (item) => item.type === 'doc' && item.docId === 'updates/index',
  );
  const connectedAppsIndex = navbarItems.findIndex(
    (item) => item.type === 'doc' && item.docId === 'connected-apps',
  );

  assert.ok(updatesIndex >= 0, 'expected Updates navbar item');
  assert.equal(
    connectedAppsIndex,
    updatesIndex + 1,
    'expected Connected Apps directly after Updates',
  );
  assert.equal(navbarItems[connectedAppsIndex].label, 'Connected Apps');

  const apisDropdown = navbarItems.find(
    (item) => item.type === 'dropdown' && item.label === 'APIs',
  );
  assert.ok(apisDropdown, 'expected APIs dropdown');
  assert.equal(
    Object.hasOwn(apisDropdown, 'sidebarId'),
    false,
    'dropdown navbar items should not pass sidebarId through to the DOM',
  );

  for (const sidebarName of ['APIsSidebar', 'APIsVersionedSidebar']) {
    assert.deepEqual(findSidebarDoc(sidebarName, 'connected-apps'), {
      type: 'doc',
      id: 'connected-apps',
      label: 'Connected Apps',
    });
  }
});

test('includes Connected Apps in generated llms.txt discovery', () => {
  const { content } = generateLlmsTxt(docsDir);

  assert.match(
    content,
    /\[Connected Apps\]\(https:\/\/api-docs\.quran\.foundation\/docs\/connected-apps\/\): Partner guide/,
  );
});

test('does not ship orphaned Connected Apps CSS classes', () => {
  const cssClassNames = new Set(
    [...customCss.matchAll(/\.(connectedApps[A-Za-z0-9_-]+)/g)].map(
      (match) => match[1],
    ),
  );
  const pageClassNames = new Set(
    [...doc.matchAll(/\bconnectedApps[A-Za-z0-9_-]+\b/g)].map(
      (match) => match[0],
    ),
  );
  const orphanedClassNames = [...cssClassNames].filter(
    (className) => !pageClassNames.has(className),
  );

  assert.deepEqual(
    orphanedClassNames,
    [],
    'Connected Apps CSS classes must be used by the MDX page',
  );
});

test('uses the cross-platform test runner wrapper', () => {
  assert.equal(packageJson.scripts.test, 'node scripts/run-tests.cjs');
  assert.ok(
    fs.existsSync(path.join(repoRoot, 'scripts', 'run-tests.cjs')),
    'expected test runner wrapper to exist',
  );
});
