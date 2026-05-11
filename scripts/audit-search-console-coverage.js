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

  return path.join(buildDir, `${relativePath}.html`);
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

  if (url.host !== siteHost) {
    throw new Error(`Cannot resolve external redirect locally: ${target}`);
  }

  return url.pathname;
}

function resolveLocalUrl(rawUrl, options = {}) {
  const redirects = options.redirects || readRedirectSources();
  const pathExists = options.pathExists || buildPathExists;
  const maxRedirects = options.maxRedirects || defaultMaxRedirects;
  const chain = [];
  const seen = new Set();
  let pathname = pathnameFromUrl(rawUrl);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    if (pathExists(pathname)) {
      return {
        ok: true,
        outcome: chain.length > 0 ? "redirected" : "ok",
        initialStatus: chain.length > 0 ? Number(chain[0].status) || 301 : 200,
        finalStatus: 200,
        finalUrl: `${siteOrigin}${pathname}`,
        chain,
      };
    }

    const redirect = redirects.get(pathname);
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

    const targetPathname = localRedirectTarget(redirect.target);
    chain.push({
      source: pathname,
      status: redirect.status || "301",
      target: targetPathname,
    });

    if (seen.has(targetPathname)) {
      return {
        ok: false,
        outcome: "redirect-loop",
        initialStatus: Number(chain[0].status) || 301,
        finalStatus: "loop",
        finalUrl: `${siteOrigin}${targetPathname}`,
        chain,
      };
    }

    seen.add(pathname);
    pathname = targetPathname;
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

function requestHead(urlString, timeoutMs = defaultTimeoutMs) {
  return new Promise((resolve) => {
    const url = new URL(urlString);
    const client = url.protocol === "http:" ? http : https;
    const request = client.request(
      url,
      {
        method: "HEAD",
        timeout: timeoutMs,
        headers: {
          "User-Agent": "qf-api-docs-search-console-audit/1.0",
        },
      },
      (response) => {
        response.resume();
        resolve({
          statusCode: response.statusCode,
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

async function resolveHttpUrl(rawUrl, options = {}) {
  const origin = options.origin || siteOrigin;
  const maxRedirects = options.maxRedirects || defaultMaxRedirects;
  const timeoutMs = options.timeoutMs || defaultTimeoutMs;
  const request = options.requestHead || requestHead;
  const chain = [];
  const seen = new Set();
  let currentUrl = urlAtOrigin(rawUrl, origin);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await request(currentUrl, timeoutMs);
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
    chain: result.chain,
  };
}

async function auditSearchConsoleExports(files, options = {}) {
  const mode = options.mode || "local";
  const origin = options.origin || siteOrigin;
  const concurrency = options.concurrency || defaultConcurrency;
  const redirects = options.redirects || (mode === "local" ? readRedirectSources() : null);
  const reports = [];
  let failedUrls = 0;

  for (const filePath of files) {
    const { issue, urls } = readSearchConsoleExport(filePath);
    const uniqueUrls = [...new Set(urls)];
    const resolver =
      mode === "live"
        ? (rawUrl) => resolveHttpUrl(rawUrl, options)
        : (rawUrl) => resolveLocalUrl(rawUrl, { ...options, redirects });
    const results = await mapLimit(uniqueUrls, mode === "live" ? concurrency : 1, resolver);
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
      options.origin = arg.slice("--origin=".length);
    } else if (arg.startsWith("--timeout-ms=")) {
      options.timeoutMs = Number(arg.slice("--timeout-ms=".length));
    } else if (arg.startsWith("--max-redirects=")) {
      options.maxRedirects = Number(arg.slice("--max-redirects=".length));
    } else if (arg.startsWith("--concurrency=")) {
      options.concurrency = Number(arg.slice("--concurrency=".length));
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
  buildPathExists,
  pathnameFromUrl,
  readRedirectSources,
  readSearchConsoleExport,
  resolveHttpUrl,
  resolveLocalUrl,
};
