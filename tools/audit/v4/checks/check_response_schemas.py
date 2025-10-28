"""Verify documented endpoints include both schema references and response examples."""

from __future__ import annotations

from typing import Iterable, List

from normalizers import normalize_http_method, normalize_path


def run(documented: Iterable[dict]) -> List[dict]:
    results: List[dict] = []
    for entry in documented:
        missing = []
        if not entry.get("has_response_schema"):
            missing.append("schema")
        if not entry.get("has_response_example"):
            missing.append("example")

        if missing:
            results.append(
                {
                    "method": normalize_http_method(entry.get("method")),
                    "path": normalize_path(entry.get("normalized_path") or entry.get("path")),
                    "missing": missing,
                    "docs_location_hint": entry.get("source", ""),
                }
            )
    return results
