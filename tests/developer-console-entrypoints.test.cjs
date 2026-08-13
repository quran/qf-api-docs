const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const developerConsoleUrl = 'https://dev-console.quran.foundation/projects';

const read = (...segments) =>
  fs.readFileSync(path.join(repoRoot, ...segments), 'utf8');

test('routes the navbar through the request-access screen', () => {
  const config = require(path.join(repoRoot, 'docusaurus.config.js'));
  const navbarItems = config.themeConfig.navbar.items;
  const requestAccessItem = navbarItems.find(
    (item) => item.label === 'Request Access',
  );

  assert.deepEqual(requestAccessItem, {
    to: '/request-access',
    label: 'Request Access',
    position: 'right',
    className: 'navbar__item--request-access',
  });

  for (const relativePath of [
    ['src', 'components', 'DeveloperJourneyMap', 'index.tsx'],
    ['src', 'pages', 'index.tsx'],
  ]) {
    const source = read(...relativePath);
    assert.match(
      source,
      new RegExp(developerConsoleUrl.replaceAll('.', '\\.')),
    );
    assert.doesNotMatch(source, /\/request-access/);
  }
});

test('routes documentation onboarding links through the Developer Console', () => {
  const onboardingDocs = [
    ['docs', 'api-reference.mdx'],
    ['docs', 'quickstart', 'index.md'],
    ['docs', 'tutorials', 'faq.mdx'],
    ['docs', 'tutorials', 'oidc', 'client-setup.mdx'],
    ['docs', 'tutorials', 'oidc', 'example-integration.mdx'],
    ['docs', 'tutorials', 'oidc', 'getting-started-with-oauth2.mdx'],
    ['docs', 'tutorials', 'oidc', 'mobile-apps', '_obtain_client_credentials.mdx'],
    ['docs', 'tutorials', 'oidc', 'user-apis-quickstart.mdx'],
  ];

  for (const relativePath of onboardingDocs) {
    const source = read(...relativePath);
    assert.match(
      source,
      new RegExp(developerConsoleUrl.replaceAll('.', '\\.')),
      `expected ${relativePath.join('/')} to link to the Developer Console`,
    );
    assert.doesNotMatch(
      source,
      /\/request-access/,
      `expected ${relativePath.join('/')} not to link to the retired request-access flow`,
    );
  }
});

test('routes machine discovery through Developer Console without bypassing the request-access screen', () => {
  const card = JSON.parse(
    read('static', '.well-known', 'mcp', 'server-card.json'),
  );
  const resourceUris = new Set(card.resources.map((resource) => resource.uri));

  assert.ok(resourceUris.has(developerConsoleUrl));
  assert.ok(
    !resourceUris.has('https://api-docs.quran.foundation/request-access/'),
  );

  const headers = read('static', '_headers');
  assert.match(
    headers,
    new RegExp(
      `Link: <${developerConsoleUrl.replaceAll('.', '\\.')}>; rel="service-doc"`,
    ),
  );

  const redirects = read('static', '_redirects');
  assert.doesNotMatch(redirects, /^\/request-access\/?\s/m);

  const searchConsoleOverrides = JSON.parse(
    read('scripts', 'search-console-redirect-overrides.json'),
  );
  assert.ok(
    searchConsoleOverrides.redirects.some(
      (redirect) =>
        redirect.source === '/docs/tutorials/oidc/request-access' &&
        redirect.target === '/docs/connected-apps/',
    ),
  );
});
