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
const formSelectComponent = read(
  "src",
  "theme",
  "ApiDemoPanel",
  "FormSelect",
  "index.tsx"
);
const sharedStyles = read("src", "theme", "ApiDemoPanel", "shared.module.css");
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

test("form select leaves the browser default selected option when no value is provided", () => {
  assert.match(formSelectComponent, /value=\{value\}/);
  assert.doesNotMatch(formSelectComponent, /normalizedOptions\[0\]\.value/);
});

test("array params sync from item changes without depending on param identity", () => {
  assert.match(paramOptionsComponent, /const paramRef = useRef\(param\)/);
  assert.match(paramOptionsComponent, /\}, \[dispatch, items\]\);/);
});

test("server panel renders variables from the selected server state", () => {
  assert.match(serverComponent, /const fallbackServer =/);
  assert.match(
    serverComponent,
    /value && fallbackServer && value\.url === fallbackServer\.url/
  );
});

test("disabled send action does not fall through to the request summary", () => {
  assert.match(executeComponent, /onClickCapture=\{handleActionClickCapture\}/);
  assert.match(executeComponent, /event\.stopPropagation\(\)/);
  assert.match(sharedStyles, /\.actionButton:disabled[\s\S]*pointer-events: auto;/);
});
