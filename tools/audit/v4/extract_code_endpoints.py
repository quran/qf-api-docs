"""Extract implemented /api/v4 endpoints and associated metadata from the code repo."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import yaml

from normalizers import (
    detect_case_style,
    filter_v4,
    normalize_header_name,
    normalize_http_method,
    normalize_param_name,
    normalize_path,
)


EndpointKey = Tuple[str, str]


@dataclass
class EndpointRecord:
    """Mutable container used during extraction prior to JSON serialisation."""

    method: str
    normalized_path: str
    raw_paths: set = field(default_factory=set)
    source_locations: set = field(default_factory=set)
    query_params: Dict[str, set] = field(default_factory=lambda: defaultdict(set))
    required_headers: set = field(default_factory=set)
    status_codes: set = field(default_factory=set)
    pagination: bool = False
    serializer_hints: set = field(default_factory=set)
    response_key_hints: set = field(default_factory=set)
    requires_auth: bool = False
    deprecated: bool = False
    rate_limit_hints: set = field(default_factory=set)
    error_envelope_hints: set = field(default_factory=set)
    date_format_hints: set = field(default_factory=set)
    notes: set = field(default_factory=set)


def load_config(config_path: Path) -> dict:
    """Read yaml config and return a dictionary."""
    with config_path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def resolve_repo_path(config_dir: Path, raw_path: str) -> Path:
    """Resolve repo path relative to config file."""
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = (config_dir / candidate).resolve()
    return candidate


def compile_param_hints(patterns: Iterable[str]) -> List[re.Pattern]:
    compiled = []
    for pattern in patterns:
        try:
            compiled.append(re.compile(pattern))
        except re.error:
            continue
    return compiled


ENDPOINT_PATTERNS: List[Tuple[str, re.Pattern, Tuple[int, int]]] = [
    (
        "express_router",
        re.compile(r"\brouter\.(get|post|put|patch|delete|options|head)\s*\(\s*['\"](/api/v4/[^'\"]+)", re.I),
        (1, 2),
    ),
    (
        "express_app",
        re.compile(r"\bapp\.(get|post|put|patch|delete|options|head)\s*\(\s*['\"](/api/v4/[^'\"]+)", re.I),
        (1, 2),
    ),
    (
        "fastapi_decorator",
        re.compile(r"@[\w\.]*\.(get|post|put|patch|delete)\s*\(\s*['\"](/api/v4/[^'\"]+)", re.I),
        (1, 2),
    ),
    (
        "flask_route",
        re.compile(
            r"@[\w\.]*route\(\s*['\"](/api/v4/[^'\"]+)['\"]\s*,\s*methods\s*=\s*\[\s*['\"](GET|POST|PUT|PATCH|DELETE)['\"]",
            re.I,
        ),
        (2, 1),
    ),
    (
        "go_router",
        re.compile(r"\.?(GET|POST|PUT|PATCH|DELETE)\s*\(\s*['\"](/api/v4/[^'\"]+)", re.I),
        (1, 2),
    ),
    (
        "rails_route",
        re.compile(r"\b(get|post|put|patch|delete)\s+['\"](/api/v4/[^'\"]+)", re.I),
        (1, 2),
    ),
]

QUERY_KEY_PATTERN = re.compile(r"['\"]([A-Za-z0-9_]+)['\"]\s*:")
STATUS_CODE_PATTERN = re.compile(r"\bstatus(?:_code)?\s*[:=]\s*(\d{3})")
PAGINATION_TERMS = {"page", "pages", "per_page", "limit", "offset", "cursor", "paginate"}
SERIALIZER_PATTERN = re.compile(r"([A-Za-z0-9_]+Serializer)")
AUTH_PATTERN = re.compile(r"Authorization", re.I)
DEPRECATED_PATTERN = re.compile(r"deprecated", re.I)
RATE_LIMIT_PATTERN = re.compile(r"(rate[_-]?limit|throttl)", re.I)
ERROR_ENVELOPE_PATTERN = re.compile(r'"(error|errors)"\s*:')
DATE_FORMAT_PATTERN = re.compile(r"(iso-?8601|strftime|\bDate\.|Time\.zone)", re.I)


def iter_files(root: Path, glob_patterns: Iterable[str]) -> Iterable[Path]:
    """Yield unique files that match provided glob patterns."""
    seen = set()
    for pattern in glob_patterns:
        for path in root.glob(pattern):
            if path.is_file():
                try:
                    stat_key = path.resolve()
                except OSError:
                    stat_key = path
                if stat_key in seen:
                    continue
                seen.add(stat_key)
                yield path


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1", errors="ignore")


def gather_context(lines: List[str], line_number: int, window: int = 40) -> str:
    start = max(0, line_number - 6)
    end = min(len(lines), line_number + window)
    return "\n".join(lines[start:end])


def add_query_params(record: EndpointRecord, context: str, hint_patterns: List[re.Pattern], location: str) -> None:
    for pattern in hint_patterns:
        for match in pattern.finditer(context):
            group_count = len(match.groups())
            param_name = ""
            if group_count >= 1:
                param_name = match.group(1)
            elif match.group(0):
                param_name = match.group(0)
            if not param_name:
                continue
            normalised = normalize_param_name(param_name)
            if not normalised:
                continue
            record.query_params[normalised].add(location)


def add_headers(record: EndpointRecord, context: str) -> None:
    if AUTH_PATTERN.search(context):
        record.required_headers.add(normalize_header_name("Authorization"))
        record.requires_auth = True
    for header in re.findall(r"['\"](X-[A-Za-z0-9\-]+)['\"]", context):
        record.required_headers.add(normalize_header_name(header))


def add_status_codes(record: EndpointRecord, context: str) -> None:
    for status in STATUS_CODE_PATTERN.findall(context):
        record.status_codes.add(status)
    render_matches = re.findall(r"render\s+status:\s*(\d{3})", context)
    for status in render_matches:
        record.status_codes.add(status)


def add_misc_hints(record: EndpointRecord, context: str) -> None:
    lowered = context.lower()
    if any(term in lowered for term in PAGINATION_TERMS):
        record.pagination = True
    for serializer in SERIALIZER_PATTERN.findall(context):
        record.serializer_hints.add(serializer)
    for key in QUERY_KEY_PATTERN.findall(context):
        case_style = detect_case_style(key)
        record.response_key_hints.add(f"{key}:{case_style}")
    if RATE_LIMIT_PATTERN.search(context):
        record.rate_limit_hints.add("rate_limit_detected")
    if ERROR_ENVELOPE_PATTERN.search(context):
        record.error_envelope_hints.add("error_payload_detected")
    if DATE_FORMAT_PATTERN.search(context):
        record.date_format_hints.add("date_format_detected")
    if DEPRECATED_PATTERN.search(context):
        record.deprecated = True
    if "idempotent" in lowered or "idempotency" in lowered:
        record.notes.add("idempotency-noted-in-code")


def extract_endpoints_from_file(
    file_path: Path,
    repo_root: Path,
    prefix: str,
    excluded: Iterable[str],
    param_hint_patterns: List[re.Pattern],
    endpoints: Dict[EndpointKey, EndpointRecord],
) -> None:
    text = read_text(file_path)
    lines = text.splitlines()

    for pattern_name, pattern, group_indexes in ENDPOINT_PATTERNS:
        for match in pattern.finditer(text):
            method = match.group(group_indexes[0])
            raw_path = match.group(group_indexes[1])
            method = normalize_http_method(method)
            normalized = normalize_path(raw_path)
            if not filter_v4(normalized, prefix, excluded):
                continue

            line_number = text.count("\n", 0, match.start()) + 1
            context = gather_context(lines, line_number)
            location = f"{file_path.relative_to(repo_root)}:{line_number}"

            key = (method, normalized)
            record = endpoints.get(key)
            if not record:
                record = EndpointRecord(method=method, normalized_path=normalized)
                endpoints[key] = record

            record.raw_paths.add(normalized if raw_path is None else raw_path)
            record.source_locations.add(location)
            record.notes.add(f"detected_via:{pattern_name}")

            add_query_params(record, context, param_hint_patterns, location)
            add_headers(record, context)
            add_status_codes(record, context)
            add_misc_hints(record, context)


def serialise_records(endpoints: Dict[EndpointKey, EndpointRecord]) -> List[dict]:
    output: List[dict] = []
    for record in endpoints.values():
        query_params = [
            {"name": name, "evidence": sorted(evidence)} for name, evidence in record.query_params.items()
        ]
        query_params.sort(key=lambda item: item["name"])

        output.append(
            {
                "method": record.method,
                "normalized_path": normalize_path(record.normalized_path),
                "raw_paths": sorted(normalize_path(path) for path in record.raw_paths),
                "source_locations": sorted(record.source_locations),
                "query_params": query_params,
                "required_headers": sorted(record.required_headers),
                "status_codes": sorted(record.status_codes),
                "pagination": bool(record.pagination),
                "serializer_hints": sorted(record.serializer_hints),
                "response_key_hints": sorted(record.response_key_hints),
                "requires_auth": bool(record.requires_auth),
                "deprecated": bool(record.deprecated),
                "rate_limit_hints": sorted(record.rate_limit_hints),
                "error_envelope_hints": sorted(record.error_envelope_hints),
                "date_format_hints": sorted(record.date_format_hints),
                "notes": sorted(record.notes),
            }
        )
    output.sort(key=lambda item: (item["normalized_path"], item["method"]))
    return output


def extract(config: dict) -> List[dict]:
    """Entry point used by run_all.py."""
    config_dir = Path(config.get("__config_dir__", "."))
    code_repo_path = resolve_repo_path(config_dir, config["code_repo_path"])
    prefix = config["api_version"]["prefix"]
    excluded = config["api_version"].get("exclude_path_contains", [])
    glob_patterns = config["code"]["route_file_globs"]

    endpoints: Dict[EndpointKey, EndpointRecord] = {}
    param_hint_patterns = compile_param_hints(config["code"].get("param_parse_hints", []))

    for file_path in iter_files(code_repo_path, glob_patterns):
        try:
            extract_endpoints_from_file(
                file_path=file_path,
                repo_root=code_repo_path,
                prefix=prefix,
                excluded=excluded,
                param_hint_patterns=param_hint_patterns,
                endpoints=endpoints,
            )
        except (OSError, UnicodeDecodeError):
            continue

    return serialise_records(endpoints)


def write_output(records: List[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(records, handle, indent=2, ensure_ascii=False)


def main(config_path: Path, output_path: Path) -> None:
    config = load_config(config_path)
    config["__config_dir__"] = config_path.parent
    records = extract(config)
    write_output(records, output_path)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract implemented /api/v4 endpoints from the code repository.")
    parser.add_argument("--config", required=True, type=Path, help="Path to config.yaml")
    parser.add_argument(
        "--output",
        default=Path("outputs/implemented.json"),
        type=Path,
        help="Destination JSON file. Defaults to outputs/implemented.json",
    )
    args = parser.parse_args()
    main(args.config, args.output)
