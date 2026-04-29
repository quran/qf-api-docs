'use strict';

/**
 * Docusaurus plugin: generates /llms.txt from the docs/ source files at build time.
 *
 * Runs in the postBuild hook so the output file in the build directory is always
 * up to date, regardless of what is committed to static/llms.txt.
 *
 * The static/llms.txt file is kept as a fallback for the dev server and as a
 * human-readable reference, but the deployed copy is always freshly generated.
 */

const fs = require('fs');
const path = require('path');
const { exportMarkdownFiles } = require('../src/build-markdown.cjs');

const BASE_URL = 'https://api-docs.quran.foundation';

const SECTION_ORDER = [
  'Getting Started',
  'JavaScript SDK',
  'Content APIs v4',
  'User-Related APIs v1',
  'User-Related APIs v1 (Pre-live)',
  'OAuth2 APIs v1',
  'Search APIs v1',
  'Tutorials',
];

const URL_PRIORITY = [
  `${BASE_URL}/docs/developer-journey`,
  `${BASE_URL}/docs/tutorials/oidc/starter-with-npx`,
  `${BASE_URL}/docs/sdk/javascript`,
  `${BASE_URL}/docs/sdk/javascript/app-shapes`,
  `${BASE_URL}/docs/sdk/javascript/runtime-matrix`,
  `${BASE_URL}/docs/sdk/javascript/auth-matrix`,
  `${BASE_URL}/docs/sdk/javascript/entrypoint-matrix`,
  `${BASE_URL}/docs/sdk/javascript/apis-by-runtime`,
  `${BASE_URL}/docs/sdk/javascript/server-quickstart`,
  `${BASE_URL}/docs/sdk/javascript/public-quickstart`,
  `${BASE_URL}/docs/sdk/javascript/full-stack`,
  `${BASE_URL}/docs/sdk/javascript/common-errors`,
  `${BASE_URL}/docs/sdk/javascript/migration-cheat-sheet`,
  `${BASE_URL}/docs/tutorials/oidc/user-apis-quickstart`,
  `${BASE_URL}/docs/tutorials/oidc/getting-started-with-oauth2`,
];

// Directories to skip during the docs walk
const VERSIONED_DIR_RE = /^\d+\.\d+\.\d+$/;

const OPENAPI_HEADER = [
  '# Quran Foundation API',
  '',
  '> API documentation for Quran.com content, search, user, and authentication APIs.',
  '',
  '## OpenAPI Specifications',
  '',
  '- [Content APIs v4](https://api-docs.quran.foundation/openAPI/content/v4.json): Verses, chapters, translations, tafsirs, audio',
  '- [User APIs v1 (Production)](https://api-docs.quran.foundation/openAPI/user-related-apis/v1.json): Stable production documentation for bookmarks, collections, notes, profiles, rooms, posts',
  '- [User APIs v1 (Pre-live)](https://api-docs.quran.foundation/openAPI/user-related-apis/pre-live/v1.json): Upcoming pre-live documentation for unreleased user API changes',
  '- [OAuth2 APIs v1](https://api-docs.quran.foundation/openAPI/oauth2-apis/v1.json): Authentication and authorization',
  '- [Search APIs v1](https://api-docs.quran.foundation/openAPI/search/v1.json): Quran text search',
  '',
  '## Agent Prompts and Starters',
  '',
  '- [QF_NPX_STARTER_PROMPT_V1](https://api-docs.quran.foundation/agent-prompts/qf-next-starter.md): Copyable prompt for the official Next.js starter app',
  '- [Agent prompt registry](https://api-docs.quran.foundation/.well-known/agent-prompts/index.json): Machine-readable prompt catalog',
  '- [Developer Journey](https://api-docs.quran.foundation/docs/developer-journey/): Choose the right starting point by app shape',
  '- [Starter With NPX](https://api-docs.quran.foundation/docs/tutorials/oidc/starter-with-npx/): One-command Next.js app scaffold',
  '- [JavaScript SDK](https://api-docs.quran.foundation/docs/sdk/javascript/): Runtime-split SDK guidance for public and server code',
  '',
].join('\n');

/** Parse a minimal subset of YAML front matter (key: value pairs only). */
function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)/);
    if (!m) continue;
    let val = m[2].trim();
    // Strip surrounding single or double quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    fm[m[1]] = val;
  }
  return fm;
}

/** Extract the page title from front matter or the first H1 heading. */
function getTitle(fm, content, relpath) {
  if (fm.title) return fm.title;
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return path.basename(relpath, path.extname(relpath));
}

/**
 * Compute the public URL for a doc file.
 *
 * Respects explicit `slug` front matter; otherwise derives the URL from the
 * file path, stripping versioned API suffixes (.api.mdx, .info.mdx, .tag.mdx)
 * and collapsing index files to their parent directory path.
 */
function getUrl(relpath, fm) {
  if (fm.slug) {
    const slug = fm.slug.startsWith('/') ? fm.slug : `/${fm.slug}`;
    const normalizedSlug =
      slug === '/docs' || slug.startsWith('/docs/') ? slug : `/docs${slug}`;
    return `${BASE_URL}${normalizedSlug}`;
  }
  // Strip .api.mdx / .info.mdx / .tag.mdx / .mdx / .md
  let rel = relpath.replace(/(?:\.(api|info|tag))?\.mdx?$/, '');
  // Collapse index files to their parent directory
  if (rel.endsWith('/index')) {
    rel = rel.slice(0, -6);
  } else if (rel === 'index') {
    rel = '';
  }
  return rel ? `${BASE_URL}/docs/${rel}` : `${BASE_URL}/docs`;
}

/** Map a docs-relative file path to one of the known sections. */
function getSection(relpath) {
  if (relpath.startsWith('content_apis_versioned/')) return 'Content APIs v4';
  if (relpath.startsWith('user_related_apis_prelive/')) {
    return 'User-Related APIs v1 (Pre-live)';
  }
  if (
    relpath.startsWith('user_related_apis_versioned/') ||
    relpath.startsWith('user-related-apis/')
  )
    return 'User-Related APIs v1';
  if (relpath.startsWith('oauth2_apis_versioned/')) return 'OAuth2 APIs v1';
  if (relpath.startsWith('search_apis_versioned/')) return 'Search APIs v1';
  if (relpath.startsWith('tutorials/')) return 'Tutorials';
  if (relpath.startsWith('sdk/')) return 'JavaScript SDK';
  return 'Getting Started';
}

/**
 * Recursively walk a directory and return { relpath, fullpath } for every
 * .md/.mdx file, skipping:
 *   - versioned snapshot directories (e.g. 1.0.0, 4.0.0)
 *   - partial/include files that start with _
 *   - hidden directories
 */
function walkDocs(dir, relBase) {
  const results = [];
  for (const entry of fs.readdirSync(dir).sort()) {
    const fullpath = path.join(dir, entry);
    const relpath = relBase ? `${relBase}/${entry}` : entry;
    const stat = fs.statSync(fullpath);
    if (stat.isDirectory()) {
      if (
        VERSIONED_DIR_RE.test(entry) ||
        entry.startsWith('_') ||
        entry.startsWith('.')
      ) {
        continue;
      }
      results.push(...walkDocs(fullpath, relpath));
    } else if (/\.(md|mdx)$/.test(entry) && !entry.startsWith('_')) {
      results.push({ relpath, fullpath });
    }
  }
  return results;
}

/** Generate the full llms.txt content from the docs/ directory. */
function generateLlmsTxt(docsDir) {
  const files = walkDocs(docsDir, '');

  // Group entries by section
  /** @type {Record<string, Array<{title: string, url: string}>>} */
  const sections = Object.fromEntries(SECTION_ORDER.map((s) => [s, []]));

  for (const { relpath, fullpath } of files) {
    const content = fs.readFileSync(fullpath, 'utf8');
    const fm = parseFrontMatter(content);
    const title = getTitle(fm, content, relpath);
    const url = getUrl(relpath, fm);
    const section = getSection(relpath);
    if (sections[section]) {
      sections[section].push({ title, url });
    }
  }

  for (const entries of Object.values(sections)) {
    entries.sort((left, right) => {
      const leftPriority = URL_PRIORITY.indexOf(left.url);
      const rightPriority = URL_PRIORITY.indexOf(right.url);

      if (leftPriority !== -1 || rightPriority !== -1) {
        return (
          (leftPriority === -1 ? Number.MAX_SAFE_INTEGER : leftPriority) -
          (rightPriority === -1 ? Number.MAX_SAFE_INTEGER : rightPriority)
        );
      }

      return left.title.localeCompare(right.title);
    });
  }

  const lines = [OPENAPI_HEADER];
  let linkCount = 0;

  for (const sectionName of SECTION_ORDER) {
    const entries = sections[sectionName];
    if (!entries || entries.length === 0) continue;
    lines.push(`## ${sectionName}\n`);
    for (const { title, url } of entries) {
      lines.push(`- [${title}](${url})`);
      linkCount++;
    }
    lines.push('');
  }

  return { content: lines.join('\n'), linkCount };
}

/**
 * Recursively copy srcDir into destDir, creating subdirectories as needed.
 * Existing files in destDir are overwritten.
 */
function copyDirSync(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** @type {import('@docusaurus/types').PluginModule} */
function llmsTxtPlugin(context) {
  return {
    name: 'llms-txt-plugin',

    /**
     * During `yarn start` (dev server), serve the source openAPI/ directory
     * at /openAPI/ so the JSON specs are accessible without a separate copy.
     */
    configureWebpack(_config, isServer) {
      if (isServer) return {};
      return {
        devServer: {
          static: [
            {
              directory: path.join(context.siteDir, 'openAPI'),
              publicPath: '/openAPI',
              watch: true,
            },
          ],
        },
      };
    },

    async postBuild({ outDir }) {
      // 1. Copy OpenAPI source specs into the build output so deployed JSON is
      //    always freshly sourced from openAPI/ and cannot diverge.
      const srcOpenApiDir = path.join(context.siteDir, 'openAPI');
      const destOpenApiDir = path.join(outDir, 'openAPI');
      copyDirSync(srcOpenApiDir, destOpenApiDir);
      console.log(
        `[llms-txt-plugin] Copied ${srcOpenApiDir} → ${destOpenApiDir}`,
      );

      // 2. Generate llms.txt from the current docs/ source tree.
      const docsDir = path.join(context.siteDir, 'docs');
      const { content, linkCount } = generateLlmsTxt(docsDir);
      const outFile = path.join(outDir, 'llms.txt');
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(
        `[llms-txt-plugin] Generated ${outFile} with ${linkCount} links`,
      );

      // 3. Emit markdown siblings for every generated HTML page so Cloudflare
      //    Pages middleware can negotiate `Accept: text/markdown` without
      //    changing the default HTML experience for browsers.
      const exportedCount = exportMarkdownFiles(outDir);
      console.log(
        `[llms-txt-plugin] Generated ${exportedCount} markdown page variants`,
      );
    },
  };
}

module.exports = llmsTxtPlugin;
module.exports.generateLlmsTxt = generateLlmsTxt;
