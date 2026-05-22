const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const promptIndex = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'static', '.well-known', 'agent-prompts', 'index.json'), 'utf8'),
);

test('publishes Next and SvelteKit scaffold agent prompts', () => {
  const ids = new Set(promptIndex.prompts.map((prompt) => prompt.id));

  assert.ok(ids.has('QF_NPX_STARTER_PROMPT_V1'));
  assert.ok(ids.has('QF_SVELTEKIT_STARTER_PROMPT_V1'));

  const sveltekitPrompt = promptIndex.prompts.find(
    (prompt) => prompt.id === 'QF_SVELTEKIT_STARTER_PROMPT_V1',
  );
  assert.match(sveltekitPrompt.command, /--template sveltekit/);
  assert.equal(sveltekitPrompt.promptUrl, 'https://api-docs.quran.foundation/agent-prompts/qf-sveltekit-starter.md');
});
