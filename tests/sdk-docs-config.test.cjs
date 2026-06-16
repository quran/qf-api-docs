const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const sidebars = require(path.join(__dirname, '..', 'sidebars.js'));
const docusaurusConfig = require(path.join(__dirname, '..', 'docusaurus.config.js'));
const { generateLlmsTxt } = require(path.join(
  __dirname,
  '..',
  'plugins',
  'llms-txt-plugin.js',
));

const docsDir = path.join(__dirname, '..', 'docs');

const expectedSdkDocIds = [
  'sdk/javascript/app-shapes',
  'sdk/javascript/runtime-matrix',
  'sdk/javascript/auth-matrix',
  'sdk/javascript/entrypoint-matrix',
  'sdk/javascript/apis-by-runtime',
  'sdk/javascript/server-quickstart',
  'sdk/javascript/public-quickstart',
  'sdk/javascript/full-stack',
  'sdk/javascript/hadith-references',
  'sdk/javascript/answers',
  'sdk/javascript/common-errors',
  'sdk/javascript/migration-cheat-sheet',
];

const expectedPythonSdkDocIds = [
  'sdk/python/authentication',
  'sdk/python/content',
  'sdk/python/chapters',
  'sdk/python/verses',
  'sdk/python/audio',
  'sdk/python/resources',
  'sdk/python/answers',
  'sdk/python/hadith-references',
  'sdk/python/juzs',
  'sdk/python/search',
  'sdk/python/user-apis',
  'sdk/python/common-errors',
];

const getSdkDocIds = (sidebarName) => {
  const sharedDocsSidebar = sidebars[sidebarName];
  assert.ok(sharedDocsSidebar, `expected ${sidebarName} to exist`);

  const sdkCategory = sharedDocsSidebar.find(
    (item) => item.type === 'category' && item.label === 'SDKs',
  );
  assert.ok(sdkCategory, `expected ${sidebarName} to include SDKs`);

  const jsCategory = sdkCategory.items.find(
    (item) => item.type === 'category' && item.label === 'JS/TS',
  );
  assert.ok(jsCategory, `expected ${sidebarName} to include JS/TS`);

  return jsCategory.items.filter((item) => typeof item === 'string');
};

const getSdkCategory = (sidebarName, label) => {
  const sharedDocsSidebar = sidebars[sidebarName];
  assert.ok(sharedDocsSidebar, `expected ${sidebarName} to exist`);

  const sdkCategory = sharedDocsSidebar.find(
    (item) => item.type === 'category' && item.label === 'SDKs',
  );
  assert.ok(sdkCategory, `expected ${sidebarName} to include SDKs`);

  const languageCategory = sdkCategory.items.find(
    (item) => item.type === 'category' && item.label === label,
  );
  assert.ok(languageCategory, `expected ${sidebarName} to include ${label}`);

  return languageCategory;
};

test('surfaces the new JavaScript SDK pages in shared sidebars', () => {
  for (const sidebarName of ['APIsSidebar', 'APIsVersionedSidebar']) {
    const sdkDocIds = getSdkDocIds(sidebarName);

    for (const expectedDocId of expectedSdkDocIds) {
      assert.ok(
        sdkDocIds.includes(expectedDocId),
        `expected ${sidebarName} to include ${expectedDocId}`,
      );
    }

    assert.ok(
      !sdkDocIds.includes('sdk/javascript/local-development'),
      `expected ${sidebarName} to exclude sdk/javascript/local-development`,
    );
  }
});

test('surfaces the Python SDK page in shared sidebars', () => {
  for (const sidebarName of ['APIsSidebar', 'APIsVersionedSidebar']) {
    const pythonCategory = getSdkCategory(sidebarName, 'Python');

    assert.deepEqual(pythonCategory.link, {
      type: 'doc',
      id: 'sdk/python/index',
    });

    for (const expectedDocId of expectedPythonSdkDocIds) {
      assert.ok(
        pythonCategory.items.includes(expectedDocId),
        `expected ${sidebarName} to include ${expectedDocId}`,
      );
    }
  }
});

test('surfaces the Python SDK page in the top SDKs dropdown', () => {
  const sdkDropdown = docusaurusConfig.themeConfig.navbar.items.find(
    (item) => item.type === 'dropdown' && item.label === 'SDKs',
  );

  assert.ok(sdkDropdown, 'expected navbar to include SDKs dropdown');
  assert.ok(
    sdkDropdown.items.some(
      (item) => item.label === 'Python SDK' && item.to === 'docs/sdk/python',
    ),
    'expected SDKs dropdown to link to the Python SDK page',
  );
});

test('keeps maintainer-only SDK local docs out of public llms output', () => {
  const { content } = generateLlmsTxt(docsDir);

  assert.doesNotMatch(content, /\/docs\/sdk\/javascript\/local-development/);
});

test('places SDK docs in the neutral SDKs llms section', () => {
  const { content } = generateLlmsTxt(docsDir);

  assert.match(content, /## SDKs\n/);
  assert.match(
    content,
    /\[Python SDK\]\(https:\/\/api-docs\.quran\.foundation\/docs\/sdk\/python\/\)/,
  );
  assert.doesNotMatch(content, /## JavaScript SDK\n/);
});
