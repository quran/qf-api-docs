'use strict';

const fs = require('fs');
const path = require('path');

const siteDir = path.resolve(__dirname, '..');
const docsDirs = [
  'docs/content_apis_versioned',
  'docs/user_related_apis_prelive',
  'docs/user_related_apis_versioned',
  'docs/oauth2_apis_versioned',
  'docs/search_apis_versioned',
].map((dir) => path.join(siteDir, dir));

const versionDirPattern = /^\d+\.\d+\.\d+$/;
const generatedApiDocPattern = /\.(api|info|tag)\.mdx$/;
const generatedSidebarPattern = /(?:^|[\\/])sidebar\.js$/;

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

function getDocId(filePath) {
  return path
    .relative(siteDir, filePath)
    .split(path.sep)
    .join('/')
    .replace(/^docs\//, '')
    .replace(/\.(api|info|tag)\.mdx$/, '');
}

function getDisplayedSidebarId(filePath) {
  const relativePath = path.relative(siteDir, filePath);
  const pathSegments = relativePath.split(path.sep);
  const isVersionedDoc = pathSegments.some((segment) =>
    versionDirPattern.test(segment),
  );

  return isVersionedDoc ? 'APIsVersionedSidebar' : 'APIsSidebar';
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

function normalizeGeneratedLabels(content) {
  return content
    .replace(/Foot Note/g, 'Footnote')
    .replace(/foot note/g, 'footnote');
}

function dedupeSidebarItems(items) {
  const seenDocIds = new Set();

  return items.reduce((accumulator, item) => {
    if (!item || typeof item !== 'object') {
      accumulator.push(item);
      return accumulator;
    }

    if (item.type === 'doc') {
      if (seenDocIds.has(item.id)) {
        return accumulator;
      }

      seenDocIds.add(item.id);
      accumulator.push(item);
      return accumulator;
    }

    if (item.type === 'category' && Array.isArray(item.items)) {
      accumulator.push({
        ...item,
        items: dedupeSidebarItems(item.items),
      });
      return accumulator;
    }

    accumulator.push(item);
    return accumulator;
  }, []);
}

function filterMissingSidebarItems(items, validDocIds) {
  return items.reduce((accumulator, item) => {
    if (!item || typeof item !== 'object') {
      accumulator.push(item);
      return accumulator;
    }

    if (item.type === 'doc') {
      if (validDocIds.has(item.id)) {
        accumulator.push(item);
      }

      return accumulator;
    }

    if (item.type === 'category' && Array.isArray(item.items)) {
      const filteredItems = filterMissingSidebarItems(item.items, validDocIds);
      const hasValidDocLink =
        !item.link ||
        item.link.type !== 'doc' ||
        validDocIds.has(item.link.id);

      if (!hasValidDocLink && filteredItems.length === 0) {
        return accumulator;
      }

      const normalizedItem = {
        ...item,
        items: filteredItems,
      };

      if (!hasValidDocLink) {
        delete normalizedItem.link;
      }

      accumulator.push(normalizedItem);
      return accumulator;
    }

    accumulator.push(item);
    return accumulator;
  }, []);
}

function normalizeGeneratedSidebar(filePath, validDocIds) {
  delete require.cache[require.resolve(filePath)];
  const sidebarItems = require(filePath);
  const filteredSidebarItems = filterMissingSidebarItems(sidebarItems, validDocIds);
  const dedupedSidebarItems = dedupeSidebarItems(filteredSidebarItems);
  const serializedSidebar = `module.exports = ${JSON.stringify(dedupedSidebarItems)};`;

  return normalizeGeneratedLabels(serializedSidebar);
}

let updatedFiles = 0;
let checkedFiles = 0;
const validDocIds = new Set();

for (const docsDir of docsDirs) {
  if (!fs.existsSync(docsDir)) {
    continue;
  }

  for (const filePath of walk(docsDir)) {
    validDocIds.add(getDocId(filePath));
  }
}

for (const docsDir of docsDirs) {
  if (!fs.existsSync(docsDir)) {
    continue;
  }

  const generatedDocs = walk(docsDir);
  const generatedSidebars = [
    path.join(docsDir, 'sidebar.js'),
    ...fs
      .readdirSync(docsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && versionDirPattern.test(entry.name))
      .map((entry) => path.join(docsDir, entry.name, 'sidebar.js'))
      .filter((filePath) => generatedSidebarPattern.test(filePath) && fs.existsSync(filePath)),
  ];

  for (const filePath of [...generatedDocs, ...generatedSidebars]) {
    checkedFiles += 1;

    const originalContent = fs.readFileSync(filePath, 'utf8');
    const normalizedContent = generatedSidebarPattern.test(filePath)
      ? normalizeGeneratedSidebar(filePath, validDocIds)
      : normalizeGeneratedLabels(originalContent);
    const updatedContent = generatedApiDocPattern.test(filePath)
      ? upsertDisplayedSidebar(
          normalizedContent,
          getDisplayedSidebarId(filePath),
        )
      : normalizedContent;

    if (updatedContent !== originalContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      updatedFiles += 1;
    }
  }
}

console.log(
  `[api-sidebars] Checked ${checkedFiles} generated API docs and updated ${updatedFiles} files`,
);
