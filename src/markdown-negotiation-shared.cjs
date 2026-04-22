const HTML_MEDIA_TYPE = "text/html";
const MARKDOWN_MEDIA_TYPE = "text/markdown";
const MARKDOWN_CONTENT_TYPE = `${MARKDOWN_MEDIA_TYPE}; charset=utf-8`;

function parseAcceptEntries(acceptHeader) {
  if (!acceptHeader || !acceptHeader.trim()) {
    return [];
  }

  return acceptHeader
    .split(",")
    .map((mediaRange, order) => {
      const [type, ...params] = mediaRange.split(";").map((part) => part.trim());
      if (!type || !type.includes("/")) {
        return null;
      }

      const qParam = params.find((part) => part.toLowerCase().startsWith("q="));
      const quality = qParam ? Number(qParam.slice(2)) : 1;
      const q =
        Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0;

      return {
        order,
        q,
        type: type.toLowerCase(),
      };
    })
    .filter(Boolean);
}

function getMediaRangeSpecificity(candidateType, mediaRangeType) {
  const [candidatePrimaryType, candidateSubtype] = candidateType.split("/");
  const [rangePrimaryType, rangeSubtype] = mediaRangeType.split("/");

  if (!candidatePrimaryType || !candidateSubtype || !rangePrimaryType || !rangeSubtype) {
    return -1;
  }

  if (rangePrimaryType === "*" && rangeSubtype === "*") {
    return 0;
  }

  if (rangeSubtype === "*" && rangePrimaryType === candidatePrimaryType) {
    return 1;
  }

  if (rangePrimaryType === candidatePrimaryType && rangeSubtype === candidateSubtype) {
    return 2;
  }

  return -1;
}

function getRepresentationRank(representationType, acceptEntries) {
  let bestMatch = null;

  for (const entry of acceptEntries) {
    const specificity = getMediaRangeSpecificity(representationType, entry.type);
    if (specificity === -1) {
      continue;
    }

    if (
      !bestMatch ||
      specificity > bestMatch.specificity ||
      (specificity === bestMatch.specificity && entry.q > bestMatch.q) ||
      (specificity === bestMatch.specificity &&
        entry.q === bestMatch.q &&
        entry.order < bestMatch.order)
    ) {
      bestMatch = {
        order: entry.order,
        q: entry.q,
        specificity,
      };
    }
  }

  if (!bestMatch) {
    return {
      order: Number.POSITIVE_INFINITY,
      q: 0,
      specificity: -1,
    };
  }

  return bestMatch;
}

function rankRepresentationTypes(
  acceptHeader,
  availableTypes,
  defaultType = availableTypes[0],
) {
  const normalizedAvailableTypes = availableTypes.map((type) => type.toLowerCase());
  const normalizedDefaultType = defaultType.toLowerCase();
  const acceptEntries = parseAcceptEntries(acceptHeader);

  if (!acceptEntries.length) {
    return normalizedAvailableTypes
      .slice()
      .sort((a, b) => {
        if (a === normalizedDefaultType) {
          return -1;
        }

        if (b === normalizedDefaultType) {
          return 1;
        }

        return normalizedAvailableTypes.indexOf(a) - normalizedAvailableTypes.indexOf(b);
      });
  }

  return normalizedAvailableTypes
    .map((type, index) => ({
      index,
      type,
      ...getRepresentationRank(type, acceptEntries),
    }))
    .filter((entry) => entry.q > 0)
    .sort((a, b) => {
      if (b.q !== a.q) {
        return b.q - a.q;
      }

      if (b.specificity !== a.specificity) {
        return b.specificity - a.specificity;
      }

      if (a.order !== b.order) {
        return a.order - b.order;
      }

      if (a.type === normalizedDefaultType) {
        return -1;
      }

      if (b.type === normalizedDefaultType) {
        return 1;
      }

      return a.index - b.index;
    })
    .map((entry) => entry.type);
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
  HTML_MEDIA_TYPE,
  MARKDOWN_CONTENT_TYPE,
  MARKDOWN_MEDIA_TYPE,
  appendHeaderValue,
  isHtmlContentType,
  isMarkdownPath,
  rankRepresentationTypes,
  toMarkdownAssetPath,
};
