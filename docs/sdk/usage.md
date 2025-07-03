---
id: usage
title: "📚 SDK Usage"
sidebar_label: Usage Examples
---

This page highlights the main wrappers exported by the SDK. All examples assume you have already called `configure`.

## Chapters

```javascript
// List all chapters
const chapters = await quran.qf.chapters.findAll();

// Get a single chapter by ID
const chapter = await quran.qf.chapters.findById('1');

// Retrieve chapter information
const info = await quran.qf.chapters.findInfoById('1');
```

## Verses

```javascript
// Get verses of a chapter
const verses = await quran.qf.verses.findByChapter('1');

// Fetch a verse by key
const verse = await quran.qf.verses.findByKey('1:1');

// Retrieve a random verse
const random = await quran.qf.verses.findRandom();
```

Additional helpers include `findByPage`, `findByJuz`, `findByHizb` and `findByRub`.

## Juzs

```javascript
const juzs = await quran.qf.juzs.findAll();
```

## Audio

```javascript
// All chapter recitations for a reciter
const files = await quran.qf.audio.findAllChapterRecitations('2');

// Verse recitations by chapter
const recitations = await quran.qf.audio.findVerseRecitationsByChapter('1', '2');
```

Other helpers cover pages, hizbs, rubs and specific verses.

## Resources

```javascript
// Available translations
const translations = await quran.qf.resources.findAllTranslations();

// Reciter information
const reciterInfo = await quran.qf.resources.findRecitationInfo('1');
```

This wrapper also exposes methods for languages, tafsirs, recitation styles, chapter reciters and more.

## Search

```javascript
const results = await quran.qf.search.search('mercy');
```

## Utilities

```javascript
import { quran } from '@quranjs/api';

quran.utils.isValidVerseKey('2:255'); // true
quran.utils.isValidChapterId('115'); // false
```

See the [Endpoint Reference](endpoints.md) for a list of API routes these wrappers use.
