"use strict";

const fs = require("fs");
const path = require("path");

const siteDir = path.resolve(__dirname, "..");
const generatedRedirectsPath = path.join(
  siteDir,
  ".docusaurus",
  "generated-auth-api-redirects.json",
);
const docsDirs = [
  "docs/user_related_apis_prelive",
  "docs/user_related_apis_versioned",
].map((dir) => path.join(siteDir, dir));

function walk(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
      continue;
    }

    // The OpenAPI plugin prefixes user API aliases with auth- because the spec
    // servers use /auth; these generated aliases are the only files normalized.
    if (entry.isFile() && /^auth-.*\.api\.mdx$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

function getDocId(filePath) {
  return path
    .relative(siteDir, filePath)
    .split(path.sep)
    .join("/")
    .replace(/^docs\//, "")
    .replace(/\.(api|info|tag)\.mdx$/, "");
}

function getFrontMatterValue(content, key) {
  const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontMatterMatch) {
    return null;
  }

  const lineMatch = frontMatterMatch[1].match(
    new RegExp(`^${key}:\\s*(?:"([^"]+)"|'([^']+)'|(.+))\\s*$`, "m"),
  );

  if (!lineMatch) {
    return null;
  }

  return lineMatch[1] || lineMatch[2] || lineMatch[3].trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getLegacySlug(content) {
  const title =
    getFrontMatterValue(content, "title") ||
    getFrontMatterValue(content, "sidebar_label");

  if (!title) {
    // Missing labels should fail the build instead of shipping duplicate auth-* URLs.
    throw new Error("Could not resolve title for generated auth API doc");
  }

  return slugify(title);
}

function replaceFrontMatterId(content, id) {
  return content.replace(/^id:\s*.*$/m, `id: ${id}`);
}

function docIdToDocsPath(docId) {
  return `/docs/${docId}/`;
}

function createRedirectsForReplacement(oldDocId, newDocId) {
  const oldPath = docIdToDocsPath(oldDocId);
  const newPath = docIdToDocsPath(newDocId);
  const oldPathWithoutSlash = oldPath.replace(/\/$/, "");

  return [
    { source: oldPathWithoutSlash, target: newPath },
    { source: oldPath, target: newPath },
  ];
}

function writeGeneratedRedirects(redirects) {
  fs.mkdirSync(path.dirname(generatedRedirectsPath), { recursive: true });
  fs.writeFileSync(
    generatedRedirectsPath,
    `${JSON.stringify(
      {
        generatedBy: "scripts/prune-generated-api-aliases.js",
        redirects,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function rewriteSidebarDocIds(replacements) {
  const sidebarFiles = [];

  for (const docsDir of docsDirs) {
    if (!fs.existsSync(docsDir)) {
      continue;
    }

    for (const filePath of walkAllFiles(docsDir)) {
      if (path.basename(filePath) === "sidebar.js") {
        sidebarFiles.push(filePath);
      }
    }
  }

  for (const sidebarFile of sidebarFiles) {
    let content = fs.readFileSync(sidebarFile, "utf8");
    const originalContent = content;

    for (const [oldDocId, newDocId] of replacements) {
      content = content.split(oldDocId).join(newDocId);
    }

    if (content !== originalContent) {
      fs.writeFileSync(sidebarFile, content, "utf8");
    }
  }
}

function walkAllFiles(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkAllFiles(fullPath));
      continue;
    }

    if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

// Generated tag pages that would claim the same URL as a hand-written guide.
// The App State guide (app-state/index.mdx) is published at .../app-state/, which
// is also where the plugin writes the generated "App State" tag page. Rename the
// tag page so the guide keeps its URL, and relabel its sidebar category so the
// two "App State" entries can be told apart.
const SHADOWED_TAG_DOCS = [
  {
    guideDir: "app-state",
    tagSlug: "app-state",
    renamedSlug: "app-state-api-reference",
    renamedLabel: "App State API reference",
  },
];

function readSidebarItems(sidebarFile) {
  const content = fs.readFileSync(sidebarFile, "utf8");
  const match = content.match(/^module\.exports\s*=\s*([\s\S]*?);?\s*$/);

  if (!match) {
    throw new Error(`Unexpected generated sidebar format: ${sidebarFile}`);
  }

  return JSON.parse(match[1]);
}

function renameShadowedTagDocs() {
  let renamed = 0;

  for (const docsDir of docsDirs) {
    if (!fs.existsSync(docsDir)) {
      continue;
    }

    for (const { guideDir, tagSlug, renamedSlug, renamedLabel } of SHADOWED_TAG_DOCS) {
      if (!fs.existsSync(path.join(docsDir, guideDir, "index.mdx"))) {
        continue;
      }

      for (const filePath of walkAllFiles(docsDir)) {
        if (path.basename(filePath) !== `${tagSlug}.tag.mdx`) {
          continue;
        }

        const targetPath = path.join(path.dirname(filePath), `${renamedSlug}.tag.mdx`);
        const oldDocId = getDocId(filePath);
        const newDocId = getDocId(targetPath);
        const content = fs.readFileSync(filePath, "utf8");

        fs.writeFileSync(targetPath, replaceFrontMatterId(content, renamedSlug), "utf8");
        fs.unlinkSync(filePath);

        const sidebarFile = path.join(path.dirname(filePath), "sidebar.js");
        if (fs.existsSync(sidebarFile)) {
          const items = readSidebarItems(sidebarFile);
          for (const item of items) {
            if (item?.type === "category" && item.link?.id === oldDocId) {
              item.link.id = newDocId;
              item.label = renamedLabel;
            }
          }
          fs.writeFileSync(sidebarFile, `module.exports = ${JSON.stringify(items)};\n`, "utf8");
        }

        renamed += 1;
      }
    }
  }

  return renamed;
}

function main() {
  const renamedTagDocs = renameShadowedTagDocs();
  let normalized = 0;
  const replacements = [];
  const redirects = [];
  const claimedTargetPaths = new Map();

  for (const docsDir of docsDirs) {
    if (!fs.existsSync(docsDir)) {
      continue;
    }

    for (const filePath of walk(docsDir)) {
      const resolvedPath = path.resolve(filePath);

      if (!resolvedPath.startsWith(docsDir + path.sep)) {
        throw new Error(`Refusing to delete path outside docs dir: ${resolvedPath}`);
      }

      const content = fs.readFileSync(resolvedPath, "utf8");
      const legacySlug = getLegacySlug(content);
      const targetPath = path.join(path.dirname(resolvedPath), `${legacySlug}.api.mdx`);
      const normalizedContent = replaceFrontMatterId(content, legacySlug);
      const oldDocId = getDocId(resolvedPath);
      const newDocId = getDocId(targetPath);
      const normalizedTargetPath = path.resolve(targetPath);
      const claimedBy = claimedTargetPaths.get(normalizedTargetPath);

      if (claimedBy) {
        throw new Error(
          `Generated auth API docs collide on ${normalizedTargetPath}: ${claimedBy} and ${resolvedPath}`,
        );
      }

      claimedTargetPaths.set(normalizedTargetPath, resolvedPath);

      fs.writeFileSync(targetPath, normalizedContent, "utf8");
      fs.unlinkSync(resolvedPath);
      replacements.push([oldDocId, newDocId]);
      redirects.push(...createRedirectsForReplacement(oldDocId, newDocId));
      normalized += 1;
    }
  }

  rewriteSidebarDocIds(replacements);
  writeGeneratedRedirects(redirects);

  console.log(
    `[api-cleanup] Normalized ${normalized} generated auth API docs and recorded ${redirects.length} redirects`,
  );
  console.log(`[api-cleanup] Renamed ${renamedTagDocs} generated tag pages shadowed by guides`);
}

if (require.main === module) {
  main();
}

module.exports = {
  createRedirectsForReplacement,
  getLegacySlug,
  slugify,
};
