---
name: quran-foundation-api-docs
description: Use Quran Foundation docs and tutorials to choose the correct API family, authentication flow, endpoint, font rendering approach, request-access prerequisite, and official references for content, search, OAuth2/OIDC, user-related, and Quran Reflect integrations.
---

# Quran Foundation API Docs

## Use When

- The task involves Quran Foundation APIs, api-docs.quran.foundation, Quran.com integrations, or quranreflect.com integrations.
- The user needs official endpoint selection, request or response details, auth guidance, scopes, quickstarts, or migration help.
- The user needs font rendering or Mushaf page-layout guidance.
- The user needs OAuth2 or OIDC setup guidance across web or mobile platforms.
- The user needs onboarding details such as client provisioning or Request Access.
- The user wants to scaffold a Quran Foundation app, choose the official JavaScript SDK runtime entrypoint, or use a copyable implementation prompt.
- The task involves Quran Reflect or quranreflect.com features backed by Quran Foundation APIs.
- The user wants links to official documentation or OpenAPI specifications.

## Do Not Use When

- The task is unrelated to Quran Foundation APIs.
- The user needs live production data, account-specific secrets, or environment access that is not present in the docs.

## Route The Request First

1. Identify the correct API family.
   - Content APIs v4: Quran text, translations, tafsir, audio, recitations, verses, chapters, pages, juz, hizb, ruku, manzil, and related content.
   - Search APIs v1: Quran search queries and search-related integration.
   - OAuth2 APIs v1 and OIDC docs: authentication, authorization, tokens, discovery, and login flows.
   - User-related APIs v1: bookmarks, collections, notes, profiles, reading sessions, rooms, posts, and related user features.
   - Font and page-layout tutorials: script rendering, Mushaf layouts, and page-based display guidance.
   - Quran Reflect integrations: posts, comments, feeds, likes, saves, room/page/community features, and related scopes.
2. Prefer stable production docs by default.
3. Only use pre-live user-related docs when the user explicitly asks for upcoming or unreleased behavior.

## Canonical Sources

- Docs home: `https://api-docs.quran.foundation/`
- Content OpenAPI: `https://api-docs.quran.foundation/openAPI/content/v4.json`
- Search OpenAPI: `https://api-docs.quran.foundation/openAPI/search/v1.json`
- OAuth2 OpenAPI: `https://api-docs.quran.foundation/openAPI/oauth2-apis/v1.json`
- User-related OpenAPI (production): `https://api-docs.quran.foundation/openAPI/user-related-apis/v1.json`
- User-related OpenAPI (pre-live): `https://api-docs.quran.foundation/openAPI/user-related-apis/pre-live/v1.json`
- Agent prompt registry: `https://api-docs.quran.foundation/.well-known/agent-prompts/index.json`
- Next.js starter prompt: `https://api-docs.quran.foundation/agent-prompts/qf-next-starter.md`
- Developer Journey: `https://api-docs.quran.foundation/docs/developer-journey/`
- API Reference: `https://api-docs.quran.foundation/docs/api-reference/`
- JavaScript SDK: `https://api-docs.quran.foundation/docs/sdk/javascript/`
- Starter With NPX: `https://api-docs.quran.foundation/docs/tutorials/oidc/starter-with-npx/`
- User APIs OIDC quickstart: `https://api-docs.quran.foundation/docs/tutorials/oidc/user-apis-quickstart/`
- OAuth2 getting started: `https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/`
- OpenID Connect tutorial: `https://api-docs.quran.foundation/docs/tutorials/oidc/openid-connect/`
- OIDC client setup: `https://api-docs.quran.foundation/docs/tutorials/oidc/client-setup/`
- OAuth2 web integration example: `https://api-docs.quran.foundation/docs/tutorials/oidc/example-integration/`
- Mobile apps overview: `https://api-docs.quran.foundation/docs/tutorials/oidc/mobile-apps/`
- Android mobile OIDC guide: `https://api-docs.quran.foundation/docs/tutorials/oidc/mobile-apps/android/`
- iOS mobile OIDC guide: `https://api-docs.quran.foundation/docs/tutorials/oidc/mobile-apps/iOS/`
- React Native OIDC guide: `https://api-docs.quran.foundation/docs/tutorials/oidc/mobile-apps/react-native/`
- Content API quickstart: `https://api-docs.quran.foundation/docs/quickstart/`
- Font rendering tutorial: `https://api-docs.quran.foundation/docs/tutorials/fonts/font-rendering/`
- Page layout tutorial: `https://api-docs.quran.foundation/docs/tutorials/fonts/page-layout/`
- Request access: `https://api-docs.quran.foundation/request-access/`
- FAQ: `https://api-docs.quran.foundation/docs/tutorials/faq/`
- API catalog: `https://api-docs.quran.foundation/.well-known/api-catalog`

## Working Rules

- Cite official Quran Foundation docs or OpenAPI specs when giving implementation guidance.
- Prefer the most specific doc page for the endpoint in question, not just the docs home page.
- Do not invent endpoints, scopes, parameters, headers, or response fields. Confirm them from the docs or OpenAPI.
- Distinguish documentation URLs from API base URLs.
- For auth questions, call out whether the answer belongs to OAuth2/OIDC or to an application API.
- For setup questions, mention if Request Access and registered redirect URIs are prerequisites.
- For Quran font questions, choose between Unicode text rendering and page-based glyph rendering based on the user's display requirements.
- For Quran Reflect-related questions, check post, comment, feed, room, and scope docs before answering.
- If multiple endpoints could fit, explain the best match and mention the alternative only if it materially changes implementation.
- If the user asks for sample code, keep it aligned with documented auth and base URL expectations.
- For JavaScript or TypeScript apps, prefer the official SDK and choose the runtime entrypoint explicitly: `@quranjs/api/public` for app/browser/mobile-facing OAuth helpers and `@quranjs/api/server` for backend Content, Search, token exchange, refresh, and server-side User API calls.
- For new Next.js apps, route the user to the official scaffold and prompt before hand-writing OAuth2 plumbing.

## Fast Routing Hints

- "Get verses, translations, tafsir, chapters, audio, or recitations" -> Content APIs v4
- "Search the Quran" -> Search APIs v1
- "Login, tokens, discovery, issuer metadata, OAuth2, OIDC" -> OAuth2 APIs v1 plus OIDC docs
- "Bookmarks, collections, notes, reading sessions, profile, rooms, posts" -> User-related APIs v1
- "Create a Quran app, starter app, scaffold, copy prompt, AI prompt, build with agents" -> Starter With NPX plus QF_NPX_STARTER_PROMPT_V1
- "Where should I start, what path should I follow, developer journey" -> Developer Journey
- "API reference, endpoint lookup, endpoint docs, all APIs" -> API Reference first, then the exact API family page
- "JavaScript SDK, TypeScript SDK, server/public imports, runtime split" -> JavaScript SDK docs
- "Web login flow, PKCE, callback, mobile auth, redirect URIs" -> OIDC tutorial pages plus OAuth2 APIs
- "Fonts, glyph codes, Mushaf pages, script rendering, Tajweed display" -> Font rendering and page-layout tutorials plus relevant content endpoints
- "Quran Reflect feed, post, comment, like, save, room, or community behavior" -> User-related posts and rooms docs, and content feed/read docs where applicable
- "Upcoming user API behavior" -> Pre-live user-related docs, and clearly label them as pre-live

## Expected Output

- Name the API family first.
- Link the exact doc page or OpenAPI spec used.
- State any auth requirement or prerequisite clearly.
- If relevant, mention whether the guidance is production or pre-live.
