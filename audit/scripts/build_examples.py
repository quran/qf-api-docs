#!/usr/bin/env python3
"""
Generate example JSON payloads for Quran.com API endpoints.

The examples leverage the extracted schema metadata. When schemas provide
structured type information the generator produces a representative payload.
Otherwise it emits a minimal placeholder and highlights the gaps via `TODO`
comments so editors know where manual curation is needed.

Usage:
  python ./audit/scripts/build_examples.py --api-root <path> \
      --routes <file> --schemas <file> --out <dir>
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

LOGGER = logging.getLogger(__name__)


def load_json(path: Path, label: str) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"{label} not found: {path}")
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    LOGGER.info("Loaded %s (%d bytes)", label, path.stat().st_size)
    return data


def normalize_route_path(path: str) -> str:
    return re.sub(
        r":([a-zA-Z_][a-zA-Z0-9_]*)",
        lambda match: "{" + match.group(1) + "}",
        path,
    )


def resolve_ref(ref: str, components: Dict[str, Any], seen: Set[str]) -> Dict[str, Any]:
    if not ref.startswith("#/components/schemas/"):
        return {}
    name = ref.split("/")[-1]
    if name in seen:
        return {}
    seen.add(name)
    return components.get(name, {})


def example_for_schema(
    schema: Dict[str, Any],
    components: Dict[str, Any],
    seen: Optional[Set[str]] = None,
) -> Tuple[Any, List[str]]:
    if seen is None:
        seen = set()

    if not schema:
        return "TODO", ["TODO: missing schema definition"]

    if "example" in schema:
        return schema["example"], []

    if "$ref" in schema:
        resolved = resolve_ref(schema["$ref"], components, seen)
        if not resolved:
            return "TODO", [f"TODO: unresolved $ref {schema['$ref']}"]
        return example_for_schema(resolved, components, seen)

    schema_type = schema.get("type")

    if schema_type == "object" or ("properties" in schema):
        properties = schema.get("properties", {})
        example_obj: Dict[str, Any] = {}
        notes: List[str] = []
        for name, prop_schema in properties.items():
            value, sub_notes = example_for_schema(prop_schema, components, seen.copy())
            example_obj[name] = value
            notes.extend(sub_notes)
        if not properties:
            notes.append("TODO: object schema missing properties")
        return example_obj, notes

    if schema_type == "array":
        item_schema = schema.get("items", {})
        value, notes = example_for_schema(item_schema, components, seen.copy())
        return [value], notes

    if schema_type == "string":
        if schema.get("enum"):
            return schema["enum"][0], []
        fmt = schema.get("format")
        if fmt in ("date-time", "datetime"):
            return "2025-01-01T00:00:00Z", []
        if fmt == "date":
            return "2025-01-01", []
        if fmt == "uri":
            return "https://example.com/resource", []
        return "string", []

    if schema_type == "integer":
        return 0, []

    if schema_type == "number":
        return 0.0, []

    if schema_type == "boolean":
        return True, []

    if schema.get("anyOf"):
        value, notes = example_for_schema(schema["anyOf"][0], components, seen.copy())
        notes.append("TODO: schema uses anyOf - verify chosen variant")
        return value, notes

    if schema.get("oneOf"):
        value, notes = example_for_schema(schema["oneOf"][0], components, seen.copy())
        notes.append("TODO: schema uses oneOf - verify chosen variant")
        return value, notes

    return "TODO", [f"TODO: unsupported schema type {schema_type}"]


def choose_response_schema(responses: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    for status in ("200", "201", "202", "204"):
        if status in responses:
            return responses[status].get("schema")
    if "default" in responses:
        return responses["default"].get("schema")
    # Fall back to first available
    for payload in responses.values():
        if isinstance(payload, dict) and payload.get("schema"):
            return payload["schema"]
    return None


def safe_filename(path: str, method: str) -> str:
    if path == "/":
        path_key = "root"
    else:
        path_key = path.strip("/").replace("/", "__")
        path_key = re.sub(r"[^A-Za-z0-9._-]+", "_", path_key)
        if not path_key:
            path_key = "root"
    return f"{path_key}.{method.lower()}.json"


def build_example_payload(
    route: Dict[str, Any],
    schema_entry: Optional[Dict[str, Any]],
    components: Dict[str, Any],
) -> Tuple[str, List[str]]:
    notes: List[str] = []
    if schema_entry:
        responses = schema_entry.get("responses", {})
        schema = choose_response_schema(responses)
        if schema:
            example, schema_notes = example_for_schema(schema, components)
            notes.extend(schema_notes)
        else:
            example = {"message": "TODO: response body shape unknown"}
            notes.append("TODO: no response schema defined")
    else:
        example = {"message": "TODO: add response example"}
        notes.append("TODO: no schema entry for this route")

    return json.dumps(example, indent=2), notes


def build_examples(
    routes_data: Dict[str, Any],
    schema_data: Dict[str, Any],
    out_dir: Path,
) -> None:
    components = schema_data.get("components", {}).get("schemas", {})
    schema_map = schema_data.get("endpoints", {})
    out_dir.mkdir(parents=True, exist_ok=True)
    total_notes = 0

    for route in routes_data.get("endpoints", []):
        method = route.get("method", "").upper()
        if not method:
            continue
        path = normalize_route_path(route.get("path", ""))
        key = f"{method} {path}"
        schema_entry = schema_map.get(key)
        example_json, notes = build_example_payload(route, schema_entry, components)

        filename = safe_filename(path, method)
        target = out_dir / filename
        content_lines: List[str] = []
        if notes:
            total_notes += len(notes)
            todo = " | ".join(notes)
            content_lines.append(f"/* {todo} */")
        content_lines.append(example_json)
        target.write_text("\n".join(content_lines) + "\n", encoding="utf-8")

    LOGGER.info(
        "Generated %d example payloads (%d TODO notes)",
        len(list(out_dir.glob("*.json"))),
        total_notes,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build example payloads.")
    parser.add_argument("--api-root", required=True, type=Path)
    parser.add_argument("--routes", required=True, type=Path)
    parser.add_argument("--schemas", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["ERROR", "WARNING", "INFO", "DEBUG"],
        help="Adjust verbosity.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    logging.basicConfig(level=args.log_level, format="%(levelname)s: %(message)s")
    routes_data = load_json(args.routes, "routes metadata")
    schema_data = load_json(args.schemas, "schema metadata")
    build_examples(routes_data, schema_data, args.out)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
