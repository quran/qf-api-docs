---
title: "First Content API Call"
description: "Make your first authenticated Quran Foundation Content API request with the required headers, a backend proxy pattern, and a simple verification step."
keywords:
  - "first API call"
  - "x-auth-token"
  - "x-client-id"
  - "chapters endpoint"
  - "backend proxy"
  - "Python requests chapters example"
sidebar_label: "First API Call"
displayed_sidebar: "APIsSidebar"
---

Use this page to verify that your token retrieval and header injection are working correctly.

:::tip What this page covers
The required request headers, the first `GET /content/api/v4/chapters` call, a backend proxy pattern, and a simple success check.
:::

## Required Headers

Every authenticated Content API request must include both headers:

```http
x-auth-token: YOUR_ACCESS_TOKEN
x-client-id: YOUR_CLIENT_ID
```

## First Request: List Chapters

Use the chapters endpoint as your first verification call:

```bash
curl --request GET \
  --url https://apis-prelive.quran.foundation/content/api/v4/chapters \
  --header "x-auth-token: YOUR_ACCESS_TOKEN" \
  --header "x-client-id: YOUR_CLIENT_ID"
```

### Python Example (`requests`)

```python
import os

import requests

API_BASE_URL = (
    "https://apis.quran.foundation"
    if os.getenv("QF_ENV") == "production"
    else "https://apis-prelive.quran.foundation"
)

response = requests.get(
    f"{API_BASE_URL}/content/api/v4/chapters",
    headers={
        "x-auth-token": os.environ["QF_ACCESS_TOKEN"],
        "x-client-id": os.environ["QF_CLIENT_ID"],
    },
    timeout=30,
)
response.raise_for_status()

data = response.json()
print(data["chapters"][0]["name_simple"])
```

This example assumes you already stored the access token from the [manual authentication](/docs/quickstart/manual-authentication) step.

### Example Successful Response

```json
{
  "chapters": [
    {
      "id": 1,
      "name_simple": "Al-Fatihah",
      "verses_count": 7
    }
  ]
}
```

## Backend Proxy Pattern

Prefer exposing a backend route instead of letting the browser call the Content APIs directly.

```js
app.get("/chapters", async (req, res) => {
  try {
    const data = await callQfApi("/content/api/v4/chapters");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});
```

Your frontend can then call your backend route without handling tokens:

```js
const response = await fetch("/chapters");
const data = await response.json();
```

## AI Handoff Prompt

Use this prompt when you want an AI coding tool to wire up the first authenticated Content API request:

```text
Implement the first authenticated Quran Foundation Content API call on the backend.

Requirements
- Call GET /content/api/v4/chapters against the correct prelive or production base URL.
- Send both required headers: x-auth-token and x-client-id.
- Reuse the existing backend token helper instead of requesting a new token for every request.
- Expose a backend route or service method that returns the chapters response without leaking credentials to the frontend.
- Verify success by checking that the response contains a chapters array.

Documentation to follow
- First API call: https://api-docs.quran.foundation/docs/quickstart/first-api-call
- Token management: https://api-docs.quran.foundation/docs/quickstart/token-management
- Content API reference: https://api-docs.quran.foundation/docs/category/content-apis
```

## Verification Checklist

- The request returns JSON with a `chapters` array.
- Your backend sent both `x-auth-token` and `x-client-id`.
- No tokens or secrets appear in logs.
- If the token had expired, your client re-requested it once and retried once.

## Continue

- Review [token management](/docs/quickstart/token-management) if you still need to add caching or retry logic.
- Review the [Content API reference](/docs/category/content-apis) after the first call succeeds.
- Review the [migration guide](/docs/quickstart/migration) if you are upgrading an older integration.
