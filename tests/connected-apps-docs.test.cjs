const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const docsDir = path.join(repoRoot, 'docs');
const docPath = path.join(docsDir, 'connected-apps.mdx');
const doc = fs.readFileSync(docPath, 'utf8');
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
    'source of truth',
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
    /Policy version:<\/strong> 1\.0/,
    /Last updated: 2026-06-30/,
    /Effective date: 2026-06-30/,
    /listing package/i,
    /review criteria/i,
    /Developer Console/,
    /Request Access/,
    /homepage/i,
    /directory/i,
    /does not mean Quran Foundation owns/,
    /Do not describe a directory listing as broad endorsement/,
    /Quran\.com\/apps/,
    /OAuth consent/i,
    /User-Facing Clarity/,
    /Communicate them to users/,
    /Changes That Can Require Re-Review/,
    /Commercial changes/,
    /AI explanations/,
    /developers@quran\.com/,
    /Eligibility Gates/,
    /pass\/fail baseline protections/,
    /Visibility Tiers In Detail/,
    /Verified Listing/,
    /Aligned App/,
    /Connected App/,
    /Featured App/,
    /Visibility Is Not For Sale/,
    /OAuth And Continuity Requirements/,
    /Partner Terms And Compliance/,
    /applicable Quran Foundation\s+developer terms/,
    /Listing Card Specs/,
    /40 characters maximum/,
    /60 characters maximum/,
    /160 characters maximum/,
    /minimum 512 x 512 px/,
    /Attribution And Content Sources/,
    /Quran data provided by \[Quran\.Foundation\]\(https:\/\/quran\.foundation\)/,
    /Gamification/,
    /AI must never produce sacred text/,
    /Enforcement And Reinstatement/,
    /Support And Office Hours/,
    /Change Log/,
    /14-day notice period/,
  ];

  for (const pattern of requiredPatterns) {
    assert.match(doc, pattern);
  }
});

test('uses Docusaurus Link for internal Connected Apps routes', () => {
  assert.match(doc, /import Link from '@docusaurus\/Link';/);
  assert.doesNotMatch(
    doc,
    /<a\s+[^>]*href="\//,
    'internal routes in MDX JSX blocks should use Docusaurus Link',
  );
  assert.match(doc, /<Link className="connectedAppsPrimaryLink" to="\/request-access">/);
  assert.match(doc, /<Link to="\/docs\/developer-journey\/">/);
  assert.match(doc, /href="#listing-package"/);
  assert.match(doc, /href="https:\/\/quran\.com\/apps"/);
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

test('keeps Connected Apps styling scoped, theme-token based, and responsive', () => {
  assert.match(customCss, /\.connectedAppsDoc\s*{/);
  assert.match(customCss, /\.connectedAppsVersion\s*{/);
  assert.doesNotMatch(customCss, /--connected-apps-muted/);
  assert.match(customCss, /var\(--connected-apps-border, var\(--qf-border-card\)\)/);
  assert.match(customCss, /var\(--connected-apps-soft, rgba\(62, 193, 201, 0\.08\)\)/);
  assert.match(customCss, /@media screen and \(max-width: 760px\)[\s\S]*\.connectedAppsGridTwo,\s*\.connectedAppsGridThree\s*{\s*grid-template-columns: 1fr;/);
  assert.match(customCss, /@media screen and \(max-width: 760px\)[\s\S]*\.connectedAppsPrimaryLink,\s*\.connectedAppsSecondaryLink\s*{\s*width: 100%;/);
});

test('uses the cross-platform test runner wrapper', () => {
  assert.equal(packageJson.scripts.test, 'node scripts/run-tests.cjs');
  assert.ok(
    fs.existsSync(path.join(repoRoot, 'scripts', 'run-tests.cjs')),
    'expected test runner wrapper to exist',
  );
});
