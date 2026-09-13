'use strict';

const fs = require('node:fs');
const path = require('node:path');

const siteDir = path.resolve(__dirname, '..');
const generatedApiDocsDirs = [
  'docs/content_apis_versioned',
  'docs/user_related_apis_prelive',
  'docs/user_related_apis_versioned',
  'docs/oauth2_apis_versioned',
  'docs/search_apis_versioned',
  'docs/analytics_apis_versioned',
].map((dir) => path.join(siteDir, dir));
const versionDirPattern = /^\d+\.\d+\.\d+$/;

function findGeneratedSidebarFiles(docsDirs = generatedApiDocsDirs) {
  const sidebarFiles = [];

  for (const docsDir of docsDirs) {
    if (!fs.existsSync(docsDir)) {
      continue;
    }

    const rootSidebar = path.join(docsDir, 'sidebar.js');
    if (fs.existsSync(rootSidebar)) {
      sidebarFiles.push(rootSidebar);
    }

    for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !versionDirPattern.test(entry.name)) {
        continue;
      }

      const versionedSidebar = path.join(docsDir, entry.name, 'sidebar.js');
      if (fs.existsSync(versionedSidebar)) {
        sidebarFiles.push(versionedSidebar);
      }
    }
  }

  return sidebarFiles;
}

function clearGeneratedApiSidebars(docsDirs = generatedApiDocsDirs) {
  const sidebarFiles = findGeneratedSidebarFiles(docsDirs);

  for (const sidebarFile of sidebarFiles) {
    fs.unlinkSync(sidebarFile);
  }

  return sidebarFiles;
}

function main() {
  const removedSidebars = clearGeneratedApiSidebars();
  console.log(
    `[api-sidebars] Removed ${removedSidebars.length} stale generated sidebar files`,
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  clearGeneratedApiSidebars,
  findGeneratedSidebarFiles,
};
