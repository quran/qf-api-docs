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

test("request access page submits uri arrays with callbackUrl compatibility", () => {
  const page = read("src", "pages", "request-access.js");

  assert.match(
    page,
    /if \(redirectUris\.length\) \{[\s\S]*payload\.callbackUrl = redirectUris\[0\];[\s\S]*payload\.redirect_uris = redirectUris;[\s\S]*\}/
  );
  assert.match(
    page,
    /if \(postLogoutRedirectUris\.length\) \{[\s\S]*payload\.post_logout_redirect_uris = postLogoutRedirectUris;[\s\S]*\}/
  );
  assert.doesNotMatch(page, /redirect_uris: redirectUris/);
  assert.doesNotMatch(page, /post_logout_redirect_uris: postLogoutRedirectUris/);
});

test("request access page cleans single pasted uri rows", () => {
  const page = read("src", "pages", "request-access.js");

  assert.match(page, /pastedValues\.length === 1/);
  assert.match(page, /setValue\(`\$\{fieldName\}\.\$\{index\}\.value`, pastedValues\[0\]/);
});

test("request access page uses clearer add uri button copy", () => {
  const page = read("src", "pages", "request-access.js");
  const styles = read("src", "pages", "request-access.module.css");

  assert.match(page, /Add another redirect URI/);
  assert.match(page, /Add another post-logout URI/);
  assert.match(page, /uriHelpText/);
  assert.match(styles, /\.uriHelpText/);
});

test("request access page uses fieldset legends for uri groups", () => {
  const page = read("src", "pages", "request-access.js");
  const styles = read("src", "pages", "request-access.module.css");

  assert.match(
    page,
    /<fieldset className=\{clsx\('margin-bottom--md', styles\.uriFieldset\)\}>[\s\S]*<legend className=\{clsx\('form-label', styles\.uriLegend\)\}>[\s\S]*Redirect URIs/
  );
  assert.match(
    page,
    /<fieldset className=\{clsx\('margin-bottom--md', styles\.uriFieldset\)\}>[\s\S]*<legend className=\{clsx\('form-label', styles\.uriLegend\)\}>[\s\S]*Post-logout Redirect URIs/
  );
  assert.doesNotMatch(page, /<label className="form-label">Redirect URIs<\/label>/);
  assert.doesNotMatch(
    page,
    /<label className="form-label">Post-logout Redirect URIs<\/label>/
  );
  assert.match(styles, /\.uriFieldset/);
  assert.match(styles, /\.uriLegend/);
});

test("client setup docs point to request access form without manual request text", () => {
  const doc = read("docs", "tutorials", "oidc", "client-setup.mdx");

  assert.match(doc, /What The Request Access Form Asks For/);
  assert.match(doc, /Use \[Request Access\]\(\/request-access\) to submit these details/);
  assert.match(doc, /add each URL in its own row/);
  assert.doesNotMatch(doc, /Please provision our Quran Foundation OAuth2 client/);
});
