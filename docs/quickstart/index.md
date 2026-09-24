---
id: "index"
title: "Quran Foundation Content APIs OAuth2 Quickstart"
description: "Fastest way to call Quran Foundation Content APIs with OAuth2 Client Credentials, the official JS/TS SDK, or a minimal manual integration."
keywords:
  - "Quran Foundation Content APIs"
  - "Quran Foundation API quickstart"
  - "OAuth2 Client Credentials"
  - "content API v4"
  - "@quranjs/api"
  - "scope=content"
sidebar_label: "Content APIs Quickstart"
displayed_sidebar: "APIsSidebar"
---

Use this quickstart after choosing Content APIs from the [Developer Journey](/docs/developer-journey). It gets you to your first authenticated, read-only request for Quranic content such as chapters, verses, translations, and recitations without exposing credentials.

:::important Choose the right API and OAuth2 flow
| You need | API and flow | Where to start |
| --- | --- | --- |
| Quranic content from a backend | Content APIs with **Client Credentials** and `scope=content` | Continue with this quickstart. |
| A signed-in person's data, such as bookmarks or collections | User-related APIs with **Authorization Code + PKCE** | Follow the [User APIs Quickstart](/docs/tutorials/oidc/user-apis-quickstart). |

A browser or mobile app must not embed a Content API `client_secret`. If it needs Content API data, call your own backend, which holds the secret and makes the Content API request.
:::

:::info Quick Summary
**Audience:** Backend teams, server-rendered apps, and web apps that proxy Content API calls through a server.

**Prerequisites:** A **Backend/server app** from [Developer Console](https://dev-console.quran.foundation/projects), its pre-live `client_id`, and its one-time `client_secret`. **Frontend or mobile app** clients cannot use this Client Credentials flow because they do not have a client secret. New apps begin in pre-live, so use the pre-live credentials and endpoints below; move to production only after production permissions are approved.

**Recommended path:** Use the official JS/TS SDK for JavaScript or TypeScript backends. Use raw HTTP for non-JS stacks or when you want to inspect the OAuth2 Client Credentials flow directly.

**Outcome:** A working `/chapters` request with the correct auth flow, headers, and environment URLs.
:::

:::warning Prelive Content API limitation
The prelive environment is for testing and development only. Its Quran content dataset includes only Al-Fatihah (surah 1) and Al-Baqarah (surah 2). Test content requests using these surahs. For the complete Quran dataset, use the production environment after production access is approved.
:::

:::info Naming convention used in this quickstart
The manual examples in this section use `QF_CLIENT_ID`, `QF_CLIENT_SECRET`, and `QF_ENV` as the canonical environment variable names. If your project already uses `QURAN_CLIENT_ID` and `QURAN_CLIENT_SECRET`, keep one naming scheme consistently across your codebase.
:::

## Recommended Architecture

For Content APIs, the default and safest architecture is:

1. Store `client_id` and `client_secret` on your backend only.
2. Request an access token from `POST /oauth2/token` with `grant_type=client_credentials&scope=content`.
3. Cache the `access_token` until it is close to expiry.
4. Send `x-auth-token` and `x-client-id` on every Content API request.
5. If the API returns `401`, re-request a token once and retry once.

This is an OAuth2 Client Credentials integration, so there is no `refresh_token`. When the token expires, request a new one from the same token endpoint.

## First SDK Request

If you are building a JavaScript or TypeScript backend, start with [`@quranjs/api`](https://github.com/quran/api-js). It gives you typed Content/Search clients and handles OAuth2 token retrieval, caching, early re-requesting, and the required headers.

```bash
npm install @quranjs/api
```

```ts
import { createServerClient } from "@quranjs/api/server";

const client = createServerClient({
  clientId: process.env.QF_CLIENT_ID!,
  clientSecret: process.env.QF_CLIENT_SECRET!,
  services: {
    gatewayUrl: "https://apis-prelive.quran.foundation",
    oauth2BaseUrl: "https://prelive-oauth2.quran.foundation",
  },
});

const chapters = await client.content.v4.chapters.list();
```

This example is for backend/server code because it uses `client_secret`, and it explicitly overrides the SDK's production defaults so a new Console app works in pre-live. After production permissions are granted, switch the credentials, `gatewayUrl`, and `oauth2BaseUrl` to production together.

| SDK entrypoint | Use it for | Credentials and flow |
| --- | --- | --- |
| [`@quranjs/api/server`](/docs/sdk/javascript/server-quickstart) | Backend Content API requests (and permitted server-side APIs) | Confidential client: `client_id` and server-only `client_secret`; Client Credentials for Content. |
| [`@quranjs/api/public`](/docs/sdk/javascript/public-quickstart) | Browser/mobile User APIs with a **Frontend or mobile app** | `clientType: "public"`: `client_id` and Authorization Code + PKCE; the public client can exchange the code. **Not** for Content APIs. |
| [`@quranjs/api/public`](/docs/sdk/javascript/full-stack) | Frontend User APIs with a **Backend/server app** | `clientType: "confidential-proxy"`: start login with PKCE in the frontend; exchange the code on the backend with `client_secret`. See the [full-stack quickstart](/docs/sdk/javascript/full-stack). |

For runtime configuration and endpoint-specific examples, continue with the [JavaScript SDK guide](/docs/sdk/javascript).

## First Raw HTTP Request

If you are not using the SDK, the smallest successful manual flow is:

```bash
curl --request POST \
  --url https://prelive-oauth2.quran.foundation/oauth2/token \
  --user 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials&scope=content'
```

Take the returned `access_token` and call the API with both required headers:

```bash
curl --request GET \
  --url https://apis-prelive.quran.foundation/content/api/v4/chapters \
  --header "x-auth-token: YOUR_ACCESS_TOKEN" \
  --header "x-client-id: YOUR_CLIENT_ID"
```

### Python and Node.js without the SDK

The same two-step flow is available as copyable, backend-only examples:

1. [Request a token in Python (`requests`) or Node.js (`fetch`)](/docs/quickstart/manual-authentication#token-request). Both examples use HTTP Basic authentication, a form-encoded body, and a status check before reading the token.
2. [Call `/chapters` in Python or Node.js](/docs/quickstart/first-api-call#first-request-list-chapters). Both examples send `x-auth-token` and `x-client-id` and check the response status.
3. [Add caching and a single 401 retry](/docs/quickstart/token-management) before using a manual integration in a long-running service. Do not request a token for every API call or print tokens to logs.

These examples default to pre-live and use `QF_CLIENT_ID`, `QF_CLIENT_SECRET`, and optionally `QF_ENV`. Keep the secret in backend environment configuration, never browser or mobile code.

## Quick Reference

| Item | Value |
| --- | --- |
| OAuth2 flow | `client_credentials` |
| Required scope | `content` |
| Token endpoint path | `/oauth2/token` |
| Access token lifetime | `3600` seconds |
| Required API headers | `x-auth-token`, `x-client-id` |
| Token renewal model | Re-request a new token before expiry |
| Refresh token | Not used in Client Credentials |

### Environment URLs

| Environment | Auth URL | API base URL |
| --- | --- | --- |
| Pre-Production | `https://prelive-oauth2.quran.foundation` | `https://apis-prelive.quran.foundation` |
| Production | `https://oauth2.quran.foundation` | `https://apis.quran.foundation` |

### Troubleshooting

Check the response status and the error body's `type` and `message`; do not blindly retry every failure. The [first API call guide](/docs/quickstart/first-api-call#handle-errors) has the full error table.

| Status | Check or action |
| --- | --- |
| `400` / `422` | Correct missing headers or invalid parameters; do not retry the same request unchanged. |
| `401` | Clear the cached token, obtain a new one, and retry **once**. |
| `403` | Check the client ID, matching environment, approved permissions, and `content` scope; do not loop. |
| `429` | Respect rate limits; retry later with bounded exponential backoff and jitter. |
| `5xx` | Retry transient failures with bounded backoff, then surface the error. |

If token retrieval itself fails, check the Client Credentials request, credentials, and auth environment in [manual authentication](/docs/quickstart/manual-authentication#token-request).

### Integration Rules

- Keep `client_secret` on the server only.
- Cache tokens and re-request them shortly before expiry.
- Always include both `x-auth-token` and `x-client-id`.
- Do not mix pre-live and production credentials, hosts, or tokens.
- If you render Quranic text in a browser, add `<meta name="google" content="notranslate">` and mark Quranic text containers with `translate="no"`.

## Next Steps

- Explore the [Content API reference](/docs/category/content-apis) after your first successful call.
- Use the [JS/TS SDK docs](/docs/sdk/javascript) if you are building in JavaScript or TypeScript and want typed clients.
- Read [manual authentication](/docs/quickstart/manual-authentication), [token management](/docs/quickstart/token-management), and [first API call](/docs/quickstart/first-api-call) if you are using raw HTTP.
- Use the [migration guide](/docs/quickstart/migration) if you are moving from `https://api.quran.com/api/v4/...`.

## Need Help?

Create and manage credentials, environments, and permission requests in [Developer Console](https://dev-console.quran.foundation/projects). If Developer Console cannot resolve the issue or you still need help, email [developers@quran.com](mailto:developers@quran.com).
