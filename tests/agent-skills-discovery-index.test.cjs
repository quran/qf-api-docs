const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const indexPath = path.join(
  __dirname,
  '..',
  'static',
  '.well-known',
  'agent-skills',
  'index.json',
);
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

test('publishes an Agent Skills discovery index with the v0.2.0 schema', () => {
  assert.equal(
    index.$schema,
    'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
  );
  assert.ok(Array.isArray(index.skills));
  assert.ok(index.skills.length > 0);
});

test('limits Agent Skills discovery entries to the RFC v0.2.0 fields', () => {
  for (const skill of index.skills) {
    assert.equal(typeof skill.name, 'string');
    assert.match(skill.name, /^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/);

    assert.ok(['skill-md', 'archive'].includes(skill.type));

    assert.equal(typeof skill.description, 'string');
    assert.ok(skill.description.length > 0);
    assert.ok(skill.description.length <= 1024);

    assert.equal(typeof skill.url, 'string');
    assert.ok(skill.url.length > 0);

    assert.equal(typeof skill.digest, 'string');
    assert.match(skill.digest, /^sha256:[0-9a-f]{64}$/);
  }
});

test('matches each published skill-md digest to the raw SKILL.md bytes', () => {
  for (const skill of index.skills) {
    if (skill.type !== 'skill-md') {
      continue;
    }

    assert.match(
      skill.url,
      /^\/\.well-known\/agent-skills\/[a-z0-9-]+\/SKILL\.md$/,
    );

    const localSkillPath = path.join(
      __dirname,
      '..',
      'static',
      ...skill.url.replace(/^\//, '').split('/'),
    );
    const rawBytes = fs.readFileSync(localSkillPath);
    const digest = `sha256:${crypto
      .createHash('sha256')
      .update(rawBytes)
      .digest('hex')}`;

    assert.equal(skill.digest, digest);
  }
});
