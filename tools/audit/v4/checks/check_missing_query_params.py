"""Check for mismatches between implemented and documented query parameters."""

from __future__ import annotations

from typing import Dict, Iterable, List, Tuple

from normalizers import normalize_http_method, normalize_param_name, normalize_path


def _endpoint_key(entry: dict) -> Tuple[str, str]:
    return normalize_http_method(entry.get("method")), normalize_path(entry.get("normalized_path") or entry.get("path"))


def run(implemented: Iterable[dict], documented: Iterable[dict]) -> List[dict]:
    implemented_index: Dict[Tuple[str, str], dict] = {_endpoint_key(entry): entry for entry in implemented}
    documented_index: Dict[Tuple[str, str], dict] = {_endpoint_key(entry): entry for entry in documented}

    results: List[dict] = []

    shared_keys = sorted(set(implemented_index) & set(documented_index))
    for key in shared_keys:
        implementation = implemented_index[key]
        documentation = documented_index[key]

        impl_params = {
            normalize_param_name(item.get("name")): item for item in implementation.get("query_params", [])
        }
        doc_params = {
            normalize_param_name(item.get("name")): item for item in documentation.get("query_params", [])
        }

        impl_only = sorted(set(impl_params) - set(doc_params))
        doc_only = sorted(set(doc_params) - set(impl_params))

        for name in impl_only:
            evidence = impl_params[name].get("evidence", [])
            results.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "param": name,
                    "evidence_in_code": "; ".join(evidence),
                    "notes": "Not documented",
                }
            )

        for name in doc_only:
            results.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "param": name,
                    "evidence_in_code": "",
                    "notes": "Documented but not detected in code",
                }
            )

    return results
