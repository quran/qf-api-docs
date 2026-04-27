"use strict";

const fs = require("fs");
const path = require("path");

const siteDir = path.resolve(__dirname, "..");
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
    throw new Error("Could not resolve title for generated auth API doc");
  }

  return slugify(title);
}

function replaceFrontMatterId(content, id) {
  return content.replace(/^id:\s*.*$/m, `id: ${id}`);
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

let normalized = 0;
const replacements = [];
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
    normalized += 1;
  }
}

rewriteSidebarDocIds(replacements);

console.log(`[api-cleanup] Normalized ${normalized} generated auth API docs`);
