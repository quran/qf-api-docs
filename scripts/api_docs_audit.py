#!/usr/bin/env python3
"""API <-> Docs Consistency Audit helper.

This script compares the Quran.com API source specification (Swagger 2.0 stored
in the code repository) against the documentation OpenAPI 3.x specification in
the docs repository. It produces structured discrepancy data and derived
artefacts required by the audit request.
"""

from __future__ import annotations

import argparse
import copy
import json
import difflib
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import yaml


HTTP_METHODS = {"get", "post", "put", "patch", "delete", "options", "head"}
TOKEN_REPLACEMENTS: Dict[str, str] = {
    "#endpoint:ZQvDmxKn7fQwLrAfy": "See `GET /audio/qaris` for the reciter list.",
    "#endpoint:HLbauN2sdGitPQPPL": "See `GET /resources/recitations` for the full list of recitations.",
    "#endpoint:8rjMCZEyPEZMHAKz9": "[/resources/languages](/docs/content_apis_versioned/languages)",
    "#endpoint:EZsWyDnekGaDKaCpt": "[/resources/languages](/docs/content_apis_versioned/languages)",
    "#endpoint:N4JAF8phDshhyrBHs": "[/resources/translations](/docs/content_apis_versioned/translations)",
    "#endpoint:5YnxJJGPMCLnM6PNE": "[/resources/tafsirs](/docs/content_apis_versioned/tafsirs)",
}


@dataclass
class Operation:
    path: str
    method: str
    source_file: Path
    line: Optional[int]
    raw: Dict[str, Any]
    parameters: Dict[Tuple[str, str], Dict[str, Any]]
    responses: Dict[str, Dict[str, Any]]
    security: List[Any]
    description: str
    summary: str


@dataclass
class RouteDef:
    method: str
    path: str
    line: int


def read_lines(path: Path) -> List[str]:
    return path.read_text(encoding="utf-8").splitlines()


def find_line(lines: List[str], needle: str, start: int = 0) -> Optional[int]:
    for idx in range(start, len(lines)):
        if needle in lines[idx]:
            return idx + 1
    return None


def format_location(path: Optional[Path], line: Optional[int]) -> Optional[str]:
    if path is None:
        return None
    rel = Path(os.path.relpath(path, Path.cwd()))
    return f"{rel.as_posix()}:{line if line is not None else '?'}"


def path_signature(path: str) -> str:
    stripped = path.strip("/")
    if not stripped:
        return "/"
    parts = []
    for segment in stripped.split("/"):
        if segment.startswith("{") and segment.endswith("}"):
            parts.append("{}")
        else:
            parts.append(segment)
    return "/" + "/".join(parts)


def extract_routes_from_file(path: Path) -> List[RouteDef]:
    routes: List[RouteDef] = []

    def normalize_token(token: str) -> str:
        token = token.strip()
        if token.startswith(("'", '"')) and token.endswith(("'", '"')):
            token = token[1:-1]
        elif token.startswith(":"):
            token = token[1:]
        if token == "v4":
            return ""
        return token

    def split_segments(component: str) -> List[str]:
        if component in ("", "/", None):
            return []
        return [seg for seg in component.split("/") if seg]

    def convert_segment(segment: str) -> str:
        if segment.startswith(":"):
            return "{" + segment[1:] + "}"
        return segment

    def build_path(prefix_parts: List[str], leaf: str) -> str:
        segments: List[str] = []
        for part in prefix_parts:
            segments.extend(split_segments(part))
        segments.extend(split_segments(leaf))
        if not segments:
            return "/"
        return "/" + "/".join(convert_segment(seg) for seg in segments)

    prefix_stack: List[str] = []
    for lineno, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line == "end":
            if prefix_stack:
                prefix_stack.pop()
            continue
        ns_match = re.match(r"namespace\s+(:\w+|['\"][^'\"]+['\"])", line)
        if ns_match and line.endswith("do"):
            token = normalize_token(ns_match.group(1))
            prefix_stack.append(token)
            continue
        scope_match = re.match(r"scope\s+(:\w+|['\"][^'\"]+['\"])", line)
        if scope_match and line.endswith("do"):
            token = normalize_token(scope_match.group(1))
            prefix_stack.append(token)
            continue

        method_match = re.match(r"(get|post|put|patch|delete)\s+(.+)", line)
        if method_match:
            method = method_match.group(1).upper()
            rest = method_match.group(2)
            # Remove trailing do (for shorthand blocks) if present
            rest = rest.split(" do")[0]
            path_token = rest.split(",", 1)[0].strip()
            leaf = normalize_token(path_token)
            route_path = build_path(prefix_stack, leaf)
            routes.append(RouteDef(method=method, path=route_path, line=lineno))
    return routes


def replace_endpoint_tokens(obj: Any) -> Any:
    if isinstance(obj, dict):
        for key, value in list(obj.items()):
            if isinstance(value, str):
                text = value
                for token, replacement in TOKEN_REPLACEMENTS.items():
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token} endpoint"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token}"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    if token in text:
                        text = text.replace(token, replacement)
                while "  " in text:
                    text = text.replace("  ", " ")
                text = text.replace(") endpoint.", ").")
                text = text.replace("` endpoint.", "`.")
                text = text.replace("See  ", "See ")
                text = text.replace("see  ", "see ")
                obj[key] = text
            else:
                replace_endpoint_tokens(value)
    elif isinstance(obj, list):
        for index, value in enumerate(list(obj)):
            if isinstance(value, str):
                text = value
                for token, replacement in TOKEN_REPLACEMENTS.items():
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token} endpoint"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    for prefix in ("\n\n", "\n", "  ", " "):
                        pattern = f"{prefix}{token}"
                        if pattern in text:
                            text = text.replace(pattern, f"{prefix}{replacement}")
                    if token in text:
                        text = text.replace(token, replacement)
                while "  " in text:
                    text = text.replace("  ", " ")
                text = text.replace(") endpoint.", ").")
                text = text.replace("` endpoint.", "`.")
                text = text.replace("See  ", "See ")
                text = text.replace("see  ", "see ")
                obj[index] = text
            else:
                replace_endpoint_tokens(value)
    return obj
