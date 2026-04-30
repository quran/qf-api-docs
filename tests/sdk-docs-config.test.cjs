const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const sidebars = require(path.join(__dirname, '..', 'sidebars.js'));
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
  'sdk/javascript/common-errors',
  'sdk/javascript/migration-cheat-sheet',
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

test('keeps maintainer-only SDK local docs out of public llms output', () => {
  const { content } = generateLlmsTxt(docsDir);

  assert.doesNotMatch(content, /\/docs\/sdk\/javascript\/local-development/);
});
