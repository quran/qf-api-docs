"""Identify implemented endpoints that are missing from the documentation."""

from __future__ import annotations

from typing import Iterable, List, Tuple

from normalizers import normalize_http_method, normalize_path


def _endpoint_key(entry: dict) -> Tuple[str, str]:
    return normalize_http_method(entry.get("method")), normalize_path(entry.get("normalized_path") or entry.get("path"))


def run(implemented: Iterable[dict], documented: Iterable[dict]) -> List[dict]:
    documented_keys = {_endpoint_key(entry) for entry in documented}
    results: List[dict] = []

    for endpoint in implemented:
        key = _endpoint_key(endpoint)
        if key in documented_keys:
            continue

        source_location = next(iter(endpoint.get("source_locations", [])), "")
        normalized_path = normalize_path(endpoint.get("normalized_path") or endpoint.get("path"))
        suggested_section = _suggest_docs_section(normalized_path)
        results.append(
            {
                "method": key[0],
                "path": normalized_path,
                "hint_source_file": source_location,
                "suggested_docs_section": suggested_section,
            }
        )
    return results


def _suggest_docs_section(path: str) -> str:
    segments = [segment for segment in path.split("/") if segment]
    if len(segments) <= 2:
        return path
    return "/" + "/".join(segments[:3])
