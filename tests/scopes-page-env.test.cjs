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

test("sync scope is documented on the production and pre-live scopes pages", () => {
  assert.match(productionScopes, /^## Sync$/m);
  assert.match(productionScopes, /\|\s*sync\s*\|[^\n]*`GET\/POST \/v1\/sync`\s*\|/);
  assert.match(
    preliveScopes,
    /\|\s*sync\s*\|\s*Access offline-first sync endpoints\s*\|/,
  );
  for (const scopes of [productionScopes, preliveScopes]) {
    assert.doesNotMatch(scopes, /pre-live offline-first sync/);
  }
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

test("App State scopes explain full access and least-privilege OAuth requests", () => {
  for (const scopes of [productionScopes, preliveScopes]) {
    assert.match(
      scopes,
      /`app_state` grants both read and write access/,
    );
    assert.match(
      scopes,
      /request `app_state\.read`, `app_state\.write`, or both instead/,
    );
    assert.match(
      scopes,
      /Any App State scope can read the active data-group configuration from\s+`GET \/auth\/v1\/app-state:config`/,
    );
    assert.match(scopes, /does not return stored user values/);
    assert.match(scopes, /A user-delegated access token is required/);
    assert.match(scopes, /client-credentials\s+tokens cannot use this endpoint/);
  }
});
