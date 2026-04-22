const {
  HTML_MEDIA_TYPE,
  MARKDOWN_CONTENT_TYPE,
  MARKDOWN_MEDIA_TYPE,
  appendHeaderValue,
  isHtmlContentType,
  isMarkdownPath,
  rankRepresentationTypes,
  toMarkdownAssetPath,
} = require("./markdown-negotiation-shared.cjs");

function withHeaders(response, headers, method) {
  return new Response(method === "HEAD" ? null : response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function shouldRewriteMarkdownContentType(response) {
  return response.ok && !isHtmlContentType(response.headers.get("Content-Type"));
}

function notAcceptableResponse({ acceptHeader, method, response }) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "text/plain; charset=utf-8");
  appendHeaderValue(headers, "Vary", "Accept");

  const lines = [
    "This resource is available in:",
    `- ${HTML_MEDIA_TYPE}`,
    `- ${MARKDOWN_MEDIA_TYPE}`,
  ];

  if (acceptHeader) {
    lines.push("", `You requested: ${acceptHeader}`);
  }

  return new Response(method === "HEAD" ? null : lines.join("\n"), {
    headers,
    status: 406,
    statusText: "Not Acceptable",
  });
}

async function negotiateMarkdownResponse({ assetsFetch, request, response }) {
  const url = new URL(request.url);
  const acceptHeader = request.headers.get("Accept");

  if (isMarkdownPath(url.pathname)) {
    if (!shouldRewriteMarkdownContentType(response)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Content-Type", MARKDOWN_CONTENT_TYPE);
    return withHeaders(response, headers, request.method);
  }

  if (!isHtmlContentType(response.headers.get("Content-Type"))) {
    return response;
  }

  const preferredRepresentations = rankRepresentationTypes(
    acceptHeader,
    [HTML_MEDIA_TYPE, MARKDOWN_MEDIA_TYPE],
    HTML_MEDIA_TYPE,
  );
  if (!preferredRepresentations.length) {
    return notAcceptableResponse({
      acceptHeader,
      method: request.method,
      response,
    });
  }

  const htmlHeaders = new Headers(response.headers);
  appendHeaderValue(htmlHeaders, "Vary", "Accept");

  if (preferredRepresentations[0] === HTML_MEDIA_TYPE) {
    return withHeaders(response, htmlHeaders, request.method);
  }

  const markdownAssetPath = toMarkdownAssetPath(url.pathname);
  if (!markdownAssetPath) {
    if (preferredRepresentations.includes(HTML_MEDIA_TYPE)) {
      return withHeaders(response, htmlHeaders, request.method);
    }

    return notAcceptableResponse({
      acceptHeader,
      method: request.method,
      response,
    });
  }

  const markdownRequest = new Request(new URL(markdownAssetPath, url), {
    method: request.method,
    headers: request.headers,
  });
  const markdownResponse = await assetsFetch(markdownRequest);

  if (!markdownResponse.ok) {
    if (preferredRepresentations.includes(HTML_MEDIA_TYPE)) {
      return withHeaders(response, htmlHeaders, request.method);
    }

    return notAcceptableResponse({
      acceptHeader,
      method: request.method,
      response,
    });
  }

  const markdownHeaders = new Headers(markdownResponse.headers);
  markdownHeaders.set("Content-Type", MARKDOWN_CONTENT_TYPE);
  appendHeaderValue(markdownHeaders, "Vary", "Accept");

  return withHeaders(markdownResponse, markdownHeaders, request.method);
}

module.exports = {
  negotiateMarkdownResponse,
};
