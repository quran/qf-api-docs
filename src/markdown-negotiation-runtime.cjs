const {
  MARKDOWN_CONTENT_TYPE,
  acceptsMarkdown,
  appendHeaderValue,
  isHtmlContentType,
  isMarkdownPath,
  toMarkdownAssetPath,
} = require("./markdown-negotiation-shared.cjs");

function withHeaders(response, headers, method) {
  return new Response(method === "HEAD" ? null : response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

async function negotiateMarkdownResponse({ assetsFetch, request, response }) {
  const url = new URL(request.url);

  if (isMarkdownPath(url.pathname)) {
    const headers = new Headers(response.headers);
    headers.set("Content-Type", MARKDOWN_CONTENT_TYPE);
    return withHeaders(response, headers, request.method);
  }

  if (!isHtmlContentType(response.headers.get("Content-Type"))) {
    return response;
  }

  const htmlHeaders = new Headers(response.headers);
  appendHeaderValue(htmlHeaders, "Vary", "Accept");

  if (!acceptsMarkdown(request.headers.get("Accept"))) {
    return withHeaders(response, htmlHeaders, request.method);
  }

  const markdownAssetPath = toMarkdownAssetPath(url.pathname);
  if (!markdownAssetPath) {
    return withHeaders(response, htmlHeaders, request.method);
  }

  const markdownRequest = new Request(new URL(markdownAssetPath, url), {
    method: request.method,
    headers: request.headers,
  });
  const markdownResponse = await assetsFetch(markdownRequest);

  if (!markdownResponse.ok) {
    return withHeaders(response, htmlHeaders, request.method);
  }

  const markdownHeaders = new Headers(markdownResponse.headers);
  markdownHeaders.set("Content-Type", MARKDOWN_CONTENT_TYPE);
  appendHeaderValue(markdownHeaders, "Vary", "Accept");

  return withHeaders(markdownResponse, markdownHeaders, request.method);
}

module.exports = {
  negotiateMarkdownResponse,
};
