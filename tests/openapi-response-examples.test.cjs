const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const specs = [
  ['content', 'openAPI/content/v4.json'],
  ['search', 'openAPI/search/v1.json'],
  ['oauth2', 'openAPI/oauth2-apis/v1.json'],
  ['user', 'openAPI/user-related-apis/v1.json'],
  ['user-prelive', 'openAPI/user-related-apis/pre-live/v1.json'],
];

const httpMethods = new Set(['get', 'post', 'put', 'patch', 'delete']);

const readSpec = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8'));

const resolveRef = (ref, root) =>
  ref
    .replace(/^#\//, '')
    .split('/')
    .reduce((current, segment) => current?.[segment], root);

const resolveSchema = (schema, root) => {
  if (!schema?.$ref) return schema;
  return resolveRef(schema.$ref, root);
};

const resolveResponse = (response, root) => {
  if (!response?.$ref) return response;
  return resolveRef(response.$ref, root);
};

const getMediaExamples = (mediaType) => {
  const examples = [];
  if (mediaType.example !== undefined) {
    examples.push(['example', mediaType.example]);
  }

  for (const [name, example] of Object.entries(mediaType.examples ?? {})) {
    if (example.value !== undefined) {
      examples.push([name, example.value]);
    }
  }

  return examples;
};

const getJsonResponses = (spec) => {
  const responses = [];
  for (const [apiPath, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!httpMethods.has(method)) continue;

      for (const [status, rawResponse] of Object.entries(operation.responses ?? {})) {
        const response = resolveResponse(rawResponse, spec);
        const mediaType = response?.content?.['application/json'];
        if (!mediaType) continue;

        responses.push({
          apiPath,
          method,
          status,
          response,
          mediaType,
        });
      }
    }
  }
  return responses;
};

const validateExample = (schema, value, root, location) => {
  if (!schema) return;

  if (schema.$ref) {
    validateExample(resolveRef(schema.$ref, root), value, root, location);
    return;
  }

  if (value === null) {
    assert.equal(schema.nullable, true, `${location} should not be null`);
    return;
  }

  if (schema.oneOf || schema.anyOf) {
    const variants = schema.oneOf ?? schema.anyOf;
    const match = variants.some((variant) => {
      try {
        validateExample(variant, value, root, location);
        return true;
      } catch (_error) {
        return false;
      }
    });
    assert.equal(match, true, `${location} should match one schema variant`);
    return;
  }

  if (schema.allOf) {
    for (const variant of schema.allOf) {
      validateExample(variant, value, root, location);
    }
    return;
  }

  if (schema.enum) {
    assert.ok(schema.enum.includes(value), `${location} should be one of ${schema.enum.join(', ')}`);
  }

  const type = schema.type;
  if (!type && !schema.properties && !schema.items) return;

  if (type === 'array' || schema.items) {
    assert.ok(Array.isArray(value), `${location} should be an array`);
    for (const [index, item] of value.entries()) {
      validateExample(schema.items, item, root, `${location}[${index}]`);
    }
    return;
  }

  if (type === 'object' || schema.properties) {
    assert.equal(typeof value, 'object', `${location} should be an object`);
    assert.ok(!Array.isArray(value), `${location} should not be an array`);

    for (const requiredName of schema.required ?? []) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(value, requiredName),
        `${location} should include required property ${requiredName}`,
      );
    }

    for (const [propertyName, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (value[propertyName] !== undefined) {
        validateExample(
          propertySchema,
          value[propertyName],
          root,
          `${location}.${propertyName}`,
        );
      }
    }
    return;
  }

  if (type === 'integer') {
    assert.ok(Number.isInteger(value), `${location} should be an integer`);
    return;
  }
  if (type === 'number') {
    assert.equal(typeof value, 'number', `${location} should be a number`);
    return;
  }
  if (type === 'string') {
    assert.equal(typeof value, 'string', `${location} should be a string`);
    return;
  }
  if (type === 'boolean') {
    assert.equal(typeof value, 'boolean', `${location} should be a boolean`);
  }
};

test('all documented JSON responses expose response examples', () => {
  for (const [, specPath] of specs) {
    const spec = readSpec(specPath);

    for (const response of getJsonResponses(spec)) {
      const examples = getMediaExamples(response.mediaType);
      assert.ok(
        examples.length > 0,
        `${specPath} ${response.method.toUpperCase()} ${response.apiPath} ${response.status} should have examples`,
      );
    }
  }
});

test('Search and OAuth examples validate against their response schemas', () => {
  for (const specPath of ['openAPI/search/v1.json', 'openAPI/oauth2-apis/v1.json']) {
    const spec = readSpec(specPath);

    for (const response of getJsonResponses(spec)) {
      for (const [name, value] of getMediaExamples(response.mediaType)) {
        validateExample(
          resolveSchema(response.mediaType.schema, spec),
          value,
          spec,
          `${specPath} ${response.method.toUpperCase()} ${response.apiPath} ${response.status} ${name}`,
        );
      }
    }
  }
});

test('non-success Content and User examples validate against their error schemas', () => {
  for (const [, specPath] of specs) {
    const spec = readSpec(specPath);

    for (const response of getJsonResponses(spec)) {
      if (/^2/.test(response.status)) continue;

      for (const [name, value] of getMediaExamples(response.mediaType)) {
        validateExample(
          resolveSchema(response.mediaType.schema, spec),
          value,
          spec,
          `${specPath} ${response.method.toUpperCase()} ${response.apiPath} ${response.status} ${name}`,
        );
      }
    }
  }
});
