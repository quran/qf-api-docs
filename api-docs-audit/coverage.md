# Endpoint Coverage
| Method | Path | Code | Docs |
| --- | --- | --- | --- |
| GET | / | yes | yes |
| GET | /audio/qaris | yes | yes |
| GET | /audio/qaris/related/{id} | yes | yes |
| GET | /audio/qaris/{id} | yes | yes |
| GET | /audio/qaris/{id}/audio_files/{ext} | yes | yes |
| GET | /audio/sections | yes | yes |
| GET | /audio/surahs | yes | yes |
| GET | /audio/surahs/{id} | yes | yes |
| GET | /chapter_recitations/{id} | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | yes | yes |
| GET | /chapters | yes | yes |
| GET | /chapters/{chapter_id}/info | yes | yes |
| GET | /chapters/{id} | yes | yes |
| GET | /foot_notes/{id} | yes | yes |
| GET | /hizbs | yes | yes |
| GET | /hizbs/{id} | yes | yes |
| GET | /juzs | yes | yes |
| GET | /juzs/{id} | yes | yes |
| GET | /manzils | yes | yes |
| GET | /manzils/{id} | yes | yes |
| GET | /mushafs | yes | yes |
| GET | /ping | yes | yes |
| GET | /quran/recitations/{recitation_id} | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | yes | yes |
| GET | /quran/translations/{translation_id} | yes | yes |
| GET | /quran/verses/{script} | yes | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_rub_el_hizb/{rub_el_hizb_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | yes | yes |
| GET | /resources/changes | yes | yes |
| GET | /resources/chapter_infos | yes | yes |
| GET | /resources/chapter_reciters | yes | yes |
| GET | /resources/languages | yes | yes |
| GET | /resources/recitation_styles | yes | yes |
| GET | /resources/recitations | yes | yes |
| GET | /resources/recitations/{recitation_id}/info | yes | yes |
| GET | /resources/tafsirs | yes | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | yes | yes |
| GET | /resources/translations | yes | yes |
| GET | /resources/translations/{translation_id}/info | yes | yes |
| GET | /resources/verse_media | yes | yes |
| GET | /resources/word_by_word_translations | yes | yes |
| GET | /rub_el_hizbs | yes | yes |
| GET | /rub_el_hizbs/{id} | yes | yes |
| GET | /rukus | yes | yes |
| GET | /rukus/{id} | yes | yes |
| GET | /search | yes | yes |
| GET | /suggest | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub/{rub_el_hizb_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | yes | yes |
| GET | /translations/{resource_id}/by_rub/{rub_el_hizb_number} | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | yes | yes |
| GET | /verses/by_juz/{juz_number} | yes | yes |
| GET | /verses/by_key/{verse_key} | yes | yes |
| GET | /verses/by_manzil/{manzil_number} | yes | yes |
| GET | /verses/by_page/{page_number} | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | yes | yes |
| GET | /verses/by_rub_el_hizb/{rub_el_hizb_number} | yes | yes |
| GET | /verses/by_ruku/{ruku_number} | yes | yes |
| GET | /verses/filter | yes | yes |
| GET | /verses/random | yes | yes |

# Parameter Coverage
| Method | Path | Name | In | Code | Docs |
| --- | --- | --- | --- | --- | --- |
| GET | / | - | - | yes | yes |
| GET | /audio/qaris | - | - | yes | yes |
| GET | /audio/qaris/related/{id} | - | - | yes | yes |
| GET | /audio/qaris/{id} | - | - | yes | yes |
| GET | /audio/qaris/{id}/audio_files/{ext} | - | - | yes | yes |
| GET | /audio/sections | - | - | yes | yes |
| GET | /audio/surahs | - | - | yes | yes |
| GET | /audio/surahs/{id} | - | - | yes | yes |
| GET | /chapter_recitations/{id} | id | path | yes | yes |
| GET | /chapter_recitations/{id} | language | query | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | chapter_number | path | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | id | path | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | segments | query | yes | yes |
| GET | /chapters | language | query | yes | yes |
| GET | /chapters/{chapter_id}/info | chapter_id | path | yes | yes |
| GET | /chapters/{chapter_id}/info | language | query | yes | yes |
| GET | /chapters/{id} | id | path | yes | yes |
| GET | /chapters/{id} | language | query | yes | yes |
| GET | /foot_notes/{id} | - | - | yes | yes |
| GET | /hizbs | - | - | yes | yes |
| GET | /hizbs/{id} | - | - | yes | yes |
| GET | /juzs | - | - | yes | yes |
| GET | /juzs/{id} | - | - | yes | yes |
| GET | /manzils | - | - | yes | yes |
| GET | /manzils/{id} | - | - | yes | yes |
| GET | /mushafs | - | - | yes | yes |
| GET | /ping | - | - | yes | yes |
| GET | /quran/recitations/{recitation_id} | recitation_id | path | yes | yes |
| GET | /quran/recitations/{recitation_id} | chapter_number | query | yes | yes |
| GET | /quran/recitations/{recitation_id} | fields | query | yes | yes |
| GET | /quran/recitations/{recitation_id} | hizb_number | query | yes | yes |
| GET | /quran/recitations/{recitation_id} | juz_number | query | yes | yes |
| GET | /quran/recitations/{recitation_id} | page_number | query | yes | yes |
| GET | /quran/recitations/{recitation_id} | rub_el_hizb_number | query | yes | yes |
| GET | /quran/recitations/{recitation_id} | verse_key | query | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | tafsir_id | path | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | chapter_number | query | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | fields | query | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | hizb_number | query | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | juz_number | query | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | page_number | query | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | rub_el_hizb_number | query | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | verse_key | query | yes | yes |
| GET | /quran/translations/{translation_id} | translation_id | path | yes | yes |
| GET | /quran/translations/{translation_id} | chapter_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | fields | query | yes | yes |
| GET | /quran/translations/{translation_id} | hizb_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | juz_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | page_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | rub_el_hizb_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | verse_key | query | yes | yes |
| GET | /quran/verses/{script} | script | path | yes | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | ayah_key | path | yes | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | chapter_number | path | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | hizb_number | path | yes | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | juz_number | path | yes | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | manzil_number | path | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | page_number | path | yes | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | rub_el_hizb_number | path | yes | yes |
| GET | /recitations/{recitation_id}/by_rub_el_hizb/{rub_el_hizb_number} | - | - | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | ruku_number | path | yes | yes |
| GET | /resources/changes | - | - | yes | yes |
| GET | /resources/chapter_infos | - | - | yes | yes |
| GET | /resources/chapter_reciters | language | query | yes | yes |
| GET | /resources/languages | language | query | yes | yes |
| GET | /resources/recitation_styles | - | - | yes | yes |
| GET | /resources/recitations | language | query | yes | yes |
| GET | /resources/recitations/{recitation_id}/info | recitation_id | path | yes | yes |
| GET | /resources/tafsirs | language | query | yes | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | tafsir_id | path | yes | yes |
| GET | /resources/translations | language | query | yes | yes |
| GET | /resources/translations/{translation_id}/info | translation_id | path | yes | yes |
| GET | /resources/verse_media | - | - | yes | yes |
| GET | /resources/word_by_word_translations | - | - | yes | yes |
| GET | /rub_el_hizbs | - | - | yes | yes |
| GET | /rub_el_hizbs/{id} | - | - | yes | yes |
| GET | /rukus | - | - | yes | yes |
| GET | /rukus/{id} | - | - | yes | yes |
| GET | /search | language | query | yes | yes |
| GET | /search | page | query | yes | yes |
| GET | /search | q | query | yes | yes |
| GET | /search | size | query | yes | yes |
| GET | /suggest | - | - | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | ayah_key | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | chapter_number | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | hizb_number | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | juz_number | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | manzil_number | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | page_number | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub/{rub_el_hizb_number} | - | - | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | rub_el_hizb_number | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | resource_id | path | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | ruku_number | path | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | ayah_key | path | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | chapter_number | path | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | hizb_number | path | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | juz_number | path | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | manzil_number | path | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | page_number | path | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_rub/{rub_el_hizb_number} | - | - | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | rub_el_hizb_number | path | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | resource_id | path | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | ruku_number | path | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | chapter_number | path | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | audio | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | fields | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | language | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | page | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | per_page | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | tafsirs | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | translation_fields | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | translations | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | word_fields | query | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | words | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | hizb_number | path | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | audio | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | fields | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | language | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | page | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | per_page | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | tafsirs | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | translation_fields | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | translations | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | word_fields | query | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | words | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | juz_number | path | yes | yes |
| GET | /verses/by_juz/{juz_number} | audio | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | fields | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | language | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | page | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | per_page | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | tafsirs | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | translation_fields | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | translations | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | word_fields | query | yes | yes |
| GET | /verses/by_juz/{juz_number} | words | query | yes | yes |
| GET | /verses/by_key/{verse_key} | verse_key | path | yes | yes |
| GET | /verses/by_key/{verse_key} | audio | query | yes | yes |
| GET | /verses/by_key/{verse_key} | fields | query | yes | yes |
| GET | /verses/by_key/{verse_key} | language | query | yes | yes |
| GET | /verses/by_key/{verse_key} | tafsirs | query | yes | yes |
| GET | /verses/by_key/{verse_key} | translation_fields | query | yes | yes |
| GET | /verses/by_key/{verse_key} | translations | query | yes | yes |
| GET | /verses/by_key/{verse_key} | word_fields | query | yes | yes |
| GET | /verses/by_key/{verse_key} | words | query | yes | yes |
| GET | /verses/by_manzil/{manzil_number} | - | - | yes | yes |
| GET | /verses/by_page/{page_number} | page_number | path | yes | yes |
| GET | /verses/by_page/{page_number} | audio | query | yes | yes |
| GET | /verses/by_page/{page_number} | fields | query | yes | yes |
| GET | /verses/by_page/{page_number} | language | query | yes | yes |
| GET | /verses/by_page/{page_number} | page | query | yes | yes |
| GET | /verses/by_page/{page_number} | per_page | query | yes | yes |
| GET | /verses/by_page/{page_number} | tafsirs | query | yes | yes |
| GET | /verses/by_page/{page_number} | translation_fields | query | yes | yes |
| GET | /verses/by_page/{page_number} | translations | query | yes | yes |
| GET | /verses/by_page/{page_number} | word_fields | query | yes | yes |
| GET | /verses/by_page/{page_number} | words | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | rub_el_hizb_number | path | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | audio | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | fields | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | language | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | tafsirs | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | translation_fields | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | translations | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | word_fields | query | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | words | query | yes | yes |
| GET | /verses/by_rub_el_hizb/{rub_el_hizb_number} | - | - | yes | yes |
| GET | /verses/by_ruku/{ruku_number} | - | - | yes | yes |
| GET | /verses/filter | - | - | yes | yes |
| GET | /verses/random | audio | query | yes | yes |
| GET | /verses/random | fields | query | yes | yes |
| GET | /verses/random | language | query | yes | yes |
| GET | /verses/random | tafsirs | query | yes | yes |
| GET | /verses/random | translation_fields | query | yes | yes |
| GET | /verses/random | translations | query | yes | yes |
| GET | /verses/random | word_fields | query | yes | yes |
| GET | /verses/random | words | query | yes | yes |

# Response Coverage
| Method | Path | Status | Code | Docs |
| --- | --- | --- | --- | --- |
| GET | / | 200 | yes | yes |
| GET | /audio/qaris | 200 | yes | yes |
| GET | /audio/qaris/related/{id} | 200 | yes | yes |
| GET | /audio/qaris/{id} | 200 | yes | yes |
| GET | /audio/qaris/{id}/audio_files/{ext} | 200 | yes | yes |
| GET | /audio/sections | 200 | yes | yes |
| GET | /audio/surahs | 200 | yes | yes |
| GET | /audio/surahs/{id} | 200 | yes | yes |
| GET | /chapter_recitations/{id} | 200 | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 200 | yes | yes |
| GET | /chapters | 200 | yes | yes |
| GET | /chapters/{chapter_id}/info | 200 | yes | yes |
| GET | /chapters/{id} | 200 | yes | yes |
| GET | /foot_notes/{id} | 200 | yes | yes |
| GET | /hizbs | 200 | yes | yes |
| GET | /hizbs/{id} | 200 | yes | yes |
| GET | /juzs | default | yes | yes |
| GET | /juzs/{id} | 200 | yes | yes |
| GET | /manzils | 200 | yes | yes |
| GET | /manzils/{id} | 200 | yes | yes |
| GET | /mushafs | 200 | yes | yes |
| GET | /ping | 200 | yes | yes |
| GET | /quran/recitations/{recitation_id} | 200 | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | 200 | yes | yes |
| GET | /quran/translations/{translation_id} | 200 | yes | yes |
| GET | /quran/verses/{script} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 400 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 401 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 403 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 404 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 422 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 429 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 500 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 502 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 503 | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | 504 | yes | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_rub_el_hizb/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 400 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 401 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 403 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 404 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 422 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 429 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 500 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 502 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 503 | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | 504 | yes | yes |
| GET | /resources/changes | 200 | yes | yes |
| GET | /resources/chapter_infos | 200 | yes | yes |
| GET | /resources/chapter_reciters | 200 | yes | yes |
| GET | /resources/languages | 200 | yes | yes |
| GET | /resources/recitation_styles | 200 | yes | yes |
| GET | /resources/recitations | 200 | yes | yes |
| GET | /resources/recitations/{recitation_id}/info | 200 | yes | yes |
| GET | /resources/tafsirs | 200 | yes | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 200 | yes | yes |
| GET | /resources/translations | 200 | yes | yes |
| GET | /resources/translations/{translation_id}/info | 200 | yes | yes |
| GET | /resources/verse_media | 200 | yes | yes |
| GET | /resources/word_by_word_translations | 200 | yes | yes |
| GET | /rub_el_hizbs | 200 | yes | yes |
| GET | /rub_el_hizbs/{id} | 200 | yes | yes |
| GET | /rukus | 200 | yes | yes |
| GET | /rukus/{id} | 200 | yes | yes |
| GET | /search | default | yes | yes |
| GET | /suggest | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | 504 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | 504 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | 504 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | 504 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | 504 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | 504 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 504 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 200 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 400 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 401 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 403 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 404 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 422 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 429 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 500 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 502 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 503 | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_rub/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | 504 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 200 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 400 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 401 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 403 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 404 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 422 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 429 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 500 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 502 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 503 | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | 504 | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | 200 | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | 200 | yes | yes |
| GET | /verses/by_juz/{juz_number} | 200 | yes | yes |
| GET | /verses/by_key/{verse_key} | 200 | yes | yes |
| GET | /verses/by_manzil/{manzil_number} | 200 | yes | yes |
| GET | /verses/by_page/{page_number} | 200 | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /verses/by_rub_el_hizb/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /verses/by_ruku/{ruku_number} | 200 | yes | yes |
| GET | /verses/filter | 200 | yes | yes |
| GET | /verses/random | 200 | yes | yes |