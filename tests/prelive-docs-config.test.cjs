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

const sidebarContainsDoc = (items, docId) =>
  items.some((item) => {
    if (typeof item === 'string') {
      return item === docId;
    }

    if (!item || typeof item !== 'object') {
      return false;
    }

    if (item.type === 'doc' && item.id === docId) {
      return true;
    }

    return Array.isArray(item.items) && sidebarContainsDoc(item.items, docId);
  });

const findSidebarCategory = (items, label) =>
  items.find(
    (item) =>
      item &&
      typeof item === 'object' &&
      item.type === 'category' &&
      item.label === label,
  );

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
        item.label === 'User APIs (Pre-live)' &&
        item.to === '/docs/user_related_apis_prelive/user-related-apis/',
    ),
    'expected the pre-live navbar link to open the intro doc',
  );

  const footerApiLinks = config.themeConfig.footer.links.find(
    (section) => section.title === 'API Docs',
  );
  assert.ok(footerApiLinks, 'expected the API Docs footer section');
  assert.ok(
    footerApiLinks.items.some(
      (item) =>
        item.label === 'User APIs (Pre-live)' &&
        item.to === '/docs/user_related_apis_prelive/user-related-apis/',
    ),
    'expected the pre-live footer link to open the intro doc',
  );

  assert.ok(
    sidebars['user-related-apis-pre-live'],
    'expected a dedicated pre-live user-related sidebar',
  );

  const generatedIndex = sidebars['user-related-apis-pre-live'].find(
    (item) => item.type === 'category',
  );
  assert.equal(generatedIndex.link.slug, '/category/user-related-apis-pre-live');
  assert.ok(
    generatedIndex.items.some(
      (item) =>
        item.type === 'doc' &&
        item.id === 'user_related_apis_prelive/scopes' &&
        item.label === 'OAuth2 Scopes',
    ),
    'expected pre-live sidebar to link to the pre-live OAuth2 scopes doc',
  );

  const sharedApiSection = findSidebarCategory(sidebars.APIsSidebar, 'API');
  assert.ok(sharedApiSection, 'expected the shared API sidebar section');

  const sharedPreliveCategory = findSidebarCategory(
    sharedApiSection.items,
    'User APIs (Pre-live)',
  );
  assert.ok(
    sharedPreliveCategory,
    'expected pre-live user APIs in the shared API sidebar',
  );
  assert.deepEqual(sharedPreliveCategory.link, {
    type: 'doc',
    id: 'user_related_apis_prelive/user-related-apis',
  });
  assert.equal(
    sidebarContainsDoc(
      sharedPreliveCategory.items,
      'user_related_apis_prelive/get-mutations',
    ),
    true,
    'expected pre-live endpoint docs in the shared API sidebar',
  );
});

test('publishes developer contact in the footer', () => {
  const communityLinks = config.themeConfig.footer.links.find(
    (section) => section.title === 'Community',
  );

  assert.ok(communityLinks, 'expected the Community footer section');
  assert.ok(
    communityLinks.items.some(
      (item) => item.html === 'developers@quran.com',
    ),
    'expected the footer to show the developer contact email',
  );
  assert.ok(
    !communityLinks.items.some(
      (item) => /mailto:|discord/i.test(item.label || item.href || item.html || ''),
    ),
    'expected the footer to avoid the Discord community link',
  );
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

  assert.match(content, /## User APIs v1 \(Pre-live\)/);
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
  assert.doesNotMatch(
    content,
    /https:\/\/api-docs\.quran\.foundation\/docs\/(?:content_apis_versioned|oauth2_apis_versioned|search_apis_versioned|user_related_apis_versioned)\/(?!\d+\.\d+\.\d+\/|scopes\/)[^)\s]+/,
  );
});
