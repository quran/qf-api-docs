# Page Layout and Page Rendering

## Introduction

This guide covers the current public `v4` workflow for rendering a known Mushaf page.

Today, the documented page-content endpoint is `GET /content/api/v4/verses/by_page/:page_number`. Use it when your app already knows the page number it wants to render, then group returned words by `line_number` to reproduce a page-style reading view.

## TL;DR

| You Want To... | Use This | Example |
|---|---|---|
| Render a known page | `/verses/by_page/:page_number` | `/verses/by_page/507?mushaf=5` |
| Render physical page lines | `words=true` + `word_fields=...line_number,page_number...` | `word_fields=code_v2,text_qpc_hafs,line_number,page_number` |
| Support multiple Mushafs | Always pass `mushaf` | `mushaf=1`, `mushaf=5`, `mushaf=7` |
| Resolve page number from chapter, juz, or verse range | Not currently exposed in public `v4` | Track page number in your app for now |

## Quick Start

### 1. Choose Your Mushaf

```javascript
const MUSHAF_IDS = {
  QCF_V2: 1,
  QCF_V1: 2,
  INDOPAK: 3,
  UTHMANI_HAFS: 4,
  KFGQPC_HAFS: 5,
  INDOPAK_15_LINES: 6,
  INDOPAK_16_LINES: 7,
  TAJWEED: 11,
  QCF_TAJWEED_V4: 19,
};
```

### 2. Fetch a Known Page

Use a page number you already know from app state, a bookmark, stored reader progress, or another upstream source.

```javascript
const API_BASE = 'https://apis.quran.foundation/content/api/v4';

async function getPage(pageNumber, mushafId, accessToken, clientId) {
  const response = await fetch(
    `${API_BASE}/verses/by_page/${pageNumber}?` +
      `mushaf=${mushafId}&words=true&word_fields=code_v2,text_qpc_hafs,line_number,page_number`,
    {
      headers: {
        'x-auth-token': accessToken,
        'x-client-id': clientId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
```

### 3. Group Words by Line

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

  return [...lines.entries()].sort((a, b) => a[0] - b[0]);
}
```

### 4. Render Each Line in Order

```javascript
const page = await getPage(507, MUSHAF_IDS.KFGQPC_HAFS, accessToken, clientId);
const lines = groupWordsByLine(page.verses);

for (const [lineNumber, words] of lines) {
  console.log('line', lineNumber, words.map((word) => word.text || word.text_qpc_hafs));
}
```

## Understanding Mushafs

### Mushaf Types and Page Counts

| Mushaf ID | Name | Total Pages | Description |
|---|---|---:|---|
| 1 | QCF V2 | 604 | Madani Mushaf, Quran Complex Font V2 |
| 2 | QCF V1 | 604 | Madani Mushaf, Quran Complex Font V1 |
| 3 | IndoPak | 604 | IndoPak script |
| 4 | Uthmani Hafs | 604 | Standard Uthmani script |
| 5 | KFGQPC Hafs | 604 | King Fahd Quran Printing Complex |
| 6 | IndoPak 15-line | 610 | IndoPak with 15 lines per page |
| 7 | IndoPak 16-line | 548 | IndoPak with 16 lines per page |
| 11 | Tajweed | 604 | Color-coded tajweed rules |
| 19 | QCF Tajweed V4 | 604 | QCF with tajweed coloring |

Different Mushafs can change:

- total page count
- line count per page
- where a line breaks within the same verse
- how closely the API output matches a specific printed edition

## Current Public Endpoint

### Endpoint

```text
GET https://apis.quran.foundation/content/api/v4/verses/by_page/{page_number}
```

### Required Headers

```text
x-auth-token: <YOUR_ACCESS_TOKEN>
x-client-id: <YOUR_CLIENT_ID>
```

### Recommended Query Parameters

| Parameter | Required | Description |
|---|---|---|
| `mushaf` | Strongly recommended | Mushaf ID to request |
| `words=true` | Yes for page layout | Include word-level data |
| `word_fields` | Yes for page layout | Include `line_number`, `page_number`, and the text/glyph fields you need |

### Example Request

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/verses/by_page/507?mushaf=5&words=true&word_fields=code_v2,text_qpc_hafs,line_number,page_number' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### Example Response Excerpt

```json
{
  "verses": [
    {
      "verse_key": "47:1",
      "words": [
        {
          "position": 1,
          "page_number": 507,
          "line_number": 2,
          "code_v2": "",
          "text": "..."
        }
      ]
    }
  ]
}
```

## Word Layout Notes

Each returned word can include:

| Field | Meaning |
|---|---|
| `page_number` | Physical Mushaf page for that word |
| `line_number` | Physical line index on that page |
| `position` | Word order within the verse |
| `code_v2`, `code_v1` | QCF glyph codes for font rendering |
| `text_qpc_hafs`, `text_indopak`, `text_uthmani` | Script-specific text fields |

Important behavior:

- `line_number` is a physical page line index, not "the first verse line on the page".
- Some pages can start visible Quran text on line `2` or `3` when upper lines are occupied by a surah header, bismillah, or other page-level layout elements.
- A single physical line can contain words from multiple verses.
- For page rendering, group words by `line_number`, not by verse.

## Rendering Workflow

```text
1. Request /verses/by_page/:page_number with mushaf + words=true
2. Flatten words from all returned verses
3. Group words by line_number
4. Render lines in ascending order
5. Render words in the order returned by the API
```

A practical request for page rendering looks like this:

```text
words=true&word_fields=code_v2,text_qpc_hafs,line_number,page_number
```

## Current Limitations

- Public `v4` does not currently expose page lookup by chapter, juz, or verse range.
- `v4/verses/by_page` is the currently documented page-content endpoint.
- Exact line and page fidelity for non-default mushafs is not fully reliable in the current `v4` implementation.
- If your product needs print-exact Mushaf navigation for alternate editions, validate the output against the intended print edition before treating it as authoritative.

## Common Implementation Patterns

### Reader State

Store these values together in your app:

- `mushaf`
- `page_number`
- the user's last reading position

That lets you reopen the same page directly without needing a public page-lookup endpoint.

### Bookmarks

If your UI is page-oriented, save both:

- the canonical verse identifier for long-term portability
- the current `mushaf` + `page_number` for fast resume behavior

### Multi-Mushaf Testing

When you support more than one Mushaf:

- pass `mushaf` on every request
- test a sample of pages near surah starts and page boundaries
- verify line breaks against the print edition you are targeting

## Troubleshooting

### Line Numbers Start at 2 or 3

This can be expected. `line_number` reflects the physical line index on the page, and upper lines may be used by non-ayah layout elements.

### Page Looks Correct in One Mushaf but Not Another

The current public `v4` endpoint is more reliable for the default Madani/QCF layout than for exact print fidelity across all alternate mushafs. Validate alternate mushafs against the intended printed edition.

### Empty or Unexpected Results

Check the following first:

- valid `x-auth-token` and `x-client-id`
- a valid `page_number` for the selected Mushaf
- `words=true` is present if your renderer expects `verse.words`
- `word_fields` includes `line_number` and `page_number`

## Summary

The current public page-layout workflow is:

1. choose a Mushaf
2. fetch a known page with `GET /verses/by_page/:page_number`
3. request word-level fields including `line_number` and `page_number`
4. group words by line and render them in order

When public `v4` page-lookup endpoints are available, this guide can expand to cover chapter, juz, and verse-range based page navigation.
