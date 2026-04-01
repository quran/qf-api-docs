---
title: "Manual Authentication for Content APIs"
description: "Configure Quran Foundation Content API credentials, choose the right environment, and request an OAuth2 Client Credentials access token manually."
keywords:
  - "Quran Foundation OAuth2"
  - "client credentials"
  - "manual authentication"
  - "content scope"
sidebar_label: "Manual Authentication"
displayed_sidebar: "APIsSidebar"
---

Use this page when you are not using the JS/TS SDK and need to request Content API tokens manually from your backend.

:::tip What this page covers
Credentials, environment URLs, the exact token request, a sample token response, and the server-only rule for Content APIs.
:::

## Credentials and Environment Variables

These manual examples use the following environment variables:

| Variable | Required | Description |
| --- | --- | --- |
| `QF_CLIENT_ID` | Yes | Your Quran Foundation client ID. |
| `QF_CLIENT_SECRET` | Yes | Your Quran Foundation client secret. Store it on the server only. |
| `QF_ENV` | No | `prelive` or `production`. Default to `prelive` for development and testing. |

If your project already uses `QURAN_CLIENT_ID` and `QURAN_CLIENT_SECRET`, that is fine. Keep one naming scheme consistent throughout your codebase.

## Environment URLs

| Environment | Auth URL | API base URL |
| --- | --- | --- |
| `prelive` | `https://prelive-oauth2.quran.foundation` | `https://apis-prelive.quran.foundation` |
| `production` | `https://oauth2.quran.foundation` | `https://apis.quran.foundation` |

The token is environment-specific. A prelive token will not work against production APIs, and a production token will not work against prelive APIs.

## Token Request

Request the access token from your backend with OAuth2 Client Credentials.

Request details:

- Method: `POST`
- URL: `{authBaseUrl}/oauth2/token`
- Auth: HTTP Basic with `client_id:client_secret`
- Content-Type: `application/x-www-form-urlencoded`
- Body: `grant_type=client_credentials&scope=content`

```bash
curl --request POST \
  --url https://prelive-oauth2.quran.foundation/oauth2/token \
  --user 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials&scope=content'
```

### Sample Token Response

```json
{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "content"
}
```

Track `access_token` and `expires_in`. Client Credentials does not return a refresh token for this quickstart flow.

## Server-Only Rule

Do not call the token endpoint from browser or mobile code. The request requires `client_secret`, and exposing that secret breaks the security model of the integration.

Recommended pattern:

1. Request the token on your backend.
2. Cache it in memory or your server-side cache.
3. Use the token when your backend calls the Content APIs.
4. Return only the API data your frontend needs.

## Continue the Manual Flow

- [Token management](/docs/quickstart/token-management) for caching, early re-requesting, and 401 retry behavior.
- [First API call](/docs/quickstart/first-api-call) for the required headers and the first `GET /chapters` request.
- [Migration guide](/docs/quickstart/migration) if you are updating an older `api.quran.com` integration.
