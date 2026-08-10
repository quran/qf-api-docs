# QF_REVIEW_EXISTING_INTEGRATION_PROMPT_V1

Review an existing Quran Foundation API integration for SDK boundary, auth, secrets, and response-handling issues.

Start with:

```bash
npx @quranjs/create-app@latest doctor
```

Review checklist:

- First identify whether the app is new scaffolded code, an existing JS/TS integration, a Python SDK integration, or a mixed integration.
- Identify the app type selected in Developer Console and verify that the implementation uses the matching public or confidential flow.
- New apps use `@quranjs/create-app`; existing JS/TS apps use `@quranjs/api`.
- Python apps use `quran-foundation-api` from trusted server-side environments.
- A **Frontend or mobile app** uses `@quranjs/api/public` with `clientType: "public"`, an S256 PKCE challenge, in-app code exchange with the stored verifier, and refresh with `client_id` and no secret.
- A **Backend/server app** uses `@quranjs/api/public` with `clientType: "confidential-proxy"` for browser-safe initiation and `@quranjs/api/server` for confidential exchange, refresh, session storage, Content, Search, and proxied User APIs.
- `CLIENT_SECRET` and `SESSION_SECRET` never reach browser/mobile code. Public-client user tokens use secure platform-appropriate storage and never appear in logs.
- Content/Search app tokens are separate from signed-in user session tokens.
- Signed-in User API calls require a valid user session.
- Logout uses OIDC end-session.
- OAuth callback, refresh, session storage, and logout match the Developer Console app type: in-app for public frontend/mobile clients or server-side for confidential backend/server clients.
- `.env.example` documents required runtime variables without real secrets.
- Response handling covers success variations and common error status codes.
- Every API call maps to an official docs page or OpenAPI path with the expected auth type and scopes.
- Raw endpoint calls are used only where the SDK lacks a dedicated helper and stay within the matching public/confidential runtime boundary; Content and Search remain server-side.

Common findings:

- `@quranjs/api/server` imported into a browser component.
- A public client that omits the PKCE verifier/challenge, or a confidential client that exchanges tokens in browser/mobile code.
- Access tokens or refresh tokens stored in local storage.
- App-level Content/Search tokens reused as user session tokens.
- Logout only deletes local state.
- Error responses are assumed to have only one shape.
- Python notebooks, logs, or generated artifacts expose tokens or client secrets.
- User API routes are added without checking the matching OAuth2 scope.

Output format:

- Findings first, ordered by severity.
- Include file/line references where code is available.
- For each finding, name the official docs/OpenAPI source that defines the expected behavior.
- Include verification commands that were run, and skipped checks with reasons.

Documentation to follow:

- AI Agent Prompts: https://api-docs.quran.foundation/docs/ai-agents/
- JavaScript SDK: https://api-docs.quran.foundation/docs/sdk/javascript/
- Python SDK: https://api-docs.quran.foundation/docs/sdk/python/
- API Reference: https://api-docs.quran.foundation/docs/api-reference/
