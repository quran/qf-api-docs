# QF_NPX_STARTER_PROMPT_V1

Set up a production-style Quran Foundation Next.js app using the official scaffold.

Run this command:

```bash
npx @quranjs/create-app@latest my-quran-app --template next --package-manager npm --install --git --sdk-source npm --yes
```

Requirements:

- Use `@quranjs/api/public` in app, browser, or mobile-facing code.
- Use `@quranjs/api/server` on the backend for Content, Search, OAuth2 token exchange, refresh, and server-side User API calls.
- Keep `CLIENT_SECRET` server-side only.
- Use Authorization Code with PKCE and OpenID Connect for signed-in User APIs.
- Use Client Credentials for app-level Content and Search APIs.
- Keep Content/Search app tokens separate from signed-in user session tokens.
- Preserve the starter's server-side session boundary and secure cookie behavior.

Documentation to follow:

- Starter With NPX: https://api-docs.quran.foundation/docs/tutorials/oidc/starter-with-npx/
- JavaScript SDK: https://api-docs.quran.foundation/docs/sdk/javascript/
- User APIs Quickstart: https://api-docs.quran.foundation/docs/tutorials/oidc/user-apis-quickstart/
- OAuth2 Tutorial: https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/
- Content APIs Quickstart: https://api-docs.quran.foundation/docs/quickstart/

Acceptance checks:

- The app runs locally after environment variables are set.
- Login, callback, refresh, logout, Content API reads, Search API reads, and signed-in User API calls are routed through the correct SDK entrypoints.
- No client secret, access token, refresh token, or session secret is exposed to browser JavaScript, logs, or generated client bundles.
