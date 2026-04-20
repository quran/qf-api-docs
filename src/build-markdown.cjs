const fs = require("fs");
const path = require("path");
const { parseDocument } = require("htmlparser2");
const {
  findOne,
  getAttributeValue,
  getChildren,
  isTag,
  isText,
} = require("domutils");

const BASE_URL = "https://api-docs.quran.foundation";

const SKIPPED_TAGS = new Set([
  "aside",
  "button",
  "form",
  "input",
  "label",
  "nav",
  "noscript",
  "option",
  "script",
  "select",
  "style",
  "svg",
  "textarea",
]);

const SKIPPED_CLASS_PATTERNS = [
  /breadcrumbs/i,
  /buttonGroup/i,
  /copyButton/i,
  /DocSearch/i,
  /hash-link/i,
  /navbar/i,
  /pagination-nav/i,
  /tableOfContents/i,
  /theme-back-to-top-button/i,
  /tocCollapsible/i,
];

function buildMarkdownDocument({ html, sourceUrl }) {
  const document = parseDocument(html, { decodeEntities: true });
  const title = readTitle(document);
  const description = readMetaContent(document, "description");
  const root = findContentRoot(document);
  const content = cleanupMarkdown(
    renderNodes(getChildren(root) || [], {
      listDepth: 0,
      sourceUrl,
    }),
  );

  if (!content) {
    return "";
  }

  const frontMatterLines = ["---"];

  if (title) {
    frontMatterLines.push(`title: ${quoteYaml(title)}`);
  }

  if (sourceUrl) {
    frontMatterLines.push(`source: ${quoteYaml(sourceUrl)}`);
  }

  if (description) {
    frontMatterLines.push(`description: ${quoteYaml(description)}`);
  }

  frontMatterLines.push("---", "");

  return `${frontMatterLines.join("\n")}${content}\n`;
}

function exportMarkdownFiles(outDir) {
  const htmlFiles = walkHtmlFiles(outDir);
  let exportedCount = 0;

  for (const filePath of htmlFiles) {
    const relativeHtmlPath = path.relative(outDir, filePath);
    const markdown = buildMarkdownDocument({
      html: fs.readFileSync(filePath, "utf8"),
      sourceUrl: toPublicUrl(relativeHtmlPath),
    });

    if (!markdown) {
      continue;
    }

    const markdownFilePath = filePath.replace(/\.html$/i, ".md");
    fs.writeFileSync(markdownFilePath, markdown, "utf8");
    exportedCount += 1;
  }

  return exportedCount;
}

function walkHtmlFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function toPublicUrl(relativeHtmlPath) {
  const normalizedPath = relativeHtmlPath.split(path.sep).join("/");

  if (normalizedPath === "index.html") {
    return `${BASE_URL}/`;
  }

  if (normalizedPath.endsWith("/index.html")) {
    return `${BASE_URL}/${normalizedPath.slice(0, -"index.html".length)}`;
  }

  return `${BASE_URL}/${normalizedPath}`;
}

function findContentRoot(document) {
  return (
    findFirstTag(document, "article") ||
    findFirstTag(document, "main") ||
    findFirstTag(document, "body") ||
    document
  );
}

function findFirstTag(document, tagName) {
  return findOne(
    (node) => isTag(node) && node.name === tagName,
    getChildren(document) || [],
    true,
  );
}

function readTitle(document) {
  const titleNode = findFirstTag(document, "title");
  if (!titleNode) {
    return "";
  }

  return cleanupInline(renderNodes(getChildren(titleNode) || [], {})).replace(
    /\s+\|\s+Quran Foundation Documentation Portal$/,
    "",
  );
}

function readMetaContent(document, metaName) {
  const metaNode = findOne(
    (node) =>
      isTag(node) &&
      node.name === "meta" &&
      (getAttributeValue(node, "name") || "").toLowerCase() === metaName,
    getChildren(document) || [],
    true,
  );

  return metaNode ? getAttributeValue(metaNode, "content") || "" : "";
}

function renderNodes(nodes, context) {
  return (nodes || []).map((node) => renderNode(node, context)).join("");
}

function renderNode(node, context) {
  if (isText(node)) {
    return context.inPre
      ? node.data.replace(/\r\n?/g, "\n")
      : normalizeText(node.data);
  }

  if (!isTag(node) || shouldSkipNode(node)) {
    return "";
  }

  switch (node.name) {
    case "a":
      return renderLink(node, context);
    case "blockquote":
      return renderBlockquote(node, context);
    case "br":
      return context.inPre ? "\n" : "  \n";
    case "code":
      return context.inPre ? renderNodes(getChildren(node) || [], context) : renderInlineCode(node);
    case "details":
      return renderDetails(node, context);
    case "dl":
      return renderDescriptionList(node, context);
    case "em":
    case "i":
      return wrapInline("*", renderNodes(getChildren(node) || [], context));
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return renderHeading(node, Number(node.name.slice(1)), context);
    case "hr":
      return "\n---\n\n";
    case "img":
      return renderImage(node, context);
    case "ol":
      return renderList(node, true, context);
    case "p":
      return renderParagraph(node, context);
    case "pre":
      return renderCodeBlock(node, context);
    case "strong":
    case "b":
      return wrapInline("**", renderNodes(getChildren(node) || [], context));
    case "summary":
      return "";
    case "table":
      return renderTable(node, context);
    case "ul":
      return renderList(node, false, context);
    default:
      return renderNodes(getChildren(node) || [], context);
  }
}

function shouldSkipNode(node) {
  if (!isTag(node)) {
    return false;
  }

  if (SKIPPED_TAGS.has(node.name)) {
    return true;
  }

  const className = getAttributeValue(node, "class") || "";
  return SKIPPED_CLASS_PATTERNS.some((pattern) => pattern.test(className));
}

function renderHeading(node, level, context) {
  const text = cleanupInline(renderNodes(getChildren(node) || [], context));
  return text ? `${"#".repeat(level)} ${text}\n\n` : "";
}

function renderParagraph(node, context) {
  const text = cleanupInline(renderNodes(getChildren(node) || [], context));
  return text ? `${text}\n\n` : "";
}

function renderLink(node, context) {
  const text = cleanupInline(renderNodes(getChildren(node) || [], context));
  const href = resolveUrl(getAttributeValue(node, "href"), context.sourceUrl);

  if (!href) {
    return text;
  }

  const label = text || href;
  return `[${label}](${href})`;
}

function renderImage(node, context) {
  const src = resolveUrl(getAttributeValue(node, "src"), context.sourceUrl);
  if (!src) {
    return "";
  }

  const alt = cleanupInline(getAttributeValue(node, "alt") || "");
  return `![${alt}](${src})`;
}

function renderInlineCode(node) {
  const code = cleanupInline(collectText(node, { inPre: true })).replace(/\n+/g, " ");
  if (!code) {
    return "";
  }

  const fence = code.includes("`") ? "``" : "`";
  return `${fence}${code}${fence}`;
}

function renderCodeBlock(node, context) {
  const language = detectCodeLanguage(node);
  const code = collectText(node, { ...context, inPre: true })
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  if (!code.trim()) {
    return "";
  }

  const fence = createCodeFence(code);
  const languageSuffix = language || "";
  return `${fence}${languageSuffix}\n${code}\n${fence}\n\n`;
}

function createCodeFence(code) {
  const backtickRuns = code.match(/`+/g) || [];
  const longestRun = backtickRuns.reduce(
    (maxLength, run) => Math.max(maxLength, run.length),
    0,
  );

  return "`".repeat(Math.max(3, longestRun + 1));
}

function renderList(node, ordered, context) {
  const items = (getChildren(node) || []).filter(
    (child) => isTag(child) && child.name === "li",
  );

  if (items.length === 0) {
    return "";
  }

  return (
    items
      .map((item, index) =>
        renderListItem(item, {
          ...context,
          listDepth: context.listDepth || 0,
          ordered,
          ordinal: index + 1,
        }),
      )
      .join("") + "\n"
  );
}

function renderListItem(node, context) {
  const indent = "  ".repeat(context.listDepth || 0);
  const marker = context.ordered ? `${context.ordinal}. ` : "- ";
  const content = [];
  const nested = [];

  for (const child of getChildren(node) || []) {
    if (isTag(child) && (child.name === "ul" || child.name === "ol")) {
      nested.push(
        renderList(child, child.name === "ol", {
          ...context,
          listDepth: (context.listDepth || 0) + 1,
        }).trimEnd(),
      );
      continue;
    }

    content.push(renderNode(child, context));
  }

  const itemText = cleanupInline(content.join(""));
  const lines = itemText
    ? itemText.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  let markdown = `${indent}${marker}${lines.shift() || ""}\n`;
  for (const line of lines) {
    markdown += `${indent}  ${line}\n`;
  }

  if (nested.length > 0) {
    markdown += `${nested.join("\n")}\n`;
  }

  return markdown;
}

function renderTable(node, context) {
  const rows = [];

  for (const child of getChildren(node) || []) {
    if (!isTag(child)) {
      continue;
    }

    if (child.name === "thead" || child.name === "tbody" || child.name === "tfoot") {
      rows.push(...extractTableRows(child, context));
      continue;
    }

    if (child.name === "tr") {
      rows.push(renderTableRow(child, context));
    }
  }

  const normalizedRows = rows.filter((row) => row.length > 0);
  if (normalizedRows.length === 0) {
    return "";
  }

  const header = normalizedRows[0];
  const divider = header.map(() => "---");
  const bodyRows = normalizedRows.slice(1);

  const markdownRows = [
    `| ${header.join(" | ")} |`,
    `| ${divider.join(" | ")} |`,
    ...bodyRows.map((row) => `| ${row.join(" | ")} |`),
  ];

  return `${markdownRows.join("\n")}\n\n`;
}

function extractTableRows(node, context) {
  return (getChildren(node) || [])
    .filter((child) => isTag(child) && child.name === "tr")
    .map((row) => renderTableRow(row, context));
}

function renderTableRow(node, context) {
  return (getChildren(node) || [])
    .filter((child) => isTag(child) && (child.name === "th" || child.name === "td"))
    .map((cell) =>
      cleanupInline(renderNodes(getChildren(cell) || [], context))
        .replace(/\|/g, "\\|")
        .replace(/\n+/g, " <br> "),
    );
}

function renderBlockquote(node, context) {
  const content = cleanupMarkdown(renderNodes(getChildren(node) || [], context));
  if (!content) {
    return "";
  }

  return `${content
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n")}\n\n`;
}

function renderDetails(node, context) {
  const summaryNode = (getChildren(node) || []).find(
    (child) => isTag(child) && child.name === "summary",
  );
  const summary = summaryNode
    ? cleanupInline(renderNodes(getChildren(summaryNode) || [], context))
    : "";
  const content = cleanupMarkdown(
    renderNodes(
      (getChildren(node) || []).filter((child) => child !== summaryNode),
      context,
    ),
  );

  if (!summary && !content) {
    return "";
  }

  const summaryLine = summary ? `**${summary}**\n\n` : "";
  const contentBlock = content ? `${content}\n\n` : "";
  return `${summaryLine}${contentBlock}`;
}

function renderDescriptionList(node, context) {
  const parts = [];
  let currentTerm = "";

  for (const child of getChildren(node) || []) {
    if (!isTag(child)) {
      continue;
    }

    if (child.name === "dt") {
      currentTerm = cleanupInline(renderNodes(getChildren(child) || [], context));
      continue;
    }

    if (child.name === "dd") {
      const description = cleanupInline(renderNodes(getChildren(child) || [], context));
      if (currentTerm || description) {
        parts.push(`- **${currentTerm || "Item"}**: ${description}`);
      }
    }
  }

  return parts.length > 0 ? `${parts.join("\n")}\n\n` : "";
}

function detectCodeLanguage(node) {
  const candidates = [node, node.parent, node.parent && node.parent.parent].filter(Boolean);

  for (const candidate of candidates) {
    const className = getAttributeValue(candidate, "class") || "";
    const match = className.match(/language-([a-z0-9+-]+)/i);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  return "";
}

function collectText(node, context) {
  if (isText(node)) {
    return context.inPre ? node.data : normalizeText(node.data);
  }

  if (!isTag(node) || shouldSkipNode(node)) {
    return "";
  }

  if (node.name === "br") {
    return "\n";
  }

  return renderNodes(getChildren(node) || [], context);
}

function normalizeText(text) {
  return text.replace(/\u200b/g, "").replace(/\s+/g, " ");
}

function cleanupInline(text) {
  return text.replace(/\u200b/g, "").replace(/\s+/g, " ").trim();
}

function cleanupMarkdown(text) {
  return text
    .replace(/\u200b/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function resolveUrl(value, sourceUrl) {
  if (!value) {
    return "";
  }

  const trimmedValue = value.trim();
  if (!trimmedValue || /^javascript:/i.test(trimmedValue)) {
    return "";
  }

  try {
    return new URL(trimmedValue, sourceUrl || BASE_URL).toString();
  } catch (_error) {
    return trimmedValue;
  }
}

function wrapInline(wrapper, value) {
  const text = cleanupInline(value);
  return text ? `${wrapper}${text}${wrapper}` : "";
}

function quoteYaml(value) {
  return JSON.stringify(value);
}

module.exports = {
  BASE_URL,
  buildMarkdownDocument,
  exportMarkdownFiles,
  toPublicUrl,
};
