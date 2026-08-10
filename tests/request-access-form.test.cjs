const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  createDefaultFormValues,
  parsePastedUriValues,
  sanitizeFormValues,
} = require("../src/pages/request-access-utils.cjs");

const read = (...segments) =>
  fs.readFileSync(path.join(__dirname, "..", ...segments), "utf-8");

test("request access defaults show three blank uri rows", () => {
  const defaults = createDefaultFormValues();

  assert.deepEqual(defaults.redirectUris, [
    { value: "" },
    { value: "" },
    { value: "" },
  ]);
  assert.deepEqual(defaults.postLogoutRedirectUris, [
    { value: "" },
    { value: "" },
    { value: "" },
  ]);
});

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
      "https://app.example.com/callback, https://admin.example.com/callback"
    ),
    ["https://app.example.com/callback", "https://admin.example.com/callback"]
  );

  assert.deepEqual(
    parsePastedUriValues(
      "https://app.example.com/callback,https://admin.example.com/callback"
    ),
    ["https://app.example.com/callback", "https://admin.example.com/callback"]
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
      "https://app.example.com/callback?return=https://one.example,https://two.example"
    ),
    [
      "https://app.example.com/callback?return=https://one.example,https://two.example",
    ]
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

test("client setup docs point to request access form without manual request text", () => {
  const doc = read("docs", "tutorials", "oidc", "client-setup.mdx");

  assert.match(doc, /What The Request Access Form Asks For/);
  assert.match(doc, /Use \[Request Access\]\(\/request-access\) to submit these details/);
  assert.match(doc, /add each URL in its own row/);
  assert.doesNotMatch(doc, /Please provision our Quran Foundation OAuth2 client/);
});
