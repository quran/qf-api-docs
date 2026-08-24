const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  applyDynamicRequestBodyExamples,
  applyDynamicRequestValues,
  getCurrentTimestampFieldNames,
} = require(path.join(
  __dirname,
  "..",
  "src",
  "theme",
  "ApiDemoPanel",
  "Request",
  "dynamic-request-values.js",
));

test("reads current timestamp fields from the OpenAPI operation extension", () => {
  assert.deepEqual(
    getCurrentTimestampFieldNames([
      { key: "x-code-samples", value: [] },
      {
        key: "x-qf-live-request-current-timestamp-fields",
        value: ["occurred_at"],
      },
    ]),
    ["occurred_at"],
  );
  assert.deepEqual(getCurrentTimestampFieldNames(undefined), []);
});

test("refreshes marked fields recursively without mutating OpenAPI examples", () => {
  const example = {
    events: [
      { occurred_at: "2026-08-22T07:12:15Z", nested: { label: "kept" } },
      { occurred_at: "2026-08-22T07:12:18Z" },
    ],
  };
  const now = "2027-09-01T12:00:00.000Z";

  const refreshed = applyDynamicRequestValues(example, ["occurred_at"], now);

  assert.deepEqual(refreshed, {
    events: [
      { occurred_at: now, nested: { label: "kept" } },
      { occurred_at: now },
    ],
  });
  assert.equal(example.events[0].occurred_at, "2026-08-22T07:12:15Z");
});

test("refreshes request examples without changing the request schema", () => {
  const requestBody = {
    content: {
      "application/json": {
        schema: {
          properties: {
            occurred_at: { type: "string", format: "date-time" },
          },
        },
        example: { occurred_at: "2026-08-22T07:12:15Z" },
        examples: {
          Batch: {
            summary: "Batch example",
            value: { events: [{ occurred_at: "2026-08-22T07:12:18Z" }] },
          },
        },
      },
    },
  };
  const now = "2027-09-01T12:00:00.000Z";

  const refreshed = applyDynamicRequestBodyExamples(
    requestBody,
    ["occurred_at"],
    now,
  );

  assert.deepEqual(
    refreshed.content["application/json"].schema,
    requestBody.content["application/json"].schema,
  );
  assert.equal(
    refreshed.content["application/json"].schema.properties.occurred_at.type,
    "string",
  );
  assert.equal(refreshed.content["application/json"].example.occurred_at, now);
  assert.equal(
    refreshed.content["application/json"].examples.Batch.value.events[0]
      .occurred_at,
    now,
  );
  assert.equal(
    requestBody.content["application/json"].examples.Batch.value.events[0]
      .occurred_at,
    "2026-08-22T07:12:18Z",
  );
});
