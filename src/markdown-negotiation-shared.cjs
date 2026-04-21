const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

function acceptsMarkdown(acceptHeader) {
  if (!acceptHeader) {
    return false;
  }

  return acceptHeader.split(",").some((mediaRange) => {
    const [type, ...params] = mediaRange.split(";").map((part) => part.trim());
    if (type.toLowerCase() !== "text/markdown") {
      return false;
    }

    const qParam = params.find((part) => part.toLowerCase().startsWith("q="));
    if (!qParam) {
      return true;
    }

    const quality = Number(qParam.slice(2));
    return Number.isFinite(quality) && quality > 0;
  });
}

function isHtmlContentType(contentType) {
  return Boolean(contentType) && contentType.toLowerCase().startsWith("text/html");
}

function isMarkdownPath(pathname) {
  return pathname.toLowerCase().endsWith(".md");
}

function toMarkdownAssetPath(pathname) {
  if (!pathname) {
    return "/index.md";
  }

  if (isMarkdownPath(pathname)) {
    return pathname;
  }

  if (pathname === "/") {
    return "/index.md";
  }

  if (pathname.endsWith("/")) {
    return `${pathname}index.md`;
  }

  if (/\.[a-z0-9]+$/i.test(pathname)) {
    return pathname.toLowerCase().endsWith(".html")
      ? pathname.replace(/\.html$/i, ".md")
      : null;
  }

  return `${pathname}/index.md`;
}

function appendHeaderValue(headers, name, value) {
  const existing = headers.get(name);
  if (!existing) {
    headers.set(name, value);
    return;
  }

  const values = existing
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (values.includes(value.toLowerCase())) {
    return;
  }

  headers.set(name, `${existing}, ${value}`);
}

module.exports = {
  MARKDOWN_CONTENT_TYPE,
  acceptsMarkdown,
  appendHeaderValue,
  isHtmlContentType,
  isMarkdownPath,
  toMarkdownAssetPath,
};
