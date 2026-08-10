# QF_OAUTH_USER_APIS_PROMPT_V1

Implement Quran Foundation OAuth2/OIDC and signed-in User API calls safely.

Requirements:

- Fetch and follow the official OAuth CLI skill before writing code:

```bash
npx @quranjs/create-app@latest skills get oauth
```

- Use Authorization Code with PKCE.
- Identify the app type selected in Developer Console before choosing the callback, exchange, refresh, and session architecture.
- For a **Frontend or mobile app**, use `@quranjs/api/public` with `clientType: "public"`; persist the PKCE verifier before redirect, exchange in the app with that verifier, and refresh with `client_id` and no secret.
- For a **Backend/server app**, use `@quranjs/api/public` with `clientType: "confidential-proxy"` for browser-safe initiation and `@quranjs/api/server` for callback token exchange, refresh, session storage, Content APIs, Search APIs, and proxied User APIs.
- Keep `CLIENT_SECRET` and `SESSION_SECRET` server-side. Store public-client user tokens with secure platform-appropriate storage and never log them.
- Keep Content/Search app tokens separate from signed-in user session tokens.
- Do not call signed-in User APIs without a valid user session.
- Use the OIDC end-session flow for logout: initiate it in the app for a public frontend/mobile client, or through a server logout route for a confidential backend/server client. Do not replace it with local state or cookie deletion only.
- Before adding each signed-in User API call, identify the documented endpoint, required scope, request parameters, success shape, and common error status codes.
- Use SDK helpers first. Use raw endpoint calls only when there is no SDK helper, and keep them within the same public/confidential runtime boundary; Content and Search calls stay on the server.

Implementation checklist:

- Add an auth start route or action that creates state, nonce, and PKCE values.
- Validate callback state and retain the PKCE verifier until the one-time code exchange completes.
- For a frontend/mobile public client, exchange and refresh without a secret, use secure platform-appropriate token storage, and initiate the OIDC end-session flow in the app before clearing local tokens.
- For a backend/server confidential client, add server callback, refresh, and logout routes; keep tokens in server session storage or secure `httpOnly` cookies; proxy signed-in User API calls through server routes; and have the logout route call the OIDC end-session flow before clearing the session.
- Add negative tests for missing session, expired token, and invalid callback state.
- Add at least one authenticated User API smoke check with a valid user token, or document why live auth validation was not possible.
- Report the exact SDK entrypoints and docs/OpenAPI sources used.

Documentation to follow:

- User APIs quickstart: https://api-docs.quran.foundation/docs/tutorials/oidc/user-apis-quickstart/
- OAuth2 tutorial: https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/
- OpenID Connect: https://api-docs.quran.foundation/docs/tutorials/oidc/openid-connect/
- OAuth2 scopes: https://api-docs.quran.foundation/docs/user_related_apis_versioned/scopes/
