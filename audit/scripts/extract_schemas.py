#!/usr/bin/env python3
"""
Extract canonical request/response schema definitions for the Quran.com API.

The script currently sources schema information from the repository's published
Swagger/OpenAPI artefacts (`oas.json`, `stoplight.json`). It normalises the data
into a lightweight structure that can be diffed against the documentation and
reused for OpenAPI generation.

Key behaviours:
* Supports Swagger 2.0 (via `oas.json`) out of the box.
* Merges path-level and operation-level parameters.
* Carries response schemas, examples, and security requirements.
* Emits deterministic JSON so repeated runs are idempotent.

Usage:
  python ./audit/scripts/extract_schemas.py --api-root <path> --out <file>
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

LOGGER = logging.getLogger(__name__)

SWAGGER_METHODS = {"get", "post", "put", "patch", "delete", "options", "head"}


def load_spec(api_root: Path) -> Tuple[Path, Dict[str, Any]]:
    """Try to locate a JSON OpenAPI/Swagger artefact within the repo."""
    candidates = [
        api_root / "oas.json",
        api_root / "stoplight.json",
        api_root / "openapi.json",
    ]
    for path in candidates:
        if path.exists():
            LOGGER.info("Loading schema artefact %s", path)
            with path.open("r", encoding="utf-8") as handle:
                return path, json.load(handle)
    raise FileNotFoundError(
        f"Unable to locate schema artefact in {api_root}. "
        "Expected oas.json or stoplight.json."
    )


def normalise_parameters(
    path_params: List[Dict[str, Any]], op_params: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Merge and deduplicate path-level + operation-level parameters."""
    combined: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for source in (path_params or []), (op_params or []):
        for param in source:
            if not isinstance(param, dict):
                continue
            name = param.get("name")
            location = param.get("in")
            if not name or not location:
                continue
            key = (location, name)
            current = combined.get(key, {})
            merged = {**current, **param}
            combined[key] = merged
    ordered = []
    for key in sorted(combined):
        normalised = {
            "name": combined[key].get("name"),
            "in": combined[key].get("in"),
            "required": bool(combined[key].get("required", False)),
            "description": combined[key].get("description", "").strip(),
            "type": combined[key].get("type"),
            "format": combined[key].get("format"),
            "schema": combined[key].get("schema"),
            "collectionFormat": combined[key].get("collectionFormat"),
            "items": combined[key].get("items"),
            "enum": combined[key].get("enum"),
            "default": combined[key].get("default"),
            "examples": combined[key].get("examples"),
        }
        ordered.append({k: v for k, v in normalised.items() if v not in (None, "")})
    return ordered


def normalise_responses(
    responses: Dict[str, Any]
) -> Dict[str, Dict[str, Any]]:
    normalised: Dict[str, Dict[str, Any]] = {}
    for status, spec in (responses or {}).items():
        if not isinstance(spec, dict):
            continue
        entry = {
            "description": spec.get("description", "").strip(),
            "schema": spec.get("schema"),
            "examples": spec.get("examples"),
            "headers": spec.get("headers"),
        }
        entry = {k: v for k, v in entry.items() if v not in (None, {}, "")}
        normalised[str(status)] = entry
    return dict(sorted(normalised.items()))


def build_endpoint_key(base_path: str, path_template: str, method: str) -> str:
    base = base_path.rstrip("/")
    path = path_template if path_template.startswith("/") else f"/{path_template}"
    full = f"{base}{path}" if base else path
    return f"{method.upper()} {full}"


def extract_endpoints(spec: Dict[str, Any]) -> Dict[str, Any]:
    base_path = spec.get("basePath", "").rstrip("/")
    paths = spec.get("paths", {})
    endpoints: Dict[str, Any] = {}

    for path_template, path_block in paths.items():
        if not isinstance(path_block, dict):
            continue
        path_parameters = path_block.get("parameters", [])
        for method, op_spec in path_block.items():
            if method.lower() not in SWAGGER_METHODS:
                continue
            if not isinstance(op_spec, dict):
                continue

            key = build_endpoint_key(base_path, path_template, method)
            parameters = normalise_parameters(path_parameters, op_spec.get("parameters"))
            responses = normalise_responses(op_spec.get("responses"))

            endpoint = {
                "operationId": op_spec.get("operationId"),
                "summary": op_spec.get("summary"),
                "description": (op_spec.get("description") or "").strip(),
                "tags": op_spec.get("tags", []),
                "produces": op_spec.get("produces", paths.get("produces")),
                "consumes": op_spec.get("consumes"),
                "parameters": parameters,
                "requestBody": op_spec.get("requestBody"),
                "responses": responses,
                "security": op_spec.get("security", spec.get("security")),
                "deprecated": bool(op_spec.get("deprecated", False)),
                "x-notes": [],
            }

            # Retrofit request body from swagger 'parameters' format.
            body_params = [
                param for param in parameters if param.get("in") == "body"
            ]
            if body_params and endpoint["requestBody"] is None:
                endpoint["requestBody"] = {
                    "description": body_params[0].get("description"),
                    "schema": body_params[0].get("schema"),
                    "required": body_params[0].get("required", False),
                }

            endpoint = {
                k: v
                for k, v in endpoint.items()
                if v not in (None, [], {}, "", False)
            }
            endpoints[key] = endpoint

    return dict(sorted(endpoints.items()))


def extract_components(spec: Dict[str, Any]) -> Dict[str, Any]:
    components: Dict[str, Any] = {}
    if "components" in spec:
        components = spec["components"]
    else:
        definitions = spec.get("definitions", {})
        parameters = spec.get("parameters", {})
        responses = spec.get("responses", {})
        security = spec.get("securityDefinitions", {})
        components = {
            "schemas": definitions,
            "parameters": parameters,
            "responses": responses,
            "securitySchemes": security,
        }
    for section, payload in list(components.items()):
        if payload in ({}, []):
            components.pop(section, None)
    return components


def build_output(
    api_root: Path, spec_path: Path, spec: Dict[str, Any]
) -> Dict[str, Any]:
    endpoints = extract_endpoints(spec)
    components = extract_components(spec)

    return {
        "meta": {
            "source_file": spec_path.relative_to(api_root).as_posix()
            if spec_path.is_relative_to(api_root)
            else spec_path.as_posix(),
            "format": spec.get("openapi") or spec.get("swagger"),
            "title": spec.get("info", {}).get("title"),
            "version": spec.get("info", {}).get("version"),
            "description": spec.get("info", {}).get("description"),
            "host": spec.get("host"),
            "basePath": spec.get("basePath"),
            "schemes": spec.get("schemes"),
        },
        "components": components,
        "endpoints": endpoints,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract canonical response/request schemas."
    )
    parser.add_argument("--api-root", required=True, type=Path)
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
    spec_path, spec = load_spec(args.api_root)
    output = build_output(args.api_root, spec_path, spec)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(output, indent=2), encoding="utf-8")
    LOGGER.info(
        "Extracted schemas for %d endpoints with %d component sections",
        len(output["endpoints"]),
        len(output["components"]),
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
