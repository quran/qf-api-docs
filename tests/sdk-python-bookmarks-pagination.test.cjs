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

test('/v1/bookmarks pages with cursors and requires mushafId', () => {
  for (const specPath of SPECS) {
    const spec = JSON.parse(read(specPath));
    const byName = new Map(
      spec.paths['/v1/bookmarks'].get.parameters.map((parameter) => [
        parameter.name,
        parameter,
      ]),
    );

    assert.ok(
      byName.has('first') && byName.has('after'),
      `${specPath} should expose the first/after cursor parameters for /v1/bookmarks`,
    );
    assert.ok(
      !byName.has('page'),
      `${specPath} does not accept a page parameter on /v1/bookmarks`,
    );
    assert.equal(
      byName.get('mushafId')?.required,
      true,
      `${specPath} requires mushafId on /v1/bookmarks`,
    );
  }
});

test('the Python SDK bookmark examples use the cursor parameter', () => {
  for (const page of PYTHON_SDK_PAGES) {
    const content = read(page);

    assert.match(
      content,
      /user_request\("\/bookmarks", params=\{"mushafId": 1, "first": 10\}\)/u,
      `${page} should page bookmarks with the required mushafId and the first cursor`,
    );
    assert.doesNotMatch(
      content,
      /user_request\("\/bookmarks"[^\n]*"page"/u,
      `${page} must not pass page to /v1/bookmarks`,
    );
  }
});
