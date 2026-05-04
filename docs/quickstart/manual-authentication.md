---
title: "Manual Authentication for Content APIs"
description: "Configure Quran Foundation Content API credentials, choose the right environment, and request an OAuth2 Client Credentials access token manually."
keywords:
  - "Quran Foundation OAuth2"
  - "client credentials"
  - "manual authentication"
  - "content scope"
  - "Python requests token request"
  - "Node fetch client credentials"
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

<details>
<summary><b>Expand for Python and Node.js token request examples</b></summary>

### Python Example (`requests`)

```python
import os

import requests
from requests.auth import HTTPBasicAuth

AUTH_BASE_BY_ENV = {
    "prelive": "https://prelive-oauth2.quran.foundation",
    "production": "https://oauth2.quran.foundation",
}

env = os.getenv("QF_ENV", "prelive")
if env not in AUTH_BASE_BY_ENV:
    raise ValueError(
        f"Invalid QF_ENV value: {env!r}. Expected 'prelive' or 'production'."
    )

AUTH_BASE_URL = AUTH_BASE_BY_ENV[env]

response = requests.post(
    f"{AUTH_BASE_URL}/oauth2/token",
    auth=HTTPBasicAuth(
        os.environ["QF_CLIENT_ID"],
        os.environ["QF_CLIENT_SECRET"],
    ),
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={
        "grant_type": "client_credentials",
        "scope": "content",
    },
    timeout=30,
)
response.raise_for_status()

token = response.json()
access_token = token["access_token"]
expires_in = token["expires_in"]
```

### Node.js Example (`fetch`)

This example assumes Node 18+ or another runtime with a global `fetch` implementation.

```js
async function getToken() {
  const authBaseByEnv = {
    production: "https://oauth2.quran.foundation",
    prelive: "https://prelive-oauth2.quran.foundation",
  };
  const env = process.env.QF_ENV ?? "prelive";
  if (!(env in authBaseByEnv)) {
    throw new Error("QF_ENV must be 'prelive' or 'production'");
  }

  const authBaseUrl = authBaseByEnv[env];

  const basicAuth = Buffer.from(
    `${process.env.QF_CLIENT_ID}:${process.env.QF_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${authBaseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "content",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  return response.json();
}

getToken()
  .then(({ expires_in }) => {
    console.log("Fetched token that expires in", expires_in, "seconds");
  })
  .catch((error) => {
    console.error("Token request failed:", error);
  });
```

</details>

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

## AI Handoff Prompt

Use this prompt when you want an AI coding tool to implement manual token retrieval on your backend:

<details>
<summary><b>Expand AI handoff prompt</b></summary>

```text
Implement Quran Foundation Content API token retrieval on the backend.

Requirements
- Read QF_CLIENT_ID, QF_CLIENT_SECRET, and QF_ENV from environment variables.
- Use prelive -> https://prelive-oauth2.quran.foundation and production -> https://oauth2.quran.foundation.
- Request POST /oauth2/token with HTTP Basic auth, grant_type=client_credentials, and scope=content.
- Return access_token and expires_in from the token response.
- Do not expose client_secret to browser or mobile code.

Documentation to follow
- Manual authentication: https://api-docs.quran.foundation/docs/quickstart/manual-authentication
- Token management: https://api-docs.quran.foundation/docs/quickstart/token-management
```

</details>

## Continue the Manual Flow

- [Token management](/docs/quickstart/token-management) for caching, early re-requesting, and 401 retry behavior.
- [First API call](/docs/quickstart/first-api-call) for the required headers and the first `GET /chapters` request.
- [Migration guide](/docs/quickstart/migration) if you are updating an older `api.quran.com` integration.
