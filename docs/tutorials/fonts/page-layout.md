# Page Layout API Guide

## Introduction

### What is the Pages Lookup API?

The Pages Lookup API provides information about how Quranic content is paginated across different Mushaf (Quran print) editions. Since different Mushafs have different page layouts, the same verse can appear on different pages depending on which Mushaf you're using.

### Why is This Important?

- **Accurate Navigation**: Navigate to specific Mushaf pages correctly
- **Consistent Display**: Show page numbers that match physical copies
- **Mushaf Variety**: Support multiple Mushaf styles (IndoPak, Uthmani, etc.)
- **Reading Progress**: Track reading progress by actual Mushaf pages

### TL;DR - Quick Decision Guide

| You Want To... | Use This Endpoint | Example |
|---------------|-------------------|---------|
| Get pages for a chapter | `/pages/lookup?chapter_number=2&mushaf=1` | Al-Baqarah in QCF V2 |
| Get pages for a Juz | `/pages/lookup?juz_number=1&mushaf=1` | Juz Amma |
| Get verses for a specific page | `/verses/by_page/50?mushaf=1` | Page 50 |
| Get verse range on a page | Use Pages Lookup response | See examples |

---

## Quick Start

### 1. Choose Your Mushaf

```javascript
const MUSHAF_IDS = {
  QCF_V2: 1,           // Quran Complex Font V2 (most common)
  QCF_V1: 2,           // Quran Complex Font V1
  INDOPAK: 3,          // IndoPak script
  UTHMANI_HAFS: 4,     // Uthmani Hafs
  KFGQPC_HAFS: 5,      // King Fahd Complex
  INDOPAK_15_LINES: 6, // IndoPak 15-line (610 pages)
  INDOPAK_16_LINES: 7, // IndoPak 16-line (548 pages)
  TAJWEED: 11,         // Tajweed colored
  QCF_TAJWEED_V4: 19,  // QCF Tajweed V4
};
```

### 2. Get Page Boundaries for a Chapter

```javascript
const API_BASE = 'https://apis.quran.foundation/content/api/v4';

const response = await fetch(
  `${API_BASE}/pages/lookup?chapter_number=2&mushaf=1`,
  { headers: { 'Authorization': `Bearer ${accessToken}` } }
);
const data = await response.json();

console.log(data.totalPage);  // 48 (Al-Baqarah spans 48 pages in this Mushaf)
console.log(data.pages['2']); // { from: "2:1", to: "2:5", ... }
```

### 3. Fetch Verses for a Page

```javascript
const pageData = data.pages['2'];  // Page 2 of the Mushaf
const versesResponse = await fetch(
  `${API_BASE}/verses/by_page/2?mushaf=1&from=${pageData.from}&to=${pageData.to}`,
  { headers: { 'Authorization': `Bearer ${accessToken}` } }
);
```

---

## Understanding Mushafs

### Mushaf Types and Page Counts

Different Mushafs have different total page counts:

| Mushaf ID | Name | Total Pages | Description |
|-----------|------|-------------|-------------|
| 1 | QCF V2 | 604 | Medina Mushaf, Quran Complex Font V2 |
| 2 | QCF V1 | 604 | Medina Mushaf, Quran Complex Font V1 |
| 3 | IndoPak | 604 | IndoPak script (general) |
| 4 | Uthmani Hafs | 604 | Standard Uthmani script |
| 5 | KFGQPC Hafs | 604 | King Fahd Quran Printing Complex |
| 6 | IndoPak 15-line | **610** | IndoPak with 15 lines per page |
| 7 | IndoPak 16-line | **548** | IndoPak with 16 lines per page |
| 11 | Tajweed | 604 | Color-coded Tajweed rules |
| 19 | QCF Tajweed V4 | 604 | QCF with Tajweed coloring |

### Why Different Page Counts?

Pages vary because:
- **Line count per page**: 15-line vs 16-line layouts
- **Script style**: Different calligraphy takes different space
- **Font size**: Larger fonts mean fewer verses per page

### Verse-to-Page Mapping

The same verse appears on different pages across Mushafs:

```
Verse 2:255 (Ayatul Kursi):
├── QCF V2 (Mushaf 1):      Page 42
├── IndoPak 15-line (Mushaf 6): Page 44
└── IndoPak 16-line (Mushaf 7): Page 39
```

---

## Pages Lookup API

### Endpoint

```
GET https://apis.quran.foundation/content/api/v4/pages/lookup
```

> **Authentication Required**: Include `Authorization: Bearer <token>` header

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mushaf` | number | **Yes** | Mushaf ID (see table above) |
| `chapter_number` | number | No* | Chapter number (1-114) |
| `juz_number` | number | No* | Juz number (1-30) |
| `hizb_number` | number | No* | Hizb number (1-60) |
| `rub_el_hizb_number` | number | No* | Rub el Hizb (1-240) |
| `page_number` | number | No* | Mushaf page number |
| `from` | string | No | Starting verse key (e.g., "2:255") |
| `to` | string | No | Ending verse key (e.g., "2:286") |

> *At least one resource identifier is required

### Response Structure

```typescript
interface PagesLookupResponse {
  lookupRange: {
    from: string;  // First verse key in range
    to: string;    // Last verse key in range
  };
  pages: {
    [pageNumber: string]: {
      from: string;          // First verse on this page
      to: string;            // Last verse on this page
      firstVerseKey: string; // Same as 'from'
      lastVerseKey: string;  // Same as 'to'
    };
  };
  totalPage: number;  // Total pages for this resource
}
```

### Example Request: Chapter

```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://apis.quran.foundation/content/api/v4/pages/lookup?chapter_number=2&mushaf=1"
```

### Example Response

```json
{
  "lookupRange": {
    "from": "2:1",
    "to": "2:286"
  },
  "pages": {
    "2": {
      "from": "2:1",
      "to": "2:5",
      "firstVerseKey": "2:1",
      "lastVerseKey": "2:5"
    },
    "3": {
      "from": "2:6",
      "to": "2:16",
      "firstVerseKey": "2:6",
      "lastVerseKey": "2:16"
    },
    "4": {
      "from": "2:17",
      "to": "2:24",
      "firstVerseKey": "2:17",
      "lastVerseKey": "2:24"
    }
  },
  "totalPage": 48
}
```

### Query by Juz

```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://apis.quran.foundation/content/api/v4/pages/lookup?juz_number=1&mushaf=1"
```

### Query by Verse Range

```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://apis.quran.foundation/content/api/v4/pages/lookup?mushaf=1&from=2:255&to=2:260"
```

---

## Verses API Integration

### Getting Verses for a Page

Once you have the page boundaries from Pages Lookup, fetch the actual verses:

```bash
# Get verses for page 3 of Mushaf 1
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://apis.quran.foundation/content/api/v4/verses/by_page/3?mushaf=1&words=true"
```

### Using from/to Parameters

For precise verse fetching within a page:

```javascript
const API_BASE = 'https://apis.quran.foundation/content/api/v4';
const pageInfo = pagesLookup.pages['3'];
const url = `${API_BASE}/verses/by_page/3?mushaf=1&from=${pageInfo.from}&to=${pageInfo.to}&words=true`;
```

### Word-Level Data

Each verse contains words with position information:

```json
{
  "verses": [{
    "id": 7,
    "verse_key": "2:6",
    "words": [{
      "id": 1,
      "position": 1,
      "page_number": 3,
      "line_number": 1,
      "text_uthmani": "إِنَّ",
      "code_v2": ""  // QCF glyph code
    }]
  }]
}
```

### Important Word Fields

| Field | Description |
|-------|-------------|
| `page_number` | Mushaf page this word appears on |
| `line_number` | Line number within the page (1-15 or 1-16) |
| `text_uthmani` | Unicode Uthmani text |
| `code_v1`, `code_v2` | QCF glyph codes for custom fonts |
| `text_indopak` | IndoPak script text |

---

## Implementation Patterns

### Pattern 1: Page-by-Page Navigation

Display Mushaf pages like a book:

```javascript
const API_BASE = 'https://apis.quran.foundation/content/api/v4';

class MushafNavigator {
  constructor(mushafId, accessToken) {
    this.mushafId = mushafId;
    this.accessToken = accessToken;
    this.pagesLookup = null;
    this.currentPage = 1;
  }

  async loadChapter(chapterNumber) {
    const response = await fetch(
      `${API_BASE}/pages/lookup?chapter_number=${chapterNumber}&mushaf=${this.mushafId}`,
      { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
    );
    this.pagesLookup = await response.json();
    this.currentPage = parseInt(Object.keys(this.pagesLookup.pages)[0]);
    return this.pagesLookup;
  }

  async getPageVerses(pageNumber) {
    const pageInfo = this.pagesLookup.pages[pageNumber];
    if (!pageInfo) return null;

    const response = await fetch(
      `${API_BASE}/verses/by_page/${pageNumber}?mushaf=${this.mushafId}&words=true&from=${pageInfo.from}&to=${pageInfo.to}`,
      { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
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

### Pattern 2: Verse Range Display

Show a range of verses across multiple pages:

```javascript
const API_BASE = 'https://apis.quran.foundation/content/api/v4';

async function getVersesInRange(from, to, mushafId, accessToken) {
  const headers = { 'Authorization': `Bearer ${accessToken}` };

  // 1. Get pages for the range
  const lookupResponse = await fetch(
    `${API_BASE}/pages/lookup?mushaf=${mushafId}&from=${from}&to=${to}`,
    { headers }
  );
  const lookup = await lookupResponse.json();

  // 2. Fetch verses for each page
  const allVerses = [];
  for (const pageNum of Object.keys(lookup.pages)) {
    const pageInfo = lookup.pages[pageNum];
    const versesResponse = await fetch(
      `${API_BASE}/verses/by_page/${pageNum}?mushaf=${mushafId}&from=${pageInfo.from}&to=${pageInfo.to}&words=true`,
      { headers }
    );
    const data = await versesResponse.json();
    allVerses.push(...data.verses);
  }

  return allVerses;
}
```

### Pattern 3: View Modes

The Quran.com frontend supports two view modes that handle API responses differently:

#### Reading View (Mushaf Layout)

Renders words grouped by lines to match the physical Mushaf layout.

**Why Line Grouping?**
The API returns verses, but a single Mushaf line often contains words from multiple verses. We must group by line (not verse) for accurate physical layout.

**Word Layout Metadata:**
Each word includes `page_number` (1-604), `line_number` (1-15), and `position` (order within verse).

**Transformation Pipeline (Pseudo-code):**

```text
API Response (Verses with Words)
        ↓
Extract all words from all verses
        ↓
Group words by "page-{page_number}-line-{line_number}"
        ↓
Render each line in order
```

**API Request (include line_number):**

```text
word_fields=code_v2,text_qpc_hafs,page_number,line_number
```

**Reference Implementation:** `src/components/QuranReader/ReadingView/groupLinesByVerses.ts`

#### Translation View (Verse-by-Verse)

Renders verses directly without line grouping.

**Transformation Pipeline (Pseudo-code):**

```text
API Response (Verses)
        ↓
Render each verse with its translations
```

**Key Difference:** Translation View doesn't require `line_number` or line grouping—verses are rendered in sequence with their translations.

**Reference Implementation:** `src/components/QuranReader/TranslationView/`

---

## Code Examples

### React Implementation

**Key Components:**

1. **usePagesLookup hook:** Fetches page boundaries for a resource (chapter, juz, etc.)
2. **MushafPage component:** Fetches verses and groups words by line for rendering
3. **ChapterReader component:** Manages page navigation and Mushaf selection

**Pseudo-code flow:**

```text
ChapterReader:
  1. Call usePagesLookup(resourceType, resourceId, mushafId)
  2. Track currentPageIndex in state
  3. Render MushafPage with pageInfo from lookup.pages[currentPage]

MushafPage:
  1. Fetch verses for page with from/to range from pageInfo
  2. Group words by line_number
  3. Render lines RTL with words in order
```

**Reference Implementation:** `src/components/QuranReader/ReadingView/`

### Flutter Implementation

**Key Classes:**

1. **PagesLookup:** Model for API response with `lookupRange`, `pages` map, and `totalPage`
2. **PageInfo:** Model for individual page with `from` and `to` verse keys
3. **QuranApiService:** API client with `getPagesLookup()` and `getPageVerses()` methods

**Pseudo-code flow:**

```text
1. Create QuranApiService with accessToken
2. Call getPagesLookup(mushafId, chapterNumber) → PagesLookup
3. Get first page number from pages.keys
4. Call getPageVerses(pageNumber, mushafId, from, to) → List<Verse>
5. Group verse.words by line_number for rendering
```

### Python Implementation

**Key Classes:**

1. **PageInfo:** Dataclass with `from_verse`, `to_verse`, `first_verse_key`, `last_verse_key`
2. **PagesLookup:** Dataclass with `lookup_range`, `pages` dict, and `total_page`
3. **QuranAPI:** Client class with `get_pages_lookup()` and `get_page_verses()` methods

**Pseudo-code flow:**

```text
1. Create QuranAPI(mushaf_id)
2. Call get_pages_lookup(chapter_number) → PagesLookup
3. Get first page from pages.keys()
4. Call get_page_verses(page_number, page_info) → dict with verses
5. Group verse words by line_number for rendering
```

---

## Common Use Cases

### 1. Jump to a Specific Verse

**Approach:** Fetch pages lookup for the verse's chapter, then iterate through pages to find which page contains the target verse number.

```text
Pseudo-code:
1. Parse verseKey → (chapter, verseNumber)
2. Fetch pages lookup for chapter + mushaf
3. For each page in lookup.pages:
   - Parse page's from/to verse numbers
   - If targetVerse is within range, return page info
4. Return page number and position (for scroll alignment)
```

### 2. Reading Progress Tracking

**Approach:** Store read page numbers in localStorage. Calculate progress as percentage of chapter pages read.

```text
Pseudo-code:
1. Load readPages Set from localStorage
2. On page read: add pageNumber to Set, save to localStorage
3. To calculate progress:
   - Get page numbers from pagesLookup.pages
   - Count how many are in readPages Set
   - Return percentage: (readCount / totalPages) * 100
```

### 3. Bookmarking with Page Context

**Approach:** Store verseKey as the universal identifier. When displaying bookmark, look up the page for the user's current Mushaf.

```text
Pseudo-code:
1. Save bookmark with verseKey (universal)
2. Optionally cache mushafId and pageNumber
3. To resolve bookmark for different Mushaf:
   - If cached Mushaf matches, use cached page
   - Otherwise, call pages/lookup with from=verseKey&to=verseKey
   - Return first page from response
```

### 4. Mushaf Switcher

**Approach:** When switching Mushaf, look up the page for the current verse in the new Mushaf, then fetch verses for that page.

```text
Pseudo-code:
1. Get currentVerseKey from current reading position
2. Call pages/lookup for new Mushaf with from=currentVerseKey&to=currentVerseKey
3. Get target page from lookup.pages
4. Fetch verses for target page with from/to from pageInfo
5. Return new page, pageInfo, and verses
```

---

## Font Scale and Layout Behavior

When implementing a Reading View that aims to replicate physical Mushaf pages, font size selection significantly impacts layout fidelity.

### Maintaining Mushaf Page Boundaries

At smaller font scales, you can maintain **authentic Mushaf page boundaries**:

- Each line matches the same boundaries as the physical Mushaf
- Page breaks align with printed Mushaf pages
- Words don't overflow their designated line positions

This creates an interleaved reading experience that closely mirrors reading from a physical Quran.

### Big Text Layout Mode

At larger font sizes, it becomes impossible to maintain exact print fidelity. Consider implementing a "Big Text Layout" mode when `fontScale > 3` or Word-by-Word is enabled.

**Layout behavior comparison:**

| Aspect | Normal Layout (Small fonts) | Big Text Layout (Large fonts) |
|--------|----------------------------|-------------------------------|
| Line boundaries | Strictly maintained | Relaxed for readability |
| Page fidelity | Matches physical Mushaf | May differ from print |
| Word wrapping | Preserves Mushaf line breaks | Allows natural wrapping |
| Primary goal | Authenticity | Accessibility |

**Why this matters:** At larger font sizes, it's physically impossible to maintain exact line boundaries without horizontal scrolling or text overflow. Prioritize readability and accessibility over strict print layout adherence when users choose larger text sizes.

### Recommended Font Scale Levels

| Level | Description | Layout Behavior |
|-------|-------------|----------------|
| 1-3 | Small sizes | Maintain strict Mushaf boundaries |
| 3 | **Default** | Balanced default |
| 4-5 | Medium sizes | Consider relaxing constraints |
| 6-10 | Large sizes | Use Big Text Layout mode |

---

## Best Practices

### 1. Cache Pages Lookup Data

Pages lookup for a chapter/Mushaf combination is static. Cache it using a Map with key `"${chapterNumber}-${mushafId}"` to avoid redundant API calls.

### 2. Prefetch Adjacent Pages

For smooth navigation, prefetch previous/next pages in parallel when the user views a page. Use `Promise.all()` to fetch adjacent pages concurrently.

### 3. Handle Mushaf Changes Gracefully

When the user switches Mushaf, don't assume the same page number is valid. Always re-lookup the page for the current verse using the new Mushaf ID.

### 4. Validate Page Numbers

Different Mushafs have different page counts. Validate page numbers against:

| Mushaf ID | Pages |
|-----------|-------|
| 1, 2 (QCF) | 604 |
| 6 (IndoPak 15-line) | 610 |
| 7 (IndoPak 16-line) | 548 |

---

## Troubleshooting

### Issue: Empty Pages Object

**Symptom**: `pages` is empty in the response

**Cause**: Invalid resource identifier or Mushaf ID

**Solution**: Verify your parameters - use valid `mushaf` ID (1-7) and valid `chapter_number` (1-114)

### Issue: Wrong Page Numbers

**Symptom**: Page numbers don't match expected Mushaf

**Cause**: Using wrong Mushaf ID

**Solution**: Double-check Mushaf ID. IndoPak uses ID 3, 6, or 7. QCF uses ID 1 or 2.

### Issue: Verses Spanning Pages

**Symptom**: A verse appears on multiple pages

**Cause**: This is normal! In some Mushafs, verses can span page boundaries.

**Solution**: Use word-level `page_number` for accurate rendering. Check if `verse.words` have different `page_number` values to detect spanning verses.

### Issue: Different Verse Counts

**Symptom**: Total verse count differs from expected

**Cause**: Using pages lookup range vs chapter verse count

**Solution**: The `lookupRange` in the response gives the actual verse range (e.g., `{ from: "2:1", to: "2:286" }`).

---

## Summary

The Pages Lookup API is essential for building authentic Mushaf experiences:

1. **Always specify mushaf ID** - Different Mushafs have different layouts
2. **Use the pages object** - It tells you exactly which verses are on each page
3. **Cache wisely** - Lookup data is static per chapter/Mushaf combination
4. **Handle Mushaf switches** - Re-lookup page when user changes Mushaf
5. **Use word-level positioning** - For accurate line-by-line rendering

For questions or issues, refer to the [API documentation](https://api-docs.quran.foundation) or open an issue on GitHub.
