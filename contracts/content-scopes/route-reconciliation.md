# Route reconciliation — Content API v4 vs contract v1

Disposition for every difference between the live Rails v4 route surface and the 90 content
operations in `v1.json`. Required by [Appendix A3](https://app.notion.com/p/3d6ffb02507a81b2b0abf6a252383ce5)
and work packages T00, T01 and T04.

**Sources**

| What | Where |
| --- | --- |
| Route surface | `quran/quran.com-api` @ `origin/testing-warsh` `596c7edcfcbc32171242ba26f34fd5499ac5f269`, `config/routes/api/v4.rb` |
| Gateway policy | `quran/qf-api-gateway` @ `origin/testing` `0954eae442ab4ed47cca45102074bb01a88079cf` |
| Contract | `contracts/content-scopes/v1.json`, sha256 `9c52c6e12ea40bc378a0a160d3e0f1bce67bbf774fe5e4f7d14e09b56b3e5254` |

**Method and its limit.** The route surface was obtained by statically parsing the routes DSL, not
by running `rails routes`, which needs the full application environment. It found 109 GET routes.
Re-run `rails routes` before relying on this for an activation decision. A route existing in source
is also not proof it is deployed.

## 1. Origin enforcement: no code change needed

`ApplicationController` (`app/controllers/application_controller.rb`) declares only
`set_cache_headers`, `set_default_response_format` and `disable_non_production_api_caching`. There
is no `before_action` that authenticates a caller, reads `x-auth-token`, or checks a gateway
identity, and no such guard exists anywhere in `app/` or `config/`. `Api::V4::ApiController` adds
only resource-lookup helpers. Even `Api::Qdc::Qiraat::BaseController` — the most restricted surface
— has no authentication of its own; Qiraat is restricted purely by explicit gateway route policy.

So the origin consumes no OAuth scope at all, and **the gateway is the complete and only
enforcement point** for content scopes. T04's outcome is a documented no-code-change: the granular
scopes require no origin work, and because the origin never inspected scopes, they create no new
bypass there.

Two properties of that model are worth stating, both pre-existing and neither altered by this
migration:

- The origin sets `Access-Control-Allow-Origin: *` and `expires_in 7.days, public: true` on content
  responses. Anything that can reach the origin directly is not scope-checked.
- Authorization therefore depends entirely on the origin not being publicly reachable except
  through the gateway. That is a network-topology property this repository cannot verify, and it
  should be confirmed independently rather than assumed. It is out of scope for the content scope
  split, which neither improves nor worsens it.

## 2. Contract operations with no dedicated Rails route

Eight operations, all `content.quran.read`:

| Contract operation | Served by |
| --- | --- |
| `/api/v4/quran/verses/uthmani` | `get 'verses/:script'` |
| `/api/v4/quran/verses/uthmani_simple` | same |
| `/api/v4/quran/verses/uthmani_tajweed` | same |
| `/api/v4/quran/verses/indopak` | same |
| `/api/v4/quran/verses/indopak_nastaleeq` | same |
| `/api/v4/quran/verses/imlaei` | same |
| `/api/v4/quran/verses/code_v1` | same |
| `/api/v4/quran/verses/code_v2` | same |

**Disposition: map to a named new scope — already done, no action.** The spreadsheet and the
OpenAPI document treat each script as its own operation; Rails serves them all through one dynamic
route whose `script` parameter is enumerated in the OpenAPI schema. The gateway matches exact keys
before dynamic ones, so a literal script path shadows `/api/v4/quran/verses/:script`. Because all
nine entries resolve to `content.quran.read`, precedence cannot change effective rights either way.
`v1.json` records all eight pairs in `precedencePairs`, and the generator fails the build if any
literal ever disagrees with its dynamic sibling.

## 3. Rails routes not in the contract

27 routes. Every category Appendix A3 predicted is confirmed present.

### 3a. Restricted — keep independent permission (11 routes)

`/api/v4/qiraat/readers`, `/readers/:id`, `/transmitters`, `/transmitters/:id`,
`/junctures/by_verse/:verse_key`, `/junctures/by_chapter/:chapter_number`, `/junctures/:id`,
`/readings/:id`, `/matrix/by_verse/:verse_key`, `/matrix/by_chapter/:chapter_number`,
`/matrix/count_within_range`.

**Disposition: outside this migration, verified.** These have explicit gateway entries requiring
`qiraat.read` or `qiraat`. The gateway change runs its content merge in `preserve` mode so an
existing explicit route is never widened, and a test asserts every Qiraat route rejects all nine
granular scopes and still accepts `qiraat.read`.

### 3b. Separately approved — not a content successor (2 routes)

`/api/v4/search`, `/api/v4/suggest`.

**Disposition: preserve legacy-only access.** Note these sit under the content service prefix, so
today they match the `GET /content/*` wildcard and are reachable with `content` or `content.read` —
they do *not* require the `search` scope on this path. That is pre-existing behavior and is
preserved unchanged. No granular successor is assigned: the new scopes must not become a second
route to a separately approved permission. The canonical search surface remains
`/search/api/v1/search`, which does require `search`.

### 3c. Live content reads absent from the spreadsheet (12 routes)

| Route | Note |
| --- | --- |
| `/api/v4/mushafs` | Approved Mushafs |
| `/api/v4/verses/filter` | Verse filtering |
| `/api/v4/hadith_references/by_urn/:urn` | Hadith by URN |
| `/api/v4/resources/changes` | Resource changes |
| `/api/v4/resources/word_by_word_translations` | Word-by-word translations |
| `/api/v4/audio/qaris` | Audio subroutes |
| `/api/v4/audio/qaris/:id` | |
| `/api/v4/audio/qaris/related/:id` | |
| `/api/v4/audio/qaris/:id/audio_files/:ext` | |
| `/api/v4/audio/sections` | |
| `/api/v4/audio/surahs` | |
| `/api/v4/audio/surahs/:id` | |

**Disposition: preserve legacy-only access, and resolve before D5 activation.**

They keep working exactly as they do today: no contract entry means no explicit gateway route, so
they fall through to the `GET /content/*` wildcard and continue to accept `content.read` or
`content`. The wildcard is deliberately legacy-only, so none of them silently inherits a granular
permission.

> **This has a consequence that needs a decision, and it is not resolved by this contract.**
>
> Under D5 a newly issued client receives the eight C8 scopes and **no** `content` or
> `content.read`. Such a client would be refused on all 12 of these routes, plus the two in 3b —
> 14 live content endpoints an existing client can call today. That is a functional regression for
> new clients, arrived at silently through absence from a spreadsheet rather than by review.
>
> Before D5 is activated, one of these has to be chosen and recorded:
>
> 1. **Reconcile them into the contract** with reviewed scope assignments (the audio subroutes
>    plausibly `content.audio.read`, Mushafs and `verses/filter` plausibly `content.quran.read`,
>    `resources/changes` plausibly `content.sync.read`, `hadith_references/by_urn`
>    plausibly `content.hadith.read`, `resources/word_by_word_translations` plausibly
>    `content.translations.read`) — each needs an owner decision, not a plausible guess; or
> 2. **Accept the narrowing deliberately**, publish that these endpoints need the legacy scope, and
>    document them as unavailable to granular-only clients; or
> 3. **Confirm they are not publicly deployed**, in which case there is nothing to reconcile — but
>    that must be verified against the deployed app rather than assumed from the routes file.
>
> Option 1 is the recommendation. Whichever is chosen, it belongs in `policy.json` and
> `decisions.md` before the new-client policy is switched on.

### 3d. Infrastructure (2 routes)

`/api/v4/ping`, `/api/v4/`.

**Disposition: keep internal/nonpublic.** Health checks. No scope assignment; they stay on
whatever the wildcard gives them, as today.

## 4. Response boundaries (D4)

No change. The scopes select endpoint families and do not filter response fields:

- Verse endpoints accept `translations`, `tafsirs` and `words` parameters and embed those resources
  in the response. A call authorized by `content.quran.read` can therefore return translation and
  tafsir text. The Python SDK's verse helpers default to `translations="131"`, which is unchanged
  and covered by a test.
- `/api/v4/resources/sync` and `/api/v4/resources/snapshots/:resource_group/:id` return resources
  across content types under `content.sync.read`.

Authorization happens at the gateway, ahead of the origin's public cache, so no protected response
is served from cache before a scope check. Nothing in this change strips fields from an existing
response.

If strict per-data-type isolation is the actual objective, this activation path is the wrong one:
it needs query and resource-group-aware authorization, origin-side field enforcement, cache
variation and SDK include handling, plus a revised migration equivalence. See D4.

## 5. Completion state

- [x] Every relevant route difference has a recorded disposition.
- [x] Origin trust and enforcement point evidenced.
- [x] Response-boundary behavior recorded, with no fields silently stripped.
- [ ] **Open:** the 14 routes in 3b/3c that a granular-only client could not call. Needs an owner
      decision before D5 activation.
- [ ] **Open:** `rails routes` re-run against the deployed revision, to replace this static parse.
