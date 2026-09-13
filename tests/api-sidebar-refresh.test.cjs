const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const packageJson = require(path.join(__dirname, '..', 'package.json'));
const {
  clearGeneratedApiSidebars,
  findGeneratedSidebarFiles,
} = require(path.join(
  __dirname,
  '..',
  'scripts',
  'clear-generated-api-sidebars.js',
));

test('refreshes generated sidebars before generating API docs', () => {
  assert.match(
    packageJson.scripts['gen-all'],
    /^node scripts\/clear-generated-api-sidebars\.js && /,
  );
});

test('clears root and semantic-version generated sidebars only', (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'api-sidebars-'));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const docsDir = path.join(tempDir, 'docs', 'example_api');
  const versionDir = path.join(docsDir, '1.2.3');
  const manualDir = path.join(docsDir, 'guides');
  const rootSidebar = path.join(docsDir, 'sidebar.js');
  const versionedSidebar = path.join(versionDir, 'sidebar.js');
  const manualSidebar = path.join(manualDir, 'sidebar.js');

  fs.mkdirSync(versionDir, { recursive: true });
  fs.mkdirSync(manualDir, { recursive: true });
  fs.writeFileSync(rootSidebar, 'module.exports = [];\n');
  fs.writeFileSync(versionedSidebar, 'module.exports = [];\n');
  fs.writeFileSync(manualSidebar, 'module.exports = [];\n');

  assert.deepEqual(findGeneratedSidebarFiles([docsDir]), [
    rootSidebar,
    versionedSidebar,
  ]);
  assert.deepEqual(clearGeneratedApiSidebars([docsDir]), [
    rootSidebar,
    versionedSidebar,
  ]);
  assert.equal(fs.existsSync(rootSidebar), false);
  assert.equal(fs.existsSync(versionedSidebar), false);
  assert.equal(fs.existsSync(manualSidebar), true);
});
