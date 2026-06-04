# QF_JS_SDK_INTEGRATION_PROMPT_V1

Integrate the Quran Foundation JavaScript SDK into an existing JS/TS app without exposing secrets.

Requirements:

- Install and use `@quranjs/api`.
- Use `@quranjs/api/public` only for browser-safe OAuth initiation.
- Use `@quranjs/api/server` for token exchange, refresh, Content APIs, Search APIs, and signed-in User APIs.
- Keep `CLIENT_SECRET`, `SESSION_SECRET`, access tokens, and refresh tokens out of browser code.
- Keep app-level Content/Search tokens separate from signed-in user session tokens.
- Do not call signed-in User APIs unless the user has a valid session.
- Do not bypass OIDC logout.

Implementation checklist:

- Identify every browser/client file and every server/backend route.
- Move Content/Search calls that need app credentials to server code.
- Move OAuth token exchange and refresh to server code.
- Store signed-in user session state server-side or in secure `httpOnly` cookies.
- Add `.env.example` entries for required variables without real values.
- Add tests or smoke checks for login, callback, refresh, logout, and at least one API call.

Documentation to follow:

- JavaScript SDK: https://api-docs.quran.foundation/docs/sdk/javascript/
- Entrypoint matrix: https://api-docs.quran.foundation/docs/sdk/javascript/entrypoint-matrix/
- APIs by runtime: https://api-docs.quran.foundation/docs/sdk/javascript/apis-by-runtime/
- Common errors: https://api-docs.quran.foundation/docs/sdk/javascript/common-errors/
