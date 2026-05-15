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

Use this quickstart after choosing Content APIs from the [Developer Journey](/docs/developer-journey). It gets you to your first authenticated Content API request without exposing credentials.

:::info Quick Summary
**Audience:** Backend teams, server-rendered apps, and web apps that proxy Content API calls through a server.

**Prerequisites:** A `client_id` and `client_secret` from [Request Access](/request-access), plus a choice of `prelive` or `production`.

**Recommended path:** Use the official JS/TS SDK for JavaScript or TypeScript backends. Use raw HTTP for non-JS stacks or when you want to inspect the OAuth2 Client Credentials flow directly.

**Outcome:** A working `/chapters` request with the correct auth flow, headers, and environment URLs.
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
});

const chapters = await client.content.v4.chapters.list();
```

This example is for backend/server code because it uses `client_secret`. Continue with the [JavaScript SDK guide](/docs/sdk/javascript) for installation, runtime configuration, and endpoint-specific SDK examples.

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

For the complete backend-safe version, continue with [manual authentication](/docs/quickstart/manual-authentication), [token management](/docs/quickstart/token-management), and [first API call](/docs/quickstart/first-api-call).

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

### Integration Rules

- Keep `client_secret` on the server only.
- Cache tokens and re-request them shortly before expiry.
- Always include both `x-auth-token` and `x-client-id`.
- Do not mix prelive and production tokens.
- If you render Quranic text in a browser, add `<meta name="google" content="notranslate">` and mark Quranic text containers with `translate="no"`.

## Next Steps

- Explore the [Content API reference](/docs/category/content-apis) after your first successful call.
- Use the [JS/TS SDK docs](/docs/sdk/javascript) if you are building in JavaScript or TypeScript and want typed clients.
- Read [manual authentication](/docs/quickstart/manual-authentication), [token management](/docs/quickstart/token-management), and [first API call](/docs/quickstart/first-api-call) if you are using raw HTTP.
- Use the [migration guide](/docs/quickstart/migration) if you are moving from `https://api.quran.com/api/v4/...`.

## Need Help?

Email [developers@quran.com](mailto:developers@quran.com) if you need help with access, environment setup, or permissions.
