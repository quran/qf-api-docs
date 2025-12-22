# Request Additional Scopes (API Docs)

## Overview
This docs page hosts the private scope-request UI at `/request-scopes`. It requires a signed token in the URL and calls the form-handler API to validate and submit scope requests.

## Local Run
1) Set environment variables (see below).
2) Start the docs site:

```bash
yarn start
```

## Environment Variables
- `SCOPE_REQUEST_API_BASE_URL` (string, optional) Base URL for the form-handler API, e.g. `http://localhost:3000`.

## Notes
- The page is not in navigation or sidebars and uses `noindex` meta.
- A valid token is required; invalid/expired links show a friendly error state.
