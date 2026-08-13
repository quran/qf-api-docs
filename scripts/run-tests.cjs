const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const testsDir = path.join(repoRoot, 'tests');

const collectTestFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTestFiles(entryPath));
    } else if (/\.test\.cjs$/u.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
};

const testFiles = collectTestFiles(testsDir).sort();

if (testFiles.length === 0) {
  console.error('No test files found under tests/**/*.test.cjs');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
