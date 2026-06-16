const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const sidebars = require(path.join(repoRoot, 'sidebars.js'));
const promptIndex = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'static', '.well-known', 'agent-prompts', 'index.json'), 'utf8'),
);
const redirects = fs.readFileSync(path.join(repoRoot, 'static', '_redirects'), 'utf8');

const readPrompt = (filename) =>
  fs.readFileSync(path.join(repoRoot, 'static', 'agent-prompts', filename), 'utf8');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('publishes scaffold, SDK, OAuth, and review agent prompts', () => {
  const ids = new Set(promptIndex.prompts.map((prompt) => prompt.id));

  assert.ok(ids.has('QF_NPX_STARTER_PROMPT_V1'));
  assert.ok(ids.has('QF_SVELTEKIT_STARTER_PROMPT_V1'));
  assert.ok(ids.has('QF_JS_SDK_INTEGRATION_PROMPT_V1'));
  assert.ok(ids.has('QF_PYTHON_SDK_INTEGRATION_PROMPT_V1'));
  assert.ok(ids.has('QF_OAUTH_USER_APIS_PROMPT_V1'));
  assert.ok(ids.has('QF_REVIEW_EXISTING_INTEGRATION_PROMPT_V1'));

  const sveltekitPrompt = promptIndex.prompts.find(
    (prompt) => prompt.id === 'QF_SVELTEKIT_STARTER_PROMPT_V1',
  );
  assert.ok(sveltekitPrompt, 'expected SvelteKit starter prompt to be registered');
  assert.match(sveltekitPrompt.command, /--template sveltekit/);
  assert.equal(sveltekitPrompt.promptUrl, 'https://api-docs.quran.foundation/agent-prompts/qf-sveltekit-starter.md');

  const reviewPrompt = promptIndex.prompts.find(
    (prompt) => prompt.id === 'QF_REVIEW_EXISTING_INTEGRATION_PROMPT_V1',
  );
  assert.ok(reviewPrompt, 'expected review integration prompt to be registered');
  assert.match(reviewPrompt.command, /doctor/);
  assert.equal(reviewPrompt.promptUrl, 'https://api-docs.quran.foundation/agent-prompts/qf-review-existing-integration.md');

  const pythonPrompt = promptIndex.prompts.find(
    (prompt) => prompt.id === 'QF_PYTHON_SDK_INTEGRATION_PROMPT_V1',
  );
  assert.ok(pythonPrompt, 'expected Python SDK integration prompt to be registered');
  assert.equal(pythonPrompt.status, 'preview');
  assert.match(pythonPrompt.command, /api-python/);
  assert.match(pythonPrompt.command, /pip install -e \./);
  assert.equal(pythonPrompt.promptUrl, 'https://api-docs.quran.foundation/agent-prompts/qf-python-sdk-integration.md');
});

test('prompts constrain agents to official commands, docs, SDK boundaries, and checks', () => {
  const nextPrompt = readPrompt('qf-next-starter.md');
  assert.match(nextPrompt, /Run the scaffold command first/);
  assert.match(nextPrompt, /read the generated `AGENTS\.md`/);
  assert.match(nextPrompt, /official docs page or OpenAPI path/);
  assert.match(nextPrompt, /Run the generated scaffold's documented checks/);

  const sveltekitPrompt = readPrompt('qf-sveltekit-starter.md');
  assert.match(sveltekitPrompt, /Run the scaffold command first/);
  assert.match(sveltekitPrompt, /preserve its server routes, session, callback, refresh, and logout structure/);
  assert.match(sveltekitPrompt, /official docs page or OpenAPI path/);

  const sdkPrompt = readPrompt('qf-js-sdk-integration.md');
  assert.match(sdkPrompt, /If this is a new app, stop and use the official scaffold prompt/);
  assert.match(sdkPrompt, /Use SDK helpers first/);
  assert.match(sdkPrompt, /implementation note that lists each API call/);

  const oauthPrompt = readPrompt('qf-oauth-user-apis.md');
  assert.match(oauthPrompt, /skills get oauth/);
  assert.match(oauthPrompt, /documented endpoint, required scope, request parameters/);
  assert.match(oauthPrompt, /authenticated User API smoke check/);

  const pythonPrompt = readPrompt('qf-python-sdk-integration.md');
  assert.match(pythonPrompt, /quran-foundation-api/);
  assert.match(pythonPrompt, /from quran_foundation import QuranClient/);
  assert.match(pythonPrompt, /Content\/Search calls use an app access token/);
  assert.match(pythonPrompt, /Run live smoke checks only with approved credentials/);
});

test('labels the shared sidebar prompt hub clearly', () => {
  const promptHub = sidebars.APIsSidebar.find(
    (item) => item.type === 'doc' && item.id === 'ai-agents/index',
  );

  assert.ok(promptHub, 'expected shared API sidebar to include the agent prompt hub');
  assert.equal(promptHub.label, 'AI Agent Prompts');
});

test('agent prompt hub links prompt assets on the same deployment', () => {
  const promptHubPage = fs.readFileSync(path.join(repoRoot, 'docs', 'ai-agents', 'index.mdx'), 'utf8');

  assert.doesNotMatch(promptHubPage, /https:\/\/api-docs\.quran\.foundation\/agent-prompts\//);
  assert.doesNotMatch(promptHubPage, /\]\(\/agent-prompts\/[^)]+\.md\)/);
  assert.match(promptHubPage, /href="\/\.well-known\/agent-prompts\/index\.json"/);
  assert.match(promptHubPage, /href="\/agent-prompts\/qf-js-sdk-integration\.md"/);
  assert.match(promptHubPage, /href="\/agent-prompts\/qf-python-sdk-integration\.md"/);
  assert.match(promptHubPage, /href="\/agent-prompts\/qf-oauth-user-apis\.md"/);
  assert.match(promptHubPage, /href="\/agent-prompts\/qf-review-existing-integration\.md"/);
});

test('redirects rendered slash prompt asset links to static files', () => {
  assert.match(
    redirects,
    /^\/\.well-known\/agent-prompts\/index\.json\/ \/\.well-known\/agent-prompts\/index\.json 301$/m,
  );

  for (const prompt of promptIndex.prompts) {
    const promptAsset = new URL(prompt.promptUrl).pathname;
    const redirectPattern = new RegExp(
      `^${escapeRegExp(`${promptAsset}/ ${promptAsset} 301`)}$`,
      'm',
    );

    assert.match(redirects, redirectPattern, `expected slash redirect for ${promptAsset}`);
  }
});
