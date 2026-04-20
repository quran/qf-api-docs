"use strict";

const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const SITEMAP_PATH = path.join(BUILD_DIR, "sitemap.xml");
const SITE_ORIGIN = "https://api-docs.quran.foundation";
const versionedApiRoots = {
  content_apis_versioned: "4.0.0",
  oauth2_apis_versioned: "1.0.0",
  search_apis_versioned: "1.0.0",
  user_related_apis_versioned: "1.0.0",
};

const dropPathsFromSitemap = new Set([
  "/search",
  "/search/",
  "/request-scopes",
  "/request-scopes/",
]);

function isStaticAsset(pathname) {
  return /\.[a-z0-9]+$/i.test(pathname);
}

function normalizePathname(pathname) {
  if (pathname !== "/" && !pathname.endsWith("/") && !isStaticAsset(pathname)) {
    return `${pathname}/`;
  }

  return pathname;
}

function normalizeSiteUrl(rawUrl, pathnameOverride) {
  const url = new URL(rawUrl);

  if (url.origin !== SITE_ORIGIN) {
    return rawUrl;
  }

  url.pathname = normalizePathname(pathnameOverride || url.pathname);

  return url.toString();
}

function getCanonicalPathOverride(pathname) {
  const singleSegmentApiFamily = pathname.match(
    /^\/docs\/(content_apis_versioned|user_related_apis_versioned|oauth2_apis_versioned|search_apis_versioned)\/([^/]+)\/?$/,
  );

  if (!singleSegmentApiFamily) {
    return null;
  }

  const [, family, slug] = singleSegmentApiFamily;

  if (family === "user_related_apis_versioned" && slug === "scopes") {
    return normalizePathname(pathname);
  }

  return `/docs/${family}/${versionedApiRoots[family]}/${slug}/`;
}

function shouldDropSitemapPath(pathname) {
  if (dropPathsFromSitemap.has(pathname)) {
    return true;
  }

  const singleSegmentApiFamily = pathname.match(
    /^\/docs\/(content_apis_versioned|user_related_apis_versioned|oauth2_apis_versioned|search_apis_versioned)\/([^/]+)\/?$/,
  );

  if (!singleSegmentApiFamily) {
    return false;
  }

  const [, family, slug] = singleSegmentApiFamily;

  if (family === "user_related_apis_versioned" && slug === "scopes") {
    return false;
  }

  return true;
}

function getBuiltHtmlPathname(htmlPath) {
  const relativePath = path.relative(BUILD_DIR, htmlPath).split(path.sep).join("/");

  if (relativePath === "index.html") {
    return "/";
  }

  const pathname = `/${relativePath}`
    .replace(/index\.html$/i, "")
    .replace(/\.html$/i, "");

  return normalizePathname(pathname);
}

function rewriteHtmlCanonicals() {
  const htmlFiles = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".html")) {
        htmlFiles.push(fullPath);
      }
    }
  }

  walk(BUILD_DIR);

  const linkPattern =
    /(<link[^>]+rel="(?:canonical|alternate)"[^>]+href=")(https:\/\/api-docs\.quran\.foundation[^"]*)(")/g;
  const ogUrlPattern =
    /(<meta[^>]+property="og:url"[^>]+content=")(https:\/\/api-docs\.quran\.foundation[^"]*)(")/g;

  for (const htmlPath of htmlFiles) {
    const source = fs.readFileSync(htmlPath, "utf8");
    const builtPathname = getBuiltHtmlPathname(htmlPath);
    const canonicalPathOverride = getCanonicalPathOverride(builtPathname);
    const rewritten = source
      .replace(linkPattern, (_, prefix, url, suffix) => {
        return `${prefix}${normalizeSiteUrl(url, canonicalPathOverride)}${suffix}`;
      })
      .replace(ogUrlPattern, (_, prefix, url, suffix) => {
        return `${prefix}${normalizeSiteUrl(url, canonicalPathOverride)}${suffix}`;
      });

    if (rewritten !== source) {
      fs.writeFileSync(htmlPath, rewritten);
    }
  }
}

function rewriteSitemap() {
  const source = fs.readFileSync(SITEMAP_PATH, "utf8");
  const urlEntries = [...source.matchAll(/<url><loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g)];

  const filteredEntries = urlEntries
    .map((match) => {
      const [entry, rawUrl] = match;
      const normalizedUrl = normalizeSiteUrl(rawUrl);
      const pathname = new URL(normalizedUrl).pathname;

      if (shouldDropSitemapPath(pathname)) {
        return null;
      }

      return entry.replace(rawUrl, normalizedUrl);
    })
    .filter(Boolean);

  const rewritten =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">' +
    filteredEntries.join("") +
    "</urlset>";

  fs.writeFileSync(SITEMAP_PATH, rewritten);
}

function main() {
  if (!fs.existsSync(BUILD_DIR) || !fs.existsSync(SITEMAP_PATH)) {
    throw new Error("Build output is missing; run the Docusaurus build first.");
  }

  rewriteHtmlCanonicals();
  rewriteSitemap();
}

main();
