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

let deleted = 0;

for (const docsDir of docsDirs) {
  if (!fs.existsSync(docsDir)) {
    continue;
  }

  for (const filePath of walk(docsDir)) {
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(docsDir + path.sep)) {
      throw new Error(`Refusing to delete path outside docs dir: ${resolvedPath}`);
    }

    fs.unlinkSync(resolvedPath);
    deleted += 1;
  }
}

console.log(`[api-cleanup] Deleted ${deleted} generated auth alias docs`);
