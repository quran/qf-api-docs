const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  createRedirectRegistry,
  getCanonicalPathOverride,
  getGeneratedAuthRedirectsFromDoc,
  getRedirectSourceVariants,
  normalizeRedirectPath,
  normalizeSiteUrl,
  operationIdToGeneratedSlug,
  shouldDropSitemapPath,
  stripGeneratedRedirectsSection,
  validateGeneratedRedirectTargets,
  validateNoRedirectLoops,
  validatePublicRouteLock,
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

test('normalizes redirect paths defensively', () => {
  assert.equal(
    normalizeRedirectPath('http://api-docs.quran.foundation/docs/sdk'),
    '/docs/sdk',
  );
  assert.throws(
    () => normalizeRedirectPath('https://api-docs.quran.foundation/docs/sdk?from=gsc'),
    /query strings or hashes/,
  );
  assert.throws(
    () => normalizeRedirectPath('https://example.com/docs/sdk'),
    /same-host redirects/,
  );
});

test('maps generated auth POST operation aliases to normalized docs routes', () => {
  const filePath = path.join(
    __dirname,
    '..',
    'docs',
    'user_related_apis_prelive',
    'add-or-update-user-reading-session.api.mdx',
  );
  const content = `---
id: add-or-update-user-reading-session
title: Add or update user reading session
api: {"operationId":"authPostV1ReadingSessions"}
---
`;

  assert.equal(
    operationIdToGeneratedSlug('authPostV1ReadingSessions'),
    'auth-post-v-1-reading-sessions',
  );
  assert.deepEqual(getGeneratedAuthRedirectsFromDoc(filePath, content), [
    {
      source: '/docs/user_related_apis_prelive/auth-post-v-1-reading-sessions',
      target:
        '/docs/user_related_apis_prelive/add-or-update-user-reading-session/',
    },
    {
      source: '/docs/user_related_apis_prelive/auth-post-v-1-reading-sessions/',
      target:
        '/docs/user_related_apis_prelive/add-or-update-user-reading-session/',
    },
  ]);
});

test('maps generated auth GET operation aliases to normalized docs routes', () => {
  const filePath = path.join(
    __dirname,
    '..',
    'docs',
    'user_related_apis_prelive',
    'get-user-reading-sessions.api.mdx',
  );
  const content = `---
id: get-user-reading-sessions
title: Get user reading sessions
api: {"operationId":"authGetV1ReadingSessions"}
---
`;

  assert.deepEqual(getGeneratedAuthRedirectsFromDoc(filePath, content), [
    {
      source: '/docs/user_related_apis_prelive/auth-get-v-1-reading-sessions',
      target: '/docs/user_related_apis_prelive/get-user-reading-sessions/',
    },
    {
      source: '/docs/user_related_apis_prelive/auth-get-v-1-reading-sessions/',
      target: '/docs/user_related_apis_prelive/get-user-reading-sessions/',
    },
  ]);
});

test('generated redirect registry rejects loops', () => {
  const registry = createRedirectRegistry();
  registry.addRedirect('/old-page', '/new-page/');
  registry.addRedirect('/new-page', '/canonical-page/');

  assert.doesNotThrow(() => validateNoRedirectLoops(registry.redirects));

  const loopRegistry = createRedirectRegistry();
  loopRegistry.addRedirect('/a', '/b/');
  loopRegistry.addRedirect('/b', '/a/');

  assert.throws(
    () => validateNoRedirectLoops(loopRegistry.redirects),
    /Redirect loop detected/,
  );
});

test('redirect registry rejects malformed and duplicate existing redirects', () => {
  assert.throws(
    () => createRedirectRegistry('/old-only\n'),
    /Malformed redirect/,
  );
  assert.throws(
    () => createRedirectRegistry('/old /new/ 301 extra\n'),
    /Malformed redirect/,
  );
  assert.throws(
    () => createRedirectRegistry('/old /new/ 301\n/old /other/ 301\n'),
    /Duplicate redirect source/,
  );
});

test('redirect registry defaults two-token existing redirects to 301', () => {
  const registry = createRedirectRegistry('/old /new/\n');

  assert.deepEqual(registry.redirects.get('/old'), {
    target: '/new/',
    status: '301',
  });
});

test('redirect registry adds slash variants for retired routes', () => {
  const registry = createRedirectRegistry();
  registry.addRedirect(
    '/docs/tutorials/sync/getting-started',
    '/docs/tutorials/oidc/user-apis-quickstart/',
  );

  assert.deepEqual(getRedirectSourceVariants('/docs/tutorials/sync/getting-started/'), [
    '/docs/tutorials/sync/getting-started',
    '/docs/tutorials/sync/getting-started/',
  ]);
  assert.equal(
    registry.redirects.get('/docs/tutorials/sync/getting-started').target,
    '/docs/tutorials/oidc/user-apis-quickstart/',
  );
  assert.equal(
    registry.redirects.get('/docs/tutorials/sync/getting-started/').target,
    '/docs/tutorials/oidc/user-apis-quickstart/',
  );
});

test('public route lock fails deleted routes without redirects', () => {
  assert.throws(
    () => validatePublicRouteLock(new Map(), ['/docs/removed-public-page/']),
    /Public route lock failed/,
  );
});

test('public route lock passes deleted routes with slash redirects', () => {
  const registry = createRedirectRegistry();
  registry.addRedirect('/docs/removed-public-page', '/docs/api/field-reference/');

  assert.doesNotThrow(() =>
    validatePublicRouteLock(registry.redirects, ['/docs/removed-public-page/']),
  );
});

test('generated redirect target validation rejects missing build targets', () => {
  assert.throws(
    () =>
      validateGeneratedRedirectTargets(
        new Map([
          [
            '/docs/removed-public-page',
            { target: '/docs/definitely-missing-target/', status: '301' },
          ],
        ]),
      ),
    /Generated redirects point at missing build targets/,
  );
});

test('strips generated redirects sections with CRLF newlines', () => {
  assert.equal(
    stripGeneratedRedirectsSection(
      [
        '# Manual',
        '# BEGIN generated-search-console-redirects',
        '/old /new/ 301',
        '# END generated-search-console-redirects',
        '/kept /target/ 301',
      ].join('\r\n'),
    ),
    '# Manual\n/kept /target/ 301',
  );
});

test('redirect registry sends unversioned API operation targets to current version', () => {
  const registry = createRedirectRegistry();
  registry.addRedirect(
    '/docs/user_related_apis_versioned/auth-post-v-1-reading-sessions',
    '/docs/user_related_apis_versioned/add-or-update-user-reading-session/',
  );

  assert.equal(
    registry.redirects.get(
      '/docs/user_related_apis_versioned/auth-post-v-1-reading-sessions',
    ).target,
    '/docs/user_related_apis_versioned/1.0.0/add-or-update-user-reading-session/',
  );
});

test('redirect registry keeps scopes unversioned', () => {
  const registry = createRedirectRegistry();
  registry.addRedirect(
    '/docs/user_related_apis_versioned/1.0.0/scopes',
    '/docs/user_related_apis_versioned/scopes/',
  );

  assert.equal(
    registry.redirects.get('/docs/user_related_apis_versioned/1.0.0/scopes').target,
    '/docs/user_related_apis_versioned/scopes/',
  );
});

test('manual redirects can override generated alias redirects', () => {
  const registry = createRedirectRegistry();
  registry.addRedirect(
    '/docs/user_related_apis_versioned/users-controller-delete-account',
    '/docs/user_related_apis_versioned/1.0.0/user-related-apis/',
  );
  registry.addRedirect(
    '/docs/user_related_apis_versioned/users-controller-delete-account',
    '/docs/user_related_apis_versioned/1.0.0/users-controller-delete-account/',
    { skipExisting: true },
  );

  assert.equal(
    registry.redirects.get(
      '/docs/user_related_apis_versioned/users-controller-delete-account',
    ).target,
    '/docs/user_related_apis_versioned/1.0.0/user-related-apis/',
  );
});
