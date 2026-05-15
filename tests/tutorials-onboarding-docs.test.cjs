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
