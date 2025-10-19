# Parameter & Example Gaps

Detected doc/code mismatches for matched endpoints.

## GET /api/qdc/chapters
- Docs: `docs/content_apis_versioned/list-chapters.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `query:language`

## GET /api/qdc/chapters/{id}
- Docs: `docs/content_apis_versioned/get-chapter.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:id`, `query:language`

## GET /api/qdc/quran/recitations/{recitation_id}
- Docs: `docs/content_apis_versioned/recitation-audio-files.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:recitation_id`, `query:chapter_number`, `query:fields`, `query:hizb_number`, `query:juz_number`, `query:page_number`, `query:rub_el_hizb_number`, `query:verse_key`

## GET /api/qdc/quran/tafsirs/{tafsir_id}
- Docs: `docs/content_apis_versioned/tafsir.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:tafsir_id`, `query:chapter_number`, `query:fields`, `query:hizb_number`, `query:juz_number`, `query:page_number`, `query:rub_el_hizb_number`, `query:verse_key`

## GET /api/qdc/quran/translations/{translation_id}
- Docs: `docs/content_apis_versioned/translation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:translation_id`, `query:chapter_number`, `query:fields`, `query:hizb_number`, `query:juz_number`, `query:page_number`, `query:rub_el_hizb_number`, `query:verse_key`

## GET /api/qdc/quran/verses/{script}
- Docs: `docs/content_apis_versioned/get-quran-glyphs-by-script.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:script`

## GET /api/qdc/recitations/{recitation_id}/by_ayah/{ayah_key}
- Docs: `docs/content_apis_versioned/list-ayah-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:ayah_key`, `path:recitation_id`

## GET /api/qdc/recitations/{recitation_id}/by_chapter/{chapter_number}
- Docs: `docs/content_apis_versioned/list-surah-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:chapter_number`, `path:recitation_id`

## GET /api/qdc/recitations/{recitation_id}/by_hizb/{hizb_number}
- Docs: `docs/content_apis_versioned/list-hizb-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:hizb_number`, `path:recitation_id`

## GET /api/qdc/recitations/{recitation_id}/by_juz/{juz_number}
- Docs: `docs/content_apis_versioned/list-juz-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:juz_number`, `path:recitation_id`

## GET /api/qdc/recitations/{recitation_id}/by_manzil/{manzil_number}
- Docs: `docs/content_apis_versioned/list-manzil-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:manzil_number`, `path:recitation_id`

## GET /api/qdc/recitations/{recitation_id}/by_page/{page_number}
- Docs: `docs/content_apis_versioned/list-page-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:page_number`, `path:recitation_id`

## GET /api/qdc/recitations/{recitation_id}/by_ruku/{ruku_number}
- Docs: `docs/content_apis_versioned/list-ruku-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:recitation_id`, `path:ruku_number`

## GET /api/qdc/resources/languages
- Docs: `docs/content_apis_versioned/languages.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `query:language`

## GET /api/qdc/resources/tafsirs
- Docs: `docs/content_apis_versioned/tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `query:language`

## GET /api/qdc/resources/tafsirs/{tafsir_id}/info
- Docs: `docs/content_apis_versioned/tafsir-info.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:tafsir_id`

## GET /api/qdc/resources/translations
- Docs: `docs/content_apis_versioned/translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `query:language`

## GET /api/qdc/resources/translations/{translation_id}/info
- Docs: `docs/content_apis_versioned/translation-info.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:translation_id`

## GET /api/qdc/search
- Docs: `docs/content_apis_versioned/search.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `query:language`, `query:page`, `query:q`, `query:size`

## GET /api/qdc/tafsirs/{resource_id}/by_ayah/{ayah_key}
- Docs: `docs/content_apis_versioned/list-ayah-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:ayah_key`, `path:resource_id`

## GET /api/qdc/tafsirs/{resource_id}/by_chapter/{chapter_number}
- Docs: `docs/content_apis_versioned/list-surah-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:chapter_number`, `path:resource_id`

## GET /api/qdc/tafsirs/{resource_id}/by_hizb/{hizb_number}
- Docs: `docs/content_apis_versioned/list-hizb-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:hizb_number`, `path:resource_id`

## GET /api/qdc/tafsirs/{resource_id}/by_juz/{juz_number}
- Docs: `docs/content_apis_versioned/list-juz-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:juz_number`, `path:resource_id`

## GET /api/qdc/tafsirs/{resource_id}/by_manzil/{manzil_number}
- Docs: `docs/content_apis_versioned/list-manzil-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:manzil_number`, `path:resource_id`

## GET /api/qdc/tafsirs/{resource_id}/by_page/{page_number}
- Docs: `docs/content_apis_versioned/list-page-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:page_number`, `path:resource_id`

## GET /api/qdc/tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number}
- Docs: `docs/content_apis_versioned/list-rub-el-hizb-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:rub_el_hizb_number`

## GET /api/qdc/tafsirs/{resource_id}/by_ruku/{ruku_number}
- Docs: `docs/content_apis_versioned/list-ruku-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:ruku_number`

## GET /api/qdc/translations/{resource_id}/by_ayah/{ayah_key}
- Docs: `docs/content_apis_versioned/list-ayah-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:ayah_key`, `path:resource_id`

## GET /api/qdc/translations/{resource_id}/by_chapter/{chapter_number}
- Docs: `docs/content_apis_versioned/list-surah-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:chapter_number`, `path:resource_id`

## GET /api/qdc/translations/{resource_id}/by_hizb/{hizb_number}
- Docs: `docs/content_apis_versioned/list-hizb-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:hizb_number`, `path:resource_id`

## GET /api/qdc/translations/{resource_id}/by_juz/{juz_number}
- Docs: `docs/content_apis_versioned/list-juz-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:juz_number`, `path:resource_id`

## GET /api/qdc/translations/{resource_id}/by_manzil/{manzil_number}
- Docs: `docs/content_apis_versioned/list-manzil-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:manzil_number`, `path:resource_id`

## GET /api/qdc/translations/{resource_id}/by_page/{page_number}
- Docs: `docs/content_apis_versioned/list-page-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:page_number`, `path:resource_id`

## GET /api/qdc/translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number}
- Docs: `docs/content_apis_versioned/list-rub-el-hizb-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:rub_el_hizb_number`

## GET /api/qdc/translations/{resource_id}/by_ruku/{ruku_number}
- Docs: `docs/content_apis_versioned/list-ruku-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:ruku_number`

## GET /api/qdc/verses/by_chapter/{chapter_number}
- Docs: `docs/content_apis_versioned/verses-by-chapter-number.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:chapter_number`, `query:audio`, `query:fields`, `query:language`, `query:page`, `query:per_page`, `query:tafsirs`, `query:translation_fields`, `query:translations`, `query:word_fields`, `query:words`

## GET /api/qdc/verses/by_hizb/{hizb_number}
- Docs: `docs/content_apis_versioned/verses-by-hizb-number.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:hizb_number`, `query:audio`, `query:fields`, `query:language`, `query:page`, `query:per_page`, `query:tafsirs`, `query:translation_fields`, `query:translations`, `query:word_fields`, `query:words`

## GET /api/qdc/verses/by_juz/{juz_number}
- Docs: `docs/content_apis_versioned/verses-by-juz-number.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:juz_number`, `query:audio`, `query:fields`, `query:language`, `query:page`, `query:per_page`, `query:tafsirs`, `query:translation_fields`, `query:translations`, `query:word_fields`, `query:words`

## GET /api/qdc/verses/by_key/{verse_key}
- Docs: `docs/content_apis_versioned/verses-by-verse-key.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:verse_key`, `query:audio`, `query:fields`, `query:language`, `query:tafsirs`, `query:translation_fields`, `query:translations`, `query:word_fields`, `query:words`

## GET /api/qdc/verses/by_page/{page_number}
- Docs: `docs/content_apis_versioned/verses-by-page-number.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:page_number`, `query:audio`, `query:fields`, `query:language`, `query:page`, `query:per_page`, `query:tafsirs`, `query:translation_fields`, `query:translations`, `query:word_fields`, `query:words`

## GET /api/qdc/verses/by_rub/{rub_el_hizb_number}
- Docs: `docs/content_apis_versioned/verses-by-rub-el-hizb-number.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:rub_el_hizb_number`, `query:audio`, `query:fields`, `query:language`, `query:tafsirs`, `query:translation_fields`, `query:translations`, `query:word_fields`, `query:words`

## GET /api/qdc/verses/random
- Docs: `docs/content_apis_versioned/random-verse.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `query:audio`, `query:fields`, `query:language`, `query:tafsirs`, `query:translation_fields`, `query:translations`, `query:word_fields`, `query:words`

## GET /api/v4/quran/verses/{script}
- Docs: `docs/content_apis_versioned/get-quran-glyphs-by-script.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:script`

## GET /api/v4/recitations/{recitation_id}/by_manzil/{manzil_number}
- Docs: `docs/content_apis_versioned/list-manzil-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:manzil_number`, `path:recitation_id`

## GET /api/v4/recitations/{recitation_id}/by_ruku/{ruku_number}
- Docs: `docs/content_apis_versioned/list-ruku-recitation.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:recitation_id`, `path:ruku_number`

## GET /api/v4/tafsirs/{resource_id}/by_ayah/{ayah_key}
- Docs: `docs/content_apis_versioned/list-ayah-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:ayah_key`, `path:resource_id`

## GET /api/v4/tafsirs/{resource_id}/by_chapter/{chapter_number}
- Docs: `docs/content_apis_versioned/list-surah-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:chapter_number`, `path:resource_id`

## GET /api/v4/tafsirs/{resource_id}/by_hizb/{hizb_number}
- Docs: `docs/content_apis_versioned/list-hizb-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:hizb_number`, `path:resource_id`

## GET /api/v4/tafsirs/{resource_id}/by_juz/{juz_number}
- Docs: `docs/content_apis_versioned/list-juz-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:juz_number`, `path:resource_id`

## GET /api/v4/tafsirs/{resource_id}/by_manzil/{manzil_number}
- Docs: `docs/content_apis_versioned/list-manzil-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:manzil_number`, `path:resource_id`

## GET /api/v4/tafsirs/{resource_id}/by_page/{page_number}
- Docs: `docs/content_apis_versioned/list-page-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:page_number`, `path:resource_id`

## GET /api/v4/tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number}
- Docs: `docs/content_apis_versioned/list-rub-el-hizb-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:rub_el_hizb_number`

## GET /api/v4/tafsirs/{resource_id}/by_ruku/{ruku_number}
- Docs: `docs/content_apis_versioned/list-ruku-tafsirs.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:ruku_number`

## GET /api/v4/translations/{resource_id}/by_ayah/{ayah_key}
- Docs: `docs/content_apis_versioned/list-ayah-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:ayah_key`, `path:resource_id`

## GET /api/v4/translations/{resource_id}/by_chapter/{chapter_number}
- Docs: `docs/content_apis_versioned/list-surah-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:chapter_number`, `path:resource_id`

## GET /api/v4/translations/{resource_id}/by_hizb/{hizb_number}
- Docs: `docs/content_apis_versioned/list-hizb-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:hizb_number`, `path:resource_id`

## GET /api/v4/translations/{resource_id}/by_juz/{juz_number}
- Docs: `docs/content_apis_versioned/list-juz-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:juz_number`, `path:resource_id`

## GET /api/v4/translations/{resource_id}/by_manzil/{manzil_number}
- Docs: `docs/content_apis_versioned/list-manzil-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:manzil_number`, `path:resource_id`

## GET /api/v4/translations/{resource_id}/by_page/{page_number}
- Docs: `docs/content_apis_versioned/list-page-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:page_number`, `path:resource_id`

## GET /api/v4/translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number}
- Docs: `docs/content_apis_versioned/list-rub-el-hizb-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:rub_el_hizb_number`

## GET /api/v4/translations/{resource_id}/by_ruku/{ruku_number}
- Docs: `docs/content_apis_versioned/list-ruku-translations.api.mdx`
- Route defaults: `{'format': 'json'}`
- Parameters documented but not inferred from code: `path:resource_id`, `path:ruku_number`
