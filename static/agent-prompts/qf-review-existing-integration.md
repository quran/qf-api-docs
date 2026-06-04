# QF_REVIEW_EXISTING_INTEGRATION_PROMPT_V1

Review an existing Quran Foundation API integration for SDK boundary, auth, secrets, and response-handling issues.

Start with:

```bash
npx @quranjs/create-app@latest doctor
```

Review checklist:

- New apps use `@quranjs/create-app`; existing JS/TS apps use `@quranjs/api`.
- Browser-safe OAuth initiation uses `@quranjs/api/public`.
- Token exchange, refresh, Content APIs, Search APIs, and User APIs use `@quranjs/api/server`.
- `CLIENT_SECRET`, `SESSION_SECRET`, access tokens, and refresh tokens never reach browser code.
- Content/Search app tokens are separate from signed-in user session tokens.
- Signed-in User API calls require a valid user session.
- Logout uses OIDC end-session.
- OAuth callback, refresh, and logout routes are server-side.
- `.env.example` documents required runtime variables without real secrets.
- Response handling covers success variations and common error status codes.

Common findings:

- `@quranjs/api/server` imported into a browser component.
- Token exchange implemented in browser code.
- Access tokens or refresh tokens stored in local storage.
- App-level Content/Search tokens reused as user session tokens.
- Logout only deletes local state.
- Error responses are assumed to have only one shape.

Documentation to follow:

- AI Agents: https://api-docs.quran.foundation/docs/ai-agents/
- JavaScript SDK: https://api-docs.quran.foundation/docs/sdk/javascript/
- Response examples: https://api-docs.quran.foundation/docs/api/response-examples/
