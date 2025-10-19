#!/usr/bin/env python3
"""
Utility to align openAPI/content/v4.json with the current API routes/spec.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

import yaml

DOC_SPEC_PATH = Path("openAPI/content/v4.json")
GENERATED_SPEC_PATH = Path("api-docs-audit/openapi.generated.yaml")
STOPLIGHT_SPEC_PATH = Path("../quran.com-api/stoplight.yaml")

TOKEN_REPLACEMENTS: Dict[str, str] = {
    "#endpoint:ZQvDmxKn7fQwLrAfy": "See `GET /audio/qaris` for the reciter list.",
    "#endpoint:HLbauN2sdGitPQPPL": "See `GET /resources/recitations` for the full list of recitations.",
    "#endpoint:8rjMCZEyPEZMHAKz9": "[/resources/languages](/docs/content_apis_versioned/languages)",
    "#endpoint:EZsWyDnekGaDKaCpt": "[/resources/languages](/docs/content_apis_versioned/languages)",
    "#endpoint:N4JAF8phDshhyrBHs": "[/resources/translations](/docs/content_apis_versioned/translations)",
    "#endpoint:5YnxJJGPMCLnM6PNE": "[/resources/tafsirs](/docs/content_apis_versioned/tafsirs)",
}

INLINE_LINKS: Dict[str, str] = {
    "`GET /audio/qaris`": "[GET /audio/qaris](/docs/content_apis_versioned/list-reciters)",
    "`GET /resources/recitations`": "[GET /resources/recitations](/docs/content_apis_versioned/recitations)",
    "`GET /resources/languages`": "[GET /resources/languages](/docs/content_apis_versioned/languages)",
    "`GET /resources/translations`": "[GET /resources/translations](/docs/content_apis_versioned/translations)",
    "`GET /resources/tafsirs`": "[GET /resources/tafsirs](/docs/content_apis_versioned/tafsirs)",
}

AUDIO_RECITER_EXAMPLE = {
    "id": 7,
    "name": "AbdulBaset AbdulSamad",
    "arabic_name": "عبد الباسط عبد الصمد",
    "format": "mp3",
    "section_id": 1,
    "description": "Classic Mujawwad recitation.",
    "home": True,
}

RELATED_RECITER_EXAMPLE = {
    "id": 18,
    "name": "Mishari Rashid Alafasy",
    "arabic_name": "مشاري راشد العفاسي",
    "format": "mp3",
    "section_id": 1,
    "description": "Murattal style recitation.",
    "home": False,
}

AUDIO_FILE_EXAMPLE = {
    "qari_id": 7,
    "surah_id": 1,
    "file_name": "001001.mp3",
    "filenum": 1,
    "extension": "mp3",
    "stream_count": 245,
    "download_count": 102,
    "metadata": {},
    "format": {
        "size": 19779712,
        "duration": 420000,
        "bit_rate": 128,
    },
}

AUDIO_SECTION_EXAMPLE = {
    "id": 5,
    "name": "Daily Favorites",
}

AUDIO_CHAPTER_EXAMPLE = {
    "id": 1,
    "page": [1, 2],
    "bismillah_pre": True,
    "ayat": 7,
    "name": {
        "complex": "Al-Fātiḥah",
        "simple": "Al-Fatihah",
        "english": "The Opening",
        "arabic": "الفاتحة",
    },
    "revelation": {
        "place": "makkah",
        "order": 5,
    },
}

HIZB_EXAMPLE = {
    "id": 1,
    "hizb_number": 1,
    "verse_mapping": ["1:1-1:7", "2:1-2:74"],
    "first_verse_id": 1,
    "last_verse_id": 148,
    "verses_count": 148,
}

MANZIL_EXAMPLE = {
    "id": 1,
    "manzil_number": 1,
    "verse_mapping": ["1:1-4:147"],
    "first_verse_id": 1,
    "last_verse_id": 590,
    "verses_count": 590,
}

RUB_EXAMPLE = {
    "id": 1,
    "rub_el_hizb_number": 1,
    "verse_mapping": ["1:1-2:25"],
    "first_verse_id": 1,
    "last_verse_id": 145,
    "verses_count": 145,
}

RUKU_EXAMPLE = {
    "id": 1,
    "ruku_number": 1,
    "surah_ruku_number": 1,
    "verse_mapping": ["2:1-2:5"],
    "first_verse_id": 8,
    "last_verse_id": 12,
    "verses_count": 5,
}

MUSHAF_EXAMPLE = {
    "id": 1,
    "name": "Madani Mushaf",
    "pages_count": 604,
    "lines_per_page": 15,
    "mushaf_type": "madani",
    "font": "uthmani",
    "qirat": {
        "id": 1,
        "name": "Hafs 'an Asim",
    },
}

FOOT_NOTE_EXAMPLE = {
    "foot_note": {
        "id": 42,
        "text": "Additional commentary on this verse.",
        "language_name": "english",
    }
}

WORD_BY_WORD_TRANSLATION_EXAMPLE = {
    "word_by_word_translations": [
        {
            "id": 203,
            "name": "Word by Word - English",
            "author_name": "Quran Foundation",
            "slug": "word-by-word-english",
            "language_name": "english",
            "iso_code": "en",
            "translated_name": {"name": "Word by Word", "language_name": "english"},
        }
    ]
}


def load_doc_spec() -> Dict:
    return json.loads(DOC_SPEC_PATH.read_text(encoding="utf-8-sig"))


def load_generated_spec() -> Dict:
    return yaml.safe_load(GENERATED_SPEC_PATH.read_text(encoding="utf-8"))


def load_stoplight_spec() -> Dict:
    return yaml.safe_load(STOPLIGHT_SPEC_PATH.read_text(encoding="utf-8"))


def path_signature(path: str) -> str:
    stripped = path.strip("/")
    if not stripped:
        return "/"
    segments = []
    for segment in stripped.split("/"):
        if segment.startswith("{") and segment.endswith("}"):
            segments.append("{}")
        else:
            segments.append(segment)
    return "/" + "/".join(segments)


def ensure_script_enum(operation: Dict) -> None:
    params: List[Dict] = operation.setdefault("parameters", [])
    choices = [
        "code_v1",
        "code_v2",
        "imlaei",
        "indopak",
        "uthmani",
        "uthmani_simple",
        "uthmani_tajweed",
    ]
    description = (
        "Script identifier for the glyph collection to fetch. "
        "Supported values: code_v1, code_v2, imlaei, indopak, uthmani, "
        "uthmani_simple, uthmani_tajweed."
    )
    for param in params:
        if param.get("name") == "script" and param.get("in") == "path":
            schema = param.setdefault("schema", {})
            schema["type"] = "string"
            schema["enum"] = choices
            param["required"] = True
            param["description"] = description
            return
    params.append(
        {
            "name": "script",
            "in": "path",
            "required": True,
            "schema": {"type": "string", "enum": choices},
            "description": description,
        }
    )


def merge_operation(
    doc_operation: Dict,
    generated_operation: Dict,
) -> None:
    preserved = {
        "summary": doc_operation.get("summary"),
        "description": doc_operation.get("description"),
        "tags": doc_operation.get("tags"),
        "security": doc_operation.get("security"),
    }
    doc_operation["parameters"] = copy.deepcopy(generated_operation.get("parameters", []))
    if generated_operation.get("requestBody"):
        doc_operation["requestBody"] = copy.deepcopy(generated_operation["requestBody"])
    else:
        doc_operation.pop("requestBody", None)
    responses = {}
    for status, response in (generated_operation.get("responses", {}) or {}).items():
        responses[str(status)] = copy.deepcopy(response)
    doc_operation["responses"] = responses
    for key, value in preserved.items():
        if value:
            doc_operation[key] = value
        elif generated_operation.get(key):
            doc_operation[key] = copy.deepcopy(generated_operation[key])


def ensure_schema(schemas: Dict[str, Any], name: str, definition: Dict[str, Any]) -> None:
    if name not in schemas:
        schemas[name] = definition


def ensure_audio_components(spec: Dict[str, Any]) -> None:
    schemas = spec.setdefault("components", {}).setdefault("schemas", {})
    ensure_schema(
        schemas,
        "AudioReciter",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "arabic_name": {"type": "string"},
                "format": {"type": "string"},
                "section_id": {"type": "integer"},
                "description": {"type": ["string", "null"]},
                "home": {"type": "boolean"},
            },
            "required": ["id", "name", "format"],
        },
    )
    ensure_schema(
        schemas,
        "AudioReciterAudioFile",
        {
            "type": "object",
            "properties": {
                "qari_id": {"type": "integer"},
                "surah_id": {"type": "integer"},
                "file_name": {"type": "string"},
                "filenum": {"type": "integer"},
                "extension": {"type": "string"},
                "stream_count": {"type": "integer"},
                "download_count": {"type": "integer"},
                "metadata": {"type": ["object", "null"]},
                "format": {
                    "type": "object",
                    "properties": {
                        "size": {"type": ["integer", "null"]},
                        "duration": {"type": ["integer", "null"]},
                        "bit_rate": {"type": ["integer", "null"]},
                    },
                },
            },
            "required": ["qari_id", "surah_id", "file_name", "extension"],
        },
    )
    ensure_schema(
        schemas,
        "AudioSection",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
            },
            "required": ["id", "name"],
        },
    )
    ensure_schema(
        schemas,
        "AudioChapterName",
        {
            "type": "object",
            "properties": {
                "complex": {"type": "string"},
                "simple": {"type": "string"},
                "english": {"type": "string"},
                "arabic": {"type": "string"},
            },
        },
    )
    ensure_schema(
        schemas,
        "AudioChapterRevelation",
        {
            "type": "object",
            "properties": {
                "place": {"type": "string"},
                "order": {"type": "integer"},
            },
        },
    )
    ensure_schema(
        schemas,
        "AudioChapter",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "page": {
                    "type": "array",
                   "items": {"type": "integer"},
                },
                "bismillah_pre": {"type": "boolean"},
                "ayat": {"type": "integer"},
                "name": {"$ref": "#/components/schemas/AudioChapterName"},
                "revelation": {"$ref": "#/components/schemas/AudioChapterRevelation"},
            },
            "required": ["id", "page", "ayat", "name", "revelation"],
        },
    )


def ensure_metadata_components(spec: Dict[str, Any]) -> None:
    schemas = spec.setdefault("components", {}).setdefault("schemas", {})
    ensure_schema(
        schemas,
        "Hizb",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "hizb_number": {"type": "integer"},
                "verse_mapping": {"type": "array", "items": {"type": "string"}},
                "first_verse_id": {"type": "integer"},
                "last_verse_id": {"type": "integer"},
                "verses_count": {"type": "integer"},
            },
            "required": ["id", "hizb_number"],
        },
    )
    ensure_schema(
        schemas,
        "Manzil",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "manzil_number": {"type": "integer"},
                "verse_mapping": {"type": "array", "items": {"type": "string"}},
                "first_verse_id": {"type": "integer"},
                "last_verse_id": {"type": "integer"},
                "verses_count": {"type": "integer"},
            },
            "required": ["id", "manzil_number"],
        },
    )
    ensure_schema(
        schemas,
        "RubElHizb",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "rub_el_hizb_number": {"type": "integer"},
                "verse_mapping": {"type": "array", "items": {"type": "string"}},
                "first_verse_id": {"type": "integer"},
                "last_verse_id": {"type": "integer"},
                "verses_count": {"type": "integer"},
            },
            "required": ["id", "rub_el_hizb_number"],
        },
    )
    ensure_schema(
        schemas,
        "Ruku",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "ruku_number": {"type": "integer"},
                "surah_ruku_number": {"type": "integer"},
                "verse_mapping": {"type": "array", "items": {"type": "string"}},
                "first_verse_id": {"type": "integer"},
                "last_verse_id": {"type": "integer"},
                "verses_count": {"type": "integer"},
            },
            "required": ["id", "ruku_number"],
        },
    )
    ensure_schema(
        schemas,
        "Mushaf",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "pages_count": {"type": "integer"},
                "lines_per_page": {"type": "integer"},
                "mushaf_type": {"type": "string"},
                "font": {"type": ["string", "null"]},
                "qirat": {
                    "type": ["object", "null"],
                    "properties": {
                        "id": {"type": "integer"},
                        "name": {"type": "string"},
                    },
                },
            },
            "required": ["id", "name"],
        },
    )
    ensure_schema(
        schemas,
        "FootNote",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "text": {"type": "string"},
                "language_name": {"type": "string"},
            },
            "required": ["id", "text"],
        },
    )
    ensure_schema(
        schemas,
        "WordByWordTranslation",
        {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "author_name": {"type": "string"},
                "slug": {"type": "string"},
                "language_name": {"type": "string"},
                "iso_code": {"type": "string"},
                "translated_name": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "language_name": {"type": "string"},
                    },
                },
            },
            "required": ["id", "name", "slug"],
        },
    )


def upsert_parameter(operation: Dict[str, Any], new_param: Dict[str, Any]) -> None:
    params = operation.setdefault("parameters", [])
    for param in params:
        if param.get("name") == new_param["name"] and param.get("in") == new_param["in"]:
            param.update(new_param)
            return
    params.append(new_param)


def set_response(operation: Dict[str, Any], schema: Dict[str, Any], example: Any) -> None:
    operation.setdefault("responses", {})
    operation["responses"]["200"] = {
        "description": "Successful response.",
        "content": {
            "application/json": {
                "schema": schema,
                "example": example,
            }
        },
    }


def ensure_path_param(operation: Dict[str, Any], name: str, description: str, schema: Dict[str, Any]) -> None:
    upsert_parameter(
        operation,
        {
            "name": name,
            "in": "path",
            "required": True,
            "description": description,
            "schema": schema,
        },
    )


def configure_audio_endpoints(spec: Dict[str, Any]) -> None:
    ensure_audio_components(spec)
    paths = spec.setdefault("paths", {})

    audio_list = paths.setdefault("/audio/qaris", {}).setdefault("get", {})
    audio_list.setdefault("summary", "List reciters")
    audio_list.setdefault(
        "description",
        "Returns metadata for all supported audio reciters (qaris), including style and available resources.",
    )
    upsert_parameter(
        audio_list,
        {
            "name": "fields",
            "in": "query",
            "required": False,
            "description": "Comma-separated list of additional reciter fields to include (supported: `bio`, `profile_picture`, `cover_image`).",
            "schema": {"type": "string"},
        },
    )
    set_response(
        audio_list,
        {"type": "array", "items": {"$ref": "#/components/schemas/AudioReciter"}},
        [AUDIO_RECITER_EXAMPLE, RELATED_RECITER_EXAMPLE],
    )

    audio_show = paths.setdefault("/audio/qaris/{id}", {}).setdefault("get", {})
    audio_show.setdefault("summary", "Get reciter details")
    audio_show.setdefault("description", "Fetch metadata for a single reciter identified by id.")
    ensure_path_param(audio_show, "id", "Reciter identifier.", {"type": "integer"})
    upsert_parameter(
        audio_show,
        {
            "name": "fields",
            "in": "query",
            "required": False,
            "description": "Comma-separated list of additional reciter fields to include (supported: `bio`, `profile_picture`, `cover_image`).",
            "schema": {"type": "string"},
        },
    )
    set_response(
        audio_show,
        {"$ref": "#/components/schemas/AudioReciter"},
        AUDIO_RECITER_EXAMPLE,
    )

    audio_related = paths.setdefault("/audio/qaris/related/{id}", {}).setdefault("get", {})
    audio_related.setdefault("summary", "Get related reciters")
    audio_related.setdefault(
        "description",
        "Returns reciters whose style or region is similar to the specified reciter.",
    )
    ensure_path_param(audio_related, "id", "Reciter identifier.", {"type": "integer"})
    set_response(
        audio_related,
        {"type": "array", "items": {"$ref": "#/components/schemas/AudioReciter"}},
        [RELATED_RECITER_EXAMPLE],
    )

    audio_files = paths.setdefault("/audio/qaris/{id}/audio_files/{ext}", {}).setdefault("get", {})
    audio_files.setdefault("summary", "List reciter audio files")
    audio_files.setdefault(
        "description",
        "Returns direct audio files available for the reciter in the requested extension (for example `mp3`).",
    )
    ensure_path_param(audio_files, "id", "Reciter identifier.", {"type": "integer"})
    ensure_path_param(audio_files, "ext", "Audio file extension to request (for example `mp3`).", {"type": "string"})
    upsert_parameter(
        audio_files,
        {
            "name": "chapter_number",
            "in": "query",
            "required": False,
            "description": "Optional surah number or slug to filter the audio files.",
            "schema": {"type": "string"},
        },
    )
    upsert_parameter(
        audio_files,
        {
            "name": "segments",
            "in": "query",
            "required": False,
            "description": "Set to `true` to include word-level timing segments in the response.",
            "schema": {"type": "boolean", "default": False},
        },
    )
    set_response(
        audio_files,
        {"type": "array", "items": {"$ref": "#/components/schemas/AudioReciterAudioFile"}},
        [AUDIO_FILE_EXAMPLE],
    )

    audio_sections = paths.setdefault("/audio/sections", {}).setdefault("get", {})
    audio_sections.setdefault("summary", "List audio sections")
    audio_sections.setdefault(
        "description",
        "Lists curated audio sections to support advanced playback experiences.",
    )
    set_response(
        audio_sections,
        {"type": "array", "items": {"$ref": "#/components/schemas/AudioSection"}},
        [AUDIO_SECTION_EXAMPLE],
    )

    audio_surahs = paths.setdefault("/audio/surahs", {}).setdefault("get", {})
    audio_surahs.setdefault("summary", "List audio surahs")
    audio_surahs.setdefault(
        "description",
        "Lists surah-level audio metadata for playback clients.",
    )
    set_response(
        audio_surahs,
        {"type": "array", "items": {"$ref": "#/components/schemas/AudioChapter"}},
        [AUDIO_CHAPTER_EXAMPLE],
    )

    audio_surah_detail = paths.setdefault("/audio/surahs/{id}", {}).setdefault("get", {})
    audio_surah_detail.setdefault("summary", "Get audio surah metadata")
    audio_surah_detail.setdefault(
        "description",
        "Fetch audio metadata for a specific surah.",
    )
    ensure_path_param(audio_surah_detail, "id", "Surah identifier (number).", {"type": "integer", "minimum": 1})
    set_response(
        audio_surah_detail,
        {"$ref": "#/components/schemas/AudioChapter"},
        AUDIO_CHAPTER_EXAMPLE,
    )


def configure_metadata_endpoints(spec: Dict[str, Any]) -> None:
    ensure_metadata_components(spec)
    paths = spec.setdefault("paths", {})

    def list_with_envelope(path_key: str, envelope: str, ref: str, example: Any) -> None:
        operation = paths.setdefault(path_key, {}).setdefault("get", {})
        set_response(
            operation,
            {
                "type": "object",
                "properties": {
                    envelope: {
                        "type": "array",
                        "items": {"$ref": ref},
                    }
                },
            },
            {envelope: example},
        )

    def detail_with_envelope(path_key: str, envelope: str, ref: str, example: Any, id_description: str) -> None:
        operation = paths.setdefault(path_key, {}).setdefault("get", {})
        ensure_path_param(operation, "id", id_description, {"type": "integer"})
        set_response(
            operation,
            {
                "type": "object",
                "properties": {
                    envelope: {"$ref": ref},
                },
            },
            {envelope: example},
        )

    list_with_envelope("/hizbs", "hizbs", "#/components/schemas/Hizb", [HIZB_EXAMPLE])
    detail_with_envelope(
        "/hizbs/{id}",
        "hizb",
        "#/components/schemas/Hizb",
        HIZB_EXAMPLE,
        "Hizb number (1-60).",
    )

    list_with_envelope("/manzils", "manzils", "#/components/schemas/Manzil", [MANZIL_EXAMPLE])
    detail_with_envelope(
        "/manzils/{id}",
        "manzil",
        "#/components/schemas/Manzil",
        MANZIL_EXAMPLE,
        "Manzil number (1-7).",
    )

    list_with_envelope("/rub_el_hizbs", "rub_el_hizbs", "#/components/schemas/RubElHizb", [RUB_EXAMPLE])
    detail_with_envelope(
        "/rub_el_hizbs/{id}",
        "rub_el_hizb",
        "#/components/schemas/RubElHizb",
        RUB_EXAMPLE,
        "Rub el Hizb number (1-240).",
    )

    list_with_envelope("/rukus", "rukus", "#/components/schemas/Ruku", [RUKU_EXAMPLE])
    detail_with_envelope(
        "/rukus/{id}",
        "ruku",
        "#/components/schemas/Ruku",
        RUKU_EXAMPLE,
        "Ruku identifier.",
    )

    operation_mushafs = paths.setdefault("/mushafs", {}).setdefault("get", {})
    set_response(
        operation_mushafs,
        {
            "type": "object",
            "properties": {
                "mushafs": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/Mushaf"},
                }
            },
        },
        {"mushafs": [MUSHAF_EXAMPLE]},
    )

    foot_note = paths.setdefault("/foot_notes/{id}", {}).setdefault("get", {})
    ensure_path_param(foot_note, "id", "Footnote identifier.", {"type": "integer"})
    set_response(
        foot_note,
        {
            "type": "object",
            "properties": {"foot_note": {"$ref": "#/components/schemas/FootNote"}},
        },
        FOOT_NOTE_EXAMPLE,
    )

    operation_word_by_word = paths.setdefault("/resources/word_by_word_translations", {}).setdefault("get", {})
    set_response(
        operation_word_by_word,
        {
            "type": "object",
            "properties": {
                "word_by_word_translations": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/WordByWordTranslation"},
                }
            },
        },
        WORD_BY_WORD_TRANSLATION_EXAMPLE,
    )


def apply_metadata(doc_paths: Dict[str, Dict]) -> None:
    metadata: Dict[Tuple[str, str], Tuple[str, str, List[str]]] = {
        ("/", "get"): (
            "API ping",
            "Lightweight readiness check for the content API (mirrors /ping).",
            ["Health"],
        ),
        ("/ping", "get"): (
            "API ping",
            "Lightweight readiness check for the content API.",
            ["Health"],
        ),
        ("/suggest", "get"): (
            "Auto-complete suggestions",
            "Returns auto-complete suggestions for chapters, verses and translations.",
            ["Search"],
        ),
        ("/juzs/{id}", "get"): (
            "Get Juz details",
            "Fetch metadata for a specific Juz (section).",
            ["Metadata"],
        ),
        ("/verses/by_rub_el_hizb/{rub_el_hizb_number}", "get"): (
            "List verses by Rub el Hizb",
            "Retrieve verses that belong to the specified Rub el Hizb.",
            ["Verses"],
        ),
        ("/verses/by_manzil/{manzil_number}", "get"): (
            "List verses by Manzil",
            "Retrieve verses within the specified Manzil.",
            ["Verses"],
        ),
        ("/verses/by_ruku/{ruku_number}", "get"): (
            "List verses by Ruku",
            "Retrieve verses that belong to the specified Ruku.",
            ["Verses"],
        ),
        ("/verses/filter", "get"): (
            "Filter verses",
            "Query verses with fine-grained filters such as chapter, pagination, and resource options.",
            ["Verses"],
        ),
        ("/recitations/{recitation_id}/by_rub_el_hizb/{rub_el_hizb_number}", "get"): (
            "List recitation audio by Rub el Hizb",
            "Fetch recitation audio files scoped to a specific Rub el Hizb.",
            ["Audio"],
        ),
        ("/translations/{resource_id}/by_rub/{rub_el_hizb_number}", "get"): (
            "List translations by Rub el Hizb",
            "Fetch translations for verses in the specified Rub el Hizb.",
            ["Translations"],
        ),
        ("/tafsirs/{resource_id}/by_rub/{rub_el_hizb_number}", "get"): (
            "List tafsirs by Rub el Hizb",
            "Fetch tafsir entries for verses in the specified Rub el Hizb.",
            ["Tafsirs"],
        ),
        ("/resources/changes", "get"): (
            "List resource changes",
            "Returns recently updated translations, recitations, or other content resources.",
            ["Metadata"],
        ),
        ("/resources/word_by_word_translations", "get"): (
            "List word-by-word translations",
            "Returns available word-by-word translation resources and their metadata.",
            ["Metadata"],
        ),
        ("/audio/qaris", "get"): (
            "List reciters",
            "Returns metadata for all supported audio reciters (qaris), including style and available resources.",
            ["Audio"],
        ),
        ("/audio/qaris/{id}", "get"): (
            "Get reciter details",
            "Fetch metadata for a single reciter identified by id.",
            ["Audio"],
        ),
        ("/audio/qaris/related/{id}", "get"): (
            "Get related reciters",
            "Returns reciters whose style or region is similar to the specified reciter.",
            ["Audio"],
        ),
        ("/audio/qaris/{id}/audio_files/{ext}", "get"): (
            "List reciter audio files",
            "Returns direct audio files available for the reciter in the requested extension (e.g., mp3).",
            ["Audio"],
        ),
        ("/audio/sections", "get"): (
            "List audio sections",
            "Lists curated audio sections to support advanced playback experiences.",
            ["Audio"],
        ),
        ("/audio/surahs", "get"): (
            "List audio surahs",
            "Lists surah-level audio metadata for playback clients.",
            ["Audio"],
        ),
        ("/audio/surahs/{id}", "get"): (
            "Get audio surah metadata",
            "Fetch audio metadata for a specific surah.",
            ["Audio"],
        ),
        ("/foot_notes/{id}", "get"): (
            "Get footnote",
            "Fetch a Quran translation footnote by its identifier.",
            ["Metadata"],
        ),
        ("/hizbs", "get"): (
            "List hizbs",
            "Returns metadata for all hizbs.",
            ["Metadata"],
        ),
        ("/hizbs/{id}", "get"): (
            "Get hizb details",
            "Fetch metadata for a specific hizb.",
            ["Metadata"],
        ),
        ("/manzils", "get"): (
            "List manzils",
            "Returns metadata for all manzils.",
            ["Metadata"],
        ),
        ("/manzils/{id}", "get"): (
            "Get manzil details",
            "Fetch metadata for a specific manzil.",
            ["Metadata"],
        ),
        ("/mushafs", "get"): (
            "List approved mushafs",
            "Returns the mushaf configurations approved for content delivery.",
            ["Metadata"],
        ),
        ("/rub_el_hizbs", "get"): (
            "List rub el hizbs",
            "Returns metadata for all rub el hizbs.",
            ["Metadata"],
        ),
        ("/rub_el_hizbs/{id}", "get"): (
            "Get rub el hizb details",
            "Fetch metadata for a specific rub el hizb.",
            ["Metadata"],
        ),
        ("/rukus", "get"): (
            "List rukus",
            "Returns metadata for all rukus.",
            ["Metadata"],
        ),
        ("/rukus/{id}", "get"): (
            "Get ruku details",
            "Fetch metadata for a specific ruku.",
            ["Metadata"],
        ),
        ("/quran/verses/{script}", "get"): (
            "Get Quran glyphs by script",
            "Returns Quran verse glyph data for the requested script (e.g., code_v1, imlaei, indopak).",
            ["Verses"],
        ),
    }

    for (path, method), (summary, description, tags) in metadata.items():
        path_item = doc_paths.setdefault(path, {})
        operation = path_item.setdefault(method, {})
        if summary:
            operation["summary"] = summary
        if description:
            operation["description"] = description
        if tags:
            operation["tags"] = tags
        responses = operation.setdefault("responses", {})
        ok = responses.setdefault("200", {})
        ok.setdefault("description", "Successful response.")


def ensure_segments_parameter(operation: Dict) -> None:
    params = operation.setdefault("parameters", [])
    if any(param.get("name") == "segments" for param in params):
        return
    params.append(
        {
            "name": "segments",
            "in": "query",
            "description": "Include verse-level timing segments? `true` adds `segments` with `[word_index, start_ms, end_ms]` triplets.",
            "required": False,
            "schema": {
                "type": "boolean",
                "default": False,
            },
        }
    )


def replace_endpoint_tokens(obj: Any) -> Any:
    if isinstance(obj, dict):
        for key, value in list(obj.items()):
            if isinstance(value, str):
                text = value
                for token, replacement in TOKEN_REPLACEMENTS.items():
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token} endpoint"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token}"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    if token in text:
                        text = text.replace(token, replacement)
                while "  " in text:
                    text = text.replace("  ", " ")
                text = text.replace(") endpoint.", ").")
                text = text.replace("` endpoint.", "`.")
                text = text.replace("See  ", "See ")
                text = text.replace("see  ", "see ")
                text = text.replace("See  See ", "See ")
                text = text.replace("See See", "See")
                text = text.replace("see See", "see")
                text = text.replace(" endpoint.", ".")
                text = text.replace("using this endpoint See [", "using the [")
                for inline, link in INLINE_LINKS.items():
                    if inline in text:
                        text = text.replace(inline, link)
                text = text.replace("using this endpoint See [", "using the [")
                text = text.replace("using this endpoint ", "using the ")
                obj[key] = text
            else:
                replace_endpoint_tokens(value)
    elif isinstance(obj, list):
        for index, value in enumerate(list(obj)):
            if isinstance(value, str):
                text = value
                for token, replacement in TOKEN_REPLACEMENTS.items():
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token} endpoint"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token}"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    if token in text:
                        text = text.replace(token, replacement)
                while "  " in text:
                    text = text.replace("  ", " ")
                text = text.replace(") endpoint.", ").")
                text = text.replace("` endpoint.", "`.")
                text = text.replace("See  ", "See ")
                text = text.replace("see  ", "see ")
                text = text.replace("See  See ", "See ")
                text = text.replace("See See", "See")
                text = text.replace("see See", "see")
                text = text.replace(" endpoint.", ".")
                text = text.replace("using this endpoint See [", "using the [")
                for inline, link in INLINE_LINKS.items():
                    if inline in text:
                        text = text.replace(inline, link)
                text = text.replace("using this endpoint See [", "using the [")
                text = text.replace("using this endpoint ", "using the ")
                obj[index] = text
            else:
                replace_endpoint_tokens(value)
    return obj


def apply_overrides(doc_paths: Dict[str, Dict]) -> None:
    chapter_recitations = doc_paths.setdefault("/chapter_recitations/{id}/{chapter_number}", {})
    operation = chapter_recitations.setdefault("get", {})
    ensure_segments_parameter(operation)
    replace_endpoint_tokens(operation)

    root_ping = doc_paths.setdefault("/", {})
    replace_endpoint_tokens(root_ping)

    for path_item in doc_paths.values():
        for operation in path_item.values():
            replace_endpoint_tokens(operation)


    recitation_paths = [
        "/recitations/{recitation_id}/by_chapter/{chapter_number}",
        "/recitations/{recitation_id}/by_juz/{juz_number}",
        "/recitations/{recitation_id}/by_page/{page_number}",
        "/recitations/{recitation_id}/by_rub/{rub_el_hizb_number}",
        "/recitations/{recitation_id}/by_hizb/{hizb_number}",
        "/recitations/{recitation_id}/by_manzil/{manzil_number}",
        "/recitations/{recitation_id}/by_ruku/{ruku_number}",
        "/recitations/{recitation_id}/by_ayah/{ayah_key}",
    ]
    for recitation_path in recitation_paths:
        recitation_operation = doc_paths.setdefault(recitation_path, {}).setdefault("get", {})
        for param in recitation_operation.get("parameters", []):
            if param.get("name") == "recitation_id" and isinstance(param.get("description"), str):
                desc = param["description"].replace(
                    "using the [GET /resources/recitations](/docs/content_apis_versioned/recitations) for the full list of recitations.",
                    "using the [GET /resources/recitations](/docs/content_apis_versioned/recitations) endpoint for the full list of recitations."
                )
                param["description"] = desc

def main() -> None:
    doc_spec = load_doc_spec()
    generated_spec = load_generated_spec()
    stoplight_spec = load_stoplight_spec()

    doc_paths: Dict[str, Dict] = doc_spec.setdefault("paths", {})
    generated_paths: Dict[str, Dict] = generated_spec.get("paths", {})

    obsolete_paths = [
        "/quran/verses/code_v1",
        "/quran/verses/code_v2",
        "/quran/verses/imlaei",
        "/quran/verses/indopak",
        "/quran/verses/uthmani",
        "/quran/verses/uthmani_simple",
        "/quran/verses/uthmani_tajweed",
    ]
    for path in obsolete_paths:
        doc_paths.pop(path, None)

    paths_to_add = [
        "/audio/qaris",
        "/audio/qaris/{id}",
        "/audio/qaris/related/{id}",
        "/audio/qaris/{id}/audio_files/{ext}",
        "/audio/sections",
        "/audio/surahs",
        "/audio/surahs/{id}",
        "/foot_notes/{id}",
        "/hizbs",
        "/hizbs/{id}",
        "/manzils",
        "/manzils/{id}",
        "/mushafs",
        "/rub_el_hizbs",
        "/rub_el_hizbs/{id}",
        "/rukus",
        "/rukus/{id}",
        "/quran/verses/{script}",
    ]

    for path in paths_to_add:
        if path not in doc_paths and path in generated_paths:
            doc_paths[path] = copy.deepcopy(generated_paths[path])

    exclusions = set()
    for path, value in generated_paths.items():
        if path in exclusions:
            continue
        if path not in doc_paths:
            doc_paths[path] = copy.deepcopy(value)

    if "/quran/verses/{script}" in generated_paths:
        doc_item = doc_paths.setdefault("/quran/verses/{script}", {})
        generated_item = generated_paths["/quran/verses/{script}"]
        if "get" in generated_item:
            doc_operation = doc_item.setdefault("get", {})
            merge_operation(doc_operation, generated_item["get"])
            ensure_script_enum(doc_operation)

    ops_to_sync: List[Tuple[str, str]] = [
        ("/chapter_recitations/{id}", "get"),
        ("/chapter_recitations/{id}/{chapter_number}", "get"),
        ("/quran/translations/{translation_id}", "get"),
        ("/recitations/{recitation_id}/by_chapter/{chapter_number}", "get"),
        ("/resources/tafsirs", "get"),
        ("/search", "get"),
    ]

    for path, method in ops_to_sync:
        if path not in generated_paths:
            continue
        generated_item = generated_paths[path]
        method_lower = method.lower()
        if method_lower not in generated_item:
            continue
        doc_operation = doc_paths.setdefault(path, {}).setdefault(method_lower, {})
        merge_operation(doc_operation, generated_item[method_lower])

    for path, path_item in doc_paths.items():
        generated_item = generated_paths.get(path)
        if not generated_item:
            continue
        for method, operation in list(path_item.items()):
            if method not in ("get", "post", "put", "patch", "delete", "options", "head"):
                continue
            generated_operation = generated_item.get(method)
            if not generated_operation:
                continue
            merge_operation(operation, generated_operation)

    apply_metadata(doc_paths)
    apply_overrides(doc_paths)

    def normalize_refs(obj: Any) -> Any:
        if isinstance(obj, dict):
            for key, value in list(obj.items()):
                if isinstance(value, str) and value.startswith("#/definitions/"):
                    obj[key] = value.replace("#/definitions/", "#/components/schemas/")
                else:
                    normalize_refs(value)
            return obj
        if isinstance(obj, list):
            for index, value in enumerate(list(obj)):
                if isinstance(value, str) and value.startswith("#/definitions/"):
                    obj[index] = value.replace("#/definitions/", "#/components/schemas/")
                else:
                    normalize_refs(value)
            return obj
        return obj

    def normalize_null_types(obj: Any) -> Any:
        if isinstance(obj, dict):
            for key, value in list(obj.items()):
                if key == "type" and isinstance(value, list):
                    obj[key] = ["null" if item is None else item for item in value]
                elif key == "items" and value is None:
                    obj[key] = {}
                else:
                    normalize_null_types(value)
            return obj
        if isinstance(obj, list):
            for index, value in enumerate(list(obj)):
                if value is None:
                    obj[index] = "null"
                else:
                    normalize_null_types(value)
            return obj
        return obj

    normalize_refs(doc_spec)
    normalize_null_types(doc_spec)

    for path_item in doc_paths.values():
        for method, operation in list(path_item.items()):
            if method not in ("get", "post", "put", "patch", "delete", "options", "head"):
                continue
            if not isinstance(operation, dict):
                continue
            if operation.get("parameters") is None:
                operation["parameters"] = []

    stoplight_paths: Dict[str, Dict] = stoplight_spec.get("paths", {})
    for path, path_item in doc_paths.items():
        stoplight_item = stoplight_paths.get(path)
        if not stoplight_item:
            continue
        for method, operation in list(path_item.items()):
            if method not in ("get", "post", "put", "patch", "delete", "options", "head"):
                continue
            stoplight_operation = stoplight_item.get(method)
            if not stoplight_operation:
                continue
            responses = stoplight_operation.get("responses", {})
            for status, response in responses.items():
                examples = response.get("examples") or {}
                example_payload = examples.get("application/json")
                if example_payload is None:
                    continue
                status_code = str(status)
                doc_response = operation.setdefault("responses", {}).setdefault(status_code, {})
                content = doc_response.setdefault("content", {}).setdefault("application/json", {})
                content["example"] = example_payload

    script = json.dumps(doc_spec, indent=2, ensure_ascii=False)
    DOC_SPEC_PATH.write_text(script, encoding="utf-8")


if __name__ == "__main__":
    main()

