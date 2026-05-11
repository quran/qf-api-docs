"use strict";

const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const DOCS_DIR = path.join(__dirname, "..", "docs");
const SITEMAP_PATH = path.join(BUILD_DIR, "sitemap.xml");
const REDIRECTS_PATH = path.join(BUILD_DIR, "_redirects");
const GENERATED_AUTH_REDIRECTS_PATH = path.join(
  __dirname,
  "..",
  ".docusaurus",
  "generated-auth-api-redirects.json",
);
const SEARCH_CONSOLE_REDIRECT_OVERRIDES_PATH = path.join(
  __dirname,
  "search-console-redirect-overrides.json",
);
const PUBLIC_ROUTE_LOCK_PATH = path.join(__dirname, "public-route-lock.json");
const SITE_ORIGIN = "https://api-docs.quran.foundation";
const SITE_HOST = new URL(SITE_ORIGIN).host;
const STATIC_REDIRECT_LIMIT = 2000;
const DYNAMIC_REDIRECT_LIMIT = 100;
const generatedRedirectsStart = "# BEGIN generated-search-console-redirects";
const generatedRedirectsEnd = "# END generated-search-console-redirects";
const versionedApiFamilies = [
  "content_apis_versioned",
  "oauth2_apis_versioned",
  "search_apis_versioned",
  "user_related_apis_versioned",
];
const docsDirsWithAuthAliases = [
  "user_related_apis_prelive",
  "user_related_apis_versioned",
];
const generatedApiDocPattern = /\.(api|info|tag)\.mdx$/;
const categoryAliasTargets = {
  "content-apis": "content_apis_versioned",
  oauth2_apis: "oauth2_apis_versioned",
  "search-apis": "search_apis_versioned",
  "user-related-apis": "user_related_apis_versioned",
};
const versionDirPattern = /^\d+\.\d+\.\d+$/;
const versionedApiRoots = getVersionedApiRoots();

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

function stripTrailingSlash(pathname) {
  return pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error.message}`);
  }
}

function getVersionedApiRoot(family) {
  const versionsPath = path.join(DOCS_DIR, family, "versions.json");
  if (!fs.existsSync(versionsPath)) {
    throw new Error(`Missing generated API versions file: ${versionsPath}`);
  }

  const versions = readJsonFile(versionsPath);
  if (!Array.isArray(versions) || versions.length === 0) {
    throw new Error(`No API versions found in ${versionsPath}`);
  }

  const currentVersion = versions[0]?.version;
  if (!currentVersion || !versionDirPattern.test(currentVersion)) {
    throw new Error(`Invalid current API version in ${versionsPath}`);
  }

  const versionPath = path.join(DOCS_DIR, family, currentVersion);
  if (!fs.existsSync(versionPath)) {
    throw new Error(
      `Resolved API version ${currentVersion} for ${family}, but ${versionPath} does not exist.`,
    );
  }

  return currentVersion;
}

function getVersionedApiRoots() {
  return Object.fromEntries(
    versionedApiFamilies.map((family) => [family, getVersionedApiRoot(family)]),
  );
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
  const currentCategoryAlias = pathname.match(
    /^\/docs\/category\/(content-apis|oauth2_apis|search-apis|user-related-apis)\/?$/,
  );

  if (currentCategoryAlias) {
    const [, categorySlug] = currentCategoryAlias;
    const family = categoryAliasTargets[categorySlug];
    return `/docs/category/${categorySlug}-${versionedApiRoots[family]}/`;
  }

  const singleSegmentApiFamily = pathname.match(
    /^\/docs\/(content_apis_versioned|user_related_apis_versioned|oauth2_apis_versioned|search_apis_versioned)\/([^/]+)\/?$/,
  );

  if (!singleSegmentApiFamily) {
    return null;
  }

  const [, family, slug] = singleSegmentApiFamily;

  // Scopes is a standalone unversioned OAuth reference, not a generated API alias.
  if (family === "user_related_apis_versioned" && slug === "scopes") {
    return normalizePathname(pathname);
  }

  return `/docs/${family}/${versionedApiRoots[family]}/${slug}/`;
}

function shouldDropSitemapPath(pathname) {
  if (dropPathsFromSitemap.has(pathname)) {
    return true;
  }

  if (
    /^\/docs\/category\/(content-apis|oauth2_apis|search-apis|user-related-apis)\/?$/.test(
      pathname,
    )
  ) {
    return true;
  }

  const singleSegmentApiFamily = pathname.match(
    /^\/docs\/(content_apis_versioned|user_related_apis_versioned|oauth2_apis_versioned|search_apis_versioned)\/([^/]+)\/?$/,
  );

  if (!singleSegmentApiFamily) {
    return false;
  }

  const [, family, slug] = singleSegmentApiFamily;

  // Scopes is a standalone unversioned OAuth reference, not a generated API alias.
  if (family === "user_related_apis_versioned" && slug === "scopes") {
    return false;
  }

  return true;
}

function walkFiles(dir, predicate = () => true) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate));
      continue;
    }

    if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
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
  const htmlFiles = walkFiles(BUILD_DIR, (filePath) => filePath.endsWith(".html"));

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
  const urlEntries = [
    ...source.matchAll(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g),
  ];

  if (urlEntries.length === 0) {
    throw new Error(
      `Failed to parse any sitemap entries from ${SITEMAP_PATH}; refusing to overwrite the sitemap.`,
    );
  }

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

function normalizeRedirectPath(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    throw new Error("Redirect path cannot be empty");
  }

  const url = rawValue.startsWith("http://") || rawValue.startsWith("https://")
    ? new URL(rawValue)
    : null;

  if (url && url.host !== SITE_HOST) {
    throw new Error(`Only same-host redirects are supported: ${rawValue}`);
  }

  if (url?.search || url?.hash) {
    throw new Error(`Redirect path must not include query strings or hashes: ${rawValue}`);
  }

  const pathname = url ? url.pathname : rawValue;
  if (!pathname.startsWith("/")) {
    throw new Error(`Redirect path must start with /: ${rawValue}`);
  }

  if (pathname.includes("?") || pathname.includes("#")) {
    throw new Error(`Redirect path must not include query strings or hashes: ${rawValue}`);
  }

  return pathname;
}

function getRedirectSourceVariants(source) {
  const pathname = normalizeRedirectPath(source);

  if (pathname === "/" || isStaticAsset(pathname)) {
    return [pathname];
  }

  const withoutSlash = stripTrailingSlash(pathname);
  const withSlash = normalizePathname(withoutSlash);

  return withoutSlash === withSlash ? [withoutSlash] : [withoutSlash, withSlash];
}

function docsRouteSourceExists(routePath) {
  const pathname = normalizeRedirectPath(routePath);
  const docId = pathname
    .replace(/^\/docs\//, "")
    .replace(/\/$/, "");
  const sourcePath = path.join(DOCS_DIR, ...docId.split("/"));
  return [".api.mdx", ".info.mdx", ".tag.mdx", ".mdx", ".md"].some((extension) =>
    fs.existsSync(`${sourcePath}${extension}`),
  );
}

function getCanonicalRedirectTarget(target) {
  const pathname = normalizePathname(normalizeRedirectPath(target));
  const match = pathname.match(/^\/docs\/([^/]+)\/([^/]+)\/$/);
  if (!match) {
    return pathname;
  }

  const [, family, slug] = match;
  const currentVersion = versionedApiRoots[family];
  if (!currentVersion || slug === currentVersion) {
    return pathname;
  }

  if (family === "user_related_apis_versioned" && slug === "scopes") {
    return pathname;
  }

  const versionedTarget = `/docs/${family}/${currentVersion}/${slug}/`;
  return docsRouteSourceExists(versionedTarget) ? versionedTarget : pathname;
}

function parseRedirects(content) {
  const redirects = new Map();

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 2 || tokens.length > 3) {
      throw new Error(`Malformed redirect on line ${index + 1}: ${line}`);
    }

    const [source, target, status = "301"] = tokens;
    if (redirects.has(source)) {
      throw new Error(`Duplicate redirect source on line ${index + 1}: ${source}`);
    }

    redirects.set(source, { target, status });
  }

  return redirects;
}

function stripGeneratedRedirectsSection(content) {
  const sectionPattern = new RegExp(
    `(?:\\r?\\n)?${generatedRedirectsStart}[\\s\\S]*?${generatedRedirectsEnd}(?:\\r?\\n)?`,
    "g",
  );

  return content.replace(sectionPattern, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

function createRedirectRegistry(existingContent = "") {
  const existingRedirects = parseRedirects(existingContent);
  const redirects = new Map(existingRedirects);
  const generated = new Map();

  function addRedirect(source, target, options = {}) {
    const {
      includeSourceVariants = true,
      skipExisting = false,
      status = "301",
    } = options;
    const normalizedTarget = getCanonicalRedirectTarget(target);
    const sources = includeSourceVariants
      ? getRedirectSourceVariants(source)
      : [normalizeRedirectPath(source)];

    for (const sourceVariant of sources) {
      if (sourceVariant === normalizedTarget) {
        continue;
      }

      const existing = redirects.get(sourceVariant);
      if (existing) {
        if (existing.target === normalizedTarget && existing.status === status) {
          continue;
        }

        if (skipExisting) {
          continue;
        }

        throw new Error(
          `Conflicting redirect for ${sourceVariant}: ${existing.target} ${existing.status} vs ${normalizedTarget} ${status}`,
        );
      }

      redirects.set(sourceVariant, { target: normalizedTarget, status });
      generated.set(sourceVariant, { target: normalizedTarget, status });
    }
  }

  return {
    addRedirect,
    generated,
    redirects,
  };
}

function getDocId(filePath) {
  return path
    .relative(path.join(__dirname, ".."), filePath)
    .split(path.sep)
    .join("/")
    .replace(/^docs\//, "")
    .replace(/\.(api|info|tag)\.mdx$/, "");
}

function docIdToDocsPath(docId) {
  return `/docs/${docId}/`;
}

function getDocRoutePath(filePath) {
  return docIdToDocsPath(getDocId(filePath));
}

function getFrontMatterValue(content, key) {
  const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontMatterMatch) {
    return null;
  }

  const lineMatch = frontMatterMatch[1].match(
    new RegExp(`^${key}:\\s*(?:"([^"]+)"|'([^']+)'|(.+))\\s*$`, "m"),
  );

  if (!lineMatch) {
    return null;
  }

  return lineMatch[1] || lineMatch[2] || lineMatch[3].trim();
}

function getApiFrontMatter(content) {
  const apiValue = getFrontMatterValue(content, "api");
  if (!apiValue) {
    return null;
  }

  try {
    return JSON.parse(apiValue);
  } catch (error) {
    throw new Error(`Failed to parse api front matter: ${error.message}`);
  }
}

function operationIdToGeneratedSlug(operationId) {
  return String(operationId)
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, "$1-$2")
    .replace(/([0-9])([A-Za-z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

function getGeneratedAuthRedirectsFromDoc(filePath, content) {
  const api = getApiFrontMatter(content);
  const operationId = api?.operationId;

  if (!operationId || !String(operationId).startsWith("auth")) {
    return [];
  }

  const generatedSlug = operationIdToGeneratedSlug(operationId);
  if (!generatedSlug.startsWith("auth-")) {
    return [];
  }

  const target = getDocRoutePath(filePath);
  const docId = getDocId(filePath);
  const currentSlug = docId.split("/").pop();
  if (generatedSlug === currentSlug) {
    return [];
  }

  const sourceDocId = [...docId.split("/").slice(0, -1), generatedSlug].join("/");
  const source = docIdToDocsPath(sourceDocId);

  return [
    { source: stripTrailingSlash(source), target },
    { source, target },
  ];
}

function collectGeneratedAuthRedirectsFromDocs() {
  const redirects = [];

  for (const docsDir of docsDirsWithAuthAliases) {
    const fullDocsDir = path.join(DOCS_DIR, docsDir);
    const files = walkFiles(fullDocsDir, (filePath) =>
      generatedApiDocPattern.test(filePath),
    );

    for (const filePath of files) {
      redirects.push(
        ...getGeneratedAuthRedirectsFromDoc(
          filePath,
          fs.readFileSync(filePath, "utf8"),
        ),
      );
    }
  }

  return redirects;
}

function readGeneratedAuthRedirectManifest() {
  if (!fs.existsSync(GENERATED_AUTH_REDIRECTS_PATH)) {
    return [];
  }

  const manifest = readJsonFile(GENERATED_AUTH_REDIRECTS_PATH);
  const redirects = Array.isArray(manifest) ? manifest : manifest.redirects;
  if (!Array.isArray(redirects)) {
    throw new Error(`Invalid generated redirect manifest: ${GENERATED_AUTH_REDIRECTS_PATH}`);
  }

  return redirects;
}

function readSearchConsoleRedirectOverrides() {
  if (!fs.existsSync(SEARCH_CONSOLE_REDIRECT_OVERRIDES_PATH)) {
    return [];
  }

  const manifest = readJsonFile(SEARCH_CONSOLE_REDIRECT_OVERRIDES_PATH);
  if (!Array.isArray(manifest.redirects)) {
    throw new Error(
      `Invalid Search Console redirect override manifest: ${SEARCH_CONSOLE_REDIRECT_OVERRIDES_PATH}`,
    );
  }

  return manifest.redirects;
}

function readPublicRouteLock() {
  if (!fs.existsSync(PUBLIC_ROUTE_LOCK_PATH)) {
    return [];
  }

  const manifest = readJsonFile(PUBLIC_ROUTE_LOCK_PATH);
  const routes = Array.isArray(manifest) ? manifest : manifest.routes;
  if (!Array.isArray(routes)) {
    throw new Error(`Invalid public route lock manifest: ${PUBLIC_ROUTE_LOCK_PATH}`);
  }

  return routes;
}

function collectVersionedApiAliasRedirects() {
  const redirects = [];

  for (const family of versionedApiFamilies) {
    const currentVersion = versionedApiRoots[family];
    const versionDir = path.join(DOCS_DIR, family, currentVersion);
    const files = walkFiles(versionDir, (filePath) => generatedApiDocPattern.test(filePath));

    for (const filePath of files) {
      const slug = path.basename(filePath).replace(generatedApiDocPattern, "");
      if (family === "user_related_apis_versioned" && slug === "scopes") {
        continue;
      }

      redirects.push({
        source: `/docs/${family}/${slug}/`,
        target: `/docs/${family}/${currentVersion}/${slug}/`,
      });
    }
  }

  return redirects;
}

function collectSlashRedirectsFromBuild() {
  return walkFiles(BUILD_DIR, (filePath) => filePath.endsWith(".html"))
    .map((htmlPath) => getBuiltHtmlPathname(htmlPath))
    .filter((pathname) => pathname !== "/" && pathname !== "/404/" && pathname.endsWith("/"))
    .map((pathname) => ({
      source: stripTrailingSlash(pathname),
      target: pathname,
    }));
}

function getBuildPathForTarget(targetPath) {
  const pathname = normalizeRedirectPath(targetPath);
  const relativePath = pathname.replace(/^\//, "");

  if (pathname === "/") {
    return path.join(BUILD_DIR, "index.html");
  }

  if (pathname.endsWith("/")) {
    return path.join(BUILD_DIR, relativePath, "index.html");
  }

  if (isStaticAsset(pathname)) {
    return path.join(BUILD_DIR, relativePath);
  }

  return path.join(BUILD_DIR, relativePath, "index.html");
}

function validateGeneratedRedirectTargets(generatedRedirects, options = {}) {
  const pathExists = options.pathExists || fs.existsSync;
  const buildPathForTarget = options.getBuildPathForTarget || getBuildPathForTarget;
  const missingTargets = [];

  for (const { target } of generatedRedirects.values()) {
    const targetPath = buildPathForTarget(target);
    if (!pathExists(targetPath)) {
      missingTargets.push(`${target} -> ${targetPath}`);
    }
  }

  if (missingTargets.length > 0) {
    throw new Error(
      `Generated redirects point at missing build targets:\n${missingTargets
        .slice(0, 20)
        .join("\n")}`,
    );
  }
}

function validatePublicRouteLock(redirects, routes = readPublicRouteLock(), options = {}) {
  const pathExists = options.pathExists || fs.existsSync;
  const buildPathForTarget = options.getBuildPathForTarget || getBuildPathForTarget;
  const missingRoutes = [];

  for (const route of routes) {
    const pathname = normalizePathname(normalizeRedirectPath(route));
    if (pathExists(buildPathForTarget(pathname))) {
      continue;
    }

    const sourceVariants = getRedirectSourceVariants(pathname);
    const missingVariants = sourceVariants.filter((source) => !redirects.has(source));
    if (missingVariants.length > 0) {
      missingRoutes.push(
        `${pathname} is not built and is missing redirects for ${missingVariants.join(", ")}`,
      );
    }
  }

  if (missingRoutes.length > 0) {
    throw new Error(
      `Public route lock failed. Add explicit redirects before removing published routes:\n${missingRoutes
        .slice(0, 30)
        .join("\n")}`,
    );
  }
}

function validateRedirectLimits(redirects) {
  let staticRedirects = 0;
  let dynamicRedirects = 0;

  for (const [source] of redirects) {
    if (source.includes(":") || source.includes("*")) {
      dynamicRedirects += 1;
    } else {
      staticRedirects += 1;
    }
  }

  if (staticRedirects > STATIC_REDIRECT_LIMIT || dynamicRedirects > DYNAMIC_REDIRECT_LIMIT) {
    throw new Error(
      `Cloudflare Pages redirect limits exceeded: ${staticRedirects}/${STATIC_REDIRECT_LIMIT} static, ${dynamicRedirects}/${DYNAMIC_REDIRECT_LIMIT} dynamic`,
    );
  }
}

function validateNoRedirectLoops(redirects) {
  for (const [source] of redirects) {
    const seen = new Set([source]);
    let current = redirects.get(source)?.target;

    while (current && redirects.has(current)) {
      if (seen.has(current)) {
        throw new Error(`Redirect loop detected: ${[...seen, current].join(" -> ")}`);
      }

      seen.add(current);
      current = redirects.get(current)?.target;
    }
  }
}

function writeRedirects() {
  const existingContent = fs.existsSync(REDIRECTS_PATH)
    ? fs.readFileSync(REDIRECTS_PATH, "utf8")
    : "# Cloudflare Pages redirects configuration\n";
  const baseContent = stripGeneratedRedirectsSection(existingContent);
  const registry = createRedirectRegistry(baseContent);

  for (const redirect of readSearchConsoleRedirectOverrides()) {
    registry.addRedirect(redirect.source, redirect.target);
  }

  const generatedRedirectSources = [
    ...readGeneratedAuthRedirectManifest(),
    ...collectGeneratedAuthRedirectsFromDocs(),
    ...collectVersionedApiAliasRedirects(),
  ];

  for (const redirect of generatedRedirectSources) {
    registry.addRedirect(redirect.source, redirect.target, { skipExisting: true });
  }

  for (const redirect of collectSlashRedirectsFromBuild()) {
    registry.addRedirect(redirect.source, redirect.target, { skipExisting: true });
  }

  validateGeneratedRedirectTargets(registry.generated);
  validatePublicRouteLock(registry.redirects);
  validateNoRedirectLoops(registry.redirects);
  validateRedirectLimits(registry.redirects);

  const generatedLines = [...registry.generated.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([source, { target, status }]) => `${source} ${target} ${status}`);

  const generatedSection = [
    generatedRedirectsStart,
    "# Generated by scripts/postbuild-seo.js. Do not edit this section by hand.",
    ...generatedLines,
    generatedRedirectsEnd,
  ].join("\n");

  fs.writeFileSync(
    REDIRECTS_PATH,
    `${baseContent.trimEnd()}\n\n${generatedSection}\n`,
    "utf8",
  );
}

function assertNoStaleSeoReferences() {
  const checkedFiles = [
    SITEMAP_PATH,
    path.join(BUILD_DIR, "llms.txt"),
    ...walkFiles(BUILD_DIR, (filePath) => filePath.endsWith(".html")),
  ].filter((filePath) => fs.existsSync(filePath));
  const staleReferences = [];
  const staleAuthPattern = /\/docs\/[^"'<\s)]*\/auth-[a-z0-9-]*/i;

  for (const filePath of checkedFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const match = content.match(staleAuthPattern);
    if (match) {
      staleReferences.push(`${path.relative(BUILD_DIR, filePath)}: ${match[0]}`);
    }
  }

  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  for (const [, rawUrl] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const pathname = new URL(rawUrl).pathname;
    if (shouldDropSitemapPath(pathname)) {
      staleReferences.push(`sitemap.xml contains dropped alias: ${pathname}`);
    }
  }

  if (staleReferences.length > 0) {
    throw new Error(
      `Stale SEO references found:\n${staleReferences.slice(0, 20).join("\n")}`,
    );
  }
}

function main() {
  if (!fs.existsSync(BUILD_DIR) || !fs.existsSync(SITEMAP_PATH)) {
    throw new Error("Build output is missing; run the Docusaurus build first.");
  }

  rewriteHtmlCanonicals();
  rewriteSitemap();
  writeRedirects();
  assertNoStaleSeoReferences();
}

if (require.main === module) {
  main();
}

module.exports = {
  createRedirectRegistry,
  getCanonicalPathOverride,
  getGeneratedAuthRedirectsFromDoc,
  getRedirectSourceVariants,
  normalizeRedirectPath,
  normalizeSiteUrl,
  operationIdToGeneratedSlug,
  shouldDropSitemapPath,
  stripGeneratedRedirectsSection,
  validateGeneratedRedirectTargets,
  validateNoRedirectLoops,
  validatePublicRouteLock,
};
