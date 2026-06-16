# QF_REVIEW_EXISTING_INTEGRATION_PROMPT_V1

Review an existing Quran Foundation API integration for SDK boundary, auth, secrets, and response-handling issues.

Start with:

```bash
npx @quranjs/create-app@latest doctor
```

Review checklist:

- First identify whether the app is new scaffolded code, an existing JS/TS integration, a Python SDK integration, or a mixed integration.
- New apps use `@quranjs/create-app`; existing JS/TS apps use `@quranjs/api`.
- Python apps use `quran-foundation-api` from trusted server-side environments.
- Browser-safe OAuth initiation uses `@quranjs/api/public`.
- Token exchange, refresh, Content APIs, Search APIs, and User APIs use `@quranjs/api/server`.
- `CLIENT_SECRET`, `SESSION_SECRET`, access tokens, and refresh tokens never reach browser code.
- Content/Search app tokens are separate from signed-in user session tokens.
- Signed-in User API calls require a valid user session.
- Logout uses OIDC end-session.
- OAuth callback, refresh, and logout routes are server-side.
- `.env.example` documents required runtime variables without real secrets.
- Response handling covers success variations and common error status codes.
- Every API call maps to an official docs page or OpenAPI path with the expected auth type and scopes.
- Raw endpoint calls are server-side and used only where the SDK lacks a dedicated helper.

Common findings:

- `@quranjs/api/server` imported into a browser component.
- Token exchange implemented in browser code.
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
