# QF_OAUTH_USER_APIS_PROMPT_V1

Implement Quran Foundation OAuth2/OIDC and signed-in User API calls safely.

Requirements:

- Fetch and follow the official OAuth CLI skill before writing code:

```bash
npx @quranjs/create-app@latest skills get oauth
```

- Use Authorization Code with PKCE.
- Use `@quranjs/api/public` only for browser-safe OAuth initiation.
- Use `@quranjs/api/server` for callback token exchange, refresh, Content APIs, Search APIs, and User APIs.
- Keep `CLIENT_SECRET`, `SESSION_SECRET`, access tokens, and refresh tokens server-side.
- Keep Content/Search app tokens separate from signed-in user session tokens.
- Do not call signed-in User APIs without a valid user session.
- Use OIDC logout and do not replace it with local cookie deletion only.
- Before adding each signed-in User API call, identify the documented endpoint, required scope, request parameters, success shape, and common error status codes.
- Use SDK helpers first. Use raw endpoint calls only when there is no SDK helper, and keep those calls on the server.

Implementation checklist:

- Add an auth start route or action that creates state, nonce, and PKCE values.
- Add a server callback route that validates state and exchanges the code.
- Store user tokens in server session storage or secure `httpOnly` cookies.
- Add a server refresh route or refresh helper.
- Proxy signed-in User API calls through server routes.
- Add a logout route that calls the OIDC end-session flow.
- Add negative tests for missing session, expired token, and invalid callback state.
- Add at least one authenticated User API smoke check with a valid user token, or document why live auth validation was not possible.
- Report the exact SDK entrypoints and docs/OpenAPI sources used.

Documentation to follow:

- User APIs quickstart: https://api-docs.quran.foundation/docs/tutorials/oidc/user-apis-quickstart/
- OAuth2 tutorial: https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/
- OpenID Connect: https://api-docs.quran.foundation/docs/tutorials/oidc/openid-connect/
- OAuth2 scopes: https://api-docs.quran.foundation/docs/user_related_apis_versioned/scopes/
