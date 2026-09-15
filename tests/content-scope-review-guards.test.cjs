'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validate } = require('../scripts/lib/json-schema-lite.cjs');
const { apply } = require('../scripts/apply-content-scope-openapi-metadata.cjs');
const contentApi = require('../openAPI/content/v4.json');

for (const schema of [
  { properties: { optional: { format: 'email' } } },
  { definitions: { unused: { format: 'email' } } },
  { not: { format: 'email' } },
  { anyOf: [true, { format: 'email' }] },
  { oneOf: [true, { format: 'email' }] },
  { allOf: [{ properties: { optional: { format: 'email' } } }] },
  { items: { format: 'email' } },
  { contains: { format: 'email' } },
  { additionalProperties: { format: 'email' } },
]) {
  test(`rejects unsupported schema keywords independent of data: ${JSON.stringify(schema)}`, () => {
    assert.ok(validate({}, schema).some((error) => error.includes('unsupported keyword "format"')));
  });
}

test('does not mistake property names or literal values for schema keywords', () => {
  assert.deepEqual(validate({ format: 'literal' }, {
    properties: { format: { const: 'literal' } },
    enum: [{ format: 'literal' }],
  }), []);
});

test('rejects an HTTP operation without operationId even under a covered path', () => {
  const doc = structuredClone(contentApi);
  doc.paths['/chapters'].post = { responses: { 200: { description: 'OK' } } };
  assert.throws(() => apply(doc), /POST \/chapters: missing operationId/);
});

test('rejects removing a covered operation ID', () => {
  const doc = structuredClone(contentApi);
  delete doc.paths['/chapters'].get.operationId;
  assert.throws(() => apply(doc), /GET \/chapters: missing operationId/);
});

test('ignores Path Item metadata instead of treating it as an operation', () => {
  const doc = structuredClone(contentApi);
  doc.paths['/chapters'].parameters = [];
  doc.paths['/chapters'].summary = 'Chapters';
  assert.equal(apply(doc).applied, 95);
});

test('rejects an operation-level empty security override', () => {
  const doc = structuredClone(contentApi);
  doc.paths['/chapters'].get.security = [];
  assert.throws(() => apply(doc), /GET \/chapters: a non-empty security requirement/);
});

test('rejects an empty inherited security requirement and anonymous alternatives', () => {
  for (const security of [[], [{}]]) {
    const doc = structuredClone(contentApi);
    doc.security = security;
    assert.throws(() => apply(doc), /security|unauthenticated/);
  }
});

test('CI filters include the validator and tested scope documentation on both events', () => {
  const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/content-scope-contract.yml'), 'utf8');
  for (const dependency of ['scripts/lib/json-schema-lite.cjs', 'docs/user_related_apis_versioned/scopes.mdx']) {
    assert.equal(workflow.split(`- '${dependency}'`).length - 1, 2);
  }
});
