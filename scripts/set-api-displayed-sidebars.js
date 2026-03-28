'use strict';

const fs = require('fs');
const path = require('path');

const siteDir = path.resolve(__dirname, '..');
const docsDirs = [
  'docs/content_apis_versioned',
  'docs/user_related_apis_versioned',
  'docs/oauth2_apis_versioned',
  'docs/search_apis_versioned',
].map((dir) => path.join(siteDir, dir));

const versionDirPattern = /^\d+\.\d+\.\d+$/;
const generatedApiDocPattern = /\.(api|info|tag)\.mdx$/;

function walk(dir) {
  /** @type {string[]} */
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && generatedApiDocPattern.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

function getDisplayedSidebarId(filePath) {
  const relativePath = path.relative(siteDir, filePath);
  const pathSegments = relativePath.split(path.sep);
  const isVersionedDoc = pathSegments.some((segment) =>
    versionDirPattern.test(segment),
  );

  return isVersionedDoc ? 'apiVersionedSidebar' : 'apiSidebar';
}

function upsertDisplayedSidebar(content, displayedSidebarId) {
  const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontMatterMatch) {
    return content;
  }

  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  const frontMatterBody = frontMatterMatch[1];
  const displayedSidebarLine = `displayed_sidebar: ${displayedSidebarId}`;
  const updatedFrontMatterBody = /(^|\r?\n)displayed_sidebar:\s*[^\r\n]*/.test(
    frontMatterBody,
  )
    ? frontMatterBody.replace(
        /(^|\r?\n)displayed_sidebar:\s*[^\r\n]*/,
        `$1${displayedSidebarLine}`,
      )
    : `${frontMatterBody}${newline}${displayedSidebarLine}`;

  return content.replace(
    frontMatterMatch[0],
    `---${newline}${updatedFrontMatterBody}${newline}---`,
  );
}

let updatedFiles = 0;
let checkedFiles = 0;

for (const docsDir of docsDirs) {
  for (const filePath of walk(docsDir)) {
    checkedFiles += 1;

    const displayedSidebarId = getDisplayedSidebarId(filePath);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const updatedContent = upsertDisplayedSidebar(
      originalContent,
      displayedSidebarId,
    );

    if (updatedContent !== originalContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      updatedFiles += 1;
    }
  }
}

console.log(
  `[api-sidebars] Checked ${checkedFiles} generated API docs and updated ${updatedFiles} files`,
);
