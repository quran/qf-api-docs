const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  parsePastedUriValues,
  sanitizeFormValues,
} = require("../src/pages/request-access-utils.cjs");

const read = (...segments) =>
  fs.readFileSync(path.join(__dirname, "..", ...segments), "utf-8");

test("request access sanitizer migrates legacy callbackUrl session data", () => {
  const sanitized = sanitizeFormValues({
    appName: "Test App",
    email: "dev@example.com",
    callbackUrl: " https://app.example.com/callback ",
    postLogoutRedirectUris: " https://app.example.com/logout ",
    agreementsAccepted: true,
  });

  assert.equal(sanitized.callbackUrl, "https://app.example.com/callback");
  assert.deepEqual(sanitized.redirectUris, [
    { value: "https://app.example.com/callback" },
  ]);
  assert.deepEqual(sanitized.postLogoutRedirectUris, [
    { value: "https://app.example.com/logout" },
  ]);
  assert.equal(sanitized.agreementsAccepted, true);
});

test("request access sanitizer preserves new uri arrays and dedupes values", () => {
  const sanitized = sanitizeFormValues({
    redirectUris: [
      { value: "https://app.example.com/callback" },
      { value: "" },
      { value: "https://app.example.com/callback" },
      { value: "http://localhost:3000/callback" },
    ],
    post_logout_redirect_uris: [
      "https://app.example.com/logout",
      "https://app.example.com/logout",
      "http://localhost:3000/logout",
    ],
  });

  assert.equal(sanitized.callbackUrl, "https://app.example.com/callback");
  assert.deepEqual(sanitized.redirectUris, [
    { value: "https://app.example.com/callback" },
    { value: "http://localhost:3000/callback" },
  ]);
  assert.deepEqual(sanitized.postLogoutRedirectUris, [
    { value: "https://app.example.com/logout" },
    { value: "http://localhost:3000/logout" },
  ]);
});

test("request access sanitizer preserves commas inside single row uri values", () => {
  const sanitized = sanitizeFormValues({
    redirectUris: [
      { value: "https://app.example.com/callback?aud=mobile,web" },
    ],
    postLogoutRedirectUris: [
      { value: "https://app.example.com/logout?next=/one,/two" },
    ],
  });

  assert.equal(
    sanitized.callbackUrl,
    "https://app.example.com/callback?aud=mobile,web"
  );
  assert.deepEqual(sanitized.redirectUris, [
    { value: "https://app.example.com/callback?aud=mobile,web" },
  ]);
  assert.deepEqual(sanitized.postLogoutRedirectUris, [
    { value: "https://app.example.com/logout?next=/one,/two" },
  ]);
});

test("request access paste parser splits common multi-uri snippets", () => {
  assert.deepEqual(
    parsePastedUriValues(
      '"https://app.example.com/callback",\n"http://localhost:3000/callback"'
    ),
    ["https://app.example.com/callback", "http://localhost:3000/callback"]
  );

  assert.deepEqual(
    parsePastedUriValues(
      '"https://app.example.com/callback", "http://localhost:3000/callback"'
    ),
    ["https://app.example.com/callback", "http://localhost:3000/callback"]
  );

  assert.deepEqual(
    parsePastedUriValues(
      '["https://app.example.com/logout", "http://localhost:3000/logout"]'
    ),
    ["https://app.example.com/logout", "http://localhost:3000/logout"]
  );
});

test("request access paste parser preserves commas inside a single uri", () => {
  assert.deepEqual(
    parsePastedUriValues("https://app.example.com/callback?aud=mobile,web"),
    ["https://app.example.com/callback?aud=mobile,web"]
  );

  assert.deepEqual(
    parsePastedUriValues(
      '["https://app.example.com/callback?aud=mobile,web", "http://localhost:3000/callback"]'
    ),
    [
      "https://app.example.com/callback?aud=mobile,web",
      "http://localhost:3000/callback",
    ]
  );
});

test("request access page submits uri arrays with callbackUrl compatibility", () => {
  const page = read("src", "pages", "request-access.js");

  assert.match(page, /callbackUrl: redirectUris\[0\]/);
  assert.match(page, /redirect_uris: redirectUris/);
  assert.match(page, /post_logout_redirect_uris: postLogoutRedirectUris/);
});
