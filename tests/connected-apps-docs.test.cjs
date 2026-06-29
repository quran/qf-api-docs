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
});

test('documents the core Connected Apps production concepts', () => {
  const requiredPatterns = [
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
  ];

  for (const pattern of requiredPatterns) {
    assert.match(doc, pattern);
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

test('keeps Connected Apps styling scoped, theme-token based, and responsive', () => {
  assert.match(customCss, /\.connectedAppsDoc\s*{/);
  assert.match(customCss, /var\(--connected-apps-border, var\(--qf-border-card\)\)/);
  assert.match(customCss, /var\(--connected-apps-soft, rgba\(62, 193, 201, 0\.08\)\)/);
  assert.match(customCss, /@media screen and \(max-width: 760px\)[\s\S]*\.connectedAppsGridTwo,\s*\.connectedAppsGridThree\s*{\s*grid-template-columns: 1fr;/);
  assert.match(customCss, /@media screen and \(max-width: 760px\)[\s\S]*\.connectedAppsPrimaryLink,\s*\.connectedAppsSecondaryLink\s*{\s*width: 100%;/);
});
