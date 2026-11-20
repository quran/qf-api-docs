const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (...segments) =>
  fs.readFileSync(path.join(__dirname, "..", ...segments), "utf-8");

test("request access page hands new developers to the Developer Console", () => {
  const page = read("src", "pages", "request-access.js");

  assert.match(page, /Start building with Quran Foundation/);
  assert.match(page, /Create your app/);
  assert.match(
    page,
    /https:\/\/dev-console\.quran\.foundation\/projects\/new/
  );
  assert.match(
    page,
    /https:\/\/dev-console\.quran\.foundation\/projects/
  );
  assert.match(page, /pre-live, our testing environment/);
  assert.match(page, /Request production access/);
  assert.match(page, /Already have an app\?/);
  assert.match(page, /Open Developer Console/);
});

test("request access page presents the five-step connected-app journey", () => {
  const page = read("src", "pages", "request-access.js");

  for (const step of [
    "Create your app",
    "Build and test",
    "Connect Quran ID",
    "Request production access",
    "Submit to the Quran App Store",
  ]) {
    assert.match(page, new RegExp(`title: '${step}'`));
  }

  assert.match(page, /Building a content-only app\?/);
  assert.match(page, /Aim for Transformational/);
  assert.match(page, /to="\/docs\/connected-apps\/"/);
  assert.match(page, /mailto:developers@quran\.com/);
});

test("request access page routes existing clients to the Console import flow", () => {
  const page = read("src", "pages", "request-access.js");

  assert.match(page, /Already have API credentials\?/);
  assert.match(page, /https:\/\/dev-console\.quran\.foundation\/claims/);
  assert.match(page, /Request still pending\?/);
  assert.match(page, /No action is needed/);
  assert.match(
    page,
    /Import an existing client\s*<span aria-hidden="true">↗<\/span>/
  );
  assert.doesNotMatch(page, /Contact developer support/);
});

test("request access page no longer contains the legacy application form", () => {
  const page = read("src", "pages", "request-access.js");

  assert.doesNotMatch(page, /react-hook-form/);
  assert.doesNotMatch(page, /qf:request-access-form/);
  assert.doesNotMatch(page, /api\/v1\/webhook/);
  assert.doesNotMatch(page, /<form/);
});

test("navbar sends new developers straight to app creation in Developer Console", () => {
  const config = read("docusaurus.config.js");

  assert.match(
    config,
    /href: "https:\/\/dev-console\.quran\.foundation\/projects\/new",\s*label: "Create your app"/
  );
  assert.doesNotMatch(config, /label: "Request Access"/);
});

test("homepage leads with Developer Console and separates capabilities from build choices", () => {
  const homepage = read("src", "pages", "index.tsx");
  const journey = read("src", "components", "DeveloperJourneyMap", "index.tsx");
  const starterCard = read("src", "components", "StarterCommandCard", "index.tsx");

  assert.match(homepage, /Build with trusted content\. Keep users connected\./);
  assert.match(homepage, /Quran Foundation Developer Docs/);
  assert.match(homepage, /Create your app/);
  assert.match(
    homepage,
    /https:\/\/dev-console\.quran\.foundation\/projects\/new/
  );
  assert.match(homepage, /Choose how to build/);
  assert.match(homepage, /Build your connected Quran experience/);
  assert.match(homepage, /Need help with your integration\?/);
  assert.doesNotMatch(homepage, /Documentation Portal/);
  assert.match(journey, /Create app in Developer Console/);
  assert.match(
    journey,
    /https:\/\/dev-console\.quran\.foundation\/projects\/new/
  );
  assert.doesNotMatch(journey, /to="\/request-access"/);
  assert.match(starterCard, /Start with a working Next\.js app/);
  assert.match(starterCard, /Backend\/server app/);
  assert.match(starterCard, /needs separate\s+pre-live permission/);
  assert.doesNotMatch(starterCard, /~5 min/);
  assert.match(
    starterCard,
    /className=\{styles\.prerequisite\}[\s\S]*className=\{styles\.commandRow\}/
  );
});
