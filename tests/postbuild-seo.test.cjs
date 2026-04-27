const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  getCanonicalPathOverride,
  normalizeSiteUrl,
  shouldDropSitemapPath,
} = require(path.join(__dirname, '..', 'scripts', 'postbuild-seo.js'));

test('canonicalizes current generated API operation aliases to versioned paths', () => {
  assert.equal(
    getCanonicalPathOverride('/docs/user_related_apis_versioned/get-user-bookmarks/'),
    '/docs/user_related_apis_versioned/1.0.0/get-user-bookmarks/',
  );
});

test('keeps the standalone scopes page unversioned', () => {
  assert.equal(
    getCanonicalPathOverride('/docs/user_related_apis_versioned/scopes/'),
    '/docs/user_related_apis_versioned/scopes/',
  );
  assert.equal(
    shouldDropSitemapPath('/docs/user_related_apis_versioned/scopes/'),
    false,
  );
});

test('canonicalizes current generated category aliases to versioned category pages', () => {
  assert.equal(
    getCanonicalPathOverride('/docs/category/content-apis/'),
    '/docs/category/content-apis-4.0.0/',
  );
  assert.equal(
    getCanonicalPathOverride('/docs/category/user-related-apis/'),
    '/docs/category/user-related-apis-1.0.0/',
  );
});

test('drops current generated API and category aliases from the sitemap', () => {
  assert.equal(
    shouldDropSitemapPath('/docs/user_related_apis_versioned/get-user-bookmarks/'),
    true,
  );
  assert.equal(shouldDropSitemapPath('/docs/category/content-apis/'), true);
  assert.equal(
    shouldDropSitemapPath('/docs/category/content-apis-4.0.0/'),
    false,
  );
});

test('normalizes canonical URLs with path overrides', () => {
  assert.equal(
    normalizeSiteUrl(
      'https://api-docs.quran.foundation/docs/category/content-apis/',
      '/docs/category/content-apis-4.0.0/',
    ),
    'https://api-docs.quran.foundation/docs/category/content-apis-4.0.0/',
  );
});
