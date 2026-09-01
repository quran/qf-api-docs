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
  'docs/analytics_apis_versioned',
].map((dir) => path.join(siteDir, dir));

const versionDirPattern = /^\d+\.\d+\.\d+$/;
const generatedApiDocPattern = /\.(api|info|tag)\.mdx$/;
const generatedSidebarPattern = /(?:^|[\\/])sidebar\.js$/;
const rubElHizbLabelOverrides = new Map([
  ['verses-by-rub-el-hizb-number', 'By Rub el Hizb number'],
  [
    'verses-by-rub-el-hizb-number-rub-el-hizb',
    'By Rub el Hizb number (alias: /by_rub_el_hizb)',
  ],
  [
    'list-rub-el-hizb-translations',
    'Get translations for specific Rub el Hizb',
  ],
  [
    'list-rub-el-hizb-translations-rub',
    'Get translations for specific Rub el Hizb (alias: /by_rub)',
  ],
  ['list-rub-el-hizb-tafsirs', 'Get tafsirs for specific Rub el Hizb'],
  [
    'list-rub-el-hizb-tafsirs-rub',
    'Get tafsirs for specific Rub el Hizb (alias: /by_rub)',
  ],
]);

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

function normalizeGeneratedLabels(content, filePath = '') {
  const shouldNormalizeDetailsCollapseAttribute =
    /[\\/]resources-(sync|snapshot)\.api\.mdx$/.test(filePath);

  const normalizedContent = shouldNormalizeDetailsCollapseAttribute
    ? content.replace(/data-collaposed=/g, 'data-collapsed=')
    : content;

  return normalizedContent
    .replace(/Foot Note/g, 'Footnote')
    .replace(/foot note/g, 'footnote');
}

function getDocSlugFromId(docId) {
  return String(docId).split('/').pop();
}

function getDocSlugFromPath(filePath) {
  return path.basename(filePath).replace(/\.(api|info|tag)\.mdx$/, '');
}

function normalizeRubElHizbDocLabels(filePath, content) {
  const label = rubElHizbLabelOverrides.get(getDocSlugFromPath(filePath));

  if (!label) {
    return content;
  }

  return content
    .replace(/^title:\s*"[^"]*"\s*$/m, `title: "${label}"`)
    .replace(/^sidebar_label:\s*"[^"]*"\s*$/m, `sidebar_label: "${label}"`)
    .replace(/^## .+$/m, `## ${label}`)
    .replace(/("postman":\{"name":)"[^"]+"/, (_match, prefix) => {
      return `${prefix}${JSON.stringify(label)}`;
    });
}

function normalizeRubElHizbSidebarLabels(items) {
  return items.map((item) => {
    if (!item || typeof item !== 'object') {
      return item;
    }

    const normalizedItem = { ...item };

    if (normalizedItem.type === 'doc') {
      const label = rubElHizbLabelOverrides.get(getDocSlugFromId(normalizedItem.id));

      if (label) {
        normalizedItem.label = label;
      }
    }

    if (Array.isArray(normalizedItem.items)) {
      normalizedItem.items = normalizeRubElHizbSidebarLabels(normalizedItem.items);
    }

    return normalizedItem;
  });
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

function hasUsableSidebarLink(item, validDocIds) {
  if (!item.link || typeof item.link !== 'object') {
    return false;
  }

  if (item.link.type !== 'doc') {
    return true;
  }

  return validDocIds.has(item.link.id);
}

function slugifySidebarLabel(value) {
  return String(value)
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findFirstDocId(items) {
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    if (item.type === 'doc' && typeof item.id === 'string') {
      return item.id;
    }

    if (item.type === 'category' && Array.isArray(item.items)) {
      const nestedDocId = findFirstDocId(item.items);

      if (nestedDocId) {
        return nestedDocId;
      }
    }
  }

  return null;
}

function inferCategoryTagLink(item, tagDocIds) {
  if (
    item.link ||
    typeof item.label !== 'string' ||
    !Array.isArray(item.items)
  ) {
    return null;
  }

  const firstDocId = findFirstDocId(item.items);

  if (!firstDocId || !firstDocId.includes('/')) {
    return null;
  }

  const docPrefix = firstDocId.split('/').slice(0, -1).join('/');
  const candidateId = `${docPrefix}/${slugifySidebarLabel(item.label)}`;

  return tagDocIds.has(candidateId)
    ? {
        type: 'doc',
        id: candidateId,
      }
    : null;
}

function filterMissingSidebarItems(items, validDocIds, tagDocIds = new Set()) {
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
      const inferredLink = inferCategoryTagLink(item, tagDocIds);
      const linkedItem = inferredLink ? { ...item, link: inferredLink } : item;
      const filteredItems = filterMissingSidebarItems(
        linkedItem.items,
        validDocIds,
        tagDocIds,
      );
      const hasUsableLink = hasUsableSidebarLink(linkedItem, validDocIds);

      if (!hasUsableLink && filteredItems.length === 0) {
        return accumulator;
      }

      const normalizedItem = {
        ...linkedItem,
        items: filteredItems,
      };

      if (linkedItem.link && !hasUsableLink) {
        delete normalizedItem.link;
      }

      accumulator.push(normalizedItem);
      return accumulator;
    }

    accumulator.push(item);
    return accumulator;
  }, []);
}

function categoryOwnsDoc(items, docId) {
  return items.some((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    if (
      item.type === 'category' &&
      item.link?.type === 'doc' &&
      item.link.id === docId
    ) {
      return true;
    }

    return Array.isArray(item.items) && categoryOwnsDoc(item.items, docId);
  });
}

function ensureTagSidebarCategories(items, tagCategories) {
  const missingCategories = tagCategories
    .filter(({ id }) => !categoryOwnsDoc(items, id))
    .map(({ id, label, items: categoryItems }) => ({
      type: 'category',
      label,
      link: {
        type: 'doc',
        id,
      },
      items: categoryItems,
    }));

  return [...items, ...missingCategories];
}

function getFrontMatterString(content, fieldName) {
  const match = content.match(new RegExp(`^${fieldName}:\\s*(.+)\\r?$`, 'm'));

  if (!match) {
    return null;
  }

  const value = match[1].trim();

  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
}

function getGeneratedApiMetadata(filePath, content) {
  const apiMatch = content.match(/^api:\s*(\{.+\})\r?$/m);

  if (!apiMatch) {
    return null;
  }

  try {
    const api = JSON.parse(apiMatch[1]);
    return {
      docId: getDocId(filePath),
      label:
        getFrontMatterString(content, 'sidebar_label') ||
        getFrontMatterString(content, 'title') ||
        getDocSlugFromPath(filePath),
      method: api.method,
      tags: Array.isArray(api.tags) ? api.tags : [],
    };
  } catch (_error) {
    return null;
  }
}

function getDocIdPrefix(docId) {
  return docId.split('/').slice(0, -1).join('/');
}

function buildTagSidebarCategories(generatedDocs, sidebarDocIdPrefix) {
  const categoriesByLabel = new Map();
  const operations = [];

  for (const filePath of generatedDocs) {
    const docId = getDocId(filePath);

    if (getDocIdPrefix(docId) !== sidebarDocIdPrefix) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    if (/\.tag\.mdx$/.test(filePath)) {
      const label = getFrontMatterString(content, 'title');

      if (label) {
        categoriesByLabel.set(label, { id: docId, label, items: [] });
      }
      continue;
    }

    const metadata = getGeneratedApiMetadata(filePath, content);

    if (metadata) {
      operations.push(metadata);
    }
  }

  for (const operation of operations) {
    for (const tag of operation.tags) {
      const category = categoriesByLabel.get(tag);

      if (!category) {
        continue;
      }

      category.items.push({
        type: 'doc',
        id: operation.docId,
        label: operation.label,
        ...(operation.method ? { className: `api-method ${operation.method}` } : {}),
      });
    }
  }

  return [...categoriesByLabel.values()].filter(({ items }) => items.length > 0);
}

function getSidebarDocIdPrefix(filePath) {
  return path
    .relative(path.join(siteDir, 'docs'), path.dirname(filePath))
    .split(path.sep)
    .join('/');
}

function normalizeGeneratedSidebar(
  filePath,
  validDocIds,
  tagDocIds,
  tagCategories,
) {
  delete require.cache[require.resolve(filePath)];
  const sidebarItems = require(filePath);
  const filteredSidebarItems = filterMissingSidebarItems(
    sidebarItems,
    validDocIds,
    tagDocIds,
  );
  const completeSidebarItems = ensureTagSidebarCategories(
    filteredSidebarItems,
    tagCategories,
  );
  const dedupedSidebarItems = dedupeSidebarItems(completeSidebarItems);
  const normalizedSidebarItems = normalizeRubElHizbSidebarLabels(dedupedSidebarItems);
  const serializedSidebar = `module.exports = ${JSON.stringify(normalizedSidebarItems)};`;

  return normalizeGeneratedLabels(serializedSidebar);
}

function main() {
  let updatedFiles = 0;
  let checkedFiles = 0;
  const validDocIds = new Set();
  const tagDocIds = new Set();

  for (const docsDir of docsDirs) {
    if (!fs.existsSync(docsDir)) {
      continue;
    }

    for (const filePath of walk(docsDir)) {
      const docId = getDocId(filePath);

      validDocIds.add(docId);

      if (/\.tag\.mdx$/.test(filePath)) {
        tagDocIds.add(docId);
      }
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
        ? normalizeGeneratedSidebar(
            filePath,
            validDocIds,
            tagDocIds,
            buildTagSidebarCategories(
              generatedDocs,
              getSidebarDocIdPrefix(filePath),
            ),
          )
        : normalizeRubElHizbDocLabels(
            filePath,
            normalizeGeneratedLabels(originalContent, filePath),
          );
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
}

if (require.main === module) {
  main();
}

module.exports = {
  ensureTagSidebarCategories,
  filterMissingSidebarItems,
  getDisplayedSidebarId,
  hasUsableSidebarLink,
  inferCategoryTagLink,
  normalizeRubElHizbDocLabels,
  normalizeRubElHizbSidebarLabels,
  main,
};
