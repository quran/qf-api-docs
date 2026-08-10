---
name: quran-foundation-api-docs
description: Use when choosing Quran Foundation API families, authentication flows, endpoints, SDK runtime boundaries, Developer Console onboarding, font rendering, or official integration references.
---

# Quran Foundation API Docs

## Use When

- The task involves Quran Foundation APIs, api-docs.quran.foundation, Quran.com integrations, or quranreflect.com integrations.
- The user needs official endpoint selection, request or response details, auth guidance, scopes, quickstarts, or migration help.
- The user needs font rendering or Mushaf page-layout guidance.
- The user needs OAuth2 or OIDC setup guidance across web or mobile platforms.
- The user needs Developer Console onboarding details such as app creation, credentials, app type, redirect URIs, permissions, or existing-client import.
- The user wants to scaffold a Quran Foundation app, choose the official JavaScript or Python SDK path, or use a copyable implementation prompt.
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
- SvelteKit starter prompt: `https://api-docs.quran.foundation/agent-prompts/qf-sveltekit-starter.md`
- JS SDK integration prompt: `https://api-docs.quran.foundation/agent-prompts/qf-js-sdk-integration.md`
- Python SDK integration prompt: `https://api-docs.quran.foundation/agent-prompts/qf-python-sdk-integration.md`
- OAuth/User APIs prompt: `https://api-docs.quran.foundation/agent-prompts/qf-oauth-user-apis.md`
- Review existing integration prompt: `https://api-docs.quran.foundation/agent-prompts/qf-review-existing-integration.md`
- AI Agent Prompts: `https://api-docs.quran.foundation/docs/ai-agents/`
- Developer Journey: `https://api-docs.quran.foundation/docs/developer-journey/`
- API Reference: `https://api-docs.quran.foundation/docs/api-reference/`
- JavaScript SDK: `https://api-docs.quran.foundation/docs/sdk/javascript/`
- Python SDK: `https://api-docs.quran.foundation/docs/sdk/python/`
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
- Developer Console: `https://dev-console.quran.foundation/`
- Developer Console onboarding bridge: `https://api-docs.quran.foundation/request-access/`
- FAQ: `https://api-docs.quran.foundation/docs/tutorials/faq/`
- API catalog: `https://api-docs.quran.foundation/.well-known/api-catalog`

## Working Rules

- Cite official Quran Foundation docs or OpenAPI specs when giving implementation guidance.
- Prefer the most specific doc page for the endpoint in question, not just the docs home page.
- Do not invent endpoints, scopes, parameters, headers, or response fields. Confirm them from the docs or OpenAPI.
- Distinguish documentation URLs from API base URLs.
- For auth questions, call out whether the answer belongs to OAuth2/OIDC or to an application API.
- For setup questions, send developers to Developer Console to create or open an app, select the exact **Frontend or mobile app** or **Backend/server app** type, manage credentials and redirect URIs, and request permissions. Treat `/request-access` as a bridge to Console, not as a provisioning form.
- For Quran font questions, choose between Unicode text rendering and page-based glyph rendering based on the user's display requirements.
- For Quran Reflect-related questions, check post, comment, feed, room, and scope docs before answering.
- If multiple endpoints could fit, explain the best match and mention the alternative only if it materially changes implementation.
- If the user asks for sample code, keep it aligned with documented auth and base URL expectations.
- For JavaScript or TypeScript apps, identify the app type selected in Developer Console before choosing the OAuth and SDK boundary.
  - A **Frontend or mobile app** is a public client with no client secret. Use `@quranjs/api/public` for PKCE authorization, code exchange, and refresh in the app; store user tokens with secure platform-appropriate storage and never log them.
  - A **Backend/server app** is a confidential client. Use `@quranjs/api/public` for browser/mobile-safe authorization initiation and `@quranjs/api/server` for secret-backed code exchange, refresh, server sessions, Content, Search, and proxied User API calls.
- For Python apps, scripts, jobs, notebooks, or AI workflows, prefer the official `quran-foundation-api` package and `QuranClient` from trusted server-side environments, keep credentials out of rendered output and logs, and choose app access tokens for Content/Search APIs versus user access tokens for signed-in User APIs explicitly.
- For new Next.js apps, route the user to the official scaffold and prompt before hand-writing OAuth2 plumbing.
- For SvelteKit apps, route the user to the official `--template sveltekit` scaffold and prompt before hand-writing OAuth2 plumbing.
- For response-shape questions, prefer exact endpoint schemas and documented status-code behavior to explain common success and error variations.

## Fast Routing Hints

- "Get verses, translations, tafsir, chapters, audio, or recitations" -> Content APIs v4
- "Search the Quran" -> Search APIs v1
- "Login, tokens, discovery, issuer metadata, OAuth2, OIDC" -> OAuth2 APIs v1 plus OIDC docs
- "Bookmarks, collections, notes, reading sessions, profile, rooms, posts" -> User-related APIs v1
- "Create a Quran app, starter app, scaffold, copy prompt, AI prompt, build with agents" -> Starter With NPX plus QF_NPX_STARTER_PROMPT_V1
- "SvelteKit starter, SvelteKit scaffold" -> Starter With NPX plus QF_SVELTEKIT_STARTER_PROMPT_V1
- "Existing JS SDK integration, add @quranjs/api" -> JavaScript SDK docs plus QF_JS_SDK_INTEGRATION_PROMPT_V1
- "Python SDK, Python client, quran_foundation, quran-foundation-api, AI workflow in Python" -> Python SDK docs plus QF_PYTHON_SDK_INTEGRATION_PROMPT_V1
- "Review an integration, check mistakes, secret exposure, SDK boundary" -> QF_REVIEW_EXISTING_INTEGRATION_PROMPT_V1 plus exact endpoint schemas
- "Where should I start, what path should I follow, developer journey" -> Developer Journey
- "API reference, endpoint lookup, endpoint docs, all APIs" -> API Reference first, then the exact API family page
- "JavaScript SDK, TypeScript SDK, server/public imports, runtime split" -> JavaScript SDK docs
- "Python SDK, Python client, quran-foundation-api, scripts, notebooks, AI workflows" -> Python SDK docs
- "Web login flow, PKCE, callback, mobile auth, redirect URIs" -> OIDC tutorial pages plus OAuth2 APIs
- "Fonts, glyph codes, Mushaf pages, script rendering, Tajweed display" -> Font rendering and page-layout tutorials plus relevant content endpoints
- "Quran Reflect feed, post, comment, like, save, room, or community behavior" -> User-related posts and rooms docs, and content feed/read docs where applicable
- "Upcoming user API behavior" -> Pre-live user-related docs, and clearly label them as pre-live

## Expected Output

- Name the API family first.
- Link the exact doc page or OpenAPI spec used.
- State any auth requirement or prerequisite clearly.
- If relevant, mention whether the guidance is production or pre-live.
