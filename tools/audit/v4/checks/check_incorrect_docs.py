"""Compare documented endpoints against implementation details to highlight discrepancies."""

from __future__ import annotations

from typing import Dict, Iterable, List, Tuple

from normalizers import detect_case_style, normalize_http_method, normalize_param_name, normalize_path


def _endpoint_key(entry: dict) -> Tuple[str, str]:
    return normalize_http_method(entry.get("method")), normalize_path(entry.get("normalized_path") or entry.get("path"))


def _response_key_styles(hints: Iterable[str]) -> Dict[str, str]:
    output: Dict[str, str] = {}
    for hint in hints or []:
        if ":" in hint:
            key, style = hint.split(":", 1)
            output[key] = style
        else:
            output[hint] = "unknown"
    return output


def run(implemented: Iterable[dict], documented: Iterable[dict]) -> List[dict]:
    implemented_index: Dict[Tuple[str, str], dict] = {_endpoint_key(item): item for item in implemented}
    documented_index: Dict[Tuple[str, str], dict] = {_endpoint_key(item): item for item in documented}

    issues: List[dict] = []
    shared_keys = sorted(set(implemented_index) & set(documented_index))

    for key in shared_keys:
        impl = implemented_index[key]
        doc = documented_index[key]

        # Authorization / auth headers
        impl_headers = {normalize_param_name(header): header for header in impl.get("required_headers", [])}
        doc_headers = {
            normalize_param_name(param.get("name")): param for param in doc.get("header_params", [])
        }

        if impl.get("requires_auth") and not doc.get("requires_auth"):
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "auth_required",
                    "code_value": "Authorization enforced in code",
                    "docs_value": "Not documented",
                    "suggested_fix": "Document authentication requirement for this endpoint.",
                }
            )

        auth_header_present = any(name in doc_headers for name in ("authorization", "bearer"))
        if doc.get("requires_auth") and not impl.get("requires_auth") and not auth_header_present:
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "auth_required",
                    "code_value": "No auth enforcement detected",
                    "docs_value": "Docs claim authentication required",
                    "suggested_fix": "Verify authentication requirement or adjust docs.",
                }
            )

        for required_header in impl_headers:
            if required_header not in doc_headers and required_header not in ("authorization", "bearer"):
                issues.append(
                    {
                        "method": key[0],
                        "path": key[1],
                        "field": "required_header",
                        "code_value": impl_headers[required_header],
                        "docs_value": "Header missing",
                        "suggested_fix": f"Document required header `{impl_headers[required_header]}`.",
                    }
                )

        # Status code coverage
        impl_status = {str(code) for code in impl.get("status_codes", []) if code}
        doc_status = {str(code) for code in doc.get("status_codes", []) if code}
        missing_status = sorted(impl_status - doc_status)
        extra_status = sorted(doc_status - impl_status)
        if missing_status:
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "status_codes",
                    "code_value": ", ".join(missing_status),
                    "docs_value": "Missing",
                    "suggested_fix": "Add status code(s) to documentation.",
                }
            )
        if extra_status:
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "status_codes",
                    "code_value": "Not implemented",
                    "docs_value": ", ".join(extra_status),
                    "suggested_fix": "Confirm codes or prune stale documentation entries.",
                }
            )

        # Pagination coverage
        impl_pagination = bool(impl.get("pagination"))
        doc_pagination = bool(doc.get("pagination_hints"))
        if impl_pagination and not doc_pagination:
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "pagination",
                    "code_value": "Pagination parameters detected",
                    "docs_value": "Not documented",
                    "suggested_fix": "Document pagination params and usage.",
                }
            )
        if doc_pagination and not impl_pagination:
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "pagination",
                    "code_value": "No pagination evidence in code",
                    "docs_value": "Docs mention pagination",
                    "suggested_fix": "Verify pagination behaviour or adjust docs.",
                }
            )

        # Deprecation discrepancies
        if impl.get("deprecated") and not doc.get("deprecated"):
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "deprecation",
                    "code_value": "Deprecated in code",
                    "docs_value": "Active",
                    "suggested_fix": "Surface deprecation notice in docs.",
                }
            )
        if doc.get("deprecated") and not impl.get("deprecated"):
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "deprecation",
                    "code_value": "Active in code",
                    "docs_value": "Deprecated",
                    "suggested_fix": "Verify deprecation status or update code comments.",
                }
            )

        # Response naming convention comparison
        code_key_styles = _response_key_styles(impl.get("response_key_hints", []))
        doc_key_styles = {key: detect_case_style(key) for key in doc.get("response_example_keys", [])}

        for key_name, code_style in code_key_styles.items():
            doc_style = doc_key_styles.get(key_name)
            if doc_style and doc_style != code_style:
                issues.append(
                    {
                        "method": key[0],
                        "path": key[1],
                        "field": f"response_key::{key_name}",
                        "code_value": code_style,
                        "docs_value": doc_style,
                        "suggested_fix": f"Align response key casing for `{key_name}`.",
                    }
                )

        # Serializer vs schema hints
        if impl.get("serializer_hints") and not doc.get("has_response_schema"):
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "response_schema",
                    "code_value": ", ".join(impl.get("serializer_hints", [])),
                    "docs_value": "Schema missing",
                    "suggested_fix": "Add schema or link to serializer fields.",
                }
            )

        # Rate limits and throttling
        if impl.get("rate_limit_hints") and not doc.get("rate_limit_hints"):
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "rate_limit",
                    "code_value": "Rate limiting logic detected",
                    "docs_value": "No rate limit mention",
                    "suggested_fix": "Document rate limit or throttling behaviour.",
                }
            )

        # Error envelope expectations
        if impl.get("error_envelope_hints") and not doc.get("error_envelope_hints"):
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "error_response",
                    "code_value": "Error envelope in code",
                    "docs_value": "No error format documented",
                    "suggested_fix": "Document error response envelope/examples.",
                }
            )

        if impl.get("date_format_hints") and not doc.get("response_example_keys"):
            issues.append(
                {
                    "method": key[0],
                    "path": key[1],
                    "field": "date_format",
                    "code_value": "Date/time formatting detected in code",
                    "docs_value": "No example highlighting format",
                    "suggested_fix": "Document date/time format expectations.",
                }
            )

    return issues
