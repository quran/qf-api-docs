# Response Example Mismatches

Comparing documented response schemas with extracted metadata.

## GET /api/v4/quran/tafsirs/{tafsir_id}
- Docs: `docs/content_apis_versioned/tafsir.api.mdx`
- Doc-only fields not in schema metadata: `manzil_number`, `resource_id`, `ruku_number`, `slug`

## GET /api/v4/verses/by_chapter/{chapter_number}
- Docs: `docs/content_apis_versioned/verses-by-chapter-number.api.mdx`
- Fields missing in docs: `sajdah_number`, `sajdah_type`

## GET /api/v4/verses/by_hizb/{hizb_number}
- Docs: `docs/content_apis_versioned/verses-by-hizb-number.api.mdx`
- Fields missing in docs: `sajdah_number`, `sajdah_type`

## GET /api/v4/verses/by_juz/{juz_number}
- Docs: `docs/content_apis_versioned/verses-by-juz-number.api.mdx`
- Fields missing in docs: `sajdah_number`, `sajdah_type`

## GET /api/v4/verses/by_key/{verse_key}
- Docs: `docs/content_apis_versioned/verses-by-verse-key.api.mdx`
- Fields missing in docs: `sajdah_number`, `sajdah_type`

## GET /api/v4/verses/by_page/{page_number}
- Docs: `docs/content_apis_versioned/verses-by-page-number.api.mdx`
- Fields missing in docs: `sajdah_number`, `sajdah_type`

## GET /api/v4/verses/by_rub/{rub_el_hizb_number}
- Docs: `docs/content_apis_versioned/verses-by-rub-el-hizb-number.api.mdx`
- Fields missing in docs: `sajdah_number`, `sajdah_type`

## GET /api/v4/verses/random
- Docs: `docs/content_apis_versioned/random-verse.api.mdx`
- Fields missing in docs: `sajdah_number`, `sajdah_type`
