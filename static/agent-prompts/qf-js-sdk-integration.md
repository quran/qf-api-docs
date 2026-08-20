# QF_JS_SDK_INTEGRATION_PROMPT_V1

Integrate the Quran Foundation JavaScript SDK into an existing JS/TS app without exposing secrets.

Requirements:

- If this is a new app, stop and use the official scaffold prompt instead of hand-writing OAuth/session plumbing.
- Install and use `@quranjs/api`.
- Identify the app type selected in Developer Console before choosing the OAuth and SDK architecture.
- For a **Frontend or mobile app**, use `@quranjs/api/public` with `clientType: "public"`. Generate and persist a PKCE verifier before redirect, send its S256 challenge on authorization, exchange the returned code in the app with that verifier, and refresh with `client_id` and no secret.
- For a **Backend/server app**, use `@quranjs/api/public` with `clientType: "confidential-proxy"` for browser-safe OAuth initiation and `@quranjs/api/server` for token exchange, refresh, session storage, Content APIs, Search APIs, and proxied signed-in User APIs.
- Keep `CLIENT_SECRET` and `SESSION_SECRET` out of browser/mobile code. Store public-client user tokens with secure platform-appropriate storage and never log them.
- Keep app-level Content/Search tokens separate from signed-in user session tokens.
- Do not call signed-in User APIs unless the user has a valid session.
- Do not bypass OIDC logout.
- Before adding or changing any API call, identify the official docs page or OpenAPI path, auth type, required scopes, request parameters, and success/error response shape.
- Use SDK helpers first. Use raw endpoint calls only when there is no SDK helper, and keep them within the same public/confidential runtime boundary; Content and Search calls stay on the server.
- For offline word-by-word content, use `client.content.v4.resources.sync()` with `word_by_word_translations:<resource_content_id>` and typed `findSnapshot<WordByWordTranslationSnapshotRecord>()`; reuse the same canonical resource filter for incremental sync.
- Produce a short implementation note that lists each API call, SDK entrypoint, endpoint family, auth type, and verification command.

Implementation checklist:

- Identify every browser/client file and every server/backend route.
- Verify the configured SDK `clientType` matches the app type in Developer Console.
- Move Content/Search calls that need app credentials to server code.
- For a frontend/mobile public client, validate state, exchange with the stored PKCE verifier, and refresh in the app without a client secret.
- For a backend/server confidential client, move OAuth token exchange and refresh to server code and store the signed-in session server-side or in secure `httpOnly` cookies.
- Add `.env.example` entries for required variables without real values.
- Add tests or smoke checks for login, callback, refresh, logout, and at least one API call.
- Confirm no `@quranjs/api/server` import is reachable from browser/client bundles.
- Confirm no signed-in User API route can run without a valid user session.

Documentation to follow:

- JavaScript SDK: https://api-docs.quran.foundation/docs/sdk/javascript/
- Entrypoint matrix: https://api-docs.quran.foundation/docs/sdk/javascript/entrypoint-matrix/
- APIs by runtime: https://api-docs.quran.foundation/docs/sdk/javascript/apis-by-runtime/
- Common errors: https://api-docs.quran.foundation/docs/sdk/javascript/common-errors/
- Resources and Content Sync: https://api-docs.quran.foundation/docs/sdk/javascript/resources/
- API Reference: https://api-docs.quran.foundation/docs/api-reference/
