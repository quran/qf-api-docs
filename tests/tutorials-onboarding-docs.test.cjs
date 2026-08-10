const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const docsRoot = path.join(__dirname, '..', 'docs');

const readDoc = (docPath) =>
  fs.readFileSync(path.join(docsRoot, docPath), 'utf8');

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
