const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const promptIndex = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'static', '.well-known', 'agent-prompts', 'index.json'), 'utf8'),
);

test('publishes scaffold, SDK, OAuth, and review agent prompts', () => {
  const ids = new Set(promptIndex.prompts.map((prompt) => prompt.id));

  assert.ok(ids.has('QF_NPX_STARTER_PROMPT_V1'));
  assert.ok(ids.has('QF_SVELTEKIT_STARTER_PROMPT_V1'));
  assert.ok(ids.has('QF_JS_SDK_INTEGRATION_PROMPT_V1'));
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
});
