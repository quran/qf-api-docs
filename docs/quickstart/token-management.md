---
title: "Token Management for Content APIs"
description: "Cache Quran Foundation Content API tokens correctly, re-request them before expiry, retry once on 401, and prevent concurrent token stampedes."
keywords:
  - "token caching"
  - "OAuth2 client credentials"
  - "re-request token"
  - "401 retry"
  - "stampede prevention"
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

## Retry Once on 401

If a Content API request returns `401 Unauthorized`, treat the token as expired or invalid:

1. Clear the cached token.
2. Request a fresh token from `/oauth2/token`.
3. Retry the failed API request once.
4. If it still fails, surface the error instead of looping.

This is a re-request, not a refresh. Client Credentials has no refresh token in this flow.

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

## Next Step

Continue with [first API call](/docs/quickstart/first-api-call) to send the required headers and verify the integration with `GET /content/api/v4/chapters`.
