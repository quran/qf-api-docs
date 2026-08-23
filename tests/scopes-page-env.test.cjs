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

test("analytics event ingestion documents client credentials and optional user correlation", () => {
  for (const scopes of [productionScopes, preliveScopes]) {
    assert.match(
      scopes,
      /\|\s*analytics\.events\.write\s*\|[^\n]*`client_credentials`[^\n]*optionally include a QF user ID for analytics correlation[^\n]*\|/,
    );
    assert.doesNotMatch(
      scopes,
      /\|\s*analytics\.events\.write\s*\|[^\n]*non-user-related[^\n]*\|/,
    );
  }
});
