const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const read = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const SPECS = [
  'openAPI/user-related-apis/v1.json',
  'openAPI/user-related-apis/pre-live/v1.json',
];

const PYTHON_SDK_PAGES = [
  'docs/sdk/python/user-apis.mdx',
  'docs/sdk/python/common-errors.mdx',
];

test('/v1/bookmarks uses cursor pagination in the pinned specs', () => {
  for (const specPath of SPECS) {
    const spec = JSON.parse(read(specPath));
    const parameterNames = spec.paths['/v1/bookmarks'].get.parameters.map(
      (parameter) => parameter.name,
    );

    assert.ok(
      parameterNames.includes('first') && parameterNames.includes('after'),
      `${specPath} should expose the first/after cursor parameters for /v1/bookmarks`,
    );
    assert.ok(
      !parameterNames.includes('page'),
      `${specPath} does not accept a page parameter on /v1/bookmarks`,
    );
  }
});

test('the Python SDK bookmark examples use the cursor parameter', () => {
  for (const page of PYTHON_SDK_PAGES) {
    const content = read(page);

    assert.match(
      content,
      /user_request\("\/bookmarks", params=\{"first": 10\}\)/u,
      `${page} should page bookmarks with first`,
    );
    assert.doesNotMatch(
      content,
      /user_request\("\/bookmarks"[^\n]*"page"/u,
      `${page} must not pass page to /v1/bookmarks`,
    );
  }
});
