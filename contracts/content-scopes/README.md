# Content scope contract

Canonical, versioned home of the content scope split. Every consumer — API gateway, Platform API,
Admin Dashboard, Developer Console, JS SDK, Python SDK, and the OpenAPI documents in this repo —
pins one approved version of this contract instead of hard-coding scope strings.

**Nothing here is deployed policy.** `v1.json` carries `"status": "proposed-pending-approval"`.
Decisions D1–D6 in [`decisions.md`](./decisions.md) are all open, and consumers must refuse to
activate issuance or enforcement while the status reads that value.

## Files

| File | Role |
| --- | --- |
| `source/QF_API_Endpoints.snapshot.csv` | Immutable snapshot of the source spreadsheet: 208 data rows, columns A–M, one-based `sheet_row` retained. Never edited by hand. |
| `policy.json` | Reviewed policy inputs. Each value is either an owner decision (cited to a D-number) or an observed fact about currently deployed authorization (cited to a pinned source file). |
| `v1.json` | Generated contract. What consumers pin. |
| `v1.sha256` | Canonical contract hash for consumers to record. |
| `v1.schema.json` | Schema `v1.json` is validated against, in CI and in every consumer's build. |
| `provenance.json` | All 208 rows with an explicit disposition: mapped, mapped-with-approved-override, or regression-inventory-not-migrated. |
| `decisions.md` | D1–D6 record. Currently all open. |
| `route-reconciliation.md` | Disposition for every difference between the live Rails v4 route surface and the contract. Records one open decision that blocks D5. |

## Regenerating

```bash
yarn contract:build
```

`yarn contract:check` (which `yarn test` runs first) fails if the committed artifacts are stale or
were hand-edited, so an edited contract cannot merge. Change policy in `policy.json`, never in
`v1.json`.

## Design rules this contract enforces

The generator fails the build — it does not warn — when any of these is violated:

- **A closed scope set.** Nine machine names, fixed in the schema. An unknown scope is a build
  failure. `content.audio.read` does not imply `content.quran.read`, and a shared `content.`
  prefix is never authorization.
- **Labels are not scopes.** Spreadsheet column F supplies display labels. Machine names come from
  D1. `sheetLabelOriginal` preserves column F even where an approved override changes the mapping.
- **Policy comes from code, not from the sheet.** `legacyAnyOf` on each operation is the set of
  alternatives the gateway accepts *today*, read from `src/utils/scopes/*` and `src/libs/oauth.ts`
  at a pinned commit. Column A is `API Family`, not a runtime scope.
- **No route conflicts.** The normalized key is service + method + canonical route template +
  environment. A collision fails the build; it is never resolved last-row-wins.
- **Aliases agree.** `/by_rub` and `/by_rub_el_hizb` style pairs must resolve to the same scope.
- **Precedence is explicit.** The gateway checks exact route keys before dynamic ones, so a literal
  path always shadows a dynamic sibling. Every such pair is recorded and must resolve to the same
  scope, so precedence can never change effective rights.
- **Quota buckets are frozen.** `quotaBuckets` is the pre-migration bucket set and is deliberately
  *not* the authorization alternatives. A granular scope in a quota bucket is a build failure:
  otherwise one aggregate content allowance would silently split into eight, or be charged twice
  for one request.
- **No environment guessing.** Environments come from spreadsheet column L. Branch names and
  GitHub environment labels are not environments, and a test asserts no branch-like string leaks
  into an operation.

## Migration equivalence

`A' = A ∪ equivalentSuccessors_v1(A)` — a finite approved map, not "every scope starting with
`content.`". Eligibility is decided by intersecting a client's *current effective* scope set with
each operation's real accepted alternatives:

- Intersects `content` or `content.read` → gains the eight **C8** successors.
- A `content.create`-only client gains **no** reads.
- `content.reflections.read` requires prior coverage of **all five** public reflection routes.
  Partial rights are preserved, never completed. `content` alone never qualifies. See D3.

The new read scopes authorize no writes, and existing clients keep their original scope strings,
client ID, secret, redirect URIs, audiences, grant types, auth method, metadata, lifecycle state
and quota settings.

## Downstream templates (T12)

Assessed, no change required now.

`quran/qf-starter-kit` reads its authorization-code scopes from a `SCOPES` environment variable
defaulting to a user-scope list that contains no content scope, and makes its content calls through
`createServerClient`, which selects the content scope inside the SDK. It does not set
`contentScopeMode`, so it gets the `legacy` default and keeps requesting `content` — correct and
unchanged for credentials issued today. It pins `@quranjs/api` at `^3.2.0`.

A generated app would need two things to work with granular-only credentials: `contentScopeMode:
"granular"` and an `@quranjs/api` release that supports it. That release is not published yet, so
changing the starter now would pin it to a version that does not exist. The follow-through is
therefore sequenced after the SDK release, per T12's dependency on T09/T10:

1. Publish the SDK minor release carrying `contentScopeMode`.
2. Update the human-maintained starter first, then synchronize `quran/quranjs-create-app` through
   the documented release workflow — do not hand-edit the generated copies.
3. Smoke-test a freshly generated app with both a migrated client and a granular-only client, and
   confirm no browser bundle contains a client secret.

## Scope of this directory

This contract covers the 95 Content-family entries. The remaining 113 rows (User, OAuth2, Search)
are retained as regression inventory with full provenance and are **not** migrated: their policies
stay independent and changing them needs separate approval. In particular, the existing user-data
`sync` scope is unrelated to `content.sync.read`, and Qiraat keeps its own explicit gateway policy
outside this migration.
