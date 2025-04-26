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
3. After approval, your credentials will be emailed to you.

> ⚠️ **Do not share your credentials.** Keep your `client_id` and `client_secret` secure.

---

## 🔑 Step 2: Get Your Access Token (Authentication)

The Quran Foundation API uses **OAuth2 Client Credentials flow**.

### Token Request Example (`curl`):

```bash
curl --request POST \
  --url https://prelive-oauth2.quran.foundation/oauth2/token \
  --user 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials&scope=content'
```

### Sample Response:

```json
{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "content"
}
```

---

## 🟢 Step 3: Use the Access Token

✅ Include the token in your API request headers like this:

```http
x-auth-token: YOUR_ACCESS_TOKEN
```

---

## 📂 Step 4: Make Your First API Call

### Example: List All Surahs (Chapters)

```bash
curl --request GET \
  --url https://apis-prelive.quran.foundation/content/api/v4/chapters \
  --header "x-auth-token: YOUR_ACCESS_TOKEN" \
  --header "x-client-id: YOUR_CLIENT_ID"
```

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

## ⚠️ Common Gotcha: Environment Mismatch

> 🚩 **Do not mix tokens between environments!**  
> If you generate an access token using Pre-Production credentials, it will **not work** on the Production base URL — and vice versa.

| Environment    | Base URL                               | Description                |
| -------------- | -------------------------------------- | -------------------------- |
| Pre-Production | `https://api-prelive.quran.foundation` | For testing and staging    |
| Production     | `https://api.quran.foundation`         | For live, real-world usage |

🔒 **Always verify that:**

- Your `client_id` and `client_secret` match the environment.
- Your access token was generated from the correct environment’s token endpoint.

---

## ❌ Other Common Issues & Troubleshooting

| Error Code | Meaning                 | Solution                                        |
| ---------- | ----------------------- | ----------------------------------------------- |
| 401        | Unauthorized            | Check your access token, client ID, and secret. |
| 403        | Forbidden / Wrong Scope | Ensure your token has the correct permissions.  |
| 429        | Rate Limit Exceeded     | Wait and retry after some time.                 |
| 500        | Internal Server Error   | Contact support if this issue persists.         |

---

## 💼 Need Help?

For any issues or questions, please contact:  
📧 **developers@quran.com**

---

> 🟢 **Next Steps:**  
> Now that you're authenticated and have successfully made your first API call, explore the [API Reference](/docs/category/content-apis) to learn about all available endpoints!
