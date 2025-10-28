"""End-to-end orchestration for the v4 API docs audit."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict

import yaml

import extract_code_endpoints
import extract_docs_endpoints
from checks import (
    check_incorrect_docs,
    check_missing_endpoints,
    check_missing_query_params,
    check_response_schemas,
)
from reporters.csv_reporter import write_csv
from reporters.markdown_reporter import write_markdown_report


def load_config(config_path: Path) -> dict:
    with config_path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    data["__config_dir__"] = config_path.parent
    return data


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the full v4 API docs audit.")
    parser.add_argument("--config", default=Path("config.yaml"), type=Path, help="Path to config.yaml")
    args = parser.parse_args()

    config = load_config(args.config)
    base_dir = Path(__file__).parent
    output_dir = (base_dir / config["report"]["output_dir"]).resolve()

    # Extraction phase
    implemented = extract_code_endpoints.extract(config)
    documented = extract_docs_endpoints.extract(config)

    extract_code_endpoints.write_output(implemented, output_dir / "implemented.json")
    extract_docs_endpoints.write_output(documented, output_dir / "documented.json")

    # Checks
    missing_endpoints = check_missing_endpoints.run(implemented, documented)
    missing_query_params = check_missing_query_params.run(implemented, documented)
    incorrect_docs = check_incorrect_docs.run(implemented, documented)
    missing_response_schemas = check_response_schemas.run(documented)

    # CSV reporting
    csv_locations: Dict[str, str] = {}
    csv_locations["missing_endpoints"] = write_csv(
        output_dir, "missing_endpoints.csv", ["method", "path", "hint_source_file", "suggested_docs_section"], missing_endpoints
    ).name
    csv_locations["missing_query_params"] = write_csv(
        output_dir, "missing_query_params.csv", ["method", "path", "param", "evidence_in_code", "notes"], missing_query_params
    ).name
    csv_locations["incorrect_docs"] = write_csv(
        output_dir,
        "incorrect_docs.csv",
        ["method", "path", "field", "code_value", "docs_value", "suggested_fix"],
        incorrect_docs,
    ).name
    csv_locations["missing_response_schemas"] = write_csv(
        output_dir, "missing_response_schemas.csv", ["method", "path", "missing", "docs_location_hint"], missing_response_schemas
    ).name

    # Extra audit insights
    extra_insights = build_extra_insights(implemented, documented, incorrect_docs)

    # Markdown report
    write_markdown_report(
        output_dir=output_dir,
        implemented_total=len(implemented),
        documented_total=len(documented),
        results={
            "missing_endpoints": missing_endpoints,
            "missing_query_params": missing_query_params,
            "incorrect_docs": incorrect_docs,
            "missing_response_schemas": missing_response_schemas,
        },
        csv_locations=csv_locations,
        extra_insights=extra_insights,
    )

    # Optional fail-fast for CI
    if config["report"].get("fail_on_any_issue") and any(
        [missing_endpoints, missing_query_params, incorrect_docs, missing_response_schemas]
    ):
        raise SystemExit("Audit detected issues. See outputs/ for detailed reports.")


def build_extra_insights(implemented: list[dict], documented: list[dict], incorrect_docs: list[dict]) -> Dict[str, list[str]]:
    implemented_index = {
        (
            entry.get("method"),
            entry.get("normalized_path"),
        ): entry
        for entry in implemented
    }
    documented_index = {
        (
            entry.get("method"),
            entry.get("normalized_path"),
        ): entry
        for entry in documented
    }

    naming_inconsistencies = [
        f"{item['method']} {item['path']} – `{item['field'].split('::', 1)[1]}` casing mismatch "
        f"(code {item['code_value']} vs docs {item['docs_value']})"
        for item in incorrect_docs
        if item.get("field", "").startswith("response_key::")
    ]

    enum_notes = []
    default_notes = []
    pagination_styles = []
    idempotency_notes = []

    for key, doc_entry in documented_index.items():
        impl_entry = implemented_index.get(key)
        # Enum audits
        for enum_detail in doc_entry.get("enum_details", []):
            name = enum_detail.get("name")
            enum_values = enum_detail.get("enum", [])
            evidence = ""
            if impl_entry:
                evidence_lines = []
                for param in impl_entry.get("query_params", []):
                    if param.get("name") == name:
                        evidence_lines.extend(param.get("evidence", []))
                evidence = "; ".join(evidence_lines)
            enum_notes.append(
                f"{key[0]} {key[1]} – verify enum `{name}` matches code values {enum_values} (code evidence: {evidence or 'none'})"
            )

        # Default audits
        for default_detail in doc_entry.get("default_details", []):
            name = default_detail.get("name")
            default_value = default_detail.get("default")
            evidence_match = False
            if impl_entry:
                for param in impl_entry.get("query_params", []):
                    if param.get("name") == name:
                        for evidence_line in param.get("evidence", []):
                            if str(default_value) in evidence_line:
                                evidence_match = True
                                break
            if not evidence_match:
                default_notes.append(
                    f"{key[0]} {key[1]} – default `{name}={default_value}` not confirmed via code evidence."
                )

        # Pagination style
        if doc_entry.get("pagination_hints"):
            param_names = [param.get("name") for param in doc_entry.get("query_params", [])]
            pagination_styles.append(
                f"{key[0]} {key[1]} – pagination params detected: {', '.join(param_names)}"
            )

        # Idempotency hints
        if impl_entry and any("idempotency" in note for note in impl_entry.get("notes", [])):
            doc_text = " ".join(filter(None, [doc_entry.get("summary", ""), doc_entry.get("description", "")])).lower()
            if "idempot" not in doc_text:
                idempotency_notes.append(f"{key[0]} {key[1]} – code hints at idempotency but docs lack guidance.")

    rate_limit_gaps = [
        f"{item['method']} {item['path']} – rate limiting detected in code but absent in docs."
        for item in incorrect_docs
        if item.get("field") == "rate_limit"
    ]
    error_envelope_gaps = [
        f"{item['method']} {item['path']} – document error envelope/format."
        for item in incorrect_docs
        if item.get("field") == "error_response"
    ]
    date_format_notes = [
        f"{item['method']} {item['path']} – provide date/time format in docs."
        for item in incorrect_docs
        if item.get("field") == "date_format"
    ]
    deprecation_flags = [
        f"{item['method']} {item['path']} – sync deprecation state (code: {item['code_value']}, docs: {item['docs_value']})."
        for item in incorrect_docs
        if item.get("field") == "deprecation"
    ]

    extra_insights = {
        "naming_inconsistencies": naming_inconsistencies,
        "enum_and_range_notes": enum_notes,
        "default_value_notes": default_notes,
        "rate_limit_gaps": rate_limit_gaps,
        "error_envelope_gaps": error_envelope_gaps,
        "date_time_format_notes": date_format_notes,
        "deprecation_flags": deprecation_flags,
        "idempotency_notes": idempotency_notes,
        "pagination_style": pagination_styles,
    }
    return extra_insights


if __name__ == "__main__":
    main()
