const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const specPath of [
  'openAPI/user-related-apis/v1.json',
  'openAPI/user-related-apis/pre-live/v1.json',
]) {
  test(`${specPath} keeps the CSRF cookie header example MDX-safe`, () => {
    const spec = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', specPath), 'utf8'),
    );
    const example = spec.paths['/users/csrf-token'].get.responses['200']
      .headers['Set-Cookie'].example;

    assert.equal(example, '_csrf=OPAQUE_SECRET; Path=/; SameSite=Lax');
    assert.doesNotMatch(example, /[<>]/);
  });
}
