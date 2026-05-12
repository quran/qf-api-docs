const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (...segments) =>
  fs.readFileSync(path.join(__dirname, "..", ...segments), "utf-8");

const productionScopes = read(
  "docs",
  "user_related_apis_versioned",
  "scopes.mdx",
);
const preliveScopes = read("docs", "user_related_apis_prelive", "scopes.mdx");

test("sync scope is documented only for the pre-live scopes page", () => {
  assert.doesNotMatch(productionScopes, /\|\s*sync\s*\|/);
  assert.match(
    preliveScopes,
    /\|\s*sync\s*\|\s*Access pre-live offline-first sync endpoints\s*\|/,
  );
});
