# Endpoints Present in Code but Missing in Docs (v4 focus)

## Confirmed gaps

- `GET /api/v4` (controller: `api/ping` source: `config/routes/api/v4.rb:139`) - no matching doc found under `docs/content_apis_versioned`.

## Previously flagged but already documented

- `GET /api/v4/chapter_recitations/{reciter_id}` (controller: `api/chapter_recitations` source: `config/routes/api/v4.rb:134`) - covered by `docs/content_apis_versioned/chapter-reciter-audio-files.api.mdx`.
- `GET /api/v4/chapter_recitations/{reciter_id}/{chapter_number}` (controller: `api/chapter_recitations` source: `config/routes/api/v4.rb:135`) - covered by `docs/content_apis_versioned/chapter-reciter-audio-file.api.mdx`.
- `GET /api/v4/chapters/{id}/info` (controller: `api/chapter_infos` source: `config/routes/api/v4.rb:39`) - documented as `GET /chapters/{chapter_id}/info` in `docs/content_apis_versioned/info.api.mdx`.

> Out-of-scope lists from earlier drafts (QDC, v3, mobile, GraphQL, etc.) were removed here per the v4-only focus.
