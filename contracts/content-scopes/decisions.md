# Content scope contract v1 — decision record

Companion to `v1.json`. Governs [Appendix A](https://app.notion.com/p/3d6ffb02507a81b2b0abf6a252383ce5)
decisions D1–D5 and [the parent plan](https://app.notion.com/p/3d6ffb02507a81c7b684cfaeba7ece5e)
section 5 decision D6.

## Status: all decisions OPEN

No decision below has been approved, and **no individual has been assigned or notified by this
record**. Nothing in this repository grants a scope, issues a token or migrates a client.

What the open state does and does not block:

| Blocked until approved | Allowed now |
| --- | --- |
| Issuing any token carrying a v1 scope | Building and reviewing this contract |
| Activating the new-client baseline | Writing golden fixtures and tests |
| Running the migration in any environment | Disabled-by-default, feature-flagged implementation |
| Publishing SDK defaults that request v1 scopes | Source inventory and route reconciliation |

`v1.json` carries `"status": "proposed-pending-approval"`. Consumers must refuse to activate
issuance or enforcement while it reads that value. Flip it to `approved` only in the same change
that records the approvals below, and re-pin every consumer to the resulting contract hash.

## How to record an approval

Append to the decision's table row: owner **role**, decision, rationale, ISO date, and the
`inputs.policy.sha256` + contract hash the approval applies to. An approval is scoped to that
hash: if policy or snapshot input changes, the decision must be re-confirmed.

## D1 — Machine scope names

**Recommendation.** Use the nine machine names below. Column F of the sheet supplies *display
labels* only; it is not a source of OAuth strings. Names are case-sensitive protocol identifiers
and are permanent once a token has been issued with them.

| Display label (sheet column F) | Proposed machine name | Ops | In C8 |
| --- | --- | --- | --- |
| Audio scope | `content.audio.read` | 18 | yes |
| Quran Scope | `content.quran.read` | 37 | yes |
| Hadith Scope | `content.hadith.read` | 3 | yes |
| Translation Scope | `content.translations.read` | 13 | yes |
| Tafsir Scope | `content.tafsirs.read` | 12 | yes |
| Content Metadata Scope | `content.metadata.read` | 2 | yes |
| Content Sync Scope | `content.sync.read` | 2 | yes |
| Q&A Scope | `content.answers.read` | 3 | yes |
| Reflections and lessons public scope | `content.reflections.read` | 5 | **no** |

Counts are post-D2. Pre-D2 they are 18 / 39 / 3 / 12 / 11 / 2 / 2 / 3 / 5.

**Approval gate.** API/security owner approves spelling and permanent semantics *before any token
is issued with them*.

| Owner role | Decision | Rationale | Date | Policy sha256 | Contract sha256 |
| --- | --- | --- | --- | --- | --- |
| _API/security_ | _open_ | | | | |

## D2 — Sheet rows 47 and 48

**Recommendation.** Map row 47 `/quran/translations/{translation_id}` to `content.translations.read`
and row 48 `/quran/tafsirs/{tafsir_id}` to `content.tafsirs.read`. Both carry `Quran Scope` in
column F but return translation and tafsir text, not Quran script.

The original column F value is retained in every artifact as `sheetLabelOriginal`, and
`provenance.json` records the override with its reason. **An agent must not edit the source
spreadsheet.** The correction lives here and in `policy.json` only.

Three cases stay covered by tests: original mapping, approved mapping, and rejected-unapproved
activation.

**Approval gate.** Sheet/API owner accepts the corrections.

| Owner role | Decision | Rationale | Date | Policy sha256 | Contract sha256 |
| --- | --- | --- | --- | --- | --- |
| _Sheet/API_ | _open_ | | | | |

## D3 — Combined public-reflections successor

**Recommendation.** Grant `content.reflections.read` only where previous effective access already
covers **all five** public routes. Eligibility is decided by intersecting the client's current
scope set with each route's actual accepted alternatives — never by an assumed hierarchy:

| Route (gateway path) | Accepted today |
| --- | --- |
| `GET /v1/posts/feed` | `post.read`, `post` |
| `GET /v1/posts/:id` | `post.read`, `post` |
| `GET /v1/posts/user-posts/:id` | `post.read`, `post` |
| `GET /v1/posts/:id/comments` | `comment.read`, `comment`, `post` |
| `GET /v1/posts/:id/all-comments` | `comment.read`, `comment`, `post` |

Consequences that follow mechanically, and that reviewers should confirm are intended:

- Narrow clients need **both** `post.read` and `comment.read`. A client holding only one keeps
  exactly that permission; the other half is never completed silently.
- A client holding the `post` umbrella alone **is** eligible, because `post` is genuinely an
  accepted alternative on all five routes today (`src/utils/scopes/posts.ts`). This follows from
  actual route policy, not from a naming assumption.
- `content` alone is **never** a reflection-migration prerequisite.

A token carrying this scope reads public posts and public comments only. It must not reach private
posts, my-posts, private rooms, user-specific feeds, mutations or moderation, and upstream
visibility filtering stays mandatory even on a public path.

**Approval gate.** QuranReflect/security owner approves the prerequisite and the downstream
public-only behavior.

| Owner role | Decision | Rationale | Date | Policy sha256 | Contract sha256 |
| --- | --- | --- | --- | --- | --- |
| _QuranReflect/security_ | _open_ | | | | |

## D4 — Endpoint family, not data isolation

**Recommendation.** v1 defines scopes as **endpoint-family** permissions. It preserves existing
response contracts: Quran verse endpoints may still embed translations, tafsirs and audio, and
content sync snapshots may still return full resources across content types. `content.metadata.read`
and `content.sync.read` stay distinct and are not interchangeable metadata-only access.

Every operation in `v1.json` records `responseBoundary: "endpoint-family-not-data-isolation"`, and
the schema pins that value, so a consumer cannot quietly assume isolation.

**If the real objective is restricting every returned content type, stop this activation path.**
That needs query/resource-group-aware authorization, origin-side field enforcement, cache variation
and SDK include handling — plus a revised migration equivalence and an approved compatibility
strategy. Do not claim isolation from path checks, and do not strip fields from existing responses.

**Approval gate.** API/product owner acknowledges cross-family responses and resource snapshots.

| Owner role | Decision | Rationale | Date | Policy sha256 | Contract sha256 |
| --- | --- | --- | --- | --- | --- |
| _API/product_ | _open_ | | | | |

## D5 — New-client baseline

**Recommendation.** Replace only the legacy content-read component of each environment baseline
with the eight C8 successors. Retain every unrelated existing default. Do not auto-grant separately
approved `search`, Qiraat, analytics, or user/admin rights.

- Remove for new identities: `content`, `content.read`
- Add for new identities: the eight C8 scopes
- Add `content.reflections.read` only where that environment's baseline already covers all five
  public reflection routes

The inspected production baseline already includes `post.read` and `comment.read` alongside
`content` and `offline_access`, so it can support all nine categories without inventing a new user
permission. **That is not a reason to grant nine scopes to a historically content-only client** —
per-client migration still follows D3.

Optional least-privilege subsets require an explicit product rule. Tokens should still request only
what each operation needs.

**Approval gate.** Provisioning/security owner approves the exact baseline and any optional subset
policy, per environment and client type.

| Owner role | Decision | Rationale | Date | Policy sha256 | Contract sha256 |
| --- | --- | --- | --- | --- | --- |
| _Provisioning/security_ | _open_ | | | | |

## D6 — SDK release semantics

**Recommendation.** Preserve existing behavior for existing credentials. Ship an explicit, opt-in
granular mode first; change a default only in a deliberately versioned release with notes. State
the minimum compatible release for new granular-only credentials.

An old SDK with hard-coded scope requests **cannot** be promised compatibility with brand-new
granular-only credentials. Say so plainly in the docs rather than implying it works.

**Approval gate.** SDK owner approves release semantics.

| Owner role | Decision | Rationale | Date | Policy sha256 | Contract sha256 |
| --- | --- | --- | --- | --- | --- |
| _SDK_ | _open_ | | | | |

## Inputs this record applies to

| Input | Path | sha256 |
| --- | --- | --- |
| Spreadsheet snapshot (208 rows) | `source/QF_API_Endpoints.snapshot.csv` | see `v1.json` → `inputs.sourceSnapshot.sha256` |
| Reviewed policy | `policy.json` | see `v1.json` → `inputs.policy.sha256` |

Source: [QF_API_Endpoints](https://docs.google.com/spreadsheets/d/1eyyhzsAq925Hj9mE-FgvncOoENVLxZdqV3NB9s4fNhI/edit),
tab `QF_API_Endpoints.csv`, columns A–M, rows 1–209 (1 header + 208 data).

Retrieval provenance: rows 2–191 were read through the Google Drive connector's text rendering of
the sheet; that rendering truncates at ~64 KB, so rows 192–209 were read separately from the same
sheet and tab via a bounded range export. The two reads overlap on rows 190–191 and agree, and the
resulting family counts (95 Content / 106 User / 6 OAuth2 / 1 Search) match the plan's stated
totals. Re-verify against the sheet before approving D1/D2.
