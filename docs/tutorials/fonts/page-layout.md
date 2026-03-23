# Page Layout and Page Rendering

## Introduction

This guide covers the current public `v4` workflow for rendering a known page on the documented default layout.

Today, the documented page-content endpoint is `GET /content/api/v4/verses/by_page/:page_number`. Public API docs describe it as a Madani page endpoint for page numbers `1-604`. If your app needs chapter entry on that same default layout, `GET /content/api/v4/chapters/{id}` exposes a `pages` array with the chapter's first and last pages.

## TL;DR

| You Want To... | Use This | Example |
|---|---|---|
| Render a known page | `/verses/by_page/:page_number` | `/verses/by_page/1` |
| Render physical page lines | `words=true` + `word_fields=...line_number...` | `word_fields=code_v2,text_uthmani,line_number` |
| Jump to a chapter on the default layout | `/chapters/:id` and read `chapter.pages` | `/chapters/1` |
| Resolve page number from juz or arbitrary verse range | Not currently exposed as a public `v4` page-lookup endpoint | Track page number in your app for now |

## Quick Start

### 1. Get Chapter Pages When You Need Chapter Entry

If the user is entering a chapter from a table of contents, fetch the chapter first and read the `pages` array.

```javascript
const API_BASE = 'https://apis.quran.foundation/content/api/v4';

async function getChapter(chapterId, accessToken, clientId) {
  const response = await fetch(`${API_BASE}/chapters/${chapterId}`, {
    headers: {
      'x-auth-token': accessToken,
      'x-client-id': clientId,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

const chapter = await getChapter(1, accessToken, clientId);
const [firstPage, lastPage] = chapter.chapter.pages;
```

`chapter.pages` gives you the first and last documented default-layout pages for that chapter.

### 2. Fetch a Known Page

Use a page number you already know from chapter metadata, app state, a bookmark, or stored reader progress.

```javascript
async function getPage(pageNumber, accessToken, clientId) {
  const response = await fetch(
    `${API_BASE}/verses/by_page/${pageNumber}?` +
      `words=true&word_fields=code_v2,text_uthmani,line_number`,
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
const page = await getPage(firstPage, accessToken, clientId);
const lines = groupWordsByLine(page.verses);

for (const [lineNumber, words] of lines) {
  console.log('line', lineNumber, words.map((word) => word.text || word.text_uthmani));
}
```

## Current Public Endpoints

### Page Content

```text
GET https://apis.quran.foundation/content/api/v4/verses/by_page/{page_number}
```

### Chapter Metadata

```text
GET https://apis.quran.foundation/content/api/v4/chapters/{id}
```

### Required Headers

```text
x-auth-token: <YOUR_ACCESS_TOKEN>
x-client-id: <YOUR_CLIENT_ID>
```

## Recommended Query Parameters

For `GET /verses/by_page/{page_number}`:

| Parameter | Required | Description |
|---|---|---|
| `words=true` | Yes for page layout | Include word-level data |
| `word_fields` | Yes for page layout | Include `line_number` and the text or glyph fields your renderer needs |

## Example Requests

### Fetch Chapter Pages

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/chapters/1' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

Example response excerpt:

```json
{
  "chapter": {
    "id": 1,
    "pages": [1, 1]
  }
}
```

### Fetch Page Content

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/verses/by_page/1?words=true&word_fields=code_v2,text_uthmani,line_number' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

Example response excerpt:

```json
{
  "verses": [
    {
      "verse_key": "1:1",
      "words": [
        {
          "position": 1,
          "page_number": 1,
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
| `page_number` | Physical page for that word on the documented default layout |
| `line_number` | Physical line index on that page |
| `position` | Word order within the verse |
| `code_v2`, `code_v1` | QCF glyph codes for font rendering |
| `text_uthmani`, `text_indopak`, `text_qpc_hafs` | Script-specific text fields |

Important behavior:

- `line_number` is a physical page line index, not "the first verse line on the page".
- Some pages can start visible Quran text on line `2` or `3` when upper lines are occupied by a surah header, bismillah, or other page-level layout elements.
- A single physical line can contain words from multiple verses.
- For page rendering, group words by `line_number`, not by verse.

## Rendering Workflow

```text
1. If needed, call /chapters/:id and read chapter.pages for chapter entry
2. Request /verses/by_page/:page_number with words=true
3. Flatten words from all returned verses
4. Group words by line_number
5. Render lines in ascending order
6. Render words in the order returned by the API
```

A practical request for page rendering looks like this:

```text
words=true&word_fields=code_v2,text_uthmani,line_number
```

## Current Limitations

- Public `v4` page rendering docs center on `GET /verses/by_page/{page_number}` for documented Madani pages `1-604`.
- `GET /chapters/{id}` exposes `chapter.pages` for chapter start and end pages on the default layout.
- Public `v4` does not currently expose a general page-lookup endpoint for juzs or arbitrary verse ranges.
- Alternate mushaf page navigation and print-exact alternate edition layout are not yet part of the documented public `v4` contract.
- If your product needs alternate mushaf page mapping or print-exact alternate edition layout, validate that behavior separately until the API contract and generated reference docs are updated.

## Common Implementation Patterns

### Reader State

Store these values together in your app:

- `page_number`
- the user's last reading position

That lets you reopen the same page directly without needing a public juz or range page-lookup endpoint.

### Bookmarks

If your UI is page-oriented, save both:

- the canonical verse identifier for long-term portability
- the current default-layout `page_number` for fast resume behavior

### Chapter Entry

If your UI lets users start reading from a surah list:

- fetch `GET /chapters/:id`
- read `chapter.pages[0]` as the first page
- fetch that page with `GET /verses/by_page/:page_number`

## Troubleshooting

### Line Numbers Start at 2 or 3

This can be expected. `line_number` reflects the physical line index on the page, and upper lines may be used by non-ayah layout elements.

### I Need the First Page of a Chapter

Use `GET /chapters/{id}` and read `chapter.pages`. That public endpoint exposes the chapter's first and last documented default-layout pages.

### I Need Juz or Verse-Range Page Lookup

That is not currently exposed as a public `v4` page-lookup endpoint. Keep track of the target page in your app for now.

### I Need Print-Exact Alternate Mushaf Layout

The current public page-rendering contract does not yet document alternate mushaf page navigation or print-exact alternate edition layout. Validate those cases separately before treating them as authoritative.

### Empty or Unexpected Results

Check the following first:

- valid `x-auth-token` and `x-client-id`
- a valid documented `page_number` in the `1-604` range
- `words=true` is present if your renderer expects `verse.words`
- `word_fields` includes `line_number` and the text or glyph fields your renderer uses

## Summary

The current public page-layout workflow is:

1. if needed, get chapter entry pages from `GET /chapters/:id`
2. fetch a known page with `GET /verses/by_page/:page_number`
3. request word-level fields including `line_number`
4. group words by line and render them in order

When public `v4` page-lookup endpoints become available, this guide can expand again to cover juz, verse-range, and alternate mushaf navigation.
