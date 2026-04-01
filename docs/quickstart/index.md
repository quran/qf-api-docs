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

Use this quickstart to make your first authenticated request to the Quran Foundation Content APIs without exposing your credentials.

:::tip Quick Summary
Audience: backend teams, server-rendered apps, and web apps that proxy Content API calls through a server.

Prerequisites: a `client_id` and `client_secret` from [Request Access](/request-access), plus a choice of `prelive` or `production`.

Recommended path: use the official JS/TS SDK when possible. Otherwise, implement OAuth2 Client Credentials on your backend, cache tokens, add the required headers, and call `/content/api/v4/...`.

Outcome: a working `/chapters` request with the correct auth flow, headers, and environment URLs.
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

## Choose Your Path

| Goal | Start here | What it covers |
| --- | --- | --- |
| Fastest path for JavaScript or TypeScript | [Official JS/TS SDK](/docs/sdk/javascript) | Install `@quranjs/api`, create a client, and let the SDK handle token management and headers. |
| Manual OAuth2 setup | [Manual authentication](/docs/quickstart/manual-authentication) | Credentials, environment URLs, token request, and sample token response. |
| Token reuse and retry behavior | [Token management](/docs/quickstart/token-management) | Caching, early re-requesting, 401 retry-once behavior, and stampede prevention. |
| First authenticated request | [First API call](/docs/quickstart/first-api-call) | Required headers, `GET /chapters`, backend proxy pattern, and verification. |
| Migration from `api.quran.com` | [Migration guide](/docs/quickstart/migration) | Base URL changes, OAuth2 auth requirements, and compatibility notes. |
| Full endpoint reference | [Content API reference](/docs/category/content-apis) | All available endpoints, parameters, and response shapes. |

## Fastest Path for JS/TS: Official SDK

If you are building with JavaScript or TypeScript, start with [`@quranjs/api`](https://github.com/quran/api-js). It already handles OAuth2 token retrieval, caching, early re-requesting, and the required headers.

```bash
npm install @quranjs/api
```

```ts
import { Language, QuranClient } from "@quranjs/api";

const client = new QuranClient({
  clientId,
  clientSecret,
  defaults: {
    language: Language.ENGLISH,
  },
});

const chapters = await client.chapters.findAll();
```

Continue with the [JavaScript SDK quick start](/docs/sdk/javascript) for installation, runtime configuration, and endpoint-specific SDK examples.

## Minimal Manual Example

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

## AI Handoff Prompt

Use this prompt when you want an AI coding tool to implement the recommended flow in your codebase:

```text
Implement Quran Foundation Content APIs using the recommended backend-safe OAuth2 Client Credentials flow.

Requirements
- Use server-side credentials only.
- Request tokens from POST {authBaseUrl}/oauth2/token with grant_type=client_credentials&scope=content.
- Cache the access token and re-request it before expiry. Do not implement refresh_token logic.
- Add x-auth-token and x-client-id to every request to {apiBaseUrl}/content/api/v4/...
- On 401, clear the cached token, re-request once, and retry once.
- Verify the integration with GET /content/api/v4/chapters.

Documentation to follow
- Quickstart hub: https://api-docs.quran.foundation/docs/quickstart/
- Manual auth: https://api-docs.quran.foundation/docs/quickstart/manual-authentication
- Token management: https://api-docs.quran.foundation/docs/quickstart/token-management
- First API call: https://api-docs.quran.foundation/docs/quickstart/first-api-call
- Migration: https://api-docs.quran.foundation/docs/quickstart/migration
- JS/TS SDK: https://api-docs.quran.foundation/docs/sdk/javascript
```

## Next Steps

- Explore the [Content API reference](/docs/category/content-apis) after your first successful call.
- Use the [JS/TS SDK docs](/docs/sdk/javascript) if you want the fastest production-ready integration path.
- Use the [migration guide](/docs/quickstart/migration) if you are moving from `https://api.quran.com/api/v4/...`.
- Contact `developers@quran.com` if you need help with access, environment setup, or permissions.
