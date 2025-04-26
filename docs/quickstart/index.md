---
id: index
title: 🚀 Quick Start Guide
sidebar_label: Quick Start
---

# 🚀 Quick Start Guide

Welcome to the Quran Foundation API! This Quick Start guide will help you get up and running within minutes.

> ✅ **Recommended for first-time users** — follow these steps to make your first successful API call.

---

## 📩 Step 1: Request API Access

1. Visit the **[Request Access page](https://api-docs.quran.foundation/request-access)**.
2. Fill out the form to request your **Client ID** and **Client Secret**.
3. Your credentials will be emailed to you.

> ⚠️ **Do not share your credentials.** Keep your `client_id` and `client_secret` secure.

---

## 🔑 Step 2: Get Your Access Token (Authentication)

The Quran Foundation API uses **OAuth2 Client Credentials flow**. Access tokens are valid for 1 hour (3600 seconds).

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

> 💡 **Tip:** Store this token securely and reuse it until expiration to avoid unnecessary token requests.

---

## 🟢 Step 3: Use the Access Token

Include the token in your API request headers:

```http
x-auth-token: YOUR_ACCESS_TOKEN
x-client-id: YOUR_CLIENT_ID  # Always include your client ID with each request
```

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
      "name_arabic": "ٱلْفَاتِحَةُ",
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
      "name_arabic": "ٱلْبَقَرَةُ",
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

---

## ⚠️ Important Considerations

### Environment Configuration

> 🚩 **Do not mix tokens between environments!**
> Access tokens are environment-specific and cannot be used across different environments.

| Environment    | Auth URL                                | API Base URL                            | Usage                   |
| -------------- | --------------------------------------- | --------------------------------------- | ----------------------- |
| Pre-Production | `https://prelive-oauth2.quran.foundation` | `https://apis-prelive.quran.foundation` | For testing and development |
| Production     | `https://oauth2.quran.foundation`       | `https://apis.quran.foundation`         | For live applications   |

---

## ❌ Common Issues & Troubleshooting

| Error Code | Meaning                 | Solution                                        |
| ---------- | ----------------------- | ----------------------------------------------- |
| 400        | Bad Request             | Check your request parameters and format.       |
| 401        | Unauthorized            | Verify your access token is valid and not expired. |
| 403        | Forbidden / Wrong Scope | Ensure your token has the correct permissions.  |
| 429        | Rate Limit Exceeded     | Reduce request frequency or contact support for increased limits. |
| 500        | Internal Server Error   | Contact support if this issue persists.         |

---

## 💼 Need Help?

For any issues or questions, please contact:
📧 **developers@quran.com**

---

> 🟢 **Next Steps:**
> Now that you're authenticated and have successfully made your first API call, explore the [API Reference](/docs/category/content-apis) to learn about all available endpoints!
