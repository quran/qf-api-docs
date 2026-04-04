---
displayed_sidebar: APIsSidebar
---

# Page Layout API Guide

## Overview

Use the public `v4` Pages and Verses endpoints together when you need Mushaf-aware
page navigation and page rendering:

| Goal | Endpoint |
| --- | --- |
| List all pages for a Mushaf | `GET /pages` |
| Get metadata for a single page | `GET /pages/{id}` |
| Look up page boundaries for a chapter, juz, ruku, page, or verse range | `GET /pages/lookup` |
| Fetch page content for rendering | `GET /verses/by_page/{page_number}` |

All requests use these headers:

```text
x-auth-token: <YOUR_ACCESS_TOKEN>
x-client-id: <YOUR_CLIENT_ID>
```

## Quick Start

### 1. Choose the Mushaf

Common Mushaf ids:

| Mushaf | ID |
| --- | --- |
| QCF V2 | `1` |
| KFGQPC Hafs | `5` |
| IndoPak 15-line | `6` |
| IndoPak 16-line | `7` |
| QCF Tajweed V4 | `19` |

### 2. Look up page boundaries

Use `pages/lookup` to resolve the correct pages for the selected Mushaf.

```javascript
const API_BASE = 'https://apis.quran.foundation/content/api/v4';
const headers = {
  'x-auth-token': accessToken,
  'x-client-id': clientId,
};

const response = await fetch(
  `${API_BASE}/pages/lookup?chapter_number=47&mushaf=5`,
  { headers }
);

const data = await response.json();

console.log(data.total_page);          // 2
console.log(data.lookup_range.from);   // "47:1"
console.log(data.pages['507']);        // { first_verse_key, last_verse_key, from, to }
```

Example response:

```json
{
  "total_page": 2,
  "lookup_range": {
    "from": "47:1",
    "to": "47:5"
  },
  "pages": {
    "507": {
      "first_verse_key": "47:1",
      "last_verse_key": "47:3",
      "from": "47:1",
      "to": "47:3"
    },
    "508": {
      "first_verse_key": "47:4",
      "last_verse_key": "47:5",
      "from": "47:4",
      "to": "47:5"
    }
  }
}
```

### 3. Fetch page content

Use the selected page number with `verses/by_page/{page_number}`.

```javascript
const pageResponse = await fetch(
  `${API_BASE}/verses/by_page/507?mushaf=5&words=true&word_fields=page_number,line_number,code_v2,text_uthmani`,
  { headers }
);

const pageData = await pageResponse.json();
```

`verses/by_page` does not take `from` / `to` query params. If you are rendering a
lookup result that spans multiple pages, fetch each page returned by `pages/lookup`
and filter the verses client-side using the lookup range.

## Supported Lookup Patterns

### By chapter

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?chapter_number=47&mushaf=5' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### By juz

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?juz_number=1&mushaf=1' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### By ruku

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?ruku_number=1&mushaf=1' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### By verse range

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?mushaf=5&from=47:1&to=47:5' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

## Rendering Page Layout

When you request `words=true`, each word includes physical layout metadata for the
selected Mushaf:

```json
{
  "id": 1,
  "position": 1,
  "char_type_name": "word",
  "line_number": 2,
  "page_number": 507,
  "code_v2": "....",
  "text_uthmani": "إِنَّ"
}
```

Relevant word fields:

| Field | Use |
| --- | --- |
| `page_number` | Physical page number in the selected Mushaf |
| `line_number` | Physical line number on that page |
| `position` | Word order inside the verse |
| `code_v2` | QCF glyph code for glyph-based rendering |
| `text_uthmani` | Unicode Arabic text |

Group words by `line_number` when you want a physical page layout:

```javascript
function groupWordsByLine(verses) {
  const lines = new Map();

  for (const verse of verses) {
    for (const word of verse.words || []) {
      const line = word.line_number;
      if (!lines.has(line)) lines.set(line, []);
      lines.get(line).push(word);
    }
  }

  return [...lines.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([lineNumber, words]) => ({ lineNumber, words }));
}
```

## Other Pages Endpoints

### List all pages for a Mushaf

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages?mushaf=5' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### Get one page's metadata

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/507?mushaf=5' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

Example page metadata:

```json
{
  "page": {
    "id": 1,
    "page_number": 507,
    "verse_mapping": {
      "47:1": "47:3"
    },
    "first_verse_id": 4787,
    "last_verse_id": 4789,
    "verses_count": 3
  }
}
```

## Notes

- `pages/layout` is not part of the public `v4` contract.
- `pages/lookup` is the page-boundary endpoint.
- `verses/by_page/{page_number}` is the page-content endpoint.
- The selected `mushaf` affects both page boundaries and the returned word layout.

For related rendering details, see the [Font Rendering guide](./font-rendering).
