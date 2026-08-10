const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (...segments) =>
  fs.readFileSync(path.join(__dirname, "..", ...segments), "utf-8");

test("request access page hands new developers to the Developer Console", () => {
  const page = read("src", "pages", "request-access.js");

  assert.match(page, /Get API access/);
  assert.match(page, /Create an API app/);
  assert.match(
    page,
    /https:\/\/dev-console\.quran\.foundation\/projects\/new/
  );
  assert.match(
    page,
    /https:\/\/dev-console\.quran\.foundation\/projects/
  );
  assert.match(page, /Build in prelive/);
  assert.match(page, /Request production permissions/);
  assert.match(page, /Already have an app\?/);
  assert.match(page, /Open your apps/);
});

test("request access page routes existing clients to the Console import flow", () => {
  const page = read("src", "pages", "request-access.js");

  assert.match(page, /Already have an existing client\?/);
  assert.match(page, /https:\/\/dev-console\.quran\.foundation\/claims/);
  assert.match(page, /Import existing client/);
  assert.match(page, /Request still pending\?/);
  assert.match(page, /No action is needed/);
  assert.doesNotMatch(page, /Contact developer support/);
});

test("request access page no longer contains the legacy application form", () => {
  const page = read("src", "pages", "request-access.js");

  assert.doesNotMatch(page, /react-hook-form/);
  assert.doesNotMatch(page, /qf:request-access-form/);
  assert.doesNotMatch(page, /api\/v1\/webhook/);
  assert.doesNotMatch(page, /<form/);
});

test("navbar keeps the prominent request-access entry point", () => {
  const config = read("docusaurus.config.js");

  assert.match(
    config,
    /to: "\/request-access"[\s\S]*label: "Request Access"/
  );
  assert.doesNotMatch(
    config,
    /href: "https:\/\/dev-console\.quran\.foundation\/projects"[\s\S]*label: "Developer Console"/
  );
});

test("homepage explains Developer Console and links new apps there directly", () => {
  const homepage = read("src", "pages", "index.tsx");
  const journey = read("src", "components", "DeveloperJourneyMap", "index.tsx");

  assert.match(homepage, /Create your app in Developer Console/);
  assert.match(journey, /Create your app in Developer Console first/);
  assert.match(journey, /Create your API app/);
  assert.match(journey, /Create app in Developer Console/);
  assert.match(
    journey,
    /https:\/\/dev-console\.quran\.foundation\/projects\/new/
  );
  assert.doesNotMatch(journey, /to="\/request-access"/);
});
