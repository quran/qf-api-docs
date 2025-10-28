"""Extract documented /api/v4 endpoints from OpenAPI or Markdown sources."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import yaml
from normalizers import (
    detect_case_style,
    filter_v4,
    normalize_http_method,
    normalize_param_name,
    normalize_path,
)


SUPPORTED_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}


@dataclass
class DocsEndpoint:
    method: str
    normalized_path: str
    source: str
    raw_path: str
    summary: str = ""
    description: str = ""
    query_params: Dict[str, dict] = field(default_factory=dict)
    header_params: Dict[str, dict] = field(default_factory=dict)
    status_codes: set = field(default_factory=set)
    has_response_schema: bool = False
    has_response_example: bool = False
    response_schema_refs: set = field(default_factory=set)
    response_example_keys: set = field(default_factory=set)
    requires_auth: bool = False
    deprecated: bool = False
    pagination_hints: set = field(default_factory=set)
    enum_details: list = field(default_factory=list)
    default_details: list = field(default_factory=list)
    rate_limit_hints: set = field(default_factory=set)
    error_envelope_hints: set = field(default_factory=set)
    notes: set = field(default_factory=set)


def resolve_repo_path(config_dir: Path, raw_path: str) -> Path:
    path = Path(raw_path)
    if not path.is_absolute():
        path = (config_dir / path).resolve()
    return path


def iter_files(root: Path, patterns: Iterable[str]) -> Iterable[Path]:
    seen = set()
    for pattern in patterns:
        for path in root.glob(pattern):
            if path.is_file():
                resolved = path.resolve()
                if resolved in seen:
                    continue
                seen.add(resolved)
                yield path


def load_yaml(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def ensure_docs_endpoint(endpoints: Dict[Tuple[str, str], DocsEndpoint], method: str, normalized: str, **kwargs) -> DocsEndpoint:
    key = (method, normalized)
    if key not in endpoints:
        endpoints[key] = DocsEndpoint(method=method, normalized_path=normalized, **kwargs)
    return endpoints[key]


def collect_example_keys(node) -> List[str]:
    keys = set()
    if isinstance(node, dict):
        for key, value in node.items():
            keys.add(key)
            keys.update(collect_example_keys(value))
    elif isinstance(node, list):
        for item in node:
            keys.update(collect_example_keys(item))
    return list(keys)


def process_openapi_file(
    file_path: Path,
    docs_root: Path,
    prefix: str,
    excluded: Iterable[str],
    endpoints: Dict[Tuple[str, str], DocsEndpoint],
) -> None:
    try:
        document = load_yaml(file_path)
    except Exception:
        return

    paths = document.get("paths", {})
    for raw_path, path_item in paths.items():
        normalized_path = normalize_path(raw_path)
        if not filter_v4(normalized_path, prefix, excluded):
            continue

        common_parameters = path_item.get("parameters", []) or []
        for method_name, operation in path_item.items():
            method = normalize_http_method(method_name)
            if method not in SUPPORTED_METHODS:
                continue

            normalized_method = normalize_http_method(method)
            endpoint = ensure_docs_endpoint(
                endpoints,
                normalized_method,
                normalized_path,
                raw_path=raw_path,
                source=f"{file_path.relative_to(docs_root)}:openapi",
            )

            endpoint.summary = operation.get("summary", endpoint.summary)
            endpoint.description = operation.get("description", endpoint.description)
            endpoint.requires_auth = bool(operation.get("security")) or endpoint.requires_auth
            endpoint.deprecated = bool(operation.get("deprecated")) or endpoint.deprecated

            all_params = list(common_parameters) + list(operation.get("parameters", []) or [])
            for param in all_params:
                name = normalize_param_name(param.get("name"))
                location = param.get("in")
                schema = param.get("schema", {}) or {}
                entry = {
                    "name": name,
                    "original_name": param.get("name", ""),
                    "in": location,
                    "required": bool(param.get("required")),
                    "type": schema.get("type"),
                    "format": schema.get("format"),
                    "description": param.get("description", ""),
                    "default": schema.get("default", param.get("default")),
                    "enum": schema.get("enum") or [],
                    "case_style": detect_case_style(param.get("name", "")),
                    "source": f"{file_path.relative_to(docs_root)}:openapi",
                }
                if entry["default"] is not None:
                    endpoint.default_details.append(
                        {"name": entry["name"], "default": entry["default"], "source": entry["source"]}
                    )
                if entry["enum"]:
                    endpoint.enum_details.append(
                        {
                            "name": entry["name"],
                            "enum": entry["enum"],
                            "source": entry["source"],
                        }
                    )
                if location == "query":
                    endpoint.query_params[name] = entry
                elif location == "header":
                    endpoint.header_params[name] = entry

                description_text = (param.get("description") or "").lower()
                if any(term in description_text for term in ("page", "cursor", "paginate", "offset", "limit")):
                    endpoint.pagination_hints.add("pagination-mentioned")

            responses = operation.get("responses", {}) or {}
            for status_code, response in responses.items():
                endpoint.status_codes.add(str(status_code))
                content = response.get("content") or {}
                for media, payload in content.items():
                    schema = payload.get("schema")
                    if schema:
                        endpoint.has_response_schema = True
                        if isinstance(schema, dict):
                            if "$ref" in schema:
                                endpoint.response_schema_refs.add(schema["$ref"])
                            elif "title" in schema:
                                endpoint.response_schema_refs.add(schema["title"])
                    example_node = payload.get("example")
                    if not example_node:
                        examples = payload.get("examples")
                        if isinstance(examples, dict):
                            example_node = next(iter(examples.values())).get("value")
                    if example_node:
                        endpoint.has_response_example = True
                        for key in collect_example_keys(example_node):
                            endpoint.response_example_keys.add(key)

            if "x-pagination" in operation or "x-pagination" in path_item:
                endpoint.pagination_hints.add("pagination-extension")

            if "x-rate-limit" in operation or "x-rate-limit" in path_item:
                endpoint.rate_limit_hints.add("rate-limit-extension")

            description_concat = " ".join(
                filter(None, [operation.get("description", ""), operation.get("summary", "")])
            ).lower()
            if "error" in description_concat:
                endpoint.error_envelope_hints.add("error-mentioned")


def parse_markdown_tables(section_lines: List[str]) -> List[List[str]]:
    rows: List[List[str]] = []
    for line in section_lines:
        if line.strip().startswith("|") and line.strip().endswith("|"):
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            rows.append(cells)
        elif rows:
            # break once we leave table block
            break
    return rows


def parse_param_table(rows: List[List[str]], keywords: Iterable[str]) -> Dict[str, dict]:
    if not rows or len(rows) < 2:
        return {}
    header = [cell.lower() for cell in rows[0]]
    keyword_positions = {}
    for keyword in keywords:
        for idx, column in enumerate(header):
            if keyword.lower() in column:
                keyword_positions[keyword.lower()] = idx
    if not keyword_positions:
        return {}
    entries: Dict[str, dict] = {}
    data_rows = rows[2:] if set(header) == set(["", "---"]) else rows[1:]
    for row in data_rows:
        if len(row) != len(header):
            continue
        name_idx = keyword_positions.get("parameter")
        if name_idx is None:
            continue
        raw_name = row[name_idx] if name_idx < len(row) else ""
        name = normalize_param_name(raw_name)
        if not name:
            continue
        entry = {
            "name": name,
            "original_name": raw_name,
            "required": False,
            "type": None,
            "description": "",
            "default": None,
            "enum": [],
            "case_style": detect_case_style(raw_name),
        }
        if "required" in keyword_positions:
            value = row[keyword_positions["required"]].lower()
            entry["required"] = value in {"yes", "true", "required", "y"}
        if "type" in keyword_positions:
            entry["type"] = row[keyword_positions["type"]]
        if "description" in keyword_positions:
            entry["description"] = row[keyword_positions["description"]]
        if "default" in keyword_positions:
            entry["default"] = row[keyword_positions["default"]] or None
        entries[name] = entry
    return entries


def process_markdown_file(
    file_path: Path,
    docs_root: Path,
    prefix: str,
    excluded: Iterable[str],
    heading_patterns: List[re.Pattern],
    table_keywords: Iterable[str],
    endpoints: Dict[Tuple[str, str], DocsEndpoint],
) -> None:
    text = file_path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()
    joined_text = "\n".join(lines)

    matches: List[Tuple[int, int, str, str]] = []
    for pattern in heading_patterns:
        for match in pattern.finditer(joined_text):
            if match.lastindex not in (2,):
                # Patterns may expose groups differently; handle both (method, path) and (path, method).
                if match.lastindex == 2:
                    method = match.group(1)
                    path = match.group(2)
                elif match.lastindex == 3:
                    method = match.group(2)
                    path = match.group(1)
                else:
                    continue
            else:
                method = match.group(1)
                path = match.group(2)
            matches.append((match.start(), match.end(), normalize_http_method(method), path))

    matches.sort()
    for idx, (start, end, method, raw_path) in enumerate(matches):
        normalized_path = normalize_path(raw_path)
        if not filter_v4(normalized_path, prefix, excluded):
            continue
        next_start = matches[idx + 1][0] if idx + 1 < len(matches) else len(joined_text)
        section_text = joined_text[end:next_start]
        section_lines = section_text.splitlines()

        line_number = joined_text.count("\n", 0, start) + 1
        endpoint = ensure_docs_endpoint(
            endpoints,
            method,
            normalized_path,
            raw_path=raw_path,
            source=f"{file_path.relative_to(docs_root)}:markdown:{line_number}",
        )

        header_rows = parse_markdown_tables(section_lines)
        table_entries = parse_param_table(header_rows, table_keywords)
        for name, entry in table_entries.items():
            entry["source"] = endpoint.source
            endpoint.query_params[name] = entry
            description_lower = (entry.get("description") or "").lower()
            if any(term in description_lower for term in ("page", "cursor", "offset", "limit")):
                endpoint.pagination_hints.add("pagination-mentioned")

        if any("schema" in line.lower() for line in section_lines):
            endpoint.has_response_schema = True
        if re.search(r"```(json|javascript)\s*{", section_text, re.I):
            endpoint.has_response_example = True
            code_blocks = re.findall(r"```(?:json|javascript)\s*(\{.*?\})\s*```", section_text, re.S | re.I)
            for block in code_blocks:
                try:
                    payload = json.loads(block)
                except json.JSONDecodeError:
                    continue
                for key in collect_example_keys(payload):
                    endpoint.response_example_keys.add(key)

        if "authorization" in section_text.lower():
            endpoint.requires_auth = True
        if "deprecated" in section_text.lower():
            endpoint.deprecated = True
        if "rate limit" in section_text.lower():
            endpoint.rate_limit_hints.add("rate-limit-mentioned")
        if "error" in section_text.lower():
            endpoint.error_envelope_hints.add("error-mentioned")


def extract(config: dict) -> List[dict]:
    config_dir = Path(config.get("__config_dir__", "."))
    docs_repo_path = resolve_repo_path(config_dir, config["docs_repo_path"])
    prefix = config["api_version"]["prefix"]
    excluded = config["api_version"].get("exclude_path_contains", [])

    endpoints: Dict[Tuple[str, str], DocsEndpoint] = {}

    openapi_files = list(iter_files(docs_repo_path, config["docs"].get("openapi_globs", [])))
    if openapi_files:
        for openapi_file in openapi_files:
            process_openapi_file(openapi_file, docs_repo_path, prefix, excluded, endpoints)

    if not endpoints:
        heading_patterns = [re.compile(pattern, re.MULTILINE) for pattern in config["docs"]["endpoint_heading_patterns"]]
        process_markdown = True
    else:
        heading_patterns = []
        process_markdown = False

    if process_markdown:
        markdown_files = list(iter_files(docs_repo_path, config["docs"].get("markdown_globs", [])))
        for md_file in markdown_files:
            process_markdown_file(
                file_path=md_file,
                docs_root=docs_repo_path,
                prefix=prefix,
                excluded=excluded,
                heading_patterns=heading_patterns,
                table_keywords=config["docs"]["param_table_header_keywords"],
                endpoints=endpoints,
            )

    output = []
    for endpoint in endpoints.values():
        output.append(
            {
                "method": endpoint.method,
                "normalized_path": normalize_path(endpoint.normalized_path),
                "raw_path": endpoint.raw_path,
                "source": endpoint.source,
                "summary": endpoint.summary,
                "description": endpoint.description,
                "query_params": sorted(endpoint.query_params.values(), key=lambda item: item["name"]),
                "header_params": sorted(endpoint.header_params.values(), key=lambda item: item["name"]),
                "status_codes": sorted(endpoint.status_codes),
                "has_response_schema": bool(endpoint.has_response_schema),
                "has_response_example": bool(endpoint.has_response_example),
                "response_schema_refs": sorted(endpoint.response_schema_refs),
                "response_example_keys": sorted(endpoint.response_example_keys),
                "requires_auth": bool(endpoint.requires_auth),
                "deprecated": bool(endpoint.deprecated),
                "pagination_hints": sorted(endpoint.pagination_hints),
                "enum_details": endpoint.enum_details,
                "default_details": endpoint.default_details,
                "rate_limit_hints": sorted(endpoint.rate_limit_hints),
                "error_envelope_hints": sorted(endpoint.error_envelope_hints),
                "notes": sorted(endpoint.notes),
            }
        )

    output.sort(key=lambda item: (item["normalized_path"], item["method"]))
    return output


def write_output(records: List[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(records, handle, indent=2, ensure_ascii=False)


def main(config_path: Path, output_path: Path) -> None:
    config = load_yaml(config_path)
    config["__config_dir__"] = config_path.parent
    records = extract(config)
    write_output(records, output_path)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract documented /api/v4 endpoints.")
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument(
        "--output",
        default=Path("outputs/documented.json"),
        type=Path,
        help="Destination JSON file. Defaults to outputs/documented.json",
    )
    args = parser.parse_args()
    main(args.config, args.output)
