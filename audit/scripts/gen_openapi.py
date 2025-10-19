#!/usr/bin/env python3
"""
Generate an OpenAPI 3.1 specification by combining extracted route metadata
with schema information derived from the Quran.com API repository.

The generator uses:
  * routes.json produced by `extract_routes.py`
  * schemas.json produced by `extract_schemas.py`

The resulting OpenAPI document aims to be faithful yet explicit about gaps.
When information is missing the generator annotates operations with `TODO`
notes so documentation authors can follow up.

Usage:
  python ./audit/scripts/gen_openapi.py --routes <file> --schemas <file> --out <file>
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

LOGGER = logging.getLogger(__name__)


def load_json(path: Path, label: str) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"{label} not found: {path}")
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    LOGGER.info("Loaded %s (%d bytes)", label, path.stat().st_size)
    return data


def normalize_route_path(path: str) -> str:
    """Convert Rails-style paths (/foo/:id) to OpenAPI format (/foo/{id})."""
    def replacer(match: re.Match[str]) -> str:
        return "{" + match.group(1) + "}"

    cleaned = re.sub(r":([a-zA-Z_][a-zA-Z0-9_]*)", replacer, path)
    cleaned = re.sub(r"//+", "/", cleaned)
    return cleaned


def convert_schema_param(param: Dict[str, Any]) -> Dict[str, Any]:
    schema = param.get("schema")
    if schema is None and param.get("type"):
        schema = {"type": param["type"]}
        if param.get("format"):
            schema["format"] = param["format"]
        if param.get("items"):
            schema["items"] = param["items"]
        if param.get("enum"):
            schema["enum"] = param["enum"]
        if param.get("default") is not None:
            schema["default"] = param["default"]

    converted = {
        "name": param.get("name"),
        "in": param.get("in"),
        "required": bool(param.get("required", False)),
        "description": param.get("description"),
    }
    if schema:
        converted["schema"] = schema
    if param.get("examples"):
        converted["examples"] = param["examples"]
    return {k: v for k, v in converted.items() if v not in (None, "", {})}


def convert_schema_response(
    responses: Dict[str, Any], produces: Optional[List[str]]
) -> Dict[str, Any]:
    if not responses:
        return {"default": {"description": "TODO: document response"}}

    content_types = produces or ["application/json"]
    converted: Dict[str, Any] = {}
    for status, spec in responses.items():
        content: Dict[str, Any] = {}
        if spec.get("schema"):
            for mime in content_types:
                content[mime] = {"schema": spec["schema"]}
                if spec.get("examples") and spec["examples"].get(mime):
                    content[mime]["example"] = spec["examples"][mime]
        entry = {"description": spec.get("description", "") or ""}
        if content:
            entry["content"] = content
        if spec.get("headers"):
            entry["headers"] = spec["headers"]
        converted[status] = entry
    return converted


def convert_request_body(
    request_body: Optional[Dict[str, Any]],
    consumes: Optional[List[str]],
) -> Optional[Dict[str, Any]]:
    if not request_body:
        return None
    content_types = consumes or ["application/json"]
    schema = request_body.get("schema") or {}
    content = {}
    for mime in content_types:
        entry = {"schema": schema}
        content[mime] = entry
    converted = {
        "required": bool(request_body.get("required", False)),
        "description": request_body.get("description"),
        "content": content,
    }
    return {k: v for k, v in converted.items() if v not in (None, "", {})}


def ensure_path_parameters(
    parameters: List[Dict[str, Any]], path_params: List[str]
) -> Tuple[List[Dict[str, Any]], List[str]]:
    existing = {f"{param.get('in')}::{param.get('name')}" for param in parameters}
    notes: List[str] = []
    for param in path_params:
        key = f"path::{param}"
        if key in existing:
            continue
        parameters.append(
            {
                "name": param,
                "in": "path",
                "required": True,
                "schema": {"type": "string"},
                "description": "TODO: add description",
            }
        )
        notes.append(f"TODO: describe path parameter `{param}`")
    return parameters, notes


def build_operation(
    route: Dict[str, Any],
    schema_entry: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    method = route["method"].lower()
    path_params = route.get("path_params", [])

    if schema_entry:
        parameters = [convert_schema_param(p) for p in schema_entry.get("parameters", [])]
        parameters, param_notes = ensure_path_parameters(parameters, path_params)
        responses = convert_schema_response(
            schema_entry.get("responses", {}),
            schema_entry.get("produces"),
        )
        request_body = convert_request_body(
            schema_entry.get("requestBody"),
            schema_entry.get("consumes"),
        )
        tags = schema_entry.get("tags") or []
        security = schema_entry.get("security")
        summary = schema_entry.get("summary")
        description = schema_entry.get("description")
        operation_id = schema_entry.get("operationId")
        deprecated = schema_entry.get("deprecated", False)
        notes = schema_entry.get("x-notes", [])
    else:
        parameters, param_notes = ensure_path_parameters([], path_params)
        responses = {"default": {"description": "TODO: document response"}}
        request_body = None
        tags = route.get("scopes", [])
        security = None
        summary = None
        description = None
        operation_id = None
        deprecated = False
        notes = []

    if not operation_id:
        parts = []
        if route.get("controller"):
            parts.append(route["controller"].replace("/", "."))
        if route.get("action"):
            parts.append(route["action"])
        operation_id = ".".join(parts) if parts else f"{method}_{route['path']}"

    all_notes = list(notes)
    if param_notes:
        all_notes.extend(param_notes)
    if not schema_entry:
        all_notes.append("TODO: no schema metadata found for this route")

    operation: Dict[str, Any] = {
        "operationId": operation_id,
        "summary": summary,
        "description": description,
        "tags": tags,
        "parameters": parameters or None,
        "requestBody": request_body,
        "responses": responses,
        "security": security,
        "deprecated": deprecated or None,
        "x-route-source": route.get("source"),
        "x-controller": route.get("controller"),
        "x-notes": all_notes or None,
    }
    return {k: v for k, v in operation.items() if v not in (None, [], {})}


def build_paths(
    routes_data: Dict[str, Any],
    schema_data: Dict[str, Any],
) -> Dict[str, Any]:
    paths: Dict[str, Dict[str, Any]] = {}
    schema_map = schema_data.get("endpoints", {})

    for route in routes_data.get("endpoints", []):
        method = route.get("method")
        path = normalize_route_path(route.get("path", ""))
        key = f"{method.upper()} {path}"
        schema_entry = schema_map.get(key)
        operation = build_operation(route, schema_entry)
        paths.setdefault(path, {})[method.lower()] = operation

    return dict(sorted(paths.items()))


def build_servers(schema_meta: Dict[str, Any]) -> List[Dict[str, Any]]:
    host = schema_meta.get("host")
    base_path = schema_meta.get("basePath", "") or ""
    schemes = schema_meta.get("schemes") or ["https"]
    servers = []
    if host:
        for scheme in schemes:
            url = f"{scheme}://{host}{base_path}"
            servers.append({"url": url})
    return servers


def build_components(schema_data: Dict[str, Any]) -> Dict[str, Any]:
    components = schema_data.get("components", {})
    if not components:
        return {}
    return components


def collect_tags(paths: Dict[str, Any]) -> List[Dict[str, Any]]:
    tags_set = {}
    for operations in paths.values():
        for op in operations.values():
            for tag in op.get("tags", []):
                tags_set.setdefault(tag, {"name": tag})
    return sorted(tags_set.values(), key=lambda item: item["name"])


def build_openapi_document(
    routes_data: Dict[str, Any],
    schema_data: Dict[str, Any],
) -> Dict[str, Any]:
    schema_meta = schema_data.get("meta", {})
    paths = build_paths(routes_data, schema_data)
    components = build_components(schema_data)
    servers = build_servers(schema_meta)
    tags = collect_tags(paths)

    info = {
        "title": schema_meta.get("title") or "Quran.com API (generated)",
        "version": schema_meta.get("version") or "0.0.0",
        "description": schema_meta.get("description"),
    }

    spec = {
        "openapi": "3.1.0",
        "info": {k: v for k, v in info.items() if v},
        "servers": servers,
        "paths": paths,
        "components": components,
        "tags": tags,
    }

    missing = [
        key
        for key, entry in schema_data.get("endpoints", {}).items()
        if key not in {f"{r['method']} {normalize_route_path(r['path'])}" for r in routes_data.get("endpoints", [])}
    ]
    if missing:
        spec.setdefault("x-schema-missing-routes", missing)

    return spec


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate OpenAPI spec from extracted metadata."
    )
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

    spec = build_openapi_document(routes_data, schema_data)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(spec, indent=2), encoding="utf-8")
    LOGGER.info(
        "OpenAPI document generated with %d paths and %d components sections",
        len(spec["paths"]),
        len(spec.get("components", {})),
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
