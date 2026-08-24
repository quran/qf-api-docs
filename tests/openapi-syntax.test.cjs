const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const openApiDir = path.join(__dirname, '..', 'openAPI');

const collectJsonFiles = (dir) => {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectJsonFiles(entryPath));
    } else if (entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }

  return files;
};

test('OpenAPI documents have valid syntax and unique mapping keys', () => {
  for (const filePath of collectJsonFiles(openApiDir)) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    const contents = fs.readFileSync(filePath, 'utf8');

    assert.doesNotThrow(
      () => yaml.load(contents),
      `${relativePath} must parse without duplicate mapping keys`,
    );
  }
});
