const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { generateLlmsTxt } = require(path.join(
  __dirname,
  "..",
  "plugins",
  "llms-txt-plugin.js",
));
const sidebars = require(path.join(__dirname, "..", "sidebars.js"));

test("publishes latest and versioned analytics category routes", () => {
  assert.ok(sidebars["analytics-apis"]);
  assert.ok(sidebars["analytics-apis-1.0.0"]);
});

test("llms.txt advertises analytics OpenAPI and canonical versioned docs", () => {
  const docsDir = path.join(__dirname, "..", "docs");
  const { content } = generateLlmsTxt(docsDir);

  assert.match(
    content,
    /\[Analytics Events API\]\(https:\/\/api-docs\.quran\.foundation\/openAPI\/analytics\/v1\.json\)/,
  );
  assert.match(content, /## Analytics APIs v1/);
  assert.match(
    content,
    /https:\/\/api-docs\.quran\.foundation\/docs\/analytics_apis_versioned\/1\.0\.0\/submit-analytics-events\//,
  );
  assert.doesNotMatch(
    content,
    /https:\/\/api-docs\.quran\.foundation\/docs\/analytics_apis_versioned\/submit-analytics-events\//,
  );
});
