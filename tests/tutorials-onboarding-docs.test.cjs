const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const docsRoot = path.join(__dirname, '..', 'docs');

const readDoc = (docPath) =>
  fs.readFileSync(path.join(docsRoot, docPath), 'utf8');

const assertClientExamplesUsePrelive = (page, factoryName) => {
  const content = readDoc(page);
  const examples = content.match(
    new RegExp(`${factoryName}\\(\\{[\\s\\S]*?\\n\\}\\);`, 'g'),
  );

  assert.ok(examples?.length, `expected ${page} to call ${factoryName}`);
  for (const example of examples) {
    assert.match(
      example,
      /gatewayUrl: "https:\/\/apis-prelive\.quran\.foundation"/,
      `expected every ${factoryName} call in ${page} to use the pre-live API gateway`,
    );
    assert.match(
      example,
      /oauth2BaseUrl: "https:\/\/prelive-oauth2\.quran\.foundation"/,
      `expected every ${factoryName} call in ${page} to use the pre-live OAuth host`,
    );
  }
};

const npxRequiredPages = [
  'tutorials/oidc/starter-with-npx.mdx',
  'tutorials/oidc/getting-started-with-oauth2.mdx',
  'tutorials/oidc/example-integration.mdx',
  'sdk/javascript/index.mdx',
];

const localOnlyPatterns = [/sdk:local/, /file:\//, /npx --yes file:/];

test('documents NPX scaffold command on required public onboarding pages', () => {
  for (const page of npxRequiredPages) {
    const content = readDoc(page);
    assert.match(
      content,
      /npx @quranjs\/create-app@latest/,
      `expected ${page} to include public npx scaffold command`,
    );
  }
});

test('keeps canonical AI prompt marker in OAuth2 and SDK entry pages', () => {
  const oauthTutorial = readDoc('tutorials/oidc/getting-started-with-oauth2.mdx');
  const sdkIndex = readDoc('sdk/javascript/index.mdx');

  assert.match(oauthTutorial, /Canonical prompt ID: QF_NPX_STARTER_PROMPT_V1/);
  assert.match(sdkIndex, /Canonical prompt ID: QF_NPX_STARTER_PROMPT_V1/);
});

test('excludes local-only scaffold command patterns from targeted public pages', () => {
  const targetedPages = [
    'tutorials/oidc/starter-with-npx.mdx',
    'tutorials/oidc/getting-started-with-oauth2.mdx',
    'tutorials/oidc/example-integration.mdx',
    'sdk/javascript/index.mdx',
  ];

  for (const page of targetedPages) {
    const content = readDoc(page);
    for (const pattern of localOnlyPatterns) {
      assert.doesNotMatch(
        content,
        pattern,
        `expected ${page} to exclude local-only pattern ${pattern}`,
      );
    }
  }
});

test('documents SvelteKit scaffold command on starter page', () => {
  const starter = readDoc('tutorials/oidc/starter-with-npx.mdx');

  assert.match(
    starter,
    /npx @quranjs\/create-app@latest my-quran-app --template sveltekit --package-manager npm --install --git --sdk-source npm --yes/,
  );
});

test('requires a backend/server Console app for the full-stack starter', () => {
  const starter = readDoc('tutorials/oidc/starter-with-npx.mdx');

  assert.match(starter, /Backend\/server app/);
  assert.match(starter, /one-time `client_secret`/);
  assert.match(starter, /Developer Console/);
  assert.match(
    starter,
    /Search[^\n]*requires[^\n]*permission[^\n]*Developer Console/i,
  );
  assert.match(starter, /unavailable until that permission is granted/i);
});

test('public-client SDK examples include the complete PKCE authorization setup', () => {
  const examples = [
    readDoc('sdk/javascript/public-quickstart.mdx'),
    readDoc('sdk/javascript/index.mdx'),
  ];

  for (const example of examples) {
    assert.match(example, /crypto\.getRandomValues/);
    assert.match(example, /crypto\.subtle\.digest/);
    assert.match(example, /sessionStorage\.setItem/);
    assert.match(example, /code_challenge: codeChallenge/);
    assert.match(example, /code_challenge_method: "S256"/);
  }

  assert.match(examples[0], /exchangeCode\(\{[\s\S]*codeVerifier/);
});

test('React Native OAuth guidance branches on the Console app type', () => {
  const reactNative = readDoc('tutorials/oidc/mobile-apps/react-native.mdx');

  assert.match(reactNative, /Frontend or mobile app/);
  assert.match(reactNative, /Backend\/server app/);
  assert.doesNotMatch(reactNative, /token_endpoint_auth_method=none/);
});

test('React Native example keeps OAuth and User APIs in the same environment', () => {
  const reactNative = readDoc('tutorials/oidc/mobile-apps/react-native.mdx');

  assert.match(reactNative, /https:\/\/apis-prelive\.quran\.foundation/);
  assert.match(reactNative, /`\$\{apiBaseUrl\}\/auth\/v1\/bookmarks`/);
});

test('new Console app SDK examples default every server client to pre-live', () => {
  const onboardingPages = [
    'quickstart/index.md',
    'sdk/javascript/index.mdx',
    'sdk/javascript/server-quickstart.mdx',
    'sdk/javascript/full-stack.mdx',
    'tutorials/oidc/user-apis-quickstart.mdx',
  ];

  for (const page of onboardingPages) {
    assertClientExamplesUsePrelive(page, 'createServerClient');
  }
});

test('new Console app SDK examples default every public client to pre-live', () => {
  const onboardingPages = [
    'sdk/javascript/index.mdx',
    'sdk/javascript/public-quickstart.mdx',
    'sdk/javascript/full-stack.mdx',
  ];

  for (const page of onboardingPages) {
    assertClientExamplesUsePrelive(page, 'createPublicClient');
  }
});

test('server quickstart keeps permission-gated Search out of the first request', () => {
  const serverQuickstart = readDoc('sdk/javascript/server-quickstart.mdx');
  const minimalExample = serverQuickstart.match(
    /## Minimal Example([\s\S]*?)## Add Search/,
  );

  assert.ok(minimalExample, 'expected separate minimal and Search sections');
  assert.doesNotMatch(minimalExample[1], /search\.v1/);
  assert.match(
    serverQuickstart,
    /Search requires additional permission in Developer Console/,
  );
});

test('Console-facing OAuth docs use the selectable app-type labels', () => {
  const guides = [
    readDoc('tutorials/oidc/client-setup.mdx'),
    readDoc('tutorials/oidc/getting-started-with-oauth2.mdx'),
    readDoc('tutorials/oidc/user-apis-quickstart.mdx'),
    readDoc('tutorials/oidc/mobile-apps/_obtain_client_credentials.mdx'),
  ];

  for (const guide of guides) {
    assert.match(guide, /Frontend or mobile app/);
    assert.match(guide, /Backend\/server app/);
    assert.doesNotMatch(
      guide,
      /(?:choose|selected) (?:the |a )?(?:\*\*)?browser\/mobile app/i,
    );
  }

  const clientSetup = guides[0];
  assert.doesNotMatch(clientSetup, /\*\*Browser\/mobile app:/);
});

test('onboarding help sends self-service setup to Developer Console first', () => {
  const pages = [
    readDoc('quickstart/index.md'),
    readDoc('tutorials/oidc/user-apis-quickstart.mdx'),
  ];

  for (const page of pages) {
    const helpSection = page.slice(page.indexOf('## Need Help?'));
    assert.match(helpSection, /Developer Console/);
    assert.match(helpSection, /cannot resolve|still need help/i);
  }
});
