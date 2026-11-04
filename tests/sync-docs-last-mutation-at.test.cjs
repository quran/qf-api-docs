const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');

const read = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const SYNC_SPECS = [
  'openAPI/user-related-apis/v1.json',
  'openAPI/user-related-apis/pre-live/v1.json',
];

const SYNC_TUTORIALS = [
  'docs/tutorials/sync/getting-started.mdx',
  'docs/tutorials/sync/handling-conflicts.mdx',
];

test('the pinned sync specs require the positive sync head, not -1', () => {
  for (const specPath of SYNC_SPECS) {
    const spec = JSON.parse(read(specPath));
    const syncPath = spec.paths['/v1/sync'];

    const pushParameter = syncPath.post.parameters.find(
      (parameter) => parameter.name === 'lastMutationAt',
    );
    assert.match(
      pushParameter.description,
      /rather than -1/u,
      `${specPath} should state that a new user sends the positive head instead of -1`,
    );

    const pullHead =
      syncPath.get.responses['200'].content['application/json'].schema
        .properties.data.properties.lastMutationAt;
    assert.match(
      pullHead.description,
      /sync head/u,
      `${specPath} should describe the GET lastMutationAt response field as the sync head`,
    );
  }
});

test('the sync tutorials do not document a -1 first-push sentinel', () => {
  for (const page of SYNC_TUTORIALS) {
    const content = read(page);

    assert.doesNotMatch(
      content,
      /lastMutationAt\s*[=:]\s*-1/u,
      `${page} must not tell clients to push with lastMutationAt=-1`,
    );
    assert.doesNotMatch(
      content,
      /first-sync state/iu,
      `${page} must not describe a -1 first-sync state`,
    );
    assert.doesNotMatch(
      content,
      /First sync detected\. Please use lastMutationAt=-1/u,
      `${page} must not quote the retired first-sync error message`,
    );
  }
});

test('the sync getting-started guide explains that the first head is positive', () => {
  const content = read('docs/tutorials/sync/getting-started.mdx');

  assert.match(
    content,
    /positive `lastMutationAt`/u,
    'the guide should state that a new user already has a positive sync head',
  );
  assert.match(
    content,
    /not\*\* the pull cursor/u,
    'the guide should separate the push precondition from the pull cursor',
  );
});
