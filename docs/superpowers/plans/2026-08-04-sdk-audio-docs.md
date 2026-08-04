# Complete JavaScript SDK Audio Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the JavaScript SDK Audio API page into a complete entry point for chapter, ayah, and word-level playback.

**Architecture:** Keep the hand-written SDK guide focused on typed `@quranjs/api/server` helpers and route developers to the generated Content API reference for advanced raw endpoint capabilities. Derive every method name, parameter order, response field, and ID source from the current `api-js` implementation and public OpenAPI contract.

**Tech Stack:** Docusaurus 2, MDX, TypeScript examples, Yarn 1, Node.js.

## Global Constraints

- Do not change SDK functionality or generated API reference files.
- Do not document generated `Promise<unknown>` raw operations as stable typed SDK helpers.
- Do not duplicate complete endpoint schemas maintained by the generated Content API reference.
- Do not invent licensing or attribution policy beyond the published Developer Terms.
- Keep all Content API credential handling on the server.

---

### Task 1: Complete the JavaScript Audio API guide

**Files:**
- Modify: `docs/sdk/javascript/audio.mdx`
- Reference: `C:/Code/api-js/packages/api/src/sdk/audio.ts`
- Reference: `C:/Code/api-js/packages/api/src/runtime/create-client.ts`
- Reference: `openAPI/content/v4.json`

**Interfaces:**
- Consumes: `client.content.v4.audio.chapterRecitation.list(reciterId, query?)`, `client.content.v4.audio.chapterRecitation.get(reciterId, chapterId, query?)`, `client.content.v4.audio.verseRecitation.byChapter(chapterId, recitationId, query?)`, and `client.content.v4.audio.verseRecitation.byKey(verseKey, recitationId, query?)`.
- Produces: One stable documentation URL at `/docs/sdk/javascript/audio` that explains typed audio retrieval, ID discovery, response interpretation, advanced endpoint links, backend safety, and usage terms.

- [ ] **Step 1: Verify the SDK contract before editing**

Run:

```powershell
rg -n "chapterRecitation|verseRecitation|findAllChapterRecitations|findChapterRecitationById|findVerseRecitationsByChapter|findVerseRecitationsByKey" C:\Code\api-js\packages\api\src\sdk\audio.ts C:\Code\api-js\packages\api\src\runtime\create-client.ts
```

Expected: all four typed helpers and their parameter order are present.

- [ ] **Step 2: Expand the guide with the complete typed workflow**

Update `docs/sdk/javascript/audio.mdx` to include:

```ts
const chapterReciters =
  await client.content.v4.resources.chapterReciters.list();
const ayahRecitations =
  await client.content.v4.resources.recitations.list();

const allChapterAudio =
  await client.content.v4.audio.chapterRecitation.list("7");
const oneChapterAudio =
  await client.content.v4.audio.chapterRecitation.get("7", "1");

const chapterAyahAudio =
  await client.content.v4.audio.verseRecitation.byChapter("1", "7");
const oneAyahAudio =
  await client.content.v4.audio.verseRecitation.byKey("2:255", "7");
```

Add prose that explicitly states:

- `chapterReciters.list()` returns IDs for chapter audio and timing endpoints.
- `recitations.list()` returns IDs for ayah-by-ayah audio.
- The two ID families are not interchangeable.
- Chapter responses expose `audioUrl`, `chapterId`, `fileSize`, and `format`.
- Ayah responses expose `audioFiles`, `pagination`, `verseKey`, `url`, and normalized absolute `audioUrl`.
- Word pronunciation uses `word.audioUrl` from the Verses API.

- [ ] **Step 3: Add advanced endpoint and policy links**

Link the guide to:

- `/docs/content_apis_versioned/chapter-reciters`
- `/docs/content_apis_versioned/recitations`
- `/docs/content_apis_versioned/chapter-reciter-audio-files`
- `/docs/content_apis_versioned/recitation-audio-files`
- `/docs/content_apis_versioned/audio-reciter-timestamp`
- `/docs/content_apis_versioned/audio-reciter-lookup`
- `/legal/developer-terms`

Explain that juz, page, hizb, rub el hizb, manzil, ruku, timestamp, and lookup capabilities are documented in the raw Content API reference but do not currently have dedicated typed audio-facade helpers.

- [ ] **Step 4: Run focused documentation checks**

Run:

```powershell
yarn test
yarn build
```

Expected: both commands exit with status 0; Docusaurus reports a successful production build.

- [ ] **Step 5: Inspect the final diff and links**

Run:

```powershell
git diff --check
git diff -- docs/sdk/javascript/audio.mdx
rg -n "chapterRecitation|verseRecitation|chapterReciters|Developer Terms|timestamp|lookup" docs/sdk/javascript/audio.mdx
```

Expected: no whitespace errors; all four typed helpers, both resource-ID sources, advanced capability links, and the terms link are present.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- docs/sdk/javascript/audio.mdx docs/superpowers/plans/2026-08-04-sdk-audio-docs.md
git commit -m "Complete JavaScript SDK audio documentation"
```
