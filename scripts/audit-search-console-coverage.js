#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const { shouldDropSitemapPath } = require("./postbuild-seo.js");

const siteDir = path.resolve(__dirname, "..");
const buildDir = path.join(siteDir, "build");
const redirectsPath = path.join(buildDir, "_redirects");
const sitemapPath = path.join(buildDir, "sitemap.xml");
const siteOrigin = "https://api-docs.quran.foundation";
const siteHost = new URL(siteOrigin).host;

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

function readRedirectSources() {
  if (!fs.existsSync(redirectsPath)) {
    return new Map();
  }

  const redirects = new Map();
  for (const line of fs.readFileSync(redirectsPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const [source, target, status] = trimmed.split(/\s+/);
    redirects.set(source, { target, status });
  }

  return redirects;
}

function readSitemapPaths() {
  if (!fs.existsSync(sitemapPath)) {
    return new Set();
  }

  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  return new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, rawUrl]) => new URL(rawUrl).pathname,
    ),
  );
}

function buildPathExists(pathname) {
  const relativePath = pathname.replace(/^\//, "");
  const candidate = pathname.endsWith("/")
    ? path.join(buildDir, relativePath, "index.html")
    : path.extname(pathname)
      ? path.join(buildDir, relativePath)
      : path.join(buildDir, relativePath, "index.html");

  return fs.existsSync(candidate);
}

function pathnameFromUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.host !== siteHost || !["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Unexpected Search Console origin: ${rawUrl}`);
  }

  return url.pathname;
}

function classify(pathname, issue, redirects, sitemapPaths) {
  if (redirects.has(pathname)) {
    return "redirected";
  }

  if (/\/auth-[a-z0-9-]+\/?$/i.test(pathname)) {
    return issue === "Not found (404)" ? "unresolved-404" : "manual-review";
  }

  if (issue === "Not found (404)") {
    return "unresolved-404";
  }

  if (shouldDropSitemapPath(pathname)) {
    return "canonicalized-alternate";
  }

  if (sitemapPaths.has(pathname)) {
    return "valid-self-canonical";
  }

  if (buildPathExists(pathname)) {
    return "valid-static-resource";
  }

  return "manual-review";
}

function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    throw new Error("Usage: node scripts/audit-search-console-coverage.js <export.xlsx> [...]");
  }

  const redirects = readRedirectSources();
  const sitemapPaths = readSitemapPaths();
  let unresolvedCount = 0;

  for (const filePath of files) {
    const { issue, urls } = readSearchConsoleExport(filePath);
    const counts = new Map();
    const examples = [];

    for (const rawUrl of urls) {
      const pathname = pathnameFromUrl(rawUrl);
      const classification = classify(pathname, issue, redirects, sitemapPaths);
      counts.set(classification, (counts.get(classification) || 0) + 1);
      if (
        (classification === "unresolved-404" || classification === "manual-review") &&
        examples.length < 8
      ) {
        examples.push(pathname);
      }
    }

    unresolvedCount += counts.get("unresolved-404") || 0;

    console.log(
      JSON.stringify(
        {
          file: path.basename(filePath),
          issue,
          total: urls.length,
          counts: Object.fromEntries([...counts.entries()].sort()),
          examples,
        },
        null,
        2,
      ),
    );
  }

  if (unresolvedCount > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
