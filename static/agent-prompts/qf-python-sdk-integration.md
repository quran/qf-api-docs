# QF_PYTHON_SDK_INTEGRATION_PROMPT_V1

Integrate the Quran Foundation Python SDK into a trusted server-side Python app, script, job, notebook, or AI workflow.

Requirements:

- Use the official Python SDK package `quran-foundation-api`, imported as `quran_foundation`.
- Install the released package from PyPI:

```bash
python -m pip install quran-foundation-api
```

- Use `QuranClient` from trusted server-side Python only:

```python
from quran_foundation import QuranClient
```

- Keep `client_secret`, app access tokens, user access tokens, refresh tokens, and session secrets out of browser code, mobile bundles, public notebooks, logs, and generated artifacts.
- Use an app access token from Client Credentials for Content and Search API calls.
- Use a user access token from the OAuth2 authorization flow for signed-in User API calls.
- Keep app-level Content/Search tokens separate from signed-in user tokens.
- Use Python SDK helpers first. Use `content_request()`, `search_request()`, or `user_request()` only when the SDK has no dedicated helper.
- Before adding any raw request, identify the official docs page or OpenAPI path, auth type, required scopes, request parameters, and success/error response shape.
- Handle `QuranHttpError` and auth failures explicitly instead of assuming a single success or error response shape.

Implementation checklist:

- Create clients with explicit `client_id` and the correct `access_token` for the API family.
- Store credentials in environment variables or a secret manager; add `.env.example` keys without real values.
- For Content reads, use helpers such as chapters, verses, audio, resources, answers, hadith references, and juzs before raw endpoint calls.
- For Search, call the SDK search helper before raw search requests.
- For signed-in User APIs, require a valid user token and matching OAuth2 scopes before calling profile, bookmarks, collections, preferences, reading sessions, streaks, notes, or related user endpoints.
- For OAuth helper usage, keep `exchange_code()` and `refresh_token()` on the server because they use `client_secret`.
- Add tests or smoke checks for at least one Content call, one Search call, and one authenticated User API call when user credentials are available.

Documentation to follow:

- Python SDK: https://api-docs.quran.foundation/docs/sdk/python/
- Python authentication: https://api-docs.quran.foundation/docs/sdk/python/authentication/
- Python Content helpers: https://api-docs.quran.foundation/docs/sdk/python/content/
- Python Search: https://api-docs.quran.foundation/docs/sdk/python/search/
- Python User APIs: https://api-docs.quran.foundation/docs/sdk/python/user-apis/
- Python common errors: https://api-docs.quran.foundation/docs/sdk/python/common-errors/
- API Reference: https://api-docs.quran.foundation/docs/api-reference/
- OAuth2 scopes: https://api-docs.quran.foundation/docs/user_related_apis_versioned/scopes/

Acceptance checks:

- The code imports `QuranClient` from `quran_foundation`.
- Content/Search calls use an app access token, and signed-in User API calls use a user access token.
- Raw request escape hatches, if any, name the documented endpoint path, auth type, parameters, and scopes.
- No secret or token is printed, logged, committed, rendered into notebooks, or exposed to client-side code.
- Run the project's Python checks, such as `python -m ruff check .` and `python -m pytest`, when those tools are configured.
- Run live smoke checks only with approved credentials, and report skipped live checks with the reason.
