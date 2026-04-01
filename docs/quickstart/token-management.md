---
title: "Token Management for Content APIs"
description: "Cache Quran Foundation Content API tokens correctly, re-request them before expiry, retry once on 401, and prevent concurrent token stampedes."
keywords:
  - "token caching"
  - "OAuth2 client credentials"
  - "re-request token"
  - "401 retry"
  - "stampede prevention"
  - "Python token cache"
sidebar_label: "Token Management"
displayed_sidebar: "APIsSidebar"
---

Use this page when you are implementing the manual Client Credentials flow and need the correct token lifecycle behavior.

:::tip What this page covers
How to cache access tokens, when to re-request them, how to handle `401 Unauthorized`, and how to prevent multiple concurrent requests from fetching the same token repeatedly.
:::

## Content API Token Lifecycle

For Quran Foundation Content APIs:

- Access tokens are valid for `3600` seconds.
- Client Credentials does not use `refresh_token`.
- When the token is close to expiry, request a new token from the same `/oauth2/token` endpoint.
- A good default is to re-request the token about `30` seconds before expiry.

## Recommended Cache Behavior

Store the token together with its expiry and reuse it until it is almost expired.

Language-agnostic flow:

```text
if cached token exists and expires more than 30 seconds from now:
  return cached token

if another request is already fetching a new token:
  wait for that in-flight request

request a new token from /oauth2/token
store access_token and expires_at
return the new token
```

This keeps your integration fast and avoids unnecessary token requests.

### Python Example (`requests` + lock)

```python
import os
import threading
import time

import requests
from requests.auth import HTTPBasicAuth


class QfTokenCache:
    def __init__(self):
        self._lock = threading.Lock()
        self._token = None
        self._expires_at = 0
        self._auth_base_url = (
            "https://oauth2.quran.foundation"
            if os.getenv("QF_ENV") == "production"
            else "https://prelive-oauth2.quran.foundation"
        )
        self._api_base_url = (
            "https://apis.quran.foundation"
            if os.getenv("QF_ENV") == "production"
            else "https://apis-prelive.quran.foundation"
        )

    def clear(self):
        self._token = None
        self._expires_at = 0

    def get_access_token(self):
        now = time.time()
        if self._token and now < self._expires_at - 30:
            return self._token

        with self._lock:
            now = time.time()
            if self._token and now < self._expires_at - 30:
                return self._token

            response = requests.post(
                f"{self._auth_base_url}/oauth2/token",
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
            self._token = token["access_token"]
            self._expires_at = time.time() + token["expires_in"]
            return self._token
```

## Retry Once on 401

If a Content API request returns `401 Unauthorized`, treat the token as expired or invalid:

1. Clear the cached token.
2. Request a fresh token from `/oauth2/token`.
3. Retry the failed API request once.
4. If it still fails, surface the error instead of looping.

This is a re-request, not a refresh. Client Credentials has no refresh token in this flow.

### Python Example (`401` retry once)

```python
cache = QfTokenCache()


def get_json(path):
    token = cache.get_access_token()
    response = requests.get(
        f"{cache._api_base_url}{path}",
        headers={
            "x-auth-token": token,
            "x-client-id": os.environ["QF_CLIENT_ID"],
        },
        timeout=30,
    )

    if response.status_code == 401:
        cache.clear()
        token = cache.get_access_token()
        response = requests.get(
            f"{cache._api_base_url}{path}",
            headers={
                "x-auth-token": token,
                "x-client-id": os.environ["QF_CLIENT_ID"],
            },
            timeout=30,
        )

    response.raise_for_status()
    return response.json()
```

## Stampede Prevention

Without coordination, many requests arriving at the same time can all decide the token is expired and all request a new token at once.

Prevent that with a single in-flight token request:

- JavaScript or TypeScript: keep one shared pending promise.
- Python: use a lock around the token fetch.
- Other runtimes: use whichever synchronization primitive ensures only one token request happens at a time.

The important behavior is that one request fetches the new token while the others wait for it.

## What Not to Do

- Do not request a new token for every API call.
- Do not store a token forever without checking `expires_in`.
- Do not retry `401` in a loop.
- Do not mix caches between `prelive` and `production`.
- Do not log `client_secret` or `access_token`.

## AI Handoff Prompt

Use this prompt when you want an AI coding tool to add safe token lifecycle handling to an existing backend integration:

```text
Implement Quran Foundation Content API token management for a backend Client Credentials integration.

Requirements
- Cache access_token together with its expiry time.
- Re-request a token about 30 seconds before expiry.
- Do not implement refresh_token logic.
- Ensure only one token request is in flight at a time.
- On a 401 from the Content API, clear the cached token, re-request once, and retry once.
- Do not retry in a loop.

Documentation to follow
- Token management: https://api-docs.quran.foundation/docs/quickstart/token-management
- Manual authentication: https://api-docs.quran.foundation/docs/quickstart/manual-authentication
- First API call: https://api-docs.quran.foundation/docs/quickstart/first-api-call
```

## Next Step

Continue with [first API call](/docs/quickstart/first-api-call) to send the required headers and verify the integration with `GET /content/api/v4/chapters`.
