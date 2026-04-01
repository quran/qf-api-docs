---
title: "First Content API Call"
description: "Make your first authenticated Quran Foundation Content API request with the required headers, a backend proxy pattern, and a simple verification step."
keywords:
  - "first API call"
  - "x-auth-token"
  - "x-client-id"
  - "chapters endpoint"
  - "backend proxy"
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

## Verification Checklist

- The request returns JSON with a `chapters` array.
- Your backend sent both `x-auth-token` and `x-client-id`.
- No tokens or secrets appear in logs.
- If the token had expired, your client re-requested it once and retried once.

## Continue

- Review [token management](/docs/quickstart/token-management) if you still need to add caching or retry logic.
- Review the [Content API reference](/docs/category/content-apis) after the first call succeeds.
- Review the [migration guide](/docs/quickstart/migration) if you are upgrading an older integration.
