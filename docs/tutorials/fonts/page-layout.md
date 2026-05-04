---
displayed_sidebar: APIsSidebar
---

# Page Layout API Guide

## Introduction

### What is the Pages Lookup API?

The Pages Lookup API provides information about how Quranic content is paginated across different Mushaf editions. Since different Mushafs have different page layouts, the same verse can appear on different pages depending on which Mushaf you use.

Use the public `v4` Pages and Verses endpoints together when you need Mushaf-aware page navigation and page rendering:

| Goal | Endpoint |
| --- | --- |
| List all pages for a Mushaf | `GET /pages` |
| Get metadata for a single page | `GET /pages/{id}` |
| Look up page boundaries for a chapter, juz, ruku, page, or verse range | `GET /pages/lookup` |
| Fetch page content for rendering | `GET /verses/by_page/{page_number}` |

### Why is this important?

- **Accurate navigation**: Navigate to specific Mushaf pages correctly.
- **Consistent display**: Show page numbers that match physical copies.
- **Mushaf variety**: Support multiple Mushaf styles, such as QCF and IndoPak layouts.
- **Reading progress**: Track reading progress by actual Mushaf pages.

### Authentication

All requests use these headers:

```text
x-auth-token: <YOUR_ACCESS_TOKEN>
x-client-id: <YOUR_CLIENT_ID>
```

### Quick decision guide

| You want to... | Use this endpoint | Example |
| --- | --- | --- |
| Get pages for a chapter | `/pages/lookup?chapter_number=47&mushaf=5` | Surah Muhammad in KFGQPC Hafs |
| Get pages for a juz | `/pages/lookup?juz_number=1&mushaf=1` | Juz 1 in QCF V2 |
| Get verses for a specific page | `/verses/by_page/507?mushaf=5` | Page 507 in KFGQPC Hafs |
| Get a verse range's page boundaries | `/pages/lookup?mushaf=5&from=47:1&to=47:5` | A range spanning one or more pages |

---

## Quick Start

### 1. Choose your Mushaf

Common Mushaf ids:

| Mushaf ID | Name | Total Pages | Description |
| --- | --- | --- | --- |
| `1` | QCF V2 | 604 | Medina Mushaf, Quran Complex Font V2 |
| `2` | QCF V1 | 604 | Medina Mushaf, Quran Complex Font V1 |
| `3` | IndoPak | 604 | IndoPak script |
| `4` | Uthmani Hafs | 604 | Standard Uthmani script |
| `5` | KFGQPC Hafs | 604 | King Fahd Quran Printing Complex |
| `6` | IndoPak 15-line | 610 | IndoPak with 15 lines per page |
| `7` | IndoPak 16-line | 548 | IndoPak with 16 lines per page |
| `11` | Tajweed | 604 | Color-coded Tajweed rules |
| `19` | QCF Tajweed V4 | 604 | QCF with Tajweed coloring |

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

`verses/by_page` does not take `from` / `to` query params. If you are rendering a lookup result that spans multiple pages, fetch each page returned by `pages/lookup` and filter the verses client-side using the lookup range.

---

## Understanding Mushafs

### Why page counts differ

Pages vary because:

- **Line count per page**: 15-line and 16-line layouts produce different page counts.
- **Script style**: Different calligraphy and script systems take different amounts of space.
- **Font size and glyph system**: Rendering choices affect how closely a digital page can match a printed Mushaf.

### Verse-to-page mapping

The same verse can appear on different pages across Mushafs:

```text
Verse 2:255:
  QCF V2 (Mushaf 1):             page 42
  IndoPak 15-line (Mushaf 6):    page 44
  IndoPak 16-line (Mushaf 7):    page 39
```

This is why clients should not hard-code one global verse-to-page mapping. Always include the selected `mushaf` when resolving page boundaries.

---

## Pages Lookup API

### Endpoint

```text
GET https://apis.quran.foundation/content/api/v4/pages/lookup
```

### Request parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `mushaf` | number | Recommended | Mushaf ID. Defaults to the system default Mushaf if omitted. |
| `chapter_number` | number | No* | Chapter number, 1-114. |
| `juz_number` | number | No* | Juz number, 1-30. |
| `hizb_number` | number | No* | Hizb number, 1-60. |
| `rub_el_hizb_number` | number | No* | Rub el Hizb number. |
| `ruku_number` | number | No* | Ruku number. |
| `page_number` | number | No* | Page number in the selected Mushaf. |
| `from` | string | No | Starting verse key or verse id, for example `2:255`. |
| `to` | string | No | Ending verse key or verse id, for example `2:286`. |

At least one lookup identifier is required, such as `chapter_number`, `juz_number`, `page_number`, `ruku_number`, or a `from` / `to` range.

### Response structure

```typescript
interface PagesLookupResponse {
  lookup_range: {
    from: string;
    to: string;
  };
  pages: {
    [pageNumber: string]: {
      from: string;
      to: string;
      first_verse_key: string;
      last_verse_key: string;
    };
  };
  total_page: number;
}
```

### Query by chapter

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?chapter_number=47&mushaf=5' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### Query by juz

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?juz_number=1&mushaf=1' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### Query by ruku

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?ruku_number=1&mushaf=1' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### Query by verse range

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/pages/lookup?mushaf=5&from=47:1&to=47:5' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

---

## Verses API Integration

### Getting verses for a page

Once you have the page boundaries from Pages Lookup, fetch the actual verses:

```bash
curl -X GET \
  'https://apis.quran.foundation/content/api/v4/verses/by_page/507?mushaf=5&words=true&word_fields=page_number,line_number,code_v2,text_uthmani' \
  -H 'x-auth-token: <YOUR_ACCESS_TOKEN>' \
  -H 'x-client-id: <YOUR_CLIENT_ID>'
```

### Rendering a lookup range

`verses/by_page/{page_number}` returns page content for the requested page. It does not accept `from` / `to` query params. When a lookup result spans multiple pages, fetch each page and filter client-side if you only want the exact lookup range.

```javascript
function parseVerseKey(verseKey) {
  const [chapter, verse] = verseKey.split(':').map(Number);
  return { chapter, verse };
}

function isVerseInRange(verseKey, from, to) {
  const current = parseVerseKey(verseKey);
  const start = parseVerseKey(from);
  const end = parseVerseKey(to);
  const currentSort = current.chapter * 1000 + current.verse;
  const startSort = start.chapter * 1000 + start.verse;
  const endSort = end.chapter * 1000 + end.verse;
  return currentSort >= startSort && currentSort <= endSort;
}

async function getVersesInLookupRange(lookup, mushafId, headers) {
  const allVerses = [];

  for (const [pageNumber, pageInfo] of Object.entries(lookup.pages)) {
    const response = await fetch(
      `${API_BASE}/verses/by_page/${pageNumber}?mushaf=${mushafId}&words=true&word_fields=page_number,line_number,code_v2,text_uthmani`,
      { headers }
    );
    const data = await response.json();
    const pageVerses = (data.verses || []).filter((verse) =>
      isVerseInRange(verse.verse_key, pageInfo.from, pageInfo.to)
    );
    allVerses.push(...pageVerses);
  }

  return allVerses;
}
```

### Word-level data

When you request `words=true`, each word includes physical layout metadata for the selected Mushaf:

```json
{
  "verses": [
    {
      "id": 4787,
      "verse_key": "47:1",
      "words": [
        {
          "id": 1,
          "position": 1,
          "page_number": 507,
          "line_number": 2,
          "text_uthmani": "إِنَّ",
          "code_v2": "...."
        }
      ]
    }
  ]
}
```

### Important word fields

| Field | Description |
| --- | --- |
| `page_number` | Physical page number in the selected Mushaf. |
| `line_number` | Physical line number on that page. |
| `position` | Word order inside the verse. |
| `text_uthmani` | Unicode Uthmani text. |
| `code_v1`, `code_v2` | QCF glyph codes for custom fonts. |
| `text_indopak` | IndoPak script text. |

---

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

---

## Implementation Patterns

### Pattern 1: Page-by-page navigation

Display Mushaf pages like a book:

```javascript
class MushafNavigator {
  constructor(mushafId, headers) {
    this.mushafId = mushafId;
    this.headers = headers;
    this.pagesLookup = null;
    this.currentPage = 1;
  }

  async loadChapter(chapterNumber) {
    const response = await fetch(
      `${API_BASE}/pages/lookup?chapter_number=${chapterNumber}&mushaf=${this.mushafId}`,
      { headers: this.headers }
    );
    this.pagesLookup = await response.json();
    this.currentPage = Number(Object.keys(this.pagesLookup.pages)[0]);
    return this.pagesLookup;
  }

  async getPageVerses(pageNumber) {
    const response = await fetch(
      `${API_BASE}/verses/by_page/${pageNumber}?mushaf=${this.mushafId}&words=true&word_fields=page_number,line_number,code_v2,text_uthmani`,
      { headers: this.headers }
    );
    return response.json();
  }

  nextPage() {
    const pages = Object.keys(this.pagesLookup.pages).map(Number);
    const currentIndex = pages.indexOf(this.currentPage);
    if (currentIndex < pages.length - 1) {
      this.currentPage = pages[currentIndex + 1];
    }
    return this.currentPage;
  }

  prevPage() {
    const pages = Object.keys(this.pagesLookup.pages).map(Number);
    const currentIndex = pages.indexOf(this.currentPage);
    if (currentIndex > 0) {
      this.currentPage = pages[currentIndex - 1];
    }
    return this.currentPage;
  }
}
```

### Pattern 2: Verse range display

Show a range of verses across multiple pages:

```javascript
async function getVersesInRange(from, to, mushafId, headers) {
  const lookupResponse = await fetch(
    `${API_BASE}/pages/lookup?mushaf=${mushafId}&from=${from}&to=${to}`,
    { headers }
  );
  const lookup = await lookupResponse.json();
  return getVersesInLookupRange(lookup, mushafId, headers);
}
```

### Pattern 3: View modes

The Quran.com frontend supports two view modes that handle API responses differently.

#### Reading View (Mushaf Layout)

Renders words grouped by lines to match the physical Mushaf layout.

**Why line grouping?**
The API returns verses, but a single Mushaf line can contain words from multiple verses. Group by line, not just by verse, for accurate physical layout.

**Word layout metadata:**
Each word includes `page_number`, `line_number`, and `position`.

**Transformation pipeline:**

```text
API response (verses with words)
        ↓
Extract all words from all verses
        ↓
Group words by "page-{page_number}-line-{line_number}"
        ↓
Render each line in order
```

**API request fields:**

```text
word_fields=code_v2,text_uthmani,page_number,line_number
```

#### Translation View (Verse-by-Verse)

Renders verses directly without line grouping.

```text
API response (verses)
        ↓
Render each verse with its translations
```

Translation View does not require line grouping unless you also want to display physical page layout data.

---

## Code Examples

### React implementation

**Key components:**

1. **usePagesLookup hook**: Fetches page boundaries for a resource, such as a chapter or juz.
2. **MushafPage component**: Fetches page verses and groups words by line for rendering.
3. **ChapterReader component**: Manages page navigation and Mushaf selection.

**Pseudo-code flow:**

```text
ChapterReader:
  1. Call usePagesLookup(resourceType, resourceId, mushafId)
  2. Track currentPageIndex in state
  3. Render MushafPage with page number from lookup.pages[currentPage]

MushafPage:
  1. Fetch verses for page with verses/by_page/{page_number}
  2. Filter to lookup page range if needed
  3. Group words by line_number
  4. Render lines RTL with words in order
```

### Flutter implementation

**Key classes:**

1. **PagesLookup**: Model for API response with `lookup_range`, `pages`, and `total_page`.
2. **PageInfo**: Model for an individual page with `from`, `to`, `first_verse_key`, and `last_verse_key`.
3. **QuranApiService**: API client with `getPagesLookup()` and `getPageVerses()` methods.

**Pseudo-code flow:**

```text
1. Create QuranApiService with x-auth-token and x-client-id
2. Call getPagesLookup(mushafId, chapterNumber) -> PagesLookup
3. Get first page number from pages.keys
4. Call getPageVerses(pageNumber, mushafId) -> List<Verse>
5. Filter to pageInfo.from/pageInfo.to if needed
6. Group verse.words by line_number for rendering
```

### Python implementation

**Key classes:**

1. **PageInfo**: Dataclass with `from_verse`, `to_verse`, `first_verse_key`, and `last_verse_key`.
2. **PagesLookup**: Dataclass with `lookup_range`, `pages`, and `total_page`.
3. **QuranAPI**: Client class with `get_pages_lookup()` and `get_page_verses()` methods.

**Pseudo-code flow:**

```text
1. Create QuranAPI(mushaf_id, access_token, client_id)
2. Call get_pages_lookup(chapter_number) -> PagesLookup
3. Get first page from pages.keys()
4. Call get_page_verses(page_number) -> dict with verses
5. Filter to page_info.from/page_info.to if needed
6. Group verse words by line_number for rendering
```

---

## Common Use Cases

### 1. Jump to a specific verse

**Approach:** Look up the target verse directly with a single-verse range.

```text
Pseudo-code:
1. Call pages/lookup with from=verseKey&to=verseKey&mushaf=currentMushaf
2. Get the first key from lookup.pages
3. Fetch verses/by_page/{page_number}
4. Scroll or highlight the target verse/word client-side
```

### 2. Reading progress tracking

**Approach:** Store read page numbers for the selected Mushaf. Calculate progress as a percentage of pages read.

```text
Pseudo-code:
1. Load readPages Set from localStorage
2. On page read: add `${mushafId}:${pageNumber}` to the Set
3. To calculate progress:
   - Get page numbers from pages/lookup or pages
   - Count how many are in readPages Set
   - Return percentage: (readCount / totalPages) * 100
```

### 3. Bookmarking with page context

**Approach:** Store `verse_key` as the universal identifier. When displaying the bookmark, look up the page for the user's current Mushaf.

```text
Pseudo-code:
1. Save bookmark with verse_key
2. Optionally cache mushafId and pageNumber
3. To resolve bookmark for a different Mushaf:
   - If cached Mushaf matches, use cached page
   - Otherwise, call pages/lookup with from=verseKey&to=verseKey
   - Return first page from response
```

### 4. Mushaf switcher

**Approach:** When switching Mushaf, look up the current verse in the new Mushaf, then fetch verses for that page.

```text
Pseudo-code:
1. Get currentVerseKey from current reading position
2. Call pages/lookup for new Mushaf with from=currentVerseKey&to=currentVerseKey
3. Get target page from lookup.pages
4. Fetch verses for target page
5. Return new page, pageInfo, and verses
```

---

## Font Scale and Layout Behavior

When implementing a Reading View that aims to replicate physical Mushaf pages, font size selection significantly impacts layout fidelity.

### Maintaining Mushaf page boundaries

At smaller font scales, you can maintain authentic Mushaf page boundaries:

- Each line matches the same boundaries as the physical Mushaf.
- Page breaks align with printed Mushaf pages.
- Words do not overflow their designated line positions.

This creates a reading experience that closely mirrors reading from a physical Quran.

### Big Text Layout mode

At larger font sizes, it can become impossible to maintain exact print fidelity. Consider implementing a Big Text Layout mode when the selected font size, word-by-word display, or viewport width would otherwise cause overflow.

**Layout behavior comparison:**

| Aspect | Normal Layout | Big Text Layout |
| --- | --- | --- |
| Line boundaries | Strictly maintained | Relaxed for readability |
| Page fidelity | Matches physical Mushaf | May differ from print |
| Word wrapping | Preserves Mushaf line breaks | Allows natural wrapping |
| Primary goal | Authenticity | Accessibility |

At larger font sizes, prioritize readability and accessibility over strict print layout if exact line boundaries would require horizontal scrolling or clipped text.

### Recommended font scale levels

| Level | Description | Layout Behavior |
| --- | --- | --- |
| 1-3 | Small sizes | Maintain strict Mushaf boundaries |
| 3 | Default | Balanced default |
| 4-5 | Medium sizes | Consider relaxing constraints |
| 6-10 | Large sizes | Use Big Text Layout mode |

---

## Best Practices

### 1. Cache Pages Lookup data

Pages lookup for a chapter/Mushaf combination is stable. Cache it using a key such as `"chapter:${chapterNumber}:mushaf:${mushafId}"` to avoid redundant API calls.

### 2. Prefetch adjacent pages

For smooth navigation, prefetch previous and next pages in parallel when the user views a page.

```javascript
await Promise.all([
  getPageVerses(currentPage - 1),
  getPageVerses(currentPage + 1),
]);
```

### 3. Handle Mushaf changes gracefully

When the user switches Mushaf, do not assume the same page number is valid or equivalent. Re-lookup the current verse using the new Mushaf ID.

### 4. Validate page numbers by selected Mushaf

Different Mushafs have different page counts. Use `GET /pages?mushaf={id}` to discover valid pages for the selected Mushaf instead of assuming every Mushaf has 604 pages.

---

## Troubleshooting

### Issue: Empty pages object

**Symptom:** `pages` is empty in the response.

**Cause:** Invalid lookup identifier, invalid verse range, or unsupported Mushaf ID.

**Solution:** Verify the `mushaf` ID and lookup parameters. For a direct verse lookup, use `from=verseKey&to=verseKey`.

### Issue: Wrong page numbers

**Symptom:** Page numbers do not match the expected Mushaf.

**Cause:** The request used the wrong `mushaf`, or the app reused a page number after the user switched Mushaf.

**Solution:** Include the selected `mushaf` in both `pages/lookup` and `verses/by_page`, and re-lookup the current verse after a Mushaf change.

### Issue: Verses spanning pages

**Symptom:** A verse appears on multiple pages.

**Cause:** This is normal in some Mushaf layouts.

**Solution:** Use word-level `page_number` and `line_number` for accurate rendering. Check whether `verse.words` have different `page_number` values to detect spanning verses.

### Issue: Different verse counts

**Symptom:** Total verse count differs from the chapter's full verse count.

**Cause:** A lookup range can cover only part of a chapter or a page.

**Solution:** Use `lookup_range` for the full requested range and each page's `from` / `to` values for page-specific boundaries.

---

## Notes

- `pages/layout` is not part of the public `v4` contract.
- `pages/lookup` is the page-boundary endpoint.
- `verses/by_page/{page_number}` is the page-content endpoint.
- The selected `mushaf` affects both page boundaries and returned word layout.
- `verses/by_page/{page_number}` does not take `from` / `to` query params.

## Summary

The Pages Lookup API is essential for building authentic Mushaf experiences:

1. **Specify Mushaf ID**: Different Mushafs have different layouts.
2. **Use the pages object**: It tells you exactly which verse range belongs to each page.
3. **Fetch content by page**: Use `verses/by_page/{page_number}` for page content.
4. **Cache wisely**: Lookup data is stable per resource/Mushaf combination.
5. **Handle Mushaf switches**: Re-lookup page when the user changes Mushaf.
6. **Use word-level positioning**: Use `page_number` and `line_number` for line-by-line rendering.

For related rendering details, see the [Font Rendering guide](./font-rendering.md).
