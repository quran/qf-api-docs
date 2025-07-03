---
id: migration
title: "🛠️ Migrating from QuranJS API"
sidebar_label: Migration Guide
---

If you previously used the `@quranjs/api` SDK against the Quran.com endpoints, switching to the new Quran Foundation API requires a few changes.

1. **Base URLs** – The new SDK defaults to `https://apis.quran.foundation` and `https://oauth2.quran.foundation`. Remove any overrides pointing to quran.com.
2. **Authentication** – OAuth2 is now mandatory. Calls without a valid token will fail. Make sure to call `configure` with both `clientId` and `clientSecret`.
3. **API Differences** – Several endpoint paths have changed and some fields were renamed. Consult the [Endpoint Reference](endpoints.md) and the official API docs for the exact routes.
4. **Utility Functions** – Validation helpers now live under `quran.utils` and return boolean values.

Most method names remain the same, so in many cases updating the configuration and endpoint URLs is all that is needed.
