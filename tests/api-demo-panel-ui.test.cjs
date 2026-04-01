const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (...segments) =>
  fs.readFileSync(path.join(__dirname, "..", ...segments), "utf-8");

const requestComponent = read("src", "theme", "ApiDemoPanel", "Request", "index.tsx");
const serverComponent = read("src", "theme", "ApiDemoPanel", "Server", "index.tsx");
const authorizationComponent = read(
  "src",
  "theme",
  "ApiDemoPanel",
  "Authorization",
  "index.tsx"
);
const paramOptionsComponent = read(
  "src",
  "theme",
  "ApiDemoPanel",
  "ParamOptions",
  "index.tsx"
);
const executeComponent = read(
  "src",
  "theme",
  "ApiDemoPanel",
  "Execute",
  "index.tsx"
);
const securitySchemesComponent = read(
  "src",
  "theme",
  "ApiDemoPanel",
  "SecuritySchemes",
  "index.tsx"
);
const utilsModule = read("src", "theme", "ApiDemoPanel", "utils.ts");

test("shared demo-panel overrides exist", () => {
  assert.match(requestComponent, /@theme\/ApiDemoPanel\/Server/);
  assert.match(
    authorizationComponent,
    /Header names stay[\s\S]*visible as helper text/
  );
  assert.match(securitySchemesComponent, /Authentication Details/);
});

test("request panel includes the refreshed section headings", () => {
  assert.match(serverComponent, /Environment/);
  assert.match(authorizationComponent, /Authorization/);
  assert.match(paramOptionsComponent, /Required Parameters/);
  assert.match(paramOptionsComponent, /Optional Parameters/);
});

test("auth label mapping prefers human-readable names", () => {
  assert.match(utilsModule, /"x-auth-token": "Access Token"/);
  assert.match(utilsModule, /"x-client-id": "Client ID"/);
});

test("execute override keeps the primary request action", () => {
  assert.match(executeComponent, /Send API Request/);
  assert.match(executeComponent, /Complete required inputs to send the request/);
});
