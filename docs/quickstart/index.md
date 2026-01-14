---
id: index
title: 🚀 Quick Start Guide
sidebar_label: Quick Start
---

# 🚀 Quick Start Guide

Welcome to the Quran Foundation API! This Quick Start guide will help you get up and running within minutes.

:::tip Recommended for first-time users
Follow these steps to make your first successful API call.
:::

---

## 📩 Step 1: Request API Access {#step-1-request-api-access}

1. Visit the **[Request Access page](https://api-docs.quran.foundation/request-access)**.
2. Fill out the form to request your **Client ID** and **Client Secret**.
3. Your credentials will be emailed to you.

:::warning
⚠️ **Do not share your credentials.** Keep your `client_id` and `client_secret` secure.
:::

**Server-side:** Store `client_id` and `client_secret` in server env/config.  
**Client-side:** Never embed `client_secret` in browser or mobile apps.

<details>
<summary><b>AI prompt: implement Step 1 (credentials + env selection)</b></summary>

```text
Implement Quran Foundation API credential configuration.

Goal
- Make credential and environment selection explicit and impossible to misuse.

Environment variables (server-only)
- QF_CLIENT_ID
- QF_CLIENT_SECRET
- QF_ENV (optional): "prelive" | "production" (default: "prelive")

Base URLs (copy exactly)
- Pre-Production:
  - Auth URL: https://prelive-oauth2.quran.foundation
  - API Base URL: https://apis-prelive.quran.foundation
- Production:
  - Auth URL: https://oauth2.quran.foundation
  - API Base URL: https://apis.quran.foundation

Implementation requirements
- Create a config module (e.g., qfConfig.*) that:
  - reads the env vars above
  - maps QF_ENV => { authBaseUrl, apiBaseUrl }
- Never hardcode or log QF_CLIENT_SECRET.
- Never print credentials in errors.
- If QF_CLIENT_ID or QF_CLIENT_SECRET is missing, throw an error with EXACT message:
  "Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access"

Output shape
- Export a function getQfConfig() that returns:
  { env, clientId, clientSecret, authBaseUrl, apiBaseUrl }

Acceptance checklist
- App boots with a clear error when env vars are missing.
- Switching QF_ENV switches both auth and API base URLs together.
```
</details>

---

## 🔑 Step 2: Get Your Access Token (Authentication) {#step-2-get-your-access-token-authentication}

The Quran Foundation API uses **OAuth2 Client Credentials flow**. Access tokens are valid for 1 hour (3600 seconds). After that, request a new access token to continue making API calls.

**Server-side:** Request tokens from your backend because it requires `client_secret`.  
**Client-side:** Do not call the token endpoint directly; use your backend.

### Token Request Examples:

<details>
<summary><b>cURL</b></summary>

```bash
curl --request POST \
  --url https://prelive-oauth2.quran.foundation/oauth2/token \
  --user 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials&scope=content'
```
</details>

<details>
<summary><b>JavaScript (Node.js)</b></summary>

```javascript
const axios = require('axios');

async function getAccessToken() {
  const clientId = 'YOUR_CLIENT_ID';
  const clientSecret = 'YOUR_CLIENT_SECRET';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios({
      method: 'post',
      url: 'https://prelive-oauth2.quran.foundation/oauth2/token',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: 'grant_type=client_credentials&scope=content'
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
  }
}
```
</details>

<details>
<summary><b>Python</b></summary>

```python
import requests

def get_access_token():
    client_id = 'YOUR_CLIENT_ID'
    client_secret = 'YOUR_CLIENT_SECRET'

    response = requests.post(
        'https://prelive-oauth2.quran.foundation/oauth2/token',
        auth=(client_id, client_secret),
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        data='grant_type=client_credentials&scope=content'
    )

    return response.json()['access_token']
```
</details>

### Sample Response:

```json
{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "content"
}
```

:::tip
💡 Tip: Store this token securely and reuse it until expiration to avoid unnecessary token requests.
:::

<details>
<summary><b>AI prompt: implement Step 2 (token retrieval + caching)</b></summary>

```text
Implement OAuth2 Client Credentials token retrieval with caching.

Source of truth
- Token endpoint path: /oauth2/token
- Request method: POST
- Auth: HTTP Basic (client_id:client_secret)
- Content-Type: application/x-www-form-urlencoded
- Body: grant_type=client_credentials&scope=content
- Response fields to use: access_token, expires_in (3600)

Implementation requirements (server-side only)
- Use authBaseUrl from config:
  POST {authBaseUrl}/oauth2/token
- Build Basic auth header safely.
- Cache the token in memory:
  - Store { token, expiresAtMs }
  - Refresh token when expired, and refresh early (e.g., 60 seconds before expiry).
- Prevent stampede:
  - If multiple requests need a token at the same time, only one token request should run; others await it.

Error handling
- Do NOT log client_secret or access_token.
- Log only safe details: status code, a short message, and sanitized error body (if any).
- On failure, throw a clear error: "Failed to obtain access token from Quran Foundation OAuth2"

Acceptance checklist
- First call fetches token successfully.
- Subsequent calls reuse token until near expiry.
- Expired token triggers a refresh.
- Concurrent calls do not cause multiple token requests.
```
</details>

---

## 🟢 Step 3: Use the Access Token {#step-3-use-the-access-token}

Include the token in your API request headers:

```http
x-auth-token: YOUR_ACCESS_TOKEN
x-client-id: YOUR_CLIENT_ID  # Always include your client ID with each request
```

**Server-side:** Attach `x-auth-token` and `x-client-id` in your backend API client.  
**Client-side:** Avoid exposing access tokens; proxy requests through your backend.

<details>
<summary><b>AI prompt: implement Step 3 (authenticated API client)</b></summary>

```text
Create an authenticated API client helper for Quran Foundation Content APIs.

Headers (copy exactly)
- x-auth-token: <access token>
- x-client-id: <client id>

Implementation requirements (server-side)
- Build a client wrapper that automatically:
  - calls tokenProvider.getAccessToken()
  - adds x-auth-token and x-client-id to every request
  - targets the correct API base URL from config

Retry behavior
- If a request returns 401:
  - refresh token once
  - retry the request once
  - if it still fails, surface the error

Logging rules
- Never log x-auth-token or client_secret.
- Logging x-client-id is okay, but optional.

Acceptance checklist
- All outgoing requests include both required headers.
- A forced-expired token results in exactly one refresh and a successful retry.
```
</details>

---

## 📂 Step 4: Make Your First API Call

### Example: List All Surahs (Chapters)

<details>
<summary><b>cURL</b></summary>

```bash
curl --request GET \
  --url https://apis-prelive.quran.foundation/content/api/v4/chapters \
  --header "x-auth-token: YOUR_ACCESS_TOKEN" \
  --header "x-client-id: YOUR_CLIENT_ID"
```
</details>

<details>
<summary><b>JavaScript (Node.js)</b></summary>

```javascript
const axios = require('axios');

async function getChapters(accessToken, clientId) {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://apis-prelive.quran.foundation/content/api/v4/chapters',
      headers: {
        'x-auth-token': accessToken,
        'x-client-id': clientId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
  }
}
```
</details>

<details>
<summary><b>Python</b></summary>

```python
import requests

def get_chapters(access_token, client_id):
    response = requests.get(
        'https://apis-prelive.quran.foundation/content/api/v4/chapters',
        headers={
            'x-auth-token': access_token,
            'x-client-id': client_id
        }
    )

    return response.json()
```
</details>

### Example Successful Response:

```json
{
  "chapters": [
    {
      "id": 1,
      "revelation_place": "makka",
      "revelation_order": 5,
      "bismillah_pre": false,
      "name_simple": "Al-Fatihah",
      "name_complex": "Al-Fatihah",
      "name_arabic": "الفاتحة",
      "verses_count": 7,
      "pages": [1, 1],
      "translated_name": {
        "language_name": "english",
        "name": "The Opener"
      }
    },
    {
      "id": 2,
      "revelation_place": "madinah",
      "revelation_order": 87,
      "bismillah_pre": true,
      "name_simple": "Al-Baqarah",
      "name_complex": "Al-Baqarah",
      "name_arabic": "البقرة",
      "verses_count": 286,
      "pages": [2, 49],
      "translated_name": {
        "language_name": "english",
        "name": "The Cow"
      }
    }
    // ... more chapters
  ]
}
```

**Server-side:** Call the chapters endpoint from your backend using the access token.  
**Client-side:** Prefer calling your backend and returning the data to the UI.

<details>
<summary><b>AI prompt: implement Step 4 (first call + verify)</b></summary>

```text
Implement a "list chapters" call using the authenticated client, plus a quick verification.

Request (copy exactly)
- GET {apiBaseUrl}/content/api/v4/chapters

Implementation requirements
- Add function listChapters() that:
  - calls the API using the authenticated client (Step 3)
  - returns the JSON response

Add a verification method (choose one)
Option A: Script
- Add scripts/qf_list_chapters.* that:
  - calls listChapters()
  - prints ONLY safe info (e.g., chapters.length and the first chapter name)
  - does NOT print access tokens

Option B: Debug route (server-only)
- Add GET /debug/qf/chapters (guard it if needed)
- It calls listChapters() and returns the JSON

Acceptance checklist
- Running the script OR calling the debug route returns a JSON object with a "chapters" array.
- No logs contain tokens or client_secret.
```
</details>

---

## ⚠️ Important Considerations

### Environment Configuration

:::warning
🚩 Do not mix tokens between environments! Access tokens are environment-specific and cannot be used across different environments.
:::

| Environment    | Auth URL                                  | API Base URL                              | Usage                       |
| -------------- | ----------------------------------------- | ----------------------------------------- | --------------------------- |
| Pre-Production | `https://prelive-oauth2.quran.foundation` | `https://apis-prelive.quran.foundation`   | For testing and development |
| Production     | `https://oauth2.quran.foundation`         | `https://apis.quran.foundation`           | For live applications       |

**Server-side:** Choose auth/API base URLs via config and keep tokens isolated per environment.  
**Client-side:** Only the auto-translate controls apply; avoid direct API calls from the browser.

### Disable Browser Auto-translate

To help ensure users never see machine-re-translated Quranic text:

- Add `<meta name="google" content="notranslate">` (site-wide hint)
- Add `translate="no"` on containers that render Quranic text (or on `<html>`)
- Optionally add `class="notranslate"` on Quranic text containers for additional compatibility

Note: Some teams also rely on CSP to restrict injected translation scripts, but the most reliable approach is `translate="no"` and `notranslate` markers.

<details>
<summary><b>AI prompt: environment config and auto-translate</b></summary>

```text
Add environment selection and client-side safeguards.

Server-side
- Implement QF_ENV ("prelive" | "production") and map it to:
  - authBaseUrl
  - apiBaseUrl
- Keep token caches isolated per environment (separate cache keys or separate instances).

Client-side (Quran text rendering)
- Add <meta name="google" content="notranslate"> to the HTML head.
- Mark Quranic text containers with translate="no".
- Optionally add class="notranslate" on Quranic text containers for extra protection.

Acceptance checklist
- Switching QF_ENV changes both token endpoint base and API base.
- Quranic text containers have translate="no" applied in rendered HTML.
```
</details>

---

## 🔄 Migrating from `api.quran.com`

If you previously used the unauthenticated API at:

```
https://api.quran.com/api/v4/...
```

please note that the new APIs require OAuth2 authentication and use a different base URL.

Steps to migrate:

1. Request API access — see [instructions above](#step-1-request-api-access).
2. Obtain your client credentials and token — follow the [Authentication section](#step-2-get-your-access-token-authentication).
    - Access tokens expire after 3600 seconds (1 hour).
    - After 3600 seconds, request a new token to continue making API calls.
3. Update your base URL:
    - Pre-Production:

      ```
      https://apis-prelive.quran.foundation/content/api/v4/...
      ```

    - Production:

      ```
      https://apis.quran.foundation/content/api/v4/...
      ```

4. Add authorization headers — follow [Use the Access Token](#step-3-use-the-access-token) to include your token and client ID with each request.

:::info
✅ **Endpoints, query parameters, and responses remain unchanged.** Only the base URL and authentication method are different.
:::

**Server-side:** Update base URLs and auth flow in your backend integration.  
**Client-side:** If you still call the API directly (not recommended), update base URLs and headers there too.

<details>
<summary><b>AI prompt: migration</b></summary>

```text
Migrate an existing integration from https://api.quran.com/api/v4/... to Quran Foundation Content APIs (OAuth2 required).

What changes
- Old base: https://api.quran.com/api/v4/...
- New base (choose one):
  - Pre-Production: https://apis-prelive.quran.foundation/content/api/v4/...
  - Production:     https://apis.quran.foundation/content/api/v4/...

Environment selection
- Use QF_ENV = "prelive" | "production" (default "prelive")
- Auth base URLs (copy exactly):
  - Pre-Production auth: https://prelive-oauth2.quran.foundation
  - Production auth:     https://oauth2.quran.foundation

Credentials (server-only)
- Read from env/config:
  - QF_CLIENT_ID
  - QF_CLIENT_SECRET
- Never hardcode or log secrets.
- If missing, throw exactly:
  "Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access"

Token retrieval (OAuth2 Client Credentials) — server-side only
- POST {authBaseUrl}/oauth2/token
- HTTP Basic auth with client_id:client_secret
- Content-Type: application/x-www-form-urlencoded
- Body: grant_type=client_credentials&scope=content
- Parse access_token and expires_in (3600)
- Cache token and refresh on expiry (refresh early ~60s). Prevent concurrent refresh stampede.

Authenticated API requests
- For every request to the new Content API base URL, include BOTH headers exactly:
  - x-auth-token: <access token>
  - x-client-id: <client id>

Migration instructions
- Find all calls to https://api.quran.com/api/v4/... and replace the base URL with the selected Quran Foundation base URL.
- Ensure every call goes through an API client that injects x-auth-token and x-client-id.
- Add safe error handling:
  - 401 => refresh token once, retry once
  - 403 => likely wrong scope/permissions (scope=content)
  - never log tokens

Verification
- Add a simple test call (e.g., GET /chapters) to confirm migration works:
  - GET {apiBaseUrl}/content/api/v4/chapters
- Confirm responses match prior shapes (endpoints/params/response schemas unchanged; only base URL + auth changed).

Client-side rule
- Do not embed client_secret or perform token exchange in browser/mobile code.
- Prefer backend proxy. If you expose tokens to clients, accept that tokens can be extracted.
```
</details>

---

## ❌ Common Issues & Troubleshooting

| Error Code | Meaning                 | Solution                                            |
| ---------- | ----------------------- | --------------------------------------------------- |
| 400        | Bad Request             | Check your request parameters and format.           |
| 401        | Unauthorized            | Verify your access token is valid and not expired.  |
| 403        | Forbidden / Wrong Scope | Ensure your token has the correct permissions.      |
| 429        | Rate Limit Exceeded     | Reduce request frequency or contact support for increased limits. |
| 500        | Internal Server Error   | Contact support if this issue persists.             |

**Server-side:** Log status codes and responses to diagnose auth and rate limits.  
**Client-side:** Show friendly errors and avoid logging tokens.

<details>
<summary><b>AI prompt: troubleshooting</b></summary>

```text
Add safe error handling for common responses.

Server-side behavior
- 400: validate parameters and payload format; surface a readable error.
- 401: refresh/re-request token; ensure x-auth-token and x-client-id are present.
- 403: verify scope/permissions (scope=content for Content APIs).
- 429: implement retry with backoff; respect rate limits (do not retry aggressively).
- 500: add a limited safe retry (e.g., 1–2 retries) and clear logs.

Logging rules
- Never log tokens or client_secret.
- Log status code + request path + environment ("prelive"/"production").
- Include a short, sanitized error body if present.

Acceptance checklist
- Errors are actionable (include status + hint) without leaking secrets.
- Token refresh is not triggered in a loop.
```
</details>

---

## 💼 Need Help?

For any issues or questions, please contact:
📧 **developers@quran.com**

---

:::info 🟢 Next Steps:
Now that you're authenticated and have successfully made your first API call, explore the [API Reference](/docs/category/content-apis) to learn about all available endpoints!
:::

---

## 🤖 Complete Implementation Prompt

```text
Implement the full Quick Start flow end-to-end in this codebase with minimal assumptions.

Server-side (required)
1) Config
- Read QF_CLIENT_ID and QF_CLIENT_SECRET from server env/config.
- Read QF_ENV ("prelive" | "production") and select BOTH:
  - authBaseUrl
  - apiBaseUrl
- If credentials missing, throw:
  "Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access"
- Never hardcode or log secrets.

2) Token provider (OAuth2 Client Credentials)
- POST {authBaseUrl}/oauth2/token
- Use HTTP Basic auth with client_id:client_secret
- Send x-www-form-urlencoded body: grant_type=client_credentials&scope=content
- Parse access_token and expires_in (3600 seconds)
- Cache token in memory and refresh on expiry (refresh early ~60s)
- Prevent concurrent refresh stampede (single in-flight refresh)

3) Authenticated API client
- For every API request, inject headers EXACTLY:
  - x-auth-token: <access token>
  - x-client-id: <client id>
- Base URL for Content APIs:
  - GET {apiBaseUrl}/content/api/v4/...
- On 401: refresh once and retry once.

4) Example call + verification
- Implement listChapters():
  - GET {apiBaseUrl}/content/api/v4/chapters
  - return JSON
- Add a runnable verification (script or debug route) that confirms it works without printing tokens.

Client-side (rules)
- Do not expose client_secret or perform token exchange in browser/mobile code.
- Prefer calling your backend for data and render the response.
- If rendering Quranic text in the browser, disable auto-translate:
  - <meta name="google" content="notranslate">
  - translate="no" on Quranic text containers (and optionally class="notranslate")

Constraints
- Use the Quick Start guide at https://api-docs.quran.foundation/docs/quickstart/ as the source of truth for URLs, headers, and endpoint paths.
- Do not invent endpoints or headers; copy them exactly.

Done when
- A fresh setup can run one command (or hit one endpoint) and successfully fetch /chapters.
- No logs contain access tokens or client_secret.
- Prelive/prod switching works without mixing tokens.
```
