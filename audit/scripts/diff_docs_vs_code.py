#!/usr/bin/env python3
"""
Diff the extracted Quran.com API metadata (routes + schemas) against the docs.

Generates the six discrepancy reports plus ready-to-paste patch snippets for any
route that exists in code but is missing detailed coverage in the docs.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple
from urllib.parse import urlparse

LOGGER = logging.getLogger(__name__)

REPORT_NAMES = [
    "01_endpoints_missing_in_docs.md",
    "02_docs_endpoints_missing_in_code.md",
    "03_param_schema_example_gaps.md",
    "04_response_example_mismatches.md",
    "05_auth_rate-limit_error-codes.md",
    "99_summary_checklist.md",
]


@dataclass
class DocEndpoint:
    file: Path
    method: str
    path: str
    candidates: List[str]
    api: Dict[str, Any]
    title: Optional[str] = None


def load_json(path: Path, label: str) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"{label} not found: {path}")
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    LOGGER.info("Loaded %s (%d bytes)", label, path.stat().st_size)
    return data


def clean_path(path: str) -> str:
    if not path:
        return "/"
    if not path.startswith("/"):
        path = f"/{path}"
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]
    return path


def normalize_route_path(path: str) -> str:
    result: List[str] = []
    i = 0
    while i < len(path):
        char = path[i]
        if char == ":" and i + 1 < len(path):
            j = i + 1
            while j < len(path) and (path[j].isalnum() or path[j] == "_"):
                j += 1
            name = path[i + 1 : j]
            if name:
                result.append("{" + name + "}")
                i = j
                continue
        result.append(char)
        i += 1
    return clean_path("".join(result))


def parse_frontmatter(text: str) -> Optional[str]:
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None
    return parts[1]


def parse_api_block(frontmatter: str) -> Optional[Dict[str, Any]]:
    for line in frontmatter.splitlines():
        stripped = line.strip()
        if not stripped.startswith("api:"):
            continue
        raw = stripped.split("api:", 1)[1].strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            LOGGER.warning("Failed to decode api block (%s)", exc)
            return None
    return None


def extract_title(frontmatter: str) -> Optional[str]:
    for line in frontmatter.splitlines():
        stripped = line.strip()
        if stripped.startswith("title:"):
            return stripped.split(":", 1)[1].strip().strip('"')
    return None


def extract_server_paths(api_meta: Dict[str, Any]) -> List[str]:
    paths: List[str] = []
    for server in api_meta.get("servers", []):
        if not isinstance(server, dict):
            continue
        url = server.get("url")
        if not url:
            continue
        parsed = urlparse(url)
        if parsed.path:
            paths.append(clean_path(parsed.path))
    return paths


def join_paths(base: str, suffix: str) -> str:
    if not base or base == "/":
        return clean_path(suffix)
    return clean_path(f"{base.rstrip('/')}/{suffix.lstrip('/')}")


def generate_doc_endpoints(docs_root: Path) -> List[DocEndpoint]:
    endpoints: List[DocEndpoint] = []
    for doc_path in docs_root.rglob("*.md*"):
        try:
            content = doc_path.read_text(encoding="utf-8")
        except Exception as exc:
            LOGGER.warning("Unable to read %s: %s", doc_path, exc)
            continue
        frontmatter = parse_frontmatter(content)
        if not frontmatter:
            continue
        api_meta = parse_api_block(frontmatter)
        if not api_meta:
            continue
        method = api_meta.get("method")
        endpoint_path = api_meta.get("path")
        if not method or not endpoint_path:
            continue
        method = str(method).upper()
        canonical_path = clean_path(str(endpoint_path))
        base_paths = extract_server_paths(api_meta)
        if not base_paths:
            base_paths = [""]
        candidates: Set[str] = set()
        for base in base_paths:
            combined = join_paths(base, canonical_path)
            candidates.add(f"{method} {combined}")
            if "/content/api/" in combined:
                candidates.add(f"{method} {combined.replace('/content/api/', '/api/')}")
            if "/content/api/v4/" in combined:
                candidates.add(f"{method} {combined.replace('/content/api/v4/', '/api/v4/')}")
                candidates.add(f"{method} {combined.replace('/content/api/v4/', '/api/qdc/')}")
            if "/api/v4/" in combined:
                candidates.add(f"{method} {combined.replace('/api/v4/', '/api/qdc/')}")
        candidates.add(f"{method} {canonical_path}")
        title = extract_title(frontmatter)
        endpoints.append(
            DocEndpoint(
                file=doc_path,
                method=method,
                path=canonical_path,
                candidates=sorted(candidates),
                api=api_meta,
                title=title,
            )
        )
    LOGGER.info("Parsed %d documentation endpoints", len(endpoints))
    return endpoints


def build_candidate_index(docs: List[DocEndpoint]) -> Dict[str, List[DocEndpoint]]:
    index: Dict[str, List[DocEndpoint]] = {}
    for doc in docs:
        for key in doc.candidates:
            index.setdefault(key, []).append(doc)
    return index


def route_key(route: Dict[str, Any]) -> str:
    return f"{route['method']} {normalize_route_path(route['path'])}"


def match_routes_to_docs(
    routes: List[Dict[str, Any]],
    candidate_index: Dict[str, List[DocEndpoint]],
) -> Tuple[Dict[str, DocEndpoint], Dict[str, List[DocEndpoint]]]:
    matches: Dict[str, DocEndpoint] = {}
    ambiguities: Dict[str, List[DocEndpoint]] = {}
    for route in routes:
        key = route_key(route)
        options = candidate_index.get(key, [])
        if not options:
            continue
        chosen: Optional[DocEndpoint] = None
        preferred = [doc for doc in options if "/4.0.0/" not in doc.file.as_posix()]
        if len(options) == 1:
            chosen = options[0]
        elif len(preferred) == 1:
            chosen = preferred[0]
            ambiguities[key] = options
        elif preferred:
            chosen = preferred[0]
            ambiguities[key] = options
        else:
            chosen = options[0]
            ambiguities[key] = options
        matches[key] = chosen
    return matches, ambiguities


def simplify_parameters(params: Iterable[Dict[str, Any]]) -> Dict[Tuple[str, str], Dict[str, Any]]:
    simplified: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for param in params or []:
        name = param.get("name")
        location = param.get("in")
        if not name or not location:
            continue
        simplified[(location, name)] = param
    return simplified


def extract_doc_parameters(api_meta: Dict[str, Any]) -> Dict[Tuple[str, str], Dict[str, Any]]:
    return simplify_parameters(api_meta.get("parameters"))


def extract_schema_parameters(schema_entry: Optional[Dict[str, Any]]) -> Dict[Tuple[str, str], Dict[str, Any]]:
    if not schema_entry:
        return {}
    return simplify_parameters(schema_entry.get("parameters"))


def schema_has_example(schema_entry: Optional[Dict[str, Any]]) -> bool:
    if not schema_entry:
        return False
    for response in (schema_entry.get("responses") or {}).values():
        if isinstance(response, dict) and response.get("examples"):
            return True
    return False


def doc_has_example(api_meta: Dict[str, Any]) -> bool:
    responses = api_meta.get("responses")
    if not isinstance(responses, dict):
        return False
    response_200 = responses.get("200")
    if not isinstance(response_200, dict):
        return False
    content = response_200.get("content")
    if not isinstance(content, dict):
        return False
    for payload in content.values():
        if isinstance(payload, dict) and payload.get("example") is not None:
            return True
    return False


def build_param_gap_report(
    matches: Dict[str, DocEndpoint],
    route_lookup: Dict[str, Dict[str, Any]],
    schema_map: Dict[str, Dict[str, Any]],
) -> List[str]:
    lines: List[str] = [
        "# Parameter & Example Gaps",
        "",
        "Detected doc/code mismatches for matched endpoints.",
        "",
    ]
    issues_found = False
    for key in sorted(matches.keys()):
        doc = matches[key]
        route = route_lookup.get(key)
        schema_entry = schema_map.get(key)
        doc_params = extract_doc_parameters(doc.api)
        schema_params = extract_schema_parameters(schema_entry)
        missing_from_docs = sorted(set(schema_params.keys()) - set(doc_params.keys()))
        doc_only = sorted(set(doc_params.keys()) - set(schema_params.keys()))
        findings: List[str] = []
        if missing_from_docs:
            formatted = ", ".join(f"`{loc}:{name}`" for loc, name in missing_from_docs)
            findings.append(f"Missing parameters in docs: {formatted}")
        if doc_only:
            formatted = ", ".join(f"`{loc}:{name}`" for loc, name in doc_only)
            findings.append(f"Parameters documented but not inferred from code: {formatted}")
        if schema_has_example(schema_entry) and not doc_has_example(doc.api):
            findings.append("Doc lacks 200-example while schema metadata includes example payloads.")
        if not findings:
            continue
        issues_found = True
        lines.append(f"## {key}")
        lines.append(f"- Docs: `{doc.file.as_posix()}`")
        if route and route.get("defaults"):
            lines.append(f"- Route defaults: `{route['defaults']}`")
        for finding in findings:
            lines.append(f"- {finding}")
        lines.append("")
    if not issues_found:
        lines.append("All matched endpoints have aligned parameters/examples based on available metadata.")
        lines.append("")
    return lines


def _schema_fields(schema: Any, components: Dict[str, Any], visited: Optional[Set[str]] = None) -> Set[str]:
    if visited is None:
        visited = set()
    if not isinstance(schema, dict):
        return set()
    if "$ref" in schema:
        ref = schema["$ref"]
        name = ref.split("/")[-1]
        if name in visited:
            return set()
        visited.add(name)
        target = components.get(name)
        if not isinstance(target, dict):
            return set()
        return _schema_fields(target, components, visited)
    fields: Set[str] = set()
    if schema.get("properties"):
        for prop, prop_schema in schema["properties"].items():
            fields.add(prop)
            fields |= _schema_fields(prop_schema, components, visited)
    if schema.get("type") == "array":
        fields |= _schema_fields(schema.get("items"), components, visited)
    return fields


def build_response_mismatch_report(
    matches: Dict[str, DocEndpoint],
    schema_map: Dict[str, Dict[str, Any]],
    components: Dict[str, Any],
) -> List[str]:
    lines: List[str] = [
        "# Response Example Mismatches",
        "",
        "Comparing documented response schemas with extracted metadata.",
        "",
    ]
    issues_found = False
    component_schemas = components.get("schemas", {}) if isinstance(components, dict) else {}
    for key in sorted(matches.keys()):
        doc = matches[key]
        schema_entry = schema_map.get(key)
        if not schema_entry:
            continue
        schema_response = schema_entry.get("responses", {}).get("200")
        doc_response = doc.api.get("responses", {}).get("200") if isinstance(doc.api.get("responses"), dict) else None
        schema_schema = schema_response.get("schema") if isinstance(schema_response, dict) else None
        doc_schema = None
        if isinstance(doc_response, dict):
            content = doc_response.get("content")
            if isinstance(content, dict):
                for payload in content.values():
                    if isinstance(payload, dict) and payload.get("schema"):
                        doc_schema = payload["schema"]
                        break
        code_fields = _schema_fields(schema_schema, component_schemas)
        doc_fields = _schema_fields(doc_schema, component_schemas)
        missing = sorted(code_fields - doc_fields)
        extras = sorted(doc_fields - code_fields)
        if missing or extras:
            issues_found = True
            lines.append(f"## {key}")
            lines.append(f"- Docs: `{doc.file.as_posix()}`")
            if missing:
                lines.append(f"- Fields missing in docs: {', '.join(f'`{field}`' for field in missing)}")
            if extras:
                lines.append(f"- Doc-only fields not in schema metadata: {', '.join(f'`{field}`' for field in extras)}")
            lines.append("")
    if not issues_found:
        lines.append("No schema mismatches detected for matched endpoints.")
        lines.append("")
    return lines


def build_auth_rate_limit_report(
    matches: Dict[str, DocEndpoint],
    schema_map: Dict[str, Dict[str, Any]],
) -> List[str]:
    lines: List[str] = [
        "# Auth, Rate Limit & Error Code Gaps",
        "",
        "Focus on security scopes, rate limits, and documented error codes.",
        "",
    ]
    issues_found = False
    for key in sorted(matches.keys()):
        doc = matches[key]
        schema_entry = schema_map.get(key)
        schema_security = schema_entry.get("security") if schema_entry else None
        doc_security = doc.api.get("security")
        schema_errors = [
            status
            for status in (schema_entry.get("responses", {}) if schema_entry else {})
            if isinstance(status, str) and (status.startswith("4") or status.startswith("5"))
        ]
        doc_errors = [
            status
            for status in (doc.api.get("responses", {}) or {})
            if isinstance(status, str) and (status.startswith("4") or status.startswith("5"))
        ]
        findings: List[str] = []
        if schema_security and not doc_security:
            findings.append("Docs missing security section while code requires it.")
        if doc_security and not schema_security:
            findings.append("Docs mention security but none detected in schema metadata.")
        missing_errors = sorted(set(schema_errors) - set(doc_errors))
        if missing_errors:
            findings.append(f"Docs missing error responses: {', '.join(missing_errors)}")
        if findings:
            issues_found = True
            lines.append(f"## {key}")
            lines.append(f"- Docs: `{doc.file.as_posix()}`")
            for finding in findings:
                lines.append(f"- {finding}")
            lines.append("")
    if not issues_found:
        lines.append("No security/error response discrepancies identified.")
        lines.append("")
    return lines


def build_missing_route_report(unmatched_routes: List[Dict[str, Any]]) -> List[str]:
    lines: List[str] = ["# Endpoints Present in Code but Missing in Docs", ""]
    if not unmatched_routes:
        lines.append("All extracted routes have a matching doc entry.")
        lines.append("")
        return lines
    for route in sorted(unmatched_routes, key=lambda item: (item["method"], item["path"])):
        lines.append(
            f"- `{route['method']} {normalize_route_path(route['path'])}` "
            f"(controller: `{route.get('controller')}` source: `{route.get('source')}`)"
        )
    lines.append("")
    lines.append("> TODO: identify ownership and create doc stubs under appropriate sections.")
    lines.append("")
    return lines


def build_missing_code_report(unmatched_docs: List[DocEndpoint]) -> List[str]:
    lines: List[str] = ["# Doc Endpoints Without Matching Code", ""]
    if not unmatched_docs:
        lines.append("No documented endpoints without code backing were detected.")
        lines.append("")
        return lines
    for doc in sorted(unmatched_docs, key=lambda item: item.file.as_posix()):
        lines.append(
            f"- `{doc.method} {doc.path}` documented in `{doc.file.as_posix()}` but no matching route discovered."
        )
    lines.append("")
    lines.append("> TODO: confirm if endpoint was renamed, deprecated, or yet to be implemented.")
    lines.append("")
    return lines


def escape_pipe(value: str) -> str:
    return value.replace("|", "\\|")


def summarize_description(text: Optional[str]) -> str:
    if not text:
        return "TODO"
    shortened = textwrap.shorten(text.replace("\n", " "), width=80, placeholder="…")
    return escape_pipe(shortened)


def format_param_table(params: Iterable[Dict[str, Any]]) -> List[str]:
    rows = [
        "| Name | Location | Type | Required | Description |",
        "| ---- | -------- | ---- | -------- | ----------- |",
    ]
    has_row = False
    for param in params or []:
        name = escape_pipe(str(param.get("name", "")))
        location = escape_pipe(str(param.get("in", "")))
        schema = param.get("schema") or {}
        param_type = schema.get("type") or param.get("type") or "TODO"
        required = "yes" if param.get("required") else "no"
        description = summarize_description(param.get("description"))
        rows.append(f"| `{name}` | {location} | {param_type} | {required} | {description} |")
        has_row = True
    if not has_row:
        rows.append("| _none_ |  |  |  |  |")
    return rows


def safe_example_filename(path: str, method: str) -> str:
    if path == "/":
        path_key = "root"
    else:
        path_key = path.strip("/").replace("/", "__")
        path_key = re.sub(r"[^A-Za-z0-9._-]+", "_", path_key)
        if not path_key:
            path_key = "root"
    return f"{path_key}.{method.lower()}.json"


def load_example(example_dir: Path, method: str, path: str) -> Optional[str]:
    if not example_dir.exists():
        return None
    filename = safe_example_filename(path, method)
    example_path = example_dir / filename
    if not example_path.exists():
        return None
    return example_path.read_text(encoding="utf-8").strip()


def build_patch_content(
    route: Dict[str, Any],
    schema_entry: Optional[Dict[str, Any]],
    example_dir: Path,
) -> str:
    method = route["method"]
    path = normalize_route_path(route["path"])
    key = f"{method} {path}"
    schema_params = schema_entry.get("parameters", []) if schema_entry else []
    query_params = [param for param in schema_params if param.get("in") == "query"]
    path_params = [
        {"name": name, "in": "path", "required": True, "schema": {"type": "string"}, "description": "TODO"}
        for name in route.get("path_params", [])
    ]
    request_body_schema = None
    if schema_entry and schema_entry.get("requestBody"):
        json_payload = (
            schema_entry["requestBody"]
            .get("content", {})
            .get("application/json", {})
            .get("schema")
        )
        request_body_schema = json_payload or schema_entry["requestBody"].get("schema")
    example_payload = load_example(example_dir, method, path)
    error_codes = sorted(
        status
        for status in (schema_entry.get("responses", {}) if schema_entry else {})
        if status.startswith("4") or status.startswith("5")
    )

    lines: List[str] = []
    lines.append(f"<!-- PATCH:{key} -->")
    lines.append(f"### Patch Snippet for `{key}`")
    lines.append("")
    lines.append("#### Query Parameters")
    lines.extend(format_param_table(query_params))
    lines.append("")
    lines.append("#### Path Parameters")
    lines.extend(format_param_table(path_params))
    lines.append("")
    lines.append("#### Request Body")
    if request_body_schema:
        lines.append("```json")
        lines.append(json.dumps(request_body_schema, indent=2))
        lines.append("```")
    else:
        lines.append("```json")
        lines.append("/* TODO: document request body */")
        lines.append("```")
    lines.append("")
    lines.append("#### Response 200 Example")
    if example_payload:
        lines.append("```json")
        lines.append(example_payload)
        lines.append("```")
    else:
        lines.append("```json")
        lines.append("{")
        lines.append('  "message": "TODO: provide example"')
        lines.append("}")
        lines.append("```")
    lines.append("")
    lines.append("#### Common Errors")
    if error_codes:
        for status in error_codes:
            lines.append(f"- {status}: TODO describe error shape")
    else:
        lines.append("- TODO: enumerate error responses")
    lines.append("")
    lines.append(f"_Generated from `{route.get('source')}`_")
    lines.append("")
    return "\n".join(lines)


def write_patch_snippets(
    patch_dir: Path,
    unmatched_routes: List[Dict[str, Any]],
    schema_map: Dict[str, Dict[str, Any]],
    example_dir: Path,
) -> None:
    patch_dir.mkdir(parents=True, exist_ok=True)
    for route in unmatched_routes:
        key = route_key(route)
        schema_entry = schema_map.get(key)
        filename = safe_example_filename(route["path"], route["method"]).replace(".json", ".md")
        content = build_patch_content(route, schema_entry, example_dir)
        (patch_dir / filename).write_text(content, encoding="utf-8")
        LOGGER.info("Generated patch stub %s", (patch_dir / filename).as_posix())


def build_summary_report(
    unmatched_routes: List[Dict[str, Any]],
    unmatched_docs: List[DocEndpoint],
    param_gaps: List[str],
    response_gaps: List[str],
    auth_gaps: List[str],
) -> List[str]:
    lines: List[str] = ["# Summary Checklist", ""]
    if unmatched_routes:
        lines.append("## Code Coverage")
        for route in unmatched_routes:
            lines.append(
                f"- [ ] Add docs for `{route['method']} {normalize_route_path(route['path'])}` "
                f"(`{route.get('source')}`)"
            )
        lines.append("")
    if unmatched_docs:
        lines.append("## Docs Cleanup")
        for doc in unmatched_docs:
            lines.append(
                f"- [ ] Verify documented endpoint `{doc.method} {doc.path}` "
                f"(`{doc.file.as_posix()}`) still exists."
            )
        lines.append("")
    if len(param_gaps) > 4:
        lines.append("## Parameters & Examples")
        lines.append("- [ ] Address gaps listed in `03_param_schema_example_gaps.md`.")
        lines.append("")
    if len(response_gaps) > 4:
        lines.append("## Response Schemas")
        lines.append("- [ ] Align schema differences noted in `04_response_example_mismatches.md`.")
        lines.append("")
    if len(auth_gaps) > 4:
        lines.append("## Auth & Errors")
        lines.append("- [ ] Reconcile auth/error discrepancies in `05_auth_rate-limit_error-codes.md`.")
        lines.append("")
    if len(lines) == 2:
        lines.append("All checks passed; no outstanding discrepancies detected.")
        lines.append("")
    return lines


def write_report(out_dir: Path, name: str, lines: List[str]) -> None:
    out_path = out_dir / name
    out_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    LOGGER.info("Wrote %s", out_path)


def build_route_lookup(routes: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    lookup: Dict[str, Dict[str, Any]] = {}
    for route in routes:
        lookup[route_key(route)] = route
    return lookup


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Diff documentation against extracted API metadata."
    )
    parser.add_argument("--docs-root", required=True, type=Path)
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
    args.out.mkdir(parents=True, exist_ok=True)

    routes_payload = load_json(args.routes, "routes metadata")
    routes = routes_payload.get("endpoints", [])
    route_lookup = build_route_lookup(routes)
    schema_payload = load_json(args.schemas, "schema metadata")
    schema_map = schema_payload.get("endpoints", {})
    components = schema_payload.get("components", {})

    docs = generate_doc_endpoints(args.docs_root)
    candidate_index = build_candidate_index(docs)
    matches, ambiguities = match_routes_to_docs(routes, candidate_index)

    if ambiguities:
        LOGGER.warning(
            "Ambiguous doc matches detected: %s",
            {key: [doc.file.as_posix() for doc in docs] for key, docs in ambiguities.items()},
        )

    unmatched_routes = [route for route in routes if route_key(route) not in matches]
    matched_files = {doc.file for doc in matches.values()}
    unmatched_docs = [doc for doc in docs if doc.file not in matched_files]

    example_dir = args.out.parent / "generated" / "examples"
    patch_dir = args.out.parent / "generated" / "patches"
    write_patch_snippets(patch_dir, unmatched_routes, schema_map, example_dir)

    report_01 = build_missing_route_report(unmatched_routes)
    report_02 = build_missing_code_report(unmatched_docs)
    report_03 = build_param_gap_report(matches, route_lookup, schema_map)
    report_04 = build_response_mismatch_report(matches, schema_map, components)
    report_05 = build_auth_rate_limit_report(matches, schema_map)
    report_99 = build_summary_report(unmatched_routes, unmatched_docs, report_03, report_04, report_05)

    write_report(args.out, REPORT_NAMES[0], report_01)
    write_report(args.out, REPORT_NAMES[1], report_02)
    write_report(args.out, REPORT_NAMES[2], report_03)
    write_report(args.out, REPORT_NAMES[3], report_04)
    write_report(args.out, REPORT_NAMES[4], report_05)
    write_report(args.out, REPORT_NAMES[5], report_99)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
