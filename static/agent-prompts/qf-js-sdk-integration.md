# QF_JS_SDK_INTEGRATION_PROMPT_V1

Integrate the Quran Foundation JavaScript SDK into an existing JS/TS app without exposing secrets.

Requirements:

- If this is a new app, stop and use the official scaffold prompt instead of hand-writing OAuth/session plumbing.
- Install and use `@quranjs/api`.
- Use `@quranjs/api/public` only for browser-safe OAuth initiation.
- Use `@quranjs/api/server` for token exchange, refresh, Content APIs, Search APIs, and signed-in User APIs.
- Keep `CLIENT_SECRET`, `SESSION_SECRET`, access tokens, and refresh tokens out of browser code.
- Keep app-level Content/Search tokens separate from signed-in user session tokens.
- Do not call signed-in User APIs unless the user has a valid session.
- Do not bypass OIDC logout.
- Before adding or changing any API call, identify the official docs page or OpenAPI path, auth type, required scopes, request parameters, and success/error response shape.
- Use SDK helpers first. Use raw endpoint calls only when there is no SDK helper, and keep those calls on the server.
- Produce a short implementation note that lists each API call, SDK entrypoint, endpoint family, auth type, and verification command.

Implementation checklist:

- Identify every browser/client file and every server/backend route.
- Move Content/Search calls that need app credentials to server code.
- Move OAuth token exchange and refresh to server code.
- Store signed-in user session state server-side or in secure `httpOnly` cookies.
- Add `.env.example` entries for required variables without real values.
- Add tests or smoke checks for login, callback, refresh, logout, and at least one API call.
- Confirm no `@quranjs/api/server` import is reachable from browser/client bundles.
- Confirm no signed-in User API route can run without a valid user session.

Documentation to follow:

- JavaScript SDK: https://api-docs.quran.foundation/docs/sdk/javascript/
- Entrypoint matrix: https://api-docs.quran.foundation/docs/sdk/javascript/entrypoint-matrix/
- APIs by runtime: https://api-docs.quran.foundation/docs/sdk/javascript/apis-by-runtime/
- Common errors: https://api-docs.quran.foundation/docs/sdk/javascript/common-errors/
- API Reference: https://api-docs.quran.foundation/docs/api-reference/
