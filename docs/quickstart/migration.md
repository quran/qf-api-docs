---
title: "Migrate from api.quran.com to Quran Foundation Content APIs"
description: "Update an older api.quran.com integration to Quran Foundation Content APIs by switching base URLs, adding OAuth2 Client Credentials, and keeping response usage compatible."
keywords:
  - "api.quran.com migration"
  - "Quran Foundation Content APIs"
  - "OAuth2 migration"
  - "client credentials migration"
  - "Python requests migration example"
  - "Node fetch migration example"
sidebar_label: "Migration"
displayed_sidebar: "APIsSidebar"
---

Use this page if you previously called the older unauthenticated API at `https://api.quran.com/api/v4/...`.

:::tip What changes in this migration
The main changes are the base URL and authentication model. The endpoints, query parameters, and response shapes remain the same for the covered Content API routes.
:::

## What Changes

| Area | Old integration | New integration |
| --- | --- | --- |
| Base URL | `https://api.quran.com/api/v4/...` | `https://apis-prelive.quran.foundation/content/api/v4/...` or `https://apis.quran.foundation/content/api/v4/...` |
| Authentication | None | OAuth2 Client Credentials |
| Token endpoint | Not used | `{authBaseUrl}/oauth2/token` |
| Required headers | None | `x-auth-token`, `x-client-id` |

## Environment URLs

| Environment | Auth URL | API base URL |
| --- | --- | --- |
| Pre-Production | `https://prelive-oauth2.quran.foundation` | `https://apis-prelive.quran.foundation` |
| Production | `https://oauth2.quran.foundation` | `https://apis.quran.foundation` |

## Migration Checklist

1. Request Quran Foundation API access and store the credentials on your backend.
2. Replace the old `api.quran.com` base URL with the correct Quran Foundation Content API base URL.
3. Add OAuth2 Client Credentials token retrieval with `scope=content`.
4. Cache the token and re-request it before expiry.
5. Add `x-auth-token` and `x-client-id` to every Content API request.
6. Verify the migration with `GET /content/api/v4/chapters`.

## Before and After Example

Older unauthenticated request:

```bash
curl --request GET \
  --url https://api.quran.com/api/v4/chapters
```

Updated authenticated request (replace `{apiBaseUrl}` with your prelive or production Content API base URL):

```bash
curl --request GET \
  --url {apiBaseUrl}/content/api/v4/chapters \
  --header "x-auth-token: YOUR_ACCESS_TOKEN" \
  --header "x-client-id: YOUR_CLIENT_ID"
```

<details>
<summary><b>Expand for Python and Node.js migration examples</b></summary>

Python migration example:

```python
import os

import requests

env = os.getenv("QF_ENV", "prelive")
API_BASE_URL = (
    "https://apis.quran.foundation"
    if env == "production"
    else "https://apis-prelive.quran.foundation"
)
access_token = "YOUR_ACCESS_TOKEN"  # Replace with your token helper or prior manual-auth step.

response = requests.get(
    f"{API_BASE_URL}/content/api/v4/chapters",
    headers={
        "x-auth-token": access_token,
        "x-client-id": os.environ["QF_CLIENT_ID"],
    },
    timeout=30,
)
response.raise_for_status()
```

Node.js migration example:

```js
async function fetchChapters() {
  const env = process.env.QF_ENV ?? "prelive";
  const apiBaseUrl =
    env === "production"
      ? "https://apis.quran.foundation"
      : "https://apis-prelive.quran.foundation";

  const response = await fetch(`${apiBaseUrl}/content/api/v4/chapters`, {
    headers: {
      "x-auth-token": "YOUR_ACCESS_TOKEN",
      "x-client-id": process.env.QF_CLIENT_ID,
    },
  });

  if (!response.ok) {
    throw new Error(`Migration check failed: ${response.status}`);
  }

  return response.json();
}
```

</details>

## Compatibility Notes

- Tokens are environment-specific. Do not use prelive tokens against production or the reverse.
- This quickstart flow does not use refresh tokens. Re-request the access token instead.
- A `403` usually points to missing permissions or the wrong scope. Use `scope=content`.
- A `401` usually means the token expired or was invalid. Re-request once and retry once.

## AI Handoff Prompt

Use this prompt when you want an AI coding tool to update an older `api.quran.com` integration:

<details>
<summary><b>Expand AI handoff prompt</b></summary>

```text
Migrate an existing api.quran.com Content API integration to Quran Foundation Content APIs.

Requirements
- Replace the old base URL with the correct Quran Foundation prelive or production base URL.
- Add backend-only OAuth2 Client Credentials token retrieval with scope=content.
- Add x-auth-token and x-client-id to every Content API request.
- Preserve existing endpoint paths, query parameters, and response handling where the API contract is unchanged.
- Verify the migration with GET /content/api/v4/chapters.

Documentation to follow
- Migration guide: https://api-docs.quran.foundation/docs/quickstart/migration
- Manual authentication: https://api-docs.quran.foundation/docs/quickstart/manual-authentication
- First API call: https://api-docs.quran.foundation/docs/quickstart/first-api-call
```

</details>

## Related Docs

- [Manual authentication](/docs/quickstart/manual-authentication) for credentials and token requests.
- [Token management](/docs/quickstart/token-management) for cache and retry behavior.
- [First API call](/docs/quickstart/first-api-call) for the verification request.
