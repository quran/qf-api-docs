const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const shared = require(path.join(
  __dirname,
  "..",
  "src",
  "markdown-negotiation-shared.cjs",
));
const buildMarkdown = require(path.join(
  __dirname,
  "..",
  "src",
  "build-markdown.cjs",
));
const runtime = require(path.join(
  __dirname,
  "..",
  "src",
  "markdown-negotiation-runtime.cjs",
));

test("ranks supported representations from the Accept header", () => {
  assert.deepEqual(
    shared.rankRepresentationTypes(
      "text/markdown, text/html;q=0.8",
      [shared.HTML_MEDIA_TYPE, shared.MARKDOWN_MEDIA_TYPE],
      shared.HTML_MEDIA_TYPE,
    ),
    [shared.MARKDOWN_MEDIA_TYPE, shared.HTML_MEDIA_TYPE],
  );
  assert.deepEqual(
    shared.rankRepresentationTypes(
      "text/html, text/markdown;q=0.5",
      [shared.HTML_MEDIA_TYPE, shared.MARKDOWN_MEDIA_TYPE],
      shared.HTML_MEDIA_TYPE,
    ),
    [shared.HTML_MEDIA_TYPE, shared.MARKDOWN_MEDIA_TYPE],
  );
  assert.deepEqual(
    shared.rankRepresentationTypes(
      "text/*;q=0.7, text/html;q=0",
      [shared.HTML_MEDIA_TYPE, shared.MARKDOWN_MEDIA_TYPE],
      shared.HTML_MEDIA_TYPE,
    ),
    [shared.MARKDOWN_MEDIA_TYPE],
  );
  assert.deepEqual(
    shared.rankRepresentationTypes(
      "application/x-content-negotiation-probe",
      [shared.HTML_MEDIA_TYPE, shared.MARKDOWN_MEDIA_TYPE],
      shared.HTML_MEDIA_TYPE,
    ),
    [],
  );
  assert.deepEqual(
    shared.rankRepresentationTypes(
      undefined,
      [shared.HTML_MEDIA_TYPE, shared.MARKDOWN_MEDIA_TYPE],
      shared.HTML_MEDIA_TYPE,
    ),
    [shared.HTML_MEDIA_TYPE, shared.MARKDOWN_MEDIA_TYPE],
  );
});

test("maps routed pages to sibling markdown assets", () => {
  assert.equal(shared.toMarkdownAssetPath("/"), "/index.md");
  assert.equal(shared.toMarkdownAssetPath("/docs/quickstart/"), "/docs/quickstart/index.md");
  assert.equal(shared.toMarkdownAssetPath("/docs/quickstart"), "/docs/quickstart/index.md");
  assert.equal(shared.toMarkdownAssetPath("/404.html"), "/404.md");
  assert.equal(shared.toMarkdownAssetPath("/robots.txt"), null);
});

test("builds markdown from article content and preserves code blocks", () => {
  const markdown = buildMarkdown.buildMarkdownDocument({
    html: `<!doctype html>
      <html>
        <head>
          <title>Quickstart | Quran Foundation Documentation Portal</title>
          <meta name="description" content="First request walkthrough">
        </head>
        <body>
          <main>
            <p>This should be ignored because article wins.</p>
          </main>
          <article>
            <nav class="breadcrumbs">Ignore me</nav>
            <header><h1>Quickstart</h1></header>
            <p>Use <a href="/docs/reference/">the reference</a>.</p>
            <pre class="language-bash"><code>curl https://example.com\n</code></pre>
            <table>
              <thead><tr><th>Item</th><th>Value</th></tr></thead>
              <tbody><tr><td>Format</td><td>Markdown</td></tr></tbody>
            </table>
          </article>
        </body>
      </html>`,
    sourceUrl: "https://api-docs.quran.foundation/docs/quickstart/",
  });

  assert.match(markdown, /title: "Quickstart"/);
  assert.match(markdown, /source: "https:\/\/api-docs\.quran\.foundation\/docs\/quickstart\/"/);
  assert.match(markdown, /# Quickstart/);
  assert.match(
    markdown,
    /\[the reference\]\(https:\/\/api-docs\.quran\.foundation\/docs\/reference\/\)/,
  );
  assert.match(markdown, /```bash\ncurl https:\/\/example\.com\n```/);
  assert.match(markdown, /\| Item \| Value \|/);
  assert.doesNotMatch(markdown, /This should be ignored because article wins/);
  assert.doesNotMatch(markdown, /Ignore me/);
});

test("uses a longer inline fence when inline code contains repeated backticks", () => {
  const markdown = buildMarkdown.buildMarkdownDocument({
    html: [
      "<!doctype html>",
      "<html>",
      "  <body>",
      "    <article>",
      "      <p><code>a``b</code></p>",
      "    </article>",
      "  </body>",
      "</html>",
    ].join("\n"),
    sourceUrl: "https://api-docs.quran.foundation/docs/inline-code-example/",
  });

  assert.match(markdown, /```a``b```/);
});

test("uses a longer outer fence when code blocks contain triple backticks", () => {
  const markdown = buildMarkdown.buildMarkdownDocument({
    html: [
      "<!doctype html>",
      "<html>",
      "  <body>",
      "    <article>",
      "      <h1>Markdown Example</h1>",
      "      <pre><code>```md",
      "# Nested fence",
      "```</code></pre>",
      "    </article>",
      "  </body>",
      "</html>",
    ].join("\n"),
    sourceUrl: "https://api-docs.quran.foundation/docs/markdown-example/",
  });

  assert.match(markdown, /````\n```md\n# Nested fence\n```\n````/);
});

test("exports markdown siblings next to generated html files", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "qf-markdown-"));
  const docsDir = path.join(tempDir, "docs", "quickstart");
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(
    path.join(docsDir, "index.html"),
    `<!doctype html><html><head><title>Quickstart | Quran Foundation Documentation Portal</title></head><body><article><h1>Quickstart</h1><p>Hello world.</p></article></body></html>`,
    "utf8",
  );

  const exportedCount = buildMarkdown.exportMarkdownFiles(tempDir);
  const markdownPath = path.join(docsDir, "index.md");

  assert.equal(exportedCount, 1);
  assert.equal(fs.existsSync(markdownPath), true);
  assert.match(fs.readFileSync(markdownPath, "utf8"), /# Quickstart/);
});

test("serves markdown with the negotiated content type while preserving HTML by default", async () => {
  const request = new Request("https://api-docs.quran.foundation/docs/quickstart/", {
    headers: {
      Accept: "text/markdown, text/html;q=0.8",
    },
  });
  const htmlResponse = new Response("<html><body><h1>Quickstart</h1></body></html>", {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  const response = await runtime.negotiateMarkdownResponse({
    assetsFetch: async (assetRequest) => {
      assert.equal(assetRequest.url, "https://api-docs.quran.foundation/docs/quickstart/index.md");
      return new Response("# Quickstart\n", {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
          "Content-Type": "text/plain; charset=utf-8",
          "x-markdown-tokens": "42",
        },
      });
    },
    request,
    response: htmlResponse,
  });

  assert.equal(response.headers.get("Content-Type"), shared.MARKDOWN_CONTENT_TYPE);
  assert.match(response.headers.get("Vary"), /Accept/);
  assert.equal(response.headers.get("x-markdown-tokens"), "42");
  assert.equal(await response.text(), "# Quickstart\n");
});

test("keeps direct .md requests as HTML when the response is an HTML error page", async () => {
  const request = new Request("https://api-docs.quran.foundation/docs/missing/index.md");
  const html404 = new Response("<html><body><h1>Not Found</h1></body></html>", {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  const response = await runtime.negotiateMarkdownResponse({
    assetsFetch: async () => {
      throw new Error("assets fetch should not run for direct .md requests");
    },
    request,
    response: html404,
  });

  assert.equal(response.status, 404);
  assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
  assert.equal(
    await response.text(),
    "<html><body><h1>Not Found</h1></body></html>",
  );
});

test("keeps HTML as the default response for non-markdown clients", async () => {
  const request = new Request("https://api-docs.quran.foundation/docs/quickstart/");
  const htmlResponse = new Response("<html><body><h1>Quickstart</h1></body></html>", {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  const response = await runtime.negotiateMarkdownResponse({
    assetsFetch: async () => {
      throw new Error("assets fetch should not run for default HTML requests");
    },
    request,
    response: htmlResponse,
  });

  assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
  assert.match(response.headers.get("Vary"), /Accept/);
  assert.equal(
    await response.text(),
    "<html><body><h1>Quickstart</h1></body></html>",
  );
});

test("honors q-values when HTML is preferred over markdown", async () => {
  const request = new Request("https://api-docs.quran.foundation/docs/quickstart/", {
    headers: {
      Accept: "text/html, text/markdown;q=0.5",
    },
  });
  const htmlResponse = new Response("<html><body><h1>Quickstart</h1></body></html>", {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  const response = await runtime.negotiateMarkdownResponse({
    assetsFetch: async () => {
      throw new Error("assets fetch should not run when HTML is preferred");
    },
    request,
    response: htmlResponse,
  });

  assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
  assert.match(response.headers.get("Vary"), /Accept/);
  assert.equal(
    await response.text(),
    "<html><body><h1>Quickstart</h1></body></html>",
  );
});

test("returns 406 when the Accept header rejects both HTML and markdown", async () => {
  const request = new Request("https://api-docs.quran.foundation/docs/quickstart/", {
    headers: {
      Accept: "application/x-content-negotiation-probe",
    },
  });
  const htmlResponse = new Response("<html><body><h1>Quickstart</h1></body></html>", {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "x-frame-options": "SAMEORIGIN",
    },
  });

  const response = await runtime.negotiateMarkdownResponse({
    assetsFetch: async () => {
      throw new Error("assets fetch should not run for unsupported Accept types");
    },
    request,
    response: htmlResponse,
  });

  assert.equal(response.status, 406);
  assert.equal(response.headers.get("Content-Type"), "text/plain; charset=utf-8");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.match(response.headers.get("Vary"), /Accept/);

  const body = await response.text();
  assert.match(body, /This resource is available in:/);
  assert.match(body, /text\/html/);
  assert.match(body, /text\/markdown/);
  assert.match(body, /application\/x-content-negotiation-probe/);
});
