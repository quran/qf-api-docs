const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  getUserRelatedDocsAvailablePaths,
  getUserRelatedDocsEnvironment,
  getUserRelatedDocsPath,
  getUserRelatedDocsTarget,
} = require(path.join(
  __dirname,
  '..',
  'src',
  'components',
  'UserRelatedApiEnvironmentNotice',
  'paths.js',
));

test('detects production and pre-live user-related docs routes', () => {
  assert.equal(
    getUserRelatedDocsEnvironment('/docs/user_related_apis_versioned/get-user-profile'),
    'production',
  );
  assert.equal(
    getUserRelatedDocsEnvironment('/docs/user_related_apis_prelive/get-user-profile'),
    'pre-live',
  );
  assert.equal(
    getUserRelatedDocsEnvironment('/docs/user_related_apis_versioned/get-user-profile/'),
    'production',
  );
  assert.equal(
    getUserRelatedDocsEnvironment('/docs/user_related_apis_prelive/get-user-profile/'),
    'pre-live',
  );
  assert.equal(getUserRelatedDocsEnvironment('/docs/user_related_apis_versioned'), 'production');
  assert.equal(getUserRelatedDocsEnvironment('/docs/user_related_apis_versioned/'), 'production');
  assert.equal(getUserRelatedDocsEnvironment('/docs/user_related_apis_prelive'), 'pre-live');
  assert.equal(getUserRelatedDocsEnvironment('/docs/user_related_apis_prelive/'), 'pre-live');
  assert.equal(getUserRelatedDocsEnvironment('/docs/category/user-related-apis'), 'production');
  assert.equal(
    getUserRelatedDocsEnvironment('/docs/category/user-related-apis/'),
    'production',
  );
  assert.equal(
    getUserRelatedDocsEnvironment('/docs/category/user-related-apis-pre-live'),
    'pre-live',
  );
  assert.equal(
    getUserRelatedDocsEnvironment('/docs/category/user-related-apis-pre-live/'),
    'pre-live',
  );
  assert.equal(getUserRelatedDocsEnvironment('/docs/category/content-apis'), null);
});

test('maps the current doc route between production and pre-live trees', () => {
  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_versioned/get-user-profile',
      'pre-live',
    ),
    '/docs/user_related_apis_prelive/get-user-profile',
  );
  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_versioned/1.0.0/get-user-profile',
      'pre-live',
    ),
    '/docs/user_related_apis_prelive/get-user-profile',
  );
  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_prelive/get-user-profile',
      'production',
    ),
    '/docs/user_related_apis_versioned/get-user-profile',
  );
  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_prelive/get-user-profile/',
      'production',
    ),
    '/docs/user_related_apis_versioned/get-user-profile',
  );
  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_versioned/1.0.0/get-user-profile/',
      'pre-live',
    ),
    '/docs/user_related_apis_prelive/get-user-profile',
  );
  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_versioned/get-user-profile',
      'production',
    ),
    '/docs/user_related_apis_versioned/get-user-profile',
  );
  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_prelive/get-user-profile',
      'pre-live',
    ),
    '/docs/user_related_apis_prelive/get-user-profile',
  );
  assert.equal(
    getUserRelatedDocsPath('/docs/category/user-related-apis', 'pre-live'),
    '/docs/category/user-related-apis-pre-live',
  );
  assert.equal(
    getUserRelatedDocsPath('/docs/category/user-related-apis/', 'pre-live'),
    '/docs/category/user-related-apis-pre-live',
  );
  assert.equal(
    getUserRelatedDocsPath('/docs/user_related_apis_versioned/', 'pre-live'),
    '/docs/user_related_apis_prelive',
  );
  assert.equal(
    getUserRelatedDocsPath('/docs/user_related_apis_prelive/', 'production'),
    '/docs/user_related_apis_versioned',
  );
  assert.equal(
    getUserRelatedDocsPath('/docs/category/user-related-apis-pre-live', 'production'),
    '/docs/category/user-related-apis',
  );
});

test('falls back to the environment intro doc when the target doc does not exist', () => {
  const availablePaths = new Set([
    '/docs/user_related_apis_versioned/get-user-profile',
    '/docs/user_related_apis_versioned/1.1.0/get-user-profile',
    '/docs/user_related_apis_prelive/get-user-profile',
    '/docs/user_related_apis_prelive/get-sync-mutations',
  ]);

  const noEquivalentTarget = getUserRelatedDocsTarget(
    '/docs/user_related_apis_prelive/get-sync-mutations',
    'production',
    { availablePaths },
  );
  assert.equal(noEquivalentTarget.path, '/docs/user_related_apis_versioned/user-related-apis');
  assert.equal(noEquivalentTarget.hasEquivalentDoc, false);

  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_prelive/get-sync-mutations',
      'production',
      { availablePaths },
    ),
    '/docs/user_related_apis_versioned/user-related-apis',
  );

  assert.equal(
    getUserRelatedDocsPath(
      '/docs/user_related_apis_prelive/get-user-profile',
      'production',
      { availablePaths },
    ),
    '/docs/user_related_apis_versioned/get-user-profile',
  );

  const equivalentTarget = getUserRelatedDocsTarget(
    '/docs/user_related_apis_prelive/get-user-profile',
    'production',
    { availablePaths },
  );
  assert.equal(equivalentTarget.path, '/docs/user_related_apis_versioned/get-user-profile');
  assert.equal(equivalentTarget.hasEquivalentDoc, true);

  const versionedProdToPreliveTarget = getUserRelatedDocsTarget(
    '/docs/user_related_apis_versioned/1.1.0/get-user-profile',
    'pre-live',
    { availablePaths },
  );
  assert.equal(versionedProdToPreliveTarget.path, '/docs/user_related_apis_prelive/get-user-profile');
  assert.equal(versionedProdToPreliveTarget.hasEquivalentDoc, true);

  const trailingSlashTarget = getUserRelatedDocsTarget(
    '/docs/user_related_apis_prelive/get-user-profile/',
    'production',
    { availablePaths },
  );
  assert.equal(trailingSlashTarget.path, '/docs/user_related_apis_versioned/get-user-profile');
  assert.equal(trailingSlashTarget.hasEquivalentDoc, true);

  const rootTarget = getUserRelatedDocsTarget(
    '/docs/user_related_apis_versioned/',
    'pre-live',
    { availablePaths },
  );
  assert.equal(rootTarget.path, '/docs/user_related_apis_prelive');
  assert.equal(rootTarget.hasEquivalentDoc, true);

  const categoryToPreliveTarget = getUserRelatedDocsTarget(
    '/docs/category/user-related-apis',
    'pre-live',
    { availablePaths },
  );
  assert.equal(categoryToPreliveTarget.path, '/docs/category/user-related-apis-pre-live');
  assert.equal(categoryToPreliveTarget.hasEquivalentDoc, true);

  const categoryToProductionTarget = getUserRelatedDocsTarget(
    '/docs/category/user-related-apis-pre-live',
    'production',
    { availablePaths },
  );
  assert.equal(categoryToProductionTarget.path, '/docs/category/user-related-apis');
  assert.equal(categoryToProductionTarget.hasEquivalentDoc, true);
});

test('collects available docs paths from Docusaurus docs data', () => {
  const availablePaths = getUserRelatedDocsAvailablePaths({
    default: {
      versions: [
        {
          docs: [
            { path: '/docs/user_related_apis_versioned/get-user-profile' },
            { path: '/docs/user_related_apis_prelive/get-sync-mutations/' },
          ],
        },
      ],
    },
  });

  assert.deepEqual([...availablePaths].sort(), [
    '/docs/user_related_apis_prelive/get-sync-mutations',
    '/docs/user_related_apis_versioned/get-user-profile',
  ]);
});
