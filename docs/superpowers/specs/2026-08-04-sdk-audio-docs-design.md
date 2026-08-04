# Complete JavaScript SDK Audio Documentation Design

## Context

The JavaScript SDK already exposes typed helpers for chapter and ayah recitation audio, but the current Audio API page demonstrates only two of the four helpers. It also does not explain how to discover the two different resource IDs used by chapter and ayah audio, which can lead developers to interchange `reciter_id` and `recitation_id` incorrectly.

## Goal

Make the JavaScript Audio API page a complete, dependable starting point for developers who want to add Quran audio playback to an application.

## Scope

The page will:

- explain the difference between chapter recitations, ayah recitations, and word-by-word pronunciation;
- show how to discover chapter-reciter IDs and ayah-recitation IDs;
- document all four typed audio helpers:
  - `chapterRecitation.list()`;
  - `chapterRecitation.get()`;
  - `verseRecitation.byChapter()`;
  - `verseRecitation.byKey()`;
- describe the principal response fields and the SDK's absolute ayah-audio URL normalization;
- explain that Content API calls require the server SDK and that credentials must remain on the backend;
- link to the complete raw Content API audio reference for filters and timing operations that do not have typed facade helpers;
- link to the Developer Terms for usage, storage, redistribution, and commercial-use requirements.

## Non-goals

- Do not add or change SDK functionality.
- Do not present the generated `Promise<unknown>` raw operation catalog as a stable, typed SDK surface.
- Do not duplicate every endpoint-level parameter and response schema already maintained in the generated Content API reference.
- Do not introduce new licensing or attribution policy beyond the published Developer Terms.

## Page Structure

1. Existing runtime and credential summary.
2. Audio-source selection table.
3. Resource-ID discovery and an explicit warning that the IDs are not interchangeable.
4. Complete typed-helper reference with concise TypeScript examples.
5. Response-shape notes for chapter and ayah audio.
6. Links to advanced raw API capabilities, including alternative range filters and timestamp lookup.
7. Server-side integration guidance.
8. Usage-permissions link and concise, non-legal interpretation.
9. Common mistakes.

## Accuracy Boundaries

Examples will use the current `@quranjs/api/server` entrypoint and the method names implemented by `api-js`. Links will point to versioned or redirect-stable pages in the Quran Foundation documentation portal. Licensing language will direct developers to the Developer Terms instead of attempting to create a parallel policy.

## Validation

- Run the repository test suite.
- Run the Docusaurus production build to catch broken MDX, imports, and links that are validated locally.
- Review the rendered content structure in the generated output when practical.
- Confirm the Git diff contains only the design specification and the intended SDK documentation changes.

## Success Criteria

A developer can use one SDK page to choose the correct audio resource, obtain the correct ID, call any typed audio helper, understand the backend requirement, find advanced endpoint documentation, and locate the applicable usage terms.
