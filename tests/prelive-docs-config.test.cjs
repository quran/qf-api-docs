const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const config = require(path.join(__dirname, '..', 'docusaurus.config.js'));
const sidebars = require(path.join(__dirname, '..', 'sidebars.js'));
const { generateLlmsTxt } = require(path.join(
  __dirname,
  '..',
  'plugins',
  'llms-txt-plugin.js',
));

const docsDir = path.join(__dirname, '..', 'docs');

const getOpenApiConfig = () => {
  const entry = config.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'docusaurus-plugin-openapi-docs',
  );

  assert.ok(entry, 'expected the OpenAPI plugin to be configured');
  return entry[1].config;
};

test('registers a separate pre-live user-related spec tree', () => {
  const openApiConfig = getOpenApiConfig();

  assert.deepEqual(openApiConfig.user_related_apis_prelive, {
    specPath: 'openAPI/user-related-apis/pre-live/v1.json',
    outputDir: 'docs/user_related_apis_prelive',
    sidebarOptions: {
      groupPathsBy: 'tag',
      categoryLinkSource: 'tag',
    },
  });
});

test('adds pre-live user-related docs to navigation and sidebars', () => {
  const apiDropdown = config.themeConfig.navbar.items.find(
    (item) => item.type === 'dropdown' && item.label === 'APIs',
  );

  assert.ok(apiDropdown, 'expected the APIs navbar dropdown');
  assert.ok(
    apiDropdown.items.some(
      (item) =>
        item.label === 'User-related APIs (Pre-live)' &&
        item.to === '/docs/category/user-related-apis-pre-live',
    ),
    'expected a pre-live user-related navbar link',
  );

  assert.ok(
    sidebars['user-related-apis-pre-live'],
    'expected a dedicated pre-live user-related sidebar',
  );

  const generatedIndex = sidebars['user-related-apis-pre-live'].find(
    (item) => item.type === 'category',
  );
  assert.equal(generatedIndex.link.slug, '/category/user-related-apis-pre-live');
});

test('publishes both production and pre-live user-related raw spec links', () => {
  const { content } = generateLlmsTxt(docsDir);

  assert.match(
    content,
    /\[User APIs v1 \(Production\)\]\(https:\/\/api-docs\.quran\.foundation\/openAPI\/user-related-apis\/v1\.json\)/,
  );
  assert.match(
    content,
    /\[User APIs v1 \(Pre-live\)\]\(https:\/\/api-docs\.quran\.foundation\/openAPI\/user-related-apis\/pre-live\/v1\.json\)/,
  );
});

test('includes pre-live user-related endpoint docs in llms.txt', () => {
  const { content } = generateLlmsTxt(docsDir);

  assert.match(content, /## User-Related APIs v1 \(Pre-live\)/);
  assert.match(
    content,
    /\[Get mutations\]\(https:\/\/api-docs\.quran\.foundation\/docs\/user_related_apis_prelive\/get-mutations\/\)/,
  );
});

test('keeps llms docs URLs canonical and unique', () => {
  const { content } = generateLlmsTxt(docsDir);
  const urls = Array.from(
    content.matchAll(/\]\((https?:\/\/[^)]+)\)/g),
    (match) => match[1],
  );
  const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);

  assert.deepEqual(duplicateUrls, []);

  for (const url of urls) {
    if (url.startsWith('https://api-docs.quran.foundation/docs')) {
      assert.equal(url.endsWith('/'), true, `expected trailing slash for ${url}`);
    }
  }

  assert.equal((content.match(/\[Developer Journey\]\(/g) || []).length, 1);
  assert.equal((content.match(/\[API Reference\]\(/g) || []).length, 1);
});
