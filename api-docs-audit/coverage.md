# Endpoint Coverage
| Method | Path | Code | Docs |
| --- | --- | --- | --- |
| GET | / | yes | no |
| GET | /audio/qaris | yes | no |
| GET | /audio/qaris/related/{id} | yes | no |
| GET | /audio/qaris/{id} | yes | no |
| GET | /audio/qaris/{id}/audio_files/{ext} | yes | no |
| GET | /audio/sections | yes | no |
| GET | /audio/surahs | yes | no |
| GET | /audio/surahs/{id} | yes | no |
| GET | /chapter_recitations/{id} | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | yes | yes |
| GET | /chapters | yes | yes |
| GET | /chapters/{chapter_id}/info | yes | yes |
| GET | /chapters/{id} | yes | yes |
| GET | /foot_notes/{id} | yes | no |
| GET | /hizbs | yes | no |
| GET | /hizbs/{id} | yes | no |
| GET | /juzs | yes | yes |
| GET | /juzs/{id} | yes | no |
| GET | /manzils | yes | no |
| GET | /manzils/{id} | yes | no |
| GET | /mushafs | yes | no |
| GET | /ping | yes | no |
| GET | /quran/recitations/{recitation_id} | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | yes | yes |
| GET | /quran/translations/{translation_id} | yes | yes |
| GET | /quran/verses/code_v1 | no | yes |
| GET | /quran/verses/code_v2 | no | yes |
| GET | /quran/verses/imlaei | no | yes |
| GET | /quran/verses/indopak | no | yes |
| GET | /quran/verses/uthmani | no | yes |
| GET | /quran/verses/uthmani_simple | no | yes |
| GET | /quran/verses/uthmani_tajweed | no | yes |
| GET | /quran/verses/{script} | yes | no |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_manzil/{manzil_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | yes | yes |
| GET | /recitations/{recitation_id}/by_rub_el_hizb/{rub_el_hizb_number} | yes | no |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | yes | yes |
| GET | /resources/changes | yes | no |
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
| GET | /resources/word_by_word_translations | yes | no |
| GET | /rub_el_hizbs | yes | no |
| GET | /rub_el_hizbs/{id} | yes | no |
| GET | /rukus | yes | no |
| GET | /rukus/{id} | yes | no |
| GET | /search | yes | yes |
| GET | /suggest | yes | no |
| GET | /tafsirs/{resource_id}/by_ayah/{ayah_key} | yes | yes |
| GET | /tafsirs/{resource_id}/by_chapter/{chapter_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_hizb/{hizb_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_juz/{juz_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_manzil/{manzil_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_page/{page_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_rub/{rub_el_hizb_number} | yes | no |
| GET | /tafsirs/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | yes | yes |
| GET | /tafsirs/{resource_id}/by_ruku/{ruku_number} | yes | yes |
| GET | /translations/{resource_id}/by_ayah/{ayah_key} | yes | yes |
| GET | /translations/{resource_id}/by_chapter/{chapter_number} | yes | yes |
| GET | /translations/{resource_id}/by_hizb/{hizb_number} | yes | yes |
| GET | /translations/{resource_id}/by_juz/{juz_number} | yes | yes |
| GET | /translations/{resource_id}/by_manzil/{manzil_number} | yes | yes |
| GET | /translations/{resource_id}/by_page/{page_number} | yes | yes |
| GET | /translations/{resource_id}/by_rub/{rub_el_hizb_number} | yes | no |
| GET | /translations/{resource_id}/by_rub_el_hizb/{rub_el_hizb_number} | yes | yes |
| GET | /translations/{resource_id}/by_ruku/{ruku_number} | yes | yes |
| GET | /verses/by_chapter/{chapter_number} | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | yes | yes |
| GET | /verses/by_juz/{juz_number} | yes | yes |
| GET | /verses/by_key/{verse_key} | yes | yes |
| GET | /verses/by_manzil/{manzil_number} | yes | no |
| GET | /verses/by_page/{page_number} | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | yes | yes |
| GET | /verses/by_rub_el_hizb/{rub_el_hizb_number} | yes | no |
| GET | /verses/by_ruku/{ruku_number} | yes | no |
| GET | /verses/filter | yes | no |
| GET | /verses/random | yes | yes |

# Parameter Coverage
| Method | Path | Name | In | Code | Docs |
| --- | --- | --- | --- | --- | --- |
| GET | / | - | - | yes | no |
| GET | /audio/qaris | - | - | yes | no |
| GET | /audio/qaris/related/{id} | - | - | yes | no |
| GET | /audio/qaris/{id} | - | - | yes | no |
| GET | /audio/qaris/{id}/audio_files/{ext} | - | - | yes | no |
| GET | /audio/sections | - | - | yes | no |
| GET | /audio/surahs | - | - | yes | no |
| GET | /audio/surahs/{id} | - | - | yes | no |
| GET | /chapter_recitations/{id} | id | path | yes | yes |
| GET | /chapter_recitations/{id} | language | query | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | chapter_number | path | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | id | path | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | segments | query | no | yes |
| GET | /chapters | language | query | yes | yes |
| GET | /chapters/{chapter_id}/info | chapter_id | path | yes | yes |
| GET | /chapters/{chapter_id}/info | language | query | yes | yes |
| GET | /chapters/{id} | id | path | yes | yes |
| GET | /chapters/{id} | language | query | yes | yes |
| GET | /foot_notes/{id} | - | - | yes | no |
| GET | /hizbs | - | - | yes | no |
| GET | /hizbs/{id} | - | - | yes | no |
| GET | /juzs | - | - | yes | yes |
| GET | /juzs/{id} | - | - | yes | no |
| GET | /manzils | - | - | yes | no |
| GET | /manzils/{id} | - | - | yes | no |
| GET | /mushafs | - | - | yes | no |
| GET | /ping | - | - | yes | no |
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
| GET | /quran/translations/{translation_id} | foot_notes | query | no | yes |
| GET | /quran/translations/{translation_id} | hizb_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | juz_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | page_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | rub_el_hizb_number | query | yes | yes |
| GET | /quran/translations/{translation_id} | verse_key | query | yes | yes |
| GET | /quran/verses/code_v1 | chapter_number | query | no | yes |
| GET | /quran/verses/code_v1 | hizb_number | query | no | yes |
| GET | /quran/verses/code_v1 | juz_number | query | no | yes |
| GET | /quran/verses/code_v1 | page_number | query | no | yes |
| GET | /quran/verses/code_v1 | rub_el_hizb_number | query | no | yes |
| GET | /quran/verses/code_v1 | verse_key | query | no | yes |
| GET | /quran/verses/code_v2 | chapter_number | query | no | yes |
| GET | /quran/verses/code_v2 | hizb_number | query | no | yes |
| GET | /quran/verses/code_v2 | juz_number | query | no | yes |
| GET | /quran/verses/code_v2 | page_number | query | no | yes |
| GET | /quran/verses/code_v2 | rub_el_hizb_number | query | no | yes |
| GET | /quran/verses/code_v2 | verse_key | query | no | yes |
| GET | /quran/verses/imlaei | chapter_number | query | no | yes |
| GET | /quran/verses/imlaei | hizb_number | query | no | yes |
| GET | /quran/verses/imlaei | juz_number | query | no | yes |
| GET | /quran/verses/imlaei | page_number | query | no | yes |
| GET | /quran/verses/imlaei | rub_el_hizb_number | query | no | yes |
| GET | /quran/verses/imlaei | verse_key | query | no | yes |
| GET | /quran/verses/indopak | chapter_number | query | no | yes |
| GET | /quran/verses/indopak | hizb_number | query | no | yes |
| GET | /quran/verses/indopak | juz_number | query | no | yes |
| GET | /quran/verses/indopak | page_number | query | no | yes |
| GET | /quran/verses/indopak | rub_el_hizb_number | query | no | yes |
| GET | /quran/verses/indopak | verse_key | query | no | yes |
| GET | /quran/verses/uthmani | chapter_number | query | no | yes |
| GET | /quran/verses/uthmani | hizb_number | query | no | yes |
| GET | /quran/verses/uthmani | juz_number | query | no | yes |
| GET | /quran/verses/uthmani | page_number | query | no | yes |
| GET | /quran/verses/uthmani | rub_el_hizb_number | query | no | yes |
| GET | /quran/verses/uthmani | verse_key | query | no | yes |
| GET | /quran/verses/uthmani_simple | chapter_number | query | no | yes |
| GET | /quran/verses/uthmani_simple | hizb_number | query | no | yes |
| GET | /quran/verses/uthmani_simple | juz_number | query | no | yes |
| GET | /quran/verses/uthmani_simple | page_number | query | no | yes |
| GET | /quran/verses/uthmani_simple | rub_el_hizb_number | query | no | yes |
| GET | /quran/verses/uthmani_simple | verse_key | query | no | yes |
| GET | /quran/verses/uthmani_tajweed | chapter_number | query | no | yes |
| GET | /quran/verses/uthmani_tajweed | hizb_number | query | no | yes |
| GET | /quran/verses/uthmani_tajweed | juz_number | query | no | yes |
| GET | /quran/verses/uthmani_tajweed | page_number | query | no | yes |
| GET | /quran/verses/uthmani_tajweed | rub_el_hizb_number | query | no | yes |
| GET | /quran/verses/uthmani_tajweed | verse_key | query | no | yes |
| GET | /quran/verses/{script} | - | - | yes | no |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | ayah_key | path | yes | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | chapter_number | path | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | page | query | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | per_page | query | no | yes |
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
| GET | /recitations/{recitation_id}/by_rub_el_hizb/{rub_el_hizb_number} | - | - | yes | no |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | recitation_id | path | yes | yes |
| GET | /recitations/{recitation_id}/by_ruku/{ruku_number} | ruku_number | path | yes | yes |
| GET | /resources/changes | - | - | yes | no |
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
| GET | /resources/word_by_word_translations | - | - | yes | no |
| GET | /rub_el_hizbs | - | - | yes | no |
| GET | /rub_el_hizbs/{id} | - | - | yes | no |
| GET | /rukus | - | - | yes | no |
| GET | /rukus/{id} | - | - | yes | no |
| GET | /search | language | query | yes | yes |
| GET | /search | page | query | yes | yes |
| GET | /search | q | query | yes | yes |
| GET | /search | size | query | yes | yes |
| GET | /search | translations | query | no | yes |
| GET | /suggest | - | - | yes | no |
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
| GET | /tafsirs/{resource_id}/by_rub/{rub_el_hizb_number} | - | - | yes | no |
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
| GET | /translations/{resource_id}/by_rub/{rub_el_hizb_number} | - | - | yes | no |
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
| GET | /verses/by_manzil/{manzil_number} | - | - | yes | no |
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
| GET | /verses/by_rub_el_hizb/{rub_el_hizb_number} | - | - | yes | no |
| GET | /verses/by_ruku/{ruku_number} | - | - | yes | no |
| GET | /verses/filter | - | - | yes | no |
| GET | /verses/random | audio | query | yes | yes |
| GET | /verses/random | chapter_number | query | no | yes |
| GET | /verses/random | fields | query | yes | yes |
| GET | /verses/random | hizb_number | query | no | yes |
| GET | /verses/random | juz_number | query | no | yes |
| GET | /verses/random | language | query | yes | yes |
| GET | /verses/random | manzil_number | query | no | yes |
| GET | /verses/random | page_number | query | no | yes |
| GET | /verses/random | rub_el_hizb_number | query | no | yes |
| GET | /verses/random | ruku_number | query | no | yes |
| GET | /verses/random | tafsirs | query | yes | yes |
| GET | /verses/random | translation_fields | query | yes | yes |
| GET | /verses/random | translations | query | yes | yes |
| GET | /verses/random | word_fields | query | yes | yes |
| GET | /verses/random | words | query | yes | yes |

# Response Coverage
| Method | Path | Status | Code | Docs |
| --- | --- | --- | --- | --- |
| GET | / | 200 | yes | no |
| GET | /audio/qaris | 200 | yes | no |
| GET | /audio/qaris/related/{id} | 200 | yes | no |
| GET | /audio/qaris/{id} | 200 | yes | no |
| GET | /audio/qaris/{id}/audio_files/{ext} | 200 | yes | no |
| GET | /audio/sections | 200 | yes | no |
| GET | /audio/surahs | 200 | yes | no |
| GET | /audio/surahs/{id} | 200 | yes | no |
| GET | /chapter_recitations/{id} | 200 | yes | yes |
| GET | /chapter_recitations/{id} | 400 | no | yes |
| GET | /chapter_recitations/{id} | 401 | no | yes |
| GET | /chapter_recitations/{id} | 403 | no | yes |
| GET | /chapter_recitations/{id} | 404 | no | yes |
| GET | /chapter_recitations/{id} | 422 | no | yes |
| GET | /chapter_recitations/{id} | 429 | no | yes |
| GET | /chapter_recitations/{id} | 500 | no | yes |
| GET | /chapter_recitations/{id} | 502 | no | yes |
| GET | /chapter_recitations/{id} | 503 | no | yes |
| GET | /chapter_recitations/{id} | 504 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 200 | yes | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 400 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 401 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 403 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 404 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 422 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 429 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 500 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 502 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 503 | no | yes |
| GET | /chapter_recitations/{id}/{chapter_number} | 504 | no | yes |
| GET | /chapters | 200 | yes | yes |
| GET | /chapters | 400 | no | yes |
| GET | /chapters | 401 | no | yes |
| GET | /chapters | 403 | no | yes |
| GET | /chapters | 404 | no | yes |
| GET | /chapters | 422 | no | yes |
| GET | /chapters | 429 | no | yes |
| GET | /chapters | 500 | no | yes |
| GET | /chapters | 502 | no | yes |
| GET | /chapters | 503 | no | yes |
| GET | /chapters | 504 | no | yes |
| GET | /chapters/{chapter_id}/info | 200 | yes | yes |
| GET | /chapters/{chapter_id}/info | 400 | no | yes |
| GET | /chapters/{chapter_id}/info | 401 | no | yes |
| GET | /chapters/{chapter_id}/info | 403 | no | yes |
| GET | /chapters/{chapter_id}/info | 404 | no | yes |
| GET | /chapters/{chapter_id}/info | 422 | no | yes |
| GET | /chapters/{chapter_id}/info | 429 | no | yes |
| GET | /chapters/{chapter_id}/info | 500 | no | yes |
| GET | /chapters/{chapter_id}/info | 502 | no | yes |
| GET | /chapters/{chapter_id}/info | 503 | no | yes |
| GET | /chapters/{chapter_id}/info | 504 | no | yes |
| GET | /chapters/{id} | 200 | yes | yes |
| GET | /chapters/{id} | 400 | no | yes |
| GET | /chapters/{id} | 401 | no | yes |
| GET | /chapters/{id} | 403 | no | yes |
| GET | /chapters/{id} | 404 | no | yes |
| GET | /chapters/{id} | 422 | no | yes |
| GET | /chapters/{id} | 429 | no | yes |
| GET | /chapters/{id} | 500 | no | yes |
| GET | /chapters/{id} | 502 | no | yes |
| GET | /chapters/{id} | 503 | no | yes |
| GET | /chapters/{id} | 504 | no | yes |
| GET | /foot_notes/{id} | 200 | yes | no |
| GET | /hizbs | 200 | yes | no |
| GET | /hizbs/{id} | 200 | yes | no |
| GET | /juzs | default | yes | yes |
| GET | /juzs/{id} | 200 | yes | no |
| GET | /manzils | 200 | yes | no |
| GET | /manzils/{id} | 200 | yes | no |
| GET | /mushafs | 200 | yes | no |
| GET | /ping | 200 | yes | no |
| GET | /quran/recitations/{recitation_id} | 200 | yes | yes |
| GET | /quran/recitations/{recitation_id} | 400 | no | yes |
| GET | /quran/recitations/{recitation_id} | 401 | no | yes |
| GET | /quran/recitations/{recitation_id} | 403 | no | yes |
| GET | /quran/recitations/{recitation_id} | 404 | no | yes |
| GET | /quran/recitations/{recitation_id} | 422 | no | yes |
| GET | /quran/recitations/{recitation_id} | 429 | no | yes |
| GET | /quran/recitations/{recitation_id} | 500 | no | yes |
| GET | /quran/recitations/{recitation_id} | 502 | no | yes |
| GET | /quran/recitations/{recitation_id} | 503 | no | yes |
| GET | /quran/recitations/{recitation_id} | 504 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 200 | yes | yes |
| GET | /quran/tafsirs/{tafsir_id} | 400 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 401 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 403 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 404 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 422 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 429 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 500 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 502 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 503 | no | yes |
| GET | /quran/tafsirs/{tafsir_id} | 504 | no | yes |
| GET | /quran/translations/{translation_id} | 200 | yes | yes |
| GET | /quran/translations/{translation_id} | 400 | no | yes |
| GET | /quran/translations/{translation_id} | 401 | no | yes |
| GET | /quran/translations/{translation_id} | 403 | no | yes |
| GET | /quran/translations/{translation_id} | 404 | no | yes |
| GET | /quran/translations/{translation_id} | 422 | no | yes |
| GET | /quran/translations/{translation_id} | 429 | no | yes |
| GET | /quran/translations/{translation_id} | 500 | no | yes |
| GET | /quran/translations/{translation_id} | 502 | no | yes |
| GET | /quran/translations/{translation_id} | 503 | no | yes |
| GET | /quran/translations/{translation_id} | 504 | no | yes |
| GET | /quran/verses/code_v1 | 200 | no | yes |
| GET | /quran/verses/code_v1 | 400 | no | yes |
| GET | /quran/verses/code_v1 | 401 | no | yes |
| GET | /quran/verses/code_v1 | 403 | no | yes |
| GET | /quran/verses/code_v1 | 404 | no | yes |
| GET | /quran/verses/code_v1 | 422 | no | yes |
| GET | /quran/verses/code_v1 | 429 | no | yes |
| GET | /quran/verses/code_v1 | 500 | no | yes |
| GET | /quran/verses/code_v1 | 502 | no | yes |
| GET | /quran/verses/code_v1 | 503 | no | yes |
| GET | /quran/verses/code_v1 | 504 | no | yes |
| GET | /quran/verses/code_v2 | 200 | no | yes |
| GET | /quran/verses/code_v2 | 400 | no | yes |
| GET | /quran/verses/code_v2 | 401 | no | yes |
| GET | /quran/verses/code_v2 | 403 | no | yes |
| GET | /quran/verses/code_v2 | 404 | no | yes |
| GET | /quran/verses/code_v2 | 422 | no | yes |
| GET | /quran/verses/code_v2 | 429 | no | yes |
| GET | /quran/verses/code_v2 | 500 | no | yes |
| GET | /quran/verses/code_v2 | 502 | no | yes |
| GET | /quran/verses/code_v2 | 503 | no | yes |
| GET | /quran/verses/code_v2 | 504 | no | yes |
| GET | /quran/verses/imlaei | 200 | no | yes |
| GET | /quran/verses/imlaei | 400 | no | yes |
| GET | /quran/verses/imlaei | 401 | no | yes |
| GET | /quran/verses/imlaei | 403 | no | yes |
| GET | /quran/verses/imlaei | 404 | no | yes |
| GET | /quran/verses/imlaei | 422 | no | yes |
| GET | /quran/verses/imlaei | 429 | no | yes |
| GET | /quran/verses/imlaei | 500 | no | yes |
| GET | /quran/verses/imlaei | 502 | no | yes |
| GET | /quran/verses/imlaei | 503 | no | yes |
| GET | /quran/verses/imlaei | 504 | no | yes |
| GET | /quran/verses/indopak | 200 | no | yes |
| GET | /quran/verses/indopak | 400 | no | yes |
| GET | /quran/verses/indopak | 401 | no | yes |
| GET | /quran/verses/indopak | 403 | no | yes |
| GET | /quran/verses/indopak | 404 | no | yes |
| GET | /quran/verses/indopak | 422 | no | yes |
| GET | /quran/verses/indopak | 429 | no | yes |
| GET | /quran/verses/indopak | 500 | no | yes |
| GET | /quran/verses/indopak | 502 | no | yes |
| GET | /quran/verses/indopak | 503 | no | yes |
| GET | /quran/verses/indopak | 504 | no | yes |
| GET | /quran/verses/uthmani | 200 | no | yes |
| GET | /quran/verses/uthmani | 400 | no | yes |
| GET | /quran/verses/uthmani | 401 | no | yes |
| GET | /quran/verses/uthmani | 403 | no | yes |
| GET | /quran/verses/uthmani | 404 | no | yes |
| GET | /quran/verses/uthmani | 422 | no | yes |
| GET | /quran/verses/uthmani | 429 | no | yes |
| GET | /quran/verses/uthmani | 500 | no | yes |
| GET | /quran/verses/uthmani | 502 | no | yes |
| GET | /quran/verses/uthmani | 503 | no | yes |
| GET | /quran/verses/uthmani | 504 | no | yes |
| GET | /quran/verses/uthmani_simple | 200 | no | yes |
| GET | /quran/verses/uthmani_simple | 400 | no | yes |
| GET | /quran/verses/uthmani_simple | 401 | no | yes |
| GET | /quran/verses/uthmani_simple | 403 | no | yes |
| GET | /quran/verses/uthmani_simple | 404 | no | yes |
| GET | /quran/verses/uthmani_simple | 422 | no | yes |
| GET | /quran/verses/uthmani_simple | 429 | no | yes |
| GET | /quran/verses/uthmani_simple | 500 | no | yes |
| GET | /quran/verses/uthmani_simple | 502 | no | yes |
| GET | /quran/verses/uthmani_simple | 503 | no | yes |
| GET | /quran/verses/uthmani_simple | 504 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 200 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 400 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 401 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 403 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 404 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 422 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 429 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 500 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 502 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 503 | no | yes |
| GET | /quran/verses/uthmani_tajweed | 504 | no | yes |
| GET | /quran/verses/{script} | 200 | yes | no |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 400 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 401 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 403 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 404 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 422 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 429 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 500 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 502 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 503 | no | yes |
| GET | /recitations/{recitation_id}/by_ayah/{ayah_key} | 504 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 400 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 401 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 403 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 404 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 422 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 429 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 500 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 502 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 503 | no | yes |
| GET | /recitations/{recitation_id}/by_chapter/{chapter_number} | 504 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 400 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 401 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 403 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 404 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 422 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 429 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 500 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 502 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 503 | no | yes |
| GET | /recitations/{recitation_id}/by_hizb/{hizb_number} | 504 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 400 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 401 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 403 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 404 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 422 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 429 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 500 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 502 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 503 | no | yes |
| GET | /recitations/{recitation_id}/by_juz/{juz_number} | 504 | no | yes |
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
| GET | /recitations/{recitation_id}/by_page/{page_number} | 400 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 401 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 403 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 404 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 422 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 429 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 500 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 502 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 503 | no | yes |
| GET | /recitations/{recitation_id}/by_page/{page_number} | 504 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 400 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 401 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 403 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 404 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 422 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 429 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 500 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 502 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 503 | no | yes |
| GET | /recitations/{recitation_id}/by_rub/{rub_el_hizb_number} | 504 | no | yes |
| GET | /recitations/{recitation_id}/by_rub_el_hizb/{rub_el_hizb_number} | 200 | yes | no |
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
| GET | /resources/changes | 200 | yes | no |
| GET | /resources/chapter_infos | 200 | yes | yes |
| GET | /resources/chapter_infos | 400 | no | yes |
| GET | /resources/chapter_infos | 401 | no | yes |
| GET | /resources/chapter_infos | 403 | no | yes |
| GET | /resources/chapter_infos | 404 | no | yes |
| GET | /resources/chapter_infos | 422 | no | yes |
| GET | /resources/chapter_infos | 429 | no | yes |
| GET | /resources/chapter_infos | 500 | no | yes |
| GET | /resources/chapter_infos | 502 | no | yes |
| GET | /resources/chapter_infos | 503 | no | yes |
| GET | /resources/chapter_infos | 504 | no | yes |
| GET | /resources/chapter_reciters | 200 | yes | yes |
| GET | /resources/chapter_reciters | 400 | no | yes |
| GET | /resources/chapter_reciters | 401 | no | yes |
| GET | /resources/chapter_reciters | 403 | no | yes |
| GET | /resources/chapter_reciters | 404 | no | yes |
| GET | /resources/chapter_reciters | 422 | no | yes |
| GET | /resources/chapter_reciters | 429 | no | yes |
| GET | /resources/chapter_reciters | 500 | no | yes |
| GET | /resources/chapter_reciters | 502 | no | yes |
| GET | /resources/chapter_reciters | 503 | no | yes |
| GET | /resources/chapter_reciters | 504 | no | yes |
| GET | /resources/languages | 200 | yes | yes |
| GET | /resources/languages | 400 | no | yes |
| GET | /resources/languages | 401 | no | yes |
| GET | /resources/languages | 403 | no | yes |
| GET | /resources/languages | 404 | no | yes |
| GET | /resources/languages | 422 | no | yes |
| GET | /resources/languages | 429 | no | yes |
| GET | /resources/languages | 500 | no | yes |
| GET | /resources/languages | 502 | no | yes |
| GET | /resources/languages | 503 | no | yes |
| GET | /resources/languages | 504 | no | yes |
| GET | /resources/recitation_styles | 200 | yes | yes |
| GET | /resources/recitation_styles | 400 | no | yes |
| GET | /resources/recitation_styles | 401 | no | yes |
| GET | /resources/recitation_styles | 403 | no | yes |
| GET | /resources/recitation_styles | 404 | no | yes |
| GET | /resources/recitation_styles | 422 | no | yes |
| GET | /resources/recitation_styles | 429 | no | yes |
| GET | /resources/recitation_styles | 500 | no | yes |
| GET | /resources/recitation_styles | 502 | no | yes |
| GET | /resources/recitation_styles | 503 | no | yes |
| GET | /resources/recitation_styles | 504 | no | yes |
| GET | /resources/recitations | 200 | yes | yes |
| GET | /resources/recitations | 400 | no | yes |
| GET | /resources/recitations | 401 | no | yes |
| GET | /resources/recitations | 403 | no | yes |
| GET | /resources/recitations | 404 | no | yes |
| GET | /resources/recitations | 422 | no | yes |
| GET | /resources/recitations | 429 | no | yes |
| GET | /resources/recitations | 500 | no | yes |
| GET | /resources/recitations | 502 | no | yes |
| GET | /resources/recitations | 503 | no | yes |
| GET | /resources/recitations | 504 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 200 | yes | yes |
| GET | /resources/recitations/{recitation_id}/info | 400 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 401 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 403 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 404 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 422 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 429 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 500 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 502 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 503 | no | yes |
| GET | /resources/recitations/{recitation_id}/info | 504 | no | yes |
| GET | /resources/tafsirs | 200 | yes | yes |
| GET | /resources/tafsirs | 400 | no | yes |
| GET | /resources/tafsirs | 401 | no | yes |
| GET | /resources/tafsirs | 403 | no | yes |
| GET | /resources/tafsirs | 404 | no | yes |
| GET | /resources/tafsirs | 422 | no | yes |
| GET | /resources/tafsirs | 429 | no | yes |
| GET | /resources/tafsirs | 500 | no | yes |
| GET | /resources/tafsirs | 502 | no | yes |
| GET | /resources/tafsirs | 503 | no | yes |
| GET | /resources/tafsirs | 504 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 200 | yes | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 400 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 401 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 403 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 404 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 422 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 429 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 500 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 502 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 503 | no | yes |
| GET | /resources/tafsirs/{tafsir_id}/info | 504 | no | yes |
| GET | /resources/translations | 200 | yes | yes |
| GET | /resources/translations | 400 | no | yes |
| GET | /resources/translations | 401 | no | yes |
| GET | /resources/translations | 403 | no | yes |
| GET | /resources/translations | 404 | no | yes |
| GET | /resources/translations | 422 | no | yes |
| GET | /resources/translations | 429 | no | yes |
| GET | /resources/translations | 500 | no | yes |
| GET | /resources/translations | 502 | no | yes |
| GET | /resources/translations | 503 | no | yes |
| GET | /resources/translations | 504 | no | yes |
| GET | /resources/translations/{translation_id}/info | 200 | yes | yes |
| GET | /resources/translations/{translation_id}/info | 400 | no | yes |
| GET | /resources/translations/{translation_id}/info | 401 | no | yes |
| GET | /resources/translations/{translation_id}/info | 403 | no | yes |
| GET | /resources/translations/{translation_id}/info | 404 | no | yes |
| GET | /resources/translations/{translation_id}/info | 422 | no | yes |
| GET | /resources/translations/{translation_id}/info | 429 | no | yes |
| GET | /resources/translations/{translation_id}/info | 500 | no | yes |
| GET | /resources/translations/{translation_id}/info | 502 | no | yes |
| GET | /resources/translations/{translation_id}/info | 503 | no | yes |
| GET | /resources/translations/{translation_id}/info | 504 | no | yes |
| GET | /resources/verse_media | 200 | yes | yes |
| GET | /resources/verse_media | 400 | no | yes |
| GET | /resources/verse_media | 401 | no | yes |
| GET | /resources/verse_media | 403 | no | yes |
| GET | /resources/verse_media | 404 | no | yes |
| GET | /resources/verse_media | 422 | no | yes |
| GET | /resources/verse_media | 429 | no | yes |
| GET | /resources/verse_media | 500 | no | yes |
| GET | /resources/verse_media | 502 | no | yes |
| GET | /resources/verse_media | 503 | no | yes |
| GET | /resources/verse_media | 504 | no | yes |
| GET | /resources/word_by_word_translations | 200 | yes | no |
| GET | /rub_el_hizbs | 200 | yes | no |
| GET | /rub_el_hizbs/{id} | 200 | yes | no |
| GET | /rukus | 200 | yes | no |
| GET | /rukus/{id} | 200 | yes | no |
| GET | /search | 200 | no | yes |
| GET | /search | 400 | no | yes |
| GET | /search | 401 | no | yes |
| GET | /search | 403 | no | yes |
| GET | /search | 404 | no | yes |
| GET | /search | 422 | no | yes |
| GET | /search | 429 | no | yes |
| GET | /search | 500 | no | yes |
| GET | /search | 502 | no | yes |
| GET | /search | 503 | no | yes |
| GET | /search | 504 | no | yes |
| GET | /search | default | yes | no |
| GET | /suggest | 200 | yes | no |
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
| GET | /tafsirs/{resource_id}/by_rub/{rub_el_hizb_number} | 200 | yes | no |
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
| GET | /translations/{resource_id}/by_rub/{rub_el_hizb_number} | 200 | yes | no |
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
| GET | /verses/by_chapter/{chapter_number} | 400 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 401 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 403 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 404 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 422 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 429 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 500 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 502 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 503 | no | yes |
| GET | /verses/by_chapter/{chapter_number} | 504 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 200 | yes | yes |
| GET | /verses/by_hizb/{hizb_number} | 400 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 401 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 403 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 404 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 422 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 429 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 500 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 502 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 503 | no | yes |
| GET | /verses/by_hizb/{hizb_number} | 504 | no | yes |
| GET | /verses/by_juz/{juz_number} | 200 | yes | yes |
| GET | /verses/by_juz/{juz_number} | 400 | no | yes |
| GET | /verses/by_juz/{juz_number} | 401 | no | yes |
| GET | /verses/by_juz/{juz_number} | 403 | no | yes |
| GET | /verses/by_juz/{juz_number} | 404 | no | yes |
| GET | /verses/by_juz/{juz_number} | 422 | no | yes |
| GET | /verses/by_juz/{juz_number} | 429 | no | yes |
| GET | /verses/by_juz/{juz_number} | 500 | no | yes |
| GET | /verses/by_juz/{juz_number} | 502 | no | yes |
| GET | /verses/by_juz/{juz_number} | 503 | no | yes |
| GET | /verses/by_juz/{juz_number} | 504 | no | yes |
| GET | /verses/by_key/{verse_key} | 200 | yes | yes |
| GET | /verses/by_key/{verse_key} | 400 | no | yes |
| GET | /verses/by_key/{verse_key} | 401 | no | yes |
| GET | /verses/by_key/{verse_key} | 403 | no | yes |
| GET | /verses/by_key/{verse_key} | 404 | no | yes |
| GET | /verses/by_key/{verse_key} | 422 | no | yes |
| GET | /verses/by_key/{verse_key} | 429 | no | yes |
| GET | /verses/by_key/{verse_key} | 500 | no | yes |
| GET | /verses/by_key/{verse_key} | 502 | no | yes |
| GET | /verses/by_key/{verse_key} | 503 | no | yes |
| GET | /verses/by_key/{verse_key} | 504 | no | yes |
| GET | /verses/by_manzil/{manzil_number} | 200 | yes | no |
| GET | /verses/by_page/{page_number} | 200 | yes | yes |
| GET | /verses/by_page/{page_number} | 400 | no | yes |
| GET | /verses/by_page/{page_number} | 401 | no | yes |
| GET | /verses/by_page/{page_number} | 403 | no | yes |
| GET | /verses/by_page/{page_number} | 404 | no | yes |
| GET | /verses/by_page/{page_number} | 422 | no | yes |
| GET | /verses/by_page/{page_number} | 429 | no | yes |
| GET | /verses/by_page/{page_number} | 500 | no | yes |
| GET | /verses/by_page/{page_number} | 502 | no | yes |
| GET | /verses/by_page/{page_number} | 503 | no | yes |
| GET | /verses/by_page/{page_number} | 504 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 200 | yes | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 400 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 401 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 403 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 404 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 422 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 429 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 500 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 502 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 503 | no | yes |
| GET | /verses/by_rub/{rub_el_hizb_number} | 504 | no | yes |
| GET | /verses/by_rub_el_hizb/{rub_el_hizb_number} | 200 | yes | no |
| GET | /verses/by_ruku/{ruku_number} | 200 | yes | no |
| GET | /verses/filter | 200 | yes | no |
| GET | /verses/random | 200 | yes | yes |
| GET | /verses/random | 400 | no | yes |
| GET | /verses/random | 401 | no | yes |
| GET | /verses/random | 403 | no | yes |
| GET | /verses/random | 404 | no | yes |
| GET | /verses/random | 422 | no | yes |
| GET | /verses/random | 429 | no | yes |
| GET | /verses/random | 500 | no | yes |
| GET | /verses/random | 502 | no | yes |
| GET | /verses/random | 503 | no | yes |
| GET | /verses/random | 504 | no | yes |