"""Utility helpers for normalising API metadata prior to comparison."""

from __future__ import annotations

import re
from typing import Iterable


PATH_CLEANER = re.compile(r"{\s*([^}]+?)\s*}")
PATH_PARAM_VARIANTS = [
    (re.compile(r":([A-Za-z0-9_]+)"), r"{\1}"),
    (re.compile(r"<([A-Za-z0-9_]+)>"), r"{\1}"),
    (re.compile(r"\{([A-Za-z0-9_]+)\?\}"), r"{\1}"),
    (re.compile(r"%\{([A-Za-z0-9_]+)\}"), r"{\1}"),
]
MULTISLASH = re.compile(r"/{2,}")


def normalize_http_method(method: str | None) -> str:
    """Return HTTP methods in canonical upper-case form."""
    if not method:
        return ""
    return method.strip().upper()


def normalize_path(path: str | None) -> str:
    """Ensure path placeholders follow `{name}` style and no trailing slash."""
    if not path:
        return ""

    value = path.strip().strip('"').strip("'")
    if not value.startswith("/"):
        value = f"/{value}"

    for pattern, replacement in PATH_PARAM_VARIANTS:
        value = pattern.sub(r"{\1}", value)

    value = MULTISLASH.sub("/", value)

    if value.endswith("/") and value != "/":
        value = value[:-1]

    value = PATH_CLEANER.sub(lambda match: "{" + match.group(1).strip() + "}", value)
    return value


def normalize_param_name(name: str | None) -> str:
    """Stick to snake_case for comparisons."""
    if not name:
        return ""
    cleaned = name.strip()
    cleaned = cleaned.replace("-", "_")
    return cleaned.lower()


def normalize_header_name(name: str | None) -> str:
    """Normalise header names for reliable comparisons."""
    if not name:
        return ""
    cleaned = "-".join(part.capitalize() for part in name.strip().split("-"))
    return cleaned


def filter_v4(path: str, prefix: str, excluded_terms: Iterable[str]) -> bool:
    """Return True if the path should be included in the v4 audit."""
    candidate = path or ""
    if prefix and not candidate.startswith(prefix):
        return False
    for term in excluded_terms:
        if term and term in candidate:
            return False
    return True


def detect_case_style(identifier: str) -> str:
    """Classify identifier naming convention for reporting."""
    if not identifier:
        return "unknown"
    if "-" in identifier:
        return "kebab"
    if "_" in identifier:
        return "snake"
    if identifier[:1].lower() == identifier[:1] and any(ch.isupper() for ch in identifier):
        return "camel"
    if identifier[:1].isupper() and any(ch.islower() for ch in identifier[1:]):
        return "pascal"
    if identifier.isupper():
        return "screaming"
    return "other"
