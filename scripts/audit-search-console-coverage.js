#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const zlib = require("zlib");

const siteDir = path.resolve(__dirname, "..");
const buildDir = path.join(siteDir, "build");
const redirectsPath = path.join(buildDir, "_redirects");
const siteOrigin = "https://api-docs.quran.foundation";
const siteHost = new URL(siteOrigin).host;
const defaultTimeoutMs = 10000;
const defaultMaxRedirects = 8;
const defaultConcurrency = 12;
const indexedThoughBlockedIssue = "Indexed, though blocked by robots.txt";
const pageWithRedirectIssue = "Page with redirect";

function decodeXml(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function getAttr(attrs, name) {
  const match = attrs.match(new RegExp(`\\b${name}="([^"]*)"`, "i"));
  return match ? decodeXml(match[1]) : null;
}

function findEndOfCentralDirectory(buffer) {
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return {
        entries: buffer.readUInt16LE(offset + 10),
        centralDirectoryOffset: buffer.readUInt32LE(offset + 16),
      };
    }
  }

  throw new Error("Could not find XLSX central directory");
}

function readZipEntries(filePath) {
  const buffer = fs.readFileSync(filePath);
  const eocd = findEndOfCentralDirectory(buffer);
  const entries = new Map();
  let offset = eocd.centralDirectoryOffset;

  for (let index = 0; index < eocd.entries; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central directory in ${filePath}`);
    }

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      throw new Error(`Invalid ZIP local header for ${name}`);
    }

    const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    const data =
      method === 0
        ? compressed
        : method === 8
          ? zlib.inflateRawSync(compressed)
          : null;

    if (!data) {
      throw new Error(`Unsupported ZIP compression method ${method} for ${name}`);
    }

    entries.set(name, data.toString("utf8"));
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readSharedStrings(entries) {
  const xml = entries.get("xl/sharedStrings.xml");
  if (!xml) {
    return [];
  }

  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(([, si]) =>
    decodeXml(
      [...si.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
        .map(([, text]) => text)
        .join(""),
    ),
  );
}

function getWorkbookSheetPath(entries, sheetName) {
  const workbook = entries.get("xl/workbook.xml");
  const rels = entries.get("xl/_rels/workbook.xml.rels");
  if (!workbook || !rels) {
    throw new Error("XLSX workbook metadata is missing");
  }

  const sheet = [...workbook.matchAll(/<sheet\b([^>]*)\/>/g)]
    .map(([, attrs]) => ({
      name: getAttr(attrs, "name"),
      relId: getAttr(attrs, "r:id"),
    }))
    .find((item) => item.name === sheetName);

  if (!sheet) {
    throw new Error(`XLSX sheet not found: ${sheetName}`);
  }

  const rel = [...rels.matchAll(/<Relationship\b([^>]*)\/>/g)]
    .map(([, attrs]) => ({
      id: getAttr(attrs, "Id"),
      target: getAttr(attrs, "Target"),
    }))
    .find((item) => item.id === sheet.relId);

  if (!rel) {
    throw new Error(`XLSX sheet relationship not found: ${sheet.relId}`);
  }

  return `xl/${rel.target.replace(/^\//, "")}`;
}

function columnIndex(cellRef) {
  const letters = String(cellRef || "A").match(/^[A-Z]+/i)?.[0] || "A";
  return [...letters.toUpperCase()].reduce(
    (value, letter) => value * 26 + letter.charCodeAt(0) - 64,
    0,
  ) - 1;
}

function readWorksheetRows(entries, sheetName) {
  const sharedStrings = readSharedStrings(entries);
  const sheetPath = getWorkbookSheetPath(entries, sheetName);
  const xml = entries.get(sheetPath);
  if (!xml) {
    throw new Error(`XLSX worksheet payload missing: ${sheetPath}`);
  }

  return [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].map(([, rowXml]) => {
    const row = [];

    for (const [, attrs, cellXml] of rowXml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const index = columnIndex(getAttr(attrs, "r"));
      const type = getAttr(attrs, "t");
      const value = cellXml.match(/<v>([\s\S]*?)<\/v>/)?.[1] || "";

      if (type === "s") {
        row[index] = sharedStrings[Number(value)] || "";
      } else if (type === "inlineStr") {
        row[index] = decodeXml(
          [...cellXml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
            .map(([, text]) => text)
            .join(""),
        );
      } else {
        row[index] = decodeXml(value);
      }
    }

    return row;
  });
}

function readSearchConsoleExport(filePath) {
  const entries = readZipEntries(filePath);
  const tableRows = readWorksheetRows(entries, "Table");
  const metadataRows = readWorksheetRows(entries, "Metadata");
  const urlIndex = tableRows[0]?.findIndex((value) => value === "URL");
  const issue =
    metadataRows.find((row) => row[0] === "Issue")?.[1] ||
    path.basename(filePath);

  if (urlIndex == null || urlIndex < 0) {
    throw new Error(`Could not find URL column in ${filePath}`);
  }

  return {
    issue,
    urls: tableRows.slice(1).map((row) => row[urlIndex]).filter(Boolean),
  };
}

function readRedirectSources(filePath = redirectsPath) {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }

  const redirects = new Map();
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const [source, target, status = "301"] = trimmed.split(/\s+/);
    redirects.set(source, { target, status });
  }

  return redirects;
}

function isStaticAsset(pathname) {
  return /\.[a-z0-9]+$/i.test(pathname);
}

function sitemapUrlFor(rawUrl) {
  const url = new URL(rawUrl);
  return `${siteOrigin}${url.pathname}`;
}

function sitemapUrlVariantsFor(rawUrl) {
  const url = new URL(rawUrl);
  const pathname = url.pathname;

  if (pathname === "/" || isStaticAsset(pathname)) {
    return new Set([sitemapUrlFor(rawUrl)]);
  }

  const withoutSlash = pathname.replace(/\/$/, "");
  return new Set([
    `${siteOrigin}${withoutSlash}`,
    `${siteOrigin}${withoutSlash}/`,
  ]);
}

function parseSitemapUrls(xml) {
  return new Set(
    [...String(xml || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, rawUrl]) =>
      decodeXml(rawUrl),
    ),
  );
}

function readLocalSitemapUrls(filePath = path.join(buildDir, "sitemap.xml")) {
  if (!fs.existsSync(filePath)) {
    return new Set();
  }

  return parseSitemapUrls(fs.readFileSync(filePath, "utf8"));
}

function readLocalRobotsTxt() {
  const buildRobotsPath = path.join(buildDir, "robots.txt");
  const staticRobotsPath = path.join(siteDir, "static", "robots.txt");
  const filePath = fs.existsSync(buildRobotsPath) ? buildRobotsPath : staticRobotsPath;
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function normalizeRobotsPath(value) {
  const pathValue = String(value || "").trim();
  if (!pathValue || pathValue === "/") {
    return pathValue;
  }

  return pathValue.replace(/\*.*$/, "");
}

function getRobotsGroups(robotsTxt) {
  const groups = [];
  let currentGroup = null;

  for (const rawLine of String(robotsTxt || "").split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) {
      continue;
    }

    const [, field, rawValue = ""] = line.match(/^([^:]+):\s*(.*)$/) || [];
    if (!field) {
      continue;
    }

    const key = field.toLowerCase();
    const value = rawValue.trim();
    if (key === "user-agent") {
      if (!currentGroup || currentGroup.rules.length > 0) {
        currentGroup = { agents: [], rules: [] };
        groups.push(currentGroup);
      }
      currentGroup.agents.push(value.toLowerCase());
      continue;
    }

    if ((key === "allow" || key === "disallow") && currentGroup) {
      currentGroup.rules.push({ directive: key, path: normalizeRobotsPath(value) });
    }
  }

  return groups;
}

function robotsAgentMatches(agentToken, userAgent) {
  return agentToken === "*" || userAgent.toLowerCase().includes(agentToken);
}

function isPathBlockedByRobots(robotsTxt, pathname, userAgent = "Googlebot") {
  const matchingGroups = getRobotsGroups(robotsTxt).filter((group) =>
    group.agents.some((agentToken) => robotsAgentMatches(agentToken, userAgent)),
  );
  const specificGroups = matchingGroups.filter((group) =>
    group.agents.some((agentToken) => agentToken !== "*"),
  );
  const matchingRules = (specificGroups.length > 0 ? specificGroups : matchingGroups)
    .flatMap((group) => group.rules)
    .filter((rule) => rule.path && pathname.startsWith(rule.path));

  if (matchingRules.length === 0) {
    return false;
  }

  matchingRules.sort((left, right) => {
    const lengthDelta = right.path.length - left.path.length;
    if (lengthDelta !== 0) {
      return lengthDelta;
    }

    return left.directive === "allow" ? -1 : 1;
  });

  return matchingRules[0].directive === "disallow";
}

function extractHtmlAttr(tag, attrName) {
  const match = tag.match(new RegExp(`\\b${attrName}=["']([^"']+)["']`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function extractCanonicalUrl(html) {
  const tag = String(html || "").match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ||
    String(html || "").match(/<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i)?.[0];
  return tag ? extractHtmlAttr(tag, "href") : "";
}

function extractMetaRobots(html) {
  const tag = String(html || "").match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0] ||
    String(html || "").match(/<meta\b[^>]*content=["'][^"']+["'][^>]*name=["']robots["'][^>]*>/i)?.[0];
  return tag ? extractHtmlAttr(tag, "content") : "";
}

function hasNoindexSignal(signals) {
  return [signals.metaRobots, signals.xRobotsTag]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes("noindex"));
}

function buildPathForPathname(pathname) {
  const relativePath = pathname.replace(/^\//, "");
  if (pathname === "/") {
    return path.join(buildDir, "index.html");
  }

  if (pathname.endsWith("/")) {
    return path.join(buildDir, relativePath, "index.html");
  }

  if (isStaticAsset(pathname)) {
    return path.join(buildDir, relativePath);
  }

  return path.join(buildDir, relativePath, "index.html");
}

function buildPathExists(pathname) {
  return fs.existsSync(buildPathForPathname(pathname));
}

function pathnameFromUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.host !== siteHost || !["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Unexpected Search Console origin: ${rawUrl}`);
  }

  return url.pathname;
}

function localRedirectTarget(target) {
  const url = target.startsWith("http://") || target.startsWith("https://")
    ? new URL(target)
    : new URL(target, siteOrigin);

  return {
    external: url.host !== siteHost,
    href: url.toString(),
    pathname: url.pathname,
  };
}

function resolveLocalUrl(rawUrl, options = {}) {
  const redirects = options.redirects || readRedirectSources();
  const pathExists = options.pathExists || buildPathExists;
  const maxRedirects = options.maxRedirects || defaultMaxRedirects;
  const chain = [];
  const seen = new Set();
  let pathname = pathnameFromUrl(rawUrl);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const redirect = redirects.get(pathname);

    if (!redirect && pathExists(pathname)) {
      return {
        ok: true,
        outcome: chain.length > 0 ? "redirected" : "ok",
        initialStatus: chain.length > 0 ? Number(chain[0].status) || 301 : 200,
        finalStatus: 200,
        finalUrl: `${siteOrigin}${pathname}`,
        chain,
      };
    }

    if (!redirect) {
      return {
        ok: false,
        outcome: "not-found",
        initialStatus: chain.length > 0 ? Number(chain[0].status) || 301 : 404,
        finalStatus: 404,
        finalUrl: `${siteOrigin}${pathname}`,
        chain,
      };
    }

    if (redirectCount === maxRedirects) {
      return {
        ok: false,
        outcome: "too-many-redirects",
        initialStatus: Number(chain[0]?.status || redirect.status) || 301,
        finalStatus: "redirect-limit",
        finalUrl: `${siteOrigin}${pathname}`,
        chain,
      };
    }

    const target = localRedirectTarget(redirect.target);
    chain.push({
      source: pathname,
      status: redirect.status || "301",
      target: target.external ? target.href : target.pathname,
    });

    if (target.external) {
      return {
        ok: false,
        outcome: "external-redirect",
        initialStatus: Number(chain[0].status) || 301,
        finalStatus: "external",
        finalUrl: target.href,
        chain,
      };
    }

    if (seen.has(target.pathname)) {
      return {
        ok: false,
        outcome: "redirect-loop",
        initialStatus: Number(chain[0].status) || 301,
        finalStatus: "loop",
        finalUrl: `${siteOrigin}${target.pathname}`,
        chain,
      };
    }

    seen.add(pathname);
    pathname = target.pathname;
  }

  throw new Error("Unreachable local URL resolution state");
}

function urlAtOrigin(rawUrl, origin) {
  const source = new URL(rawUrl);
  const target = new URL(origin);
  target.pathname = source.pathname;
  target.search = source.search;
  target.hash = "";
  return target.toString();
}

function requestWithMethod(urlString, method, timeoutMs = defaultTimeoutMs) {
  return new Promise((resolve) => {
    const url = new URL(urlString);
    const client = url.protocol === "http:" ? http : https;
    const request = client.request(
      url,
      {
        method,
        timeout: timeoutMs,
        headers: {
          "User-Agent": "qf-api-docs-search-console-audit/1.0",
        },
      },
      (response) => {
        response.resume();
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          location: response.headers.location || null,
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("Request timed out"));
    });
    request.on("error", (error) => {
      resolve({ error: error.message || String(error) });
    });
    request.end();
  });
}

function requestHead(urlString, timeoutMs = defaultTimeoutMs) {
  return requestWithMethod(urlString, "HEAD", timeoutMs);
}

function requestGet(urlString, timeoutMs = defaultTimeoutMs) {
  return requestWithMethod(urlString, "GET", timeoutMs);
}

function decodeResponseBody(buffer, encoding) {
  if (encoding === "gzip") {
    return zlib.gunzipSync(buffer).toString("utf8");
  }

  if (encoding === "br") {
    return zlib.brotliDecompressSync(buffer).toString("utf8");
  }

  if (encoding === "deflate") {
    return zlib.inflateSync(buffer).toString("utf8");
  }

  return buffer.toString("utf8");
}

function requestContent(urlString, timeoutMs = defaultTimeoutMs) {
  return new Promise((resolve) => {
    const url = new URL(urlString);
    const client = url.protocol === "http:" ? http : https;
    const request = client.request(
      url,
      {
        method: "GET",
        timeout: timeoutMs,
        headers: {
          "Accept-Encoding": "gzip, br, deflate",
          "User-Agent": "qf-api-docs-search-console-audit/1.0",
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          try {
            resolve({
              body: decodeResponseBody(
                Buffer.concat(chunks),
                response.headers["content-encoding"],
              ),
              headers: response.headers,
              statusCode: response.statusCode,
            });
          } catch (error) {
            resolve({ error: error.message || String(error) });
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("Request timed out"));
    });
    request.on("error", (error) => {
      resolve({ error: error.message || String(error) });
    });
    request.end();
  });
}

async function resolveHttpUrl(rawUrl, options = {}) {
  const origin = options.origin || siteOrigin;
  const maxRedirects = options.maxRedirects || defaultMaxRedirects;
  const timeoutMs = options.timeoutMs || defaultTimeoutMs;
  const headRequest = options.requestHead || requestHead;
  const getRequest = options.requestGet || requestGet;
  const chain = [];
  const seen = new Set();
  let currentUrl = urlAtOrigin(rawUrl, origin);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    let response = await headRequest(currentUrl, timeoutMs);
    if (response.error) {
      return {
        ok: false,
        outcome: "request-error",
        initialStatus: chain[0]?.status || "error",
        finalStatus: "error",
        finalUrl: currentUrl,
        error: response.error,
        chain,
      };
    }

    if (response.statusCode === 405 || response.statusCode === 501) {
      response = await getRequest(currentUrl, timeoutMs);
      if (response.error) {
        return {
          ok: false,
          outcome: "request-error",
          initialStatus: chain[0]?.status || "error",
          finalStatus: "error",
          finalUrl: currentUrl,
          error: response.error,
          chain,
        };
      }
    }

    const status = response.statusCode;
    if (status === 200) {
      return {
        ok: true,
        outcome: chain.length > 0 ? "redirected" : "ok",
        initialStatus: chain[0]?.status || status,
        finalStatus: status,
        finalUrl: currentUrl,
        chain,
      };
    }

    if (status >= 300 && status < 400 && response.location) {
      if (redirectCount === maxRedirects) {
        return {
          ok: false,
          outcome: "too-many-redirects",
          initialStatus: chain[0]?.status || status,
          finalStatus: "redirect-limit",
          finalUrl: currentUrl,
          chain,
        };
      }

      const nextUrl = new URL(response.location, currentUrl).toString();
      chain.push({
        source: currentUrl,
        status,
        target: nextUrl,
      });

      if (seen.has(nextUrl)) {
        return {
          ok: false,
          outcome: "redirect-loop",
          initialStatus: chain[0].status,
          finalStatus: "loop",
          finalUrl: nextUrl,
          chain,
        };
      }

      seen.add(currentUrl);
      currentUrl = nextUrl;
      continue;
    }

    return {
      ok: false,
      outcome: status >= 300 && status < 400 ? "redirect-without-location" : "bad-status",
      initialStatus: chain[0]?.status || status,
      finalStatus: status,
      finalUrl: currentUrl,
      chain,
    };
  }

  throw new Error("Unreachable HTTP URL resolution state");
}

function readLocalIndexSignals(finalUrl) {
  const pathname = new URL(finalUrl).pathname;
  if (isStaticAsset(pathname)) {
    return { contentType: "", canonical: "", metaRobots: "", xRobotsTag: "" };
  }

  const filePath = buildPathForPathname(pathname);
  if (!fs.existsSync(filePath)) {
    return { contentType: "", canonical: "", metaRobots: "", xRobotsTag: "" };
  }

  const html = fs.readFileSync(filePath, "utf8");
  return {
    canonical: extractCanonicalUrl(html),
    contentType: "text/html",
    metaRobots: extractMetaRobots(html),
    xRobotsTag: "",
  };
}

async function readLiveIndexSignals(finalUrl, options = {}) {
  const contentRequest = options.requestContent || requestContent;
  const response = await contentRequest(finalUrl, options.timeoutMs || defaultTimeoutMs);
  if (response.error) {
    return { error: response.error };
  }

  const body = response.body || "";
  return {
    canonical: extractCanonicalUrl(body),
    contentType: response.headers?.["content-type"] || "",
    metaRobots: extractMetaRobots(body),
    xRobotsTag: response.headers?.["x-robots-tag"] || "",
  };
}

async function readLiveSitemapUrls(options = {}) {
  const contentRequest = options.requestContent || requestContent;
  const origin = options.origin || siteOrigin;
  const response = await contentRequest(`${origin}/sitemap.xml`, options.timeoutMs);
  if (response.error || response.statusCode !== 200) {
    return new Set();
  }

  return parseSitemapUrls(response.body);
}

async function readLiveRobotsTxt(options = {}) {
  const contentRequest = options.requestContent || requestContent;
  const origin = options.origin || siteOrigin;
  const response = await contentRequest(`${origin}/robots.txt`, options.timeoutMs);
  if (response.error || response.statusCode !== 200) {
    return "";
  }

  return response.body || "";
}

function shouldExpectSitemapEntry(finalUrl, signals) {
  const pathname = new URL(finalUrl).pathname;
  if (isStaticAsset(pathname)) {
    return false;
  }

  return !signals.contentType || signals.contentType.includes("text/html");
}

function failIndexability(result, outcome, diagnostics) {
  return {
    ...result,
    diagnostics,
    ok: false,
    outcome,
  };
}

async function applySearchConsoleIssueChecks(rawUrl, issue, result, context, options = {}) {
  if (!result.ok) {
    return result;
  }

  const mode = options.mode || "local";
  const finalUrl = result.finalUrl;
  const finalPathname = new URL(finalUrl).pathname;
  const sourceSitemapUrls = sitemapUrlVariantsFor(rawUrl);
  const finalSitemapUrl = sitemapUrlFor(finalUrl);
  const readSignals = options.readIndexSignals ||
    (mode === "live" ? readLiveIndexSignals : readLocalIndexSignals);
  const signals = isStaticAsset(finalPathname)
    ? { contentType: "", canonical: "", metaRobots: "", xRobotsTag: "" }
    : await readSignals(finalUrl, options);
  const expectSitemapEntry = shouldExpectSitemapEntry(finalUrl, signals);
  const robotsBlocked = isPathBlockedByRobots(context.robotsTxt, finalPathname);
  const matchingSourceSitemapUrls = [...sourceSitemapUrls].filter((url) =>
    context.sitemapUrls.has(url),
  );

  if (result.outcome === "redirected" && matchingSourceSitemapUrls.length > 0) {
    return failIndexability(result, "redirect-source-in-sitemap", {
      sourceSitemapUrls: matchingSourceSitemapUrls,
    });
  }

  if (issue === pageWithRedirectIssue && result.outcome !== "redirected") {
    return failIndexability(result, "expected-redirect", {
      issue,
    });
  }

  if (issue === indexedThoughBlockedIssue) {
    if (robotsBlocked) {
      return failIndexability(result, "blocked-by-robots", {
        finalPathname,
      });
    }

    if (!hasNoindexSignal(signals)) {
      return failIndexability(result, "missing-noindex", {
        finalUrl,
      });
    }

    if (context.sitemapUrls.has(finalSitemapUrl)) {
      return failIndexability(result, "noindex-url-in-sitemap", {
        finalSitemapUrl,
      });
    }

    return result;
  }

  if (robotsBlocked) {
    return failIndexability(result, "blocked-by-robots", {
      finalPathname,
    });
  }

  if (hasNoindexSignal(signals)) {
    return failIndexability(result, "unexpected-noindex", {
      finalUrl,
    });
  }

  if (expectSitemapEntry && !context.sitemapUrls.has(finalSitemapUrl)) {
    return failIndexability(result, "final-url-not-in-sitemap", {
      finalSitemapUrl,
    });
  }

  if (expectSitemapEntry) {
    if (!signals.canonical) {
      return failIndexability(result, "missing-canonical", {
        finalUrl,
      });
    }

    let canonicalUrl;
    try {
      canonicalUrl = new URL(signals.canonical);
    } catch {
      return failIndexability(result, "invalid-canonical", {
        canonical: signals.canonical,
      });
    }

    if (canonicalUrl.origin !== siteOrigin) {
      return failIndexability(result, "canonical-host-mismatch", {
        canonical: signals.canonical,
      });
    }

    if (signals.canonical !== finalSitemapUrl) {
      return failIndexability(result, "canonical-url-mismatch", {
        canonical: signals.canonical,
        expected: finalSitemapUrl,
      });
    }
  }

  return result;
}

async function mapLimit(items, limit, iteratee) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await iteratee(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

function summarizeResults(results) {
  const counts = new Map();
  for (const result of results) {
    const key = result.ok ? result.outcome : `failed:${result.outcome}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Object.fromEntries([...counts.entries()].sort());
}

function formatFailure(rawUrl, result) {
  return {
    url: rawUrl,
    outcome: result.outcome,
    initialStatus: result.initialStatus,
    finalStatus: result.finalStatus,
    finalUrl: result.finalUrl,
    error: result.error,
    diagnostics: result.diagnostics,
    chain: result.chain,
  };
}

async function auditSearchConsoleExports(files, options = {}) {
  const mode = options.mode || "local";
  const origin = options.origin || siteOrigin;
  const concurrency = options.concurrency || defaultConcurrency;
  const redirects = options.redirects || (mode === "local" ? readRedirectSources() : null);
  const context = {
    robotsTxt: options.robotsTxt ||
      (mode === "live" ? await readLiveRobotsTxt(options) : readLocalRobotsTxt()),
    sitemapUrls: options.sitemapUrls ||
      (mode === "live" ? await readLiveSitemapUrls(options) : readLocalSitemapUrls()),
  };
  const reports = [];
  let failedUrls = 0;

  for (const filePath of files) {
    const { issue, urls } = readSearchConsoleExport(filePath);
    const uniqueUrls = [...new Set(urls)];
    const resolver =
      mode === "live"
        ? (rawUrl) => resolveHttpUrl(rawUrl, options)
        : (rawUrl) => resolveLocalUrl(rawUrl, { ...options, redirects });
    const results = await mapLimit(
      uniqueUrls,
      mode === "live" ? concurrency : 1,
      async (rawUrl) =>
        applySearchConsoleIssueChecks(
          rawUrl,
          issue,
          await resolver(rawUrl),
          context,
          options,
        ),
    );
    const failures = results
      .map((result, index) => ({ result, rawUrl: uniqueUrls[index] }))
      .filter(({ result }) => !result.ok)
      .map(({ result, rawUrl }) => formatFailure(rawUrl, result));

    failedUrls += failures.length;
    reports.push({
      file: path.basename(filePath),
      issue,
      mode,
      origin: mode === "live" ? origin : undefined,
      total: urls.length,
      unique: uniqueUrls.length,
      counts: summarizeResults(results),
      failures: failures.slice(0, 20),
      failureCount: failures.length,
    });
  }

  return { reports, failedUrls };
}

function parsePositiveIntegerOption(name, rawValue) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}

function parseHttpOriginOption(name, rawValue) {
  let url;
  try {
    url = new URL(rawValue);
  } catch {
    throw new Error(`${name} must be an http(s) URL origin`);
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must be an http(s) URL origin`);
  }

  return url.origin;
}

function parseArgs(argv) {
  const options = {
    mode: "local",
    origin: siteOrigin,
    timeoutMs: defaultTimeoutMs,
    maxRedirects: defaultMaxRedirects,
    concurrency: defaultConcurrency,
  };
  const files = [];

  for (const arg of argv) {
    if (arg === "--mode=local" || arg === "--local") {
      options.mode = "local";
    } else if (arg === "--mode=live" || arg === "--live") {
      options.mode = "live";
    } else if (arg.startsWith("--origin=")) {
      options.origin = parseHttpOriginOption(
        "--origin",
        arg.slice("--origin=".length),
      );
    } else if (arg.startsWith("--timeout-ms=")) {
      options.timeoutMs = parsePositiveIntegerOption(
        "--timeout-ms",
        arg.slice("--timeout-ms=".length),
      );
    } else if (arg.startsWith("--max-redirects=")) {
      options.maxRedirects = parsePositiveIntegerOption(
        "--max-redirects",
        arg.slice("--max-redirects=".length),
      );
    } else if (arg.startsWith("--concurrency=")) {
      options.concurrency = parsePositiveIntegerOption(
        "--concurrency",
        arg.slice("--concurrency=".length),
      );
    } else {
      files.push(arg);
    }
  }

  if (!["local", "live"].includes(options.mode)) {
    throw new Error(`Unsupported audit mode: ${options.mode}`);
  }

  if (files.length === 0) {
    throw new Error(
      "Usage: node scripts/audit-search-console-coverage.js [--mode=local|live] [--origin=https://...] <export.xlsx> [...]",
    );
  }

  return { options, files };
}

async function main() {
  const { options, files } = parseArgs(process.argv.slice(2));
  const { reports, failedUrls } = await auditSearchConsoleExports(files, options);
  for (const report of reports) {
    console.log(JSON.stringify(report, null, 2));
  }

  if (failedUrls > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  auditSearchConsoleExports,
  buildPathForPathname,
  buildPathExists,
  applySearchConsoleIssueChecks,
  formatFailure,
  hasNoindexSignal,
  isPathBlockedByRobots,
  parseArgs,
  parseSitemapUrls,
  pathnameFromUrl,
  readRedirectSources,
  readSearchConsoleExport,
  resolveHttpUrl,
  resolveLocalUrl,
  sitemapUrlFor,
  sitemapUrlVariantsFor,
};
