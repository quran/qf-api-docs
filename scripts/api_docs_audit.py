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


def replace_refs(obj: Any) -> Any:
    if isinstance(obj, dict):
        new_dict = {}
        for key, value in obj.items():
            new_dict[key] = replace_refs(value)
        if "$ref" in new_dict and isinstance(new_dict["$ref"], str):
            ref = new_dict["$ref"]
            if ref.startswith("#/definitions/"):
                new_dict["$ref"] = ref.replace("#/definitions/", "#/components/schemas/")
            elif ref.startswith("#/parameters/"):
                new_dict["$ref"] = ref.replace("#/parameters/", "#/components/parameters/")
            elif ref.startswith("#/responses/"):
                new_dict["$ref"] = ref.replace("#/responses/", "#/components/responses/")
        return new_dict
    if isinstance(obj, list):
        return [replace_refs(item) for item in obj]
    return obj


def dereference(obj: Dict[str, Any], root: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(obj, dict):
        return obj
    if "$ref" not in obj:
        return obj
    ref = obj["$ref"]
    if not ref.startswith("#/"):
        raise ValueError(f"Unsupported external $ref: {ref}")
    parts = ref[2:].split("/")
    target: Any = root
    for part in parts:
        target = target[part]
    return dereference(target, root)


def convert_swagger2_to_openapi3(swagger: Dict[str, Any]) -> Dict[str, Any]:
    oas: Dict[str, Any] = {
        "openapi": "3.0.3",
        "info": copy.deepcopy(swagger.get("info", {})),
    }

    host = swagger.get("host", "")
    base_path = swagger.get("basePath", "")
    schemes = swagger.get("schemes") or ["https"]
    servers = []
    if host:
        for scheme in schemes:
            url = f"{scheme}://{host}{base_path}".rstrip("/")
            servers.append({"url": url or "/"})
    elif base_path:
        servers.append({"url": base_path})
    if servers:
        oas["servers"] = servers

    for optional_key in ("tags", "externalDocs"):
        if optional_key in swagger:
            oas[optional_key] = copy.deepcopy(swagger[optional_key])

    components: Dict[str, Any] = {}
    if "definitions" in swagger:
        components["schemas"] = copy.deepcopy(swagger["definitions"])
    if "parameters" in swagger:
        components["parameters"] = copy.deepcopy(swagger["parameters"])
    if "responses" in swagger:
        components["responses"] = copy.deepcopy(swagger["responses"])
    if "securityDefinitions" in swagger:
        components["securitySchemes"] = copy.deepcopy(swagger["securityDefinitions"])
    if components:
        oas["components"] = components

    if "security" in swagger:
        oas["security"] = copy.deepcopy(swagger["security"])

    global_consumes = swagger.get("consumes", [])
    global_produces = swagger.get("produces", [])

    paths_oas: Dict[str, Any] = {}
    for path, path_item in swagger.get("paths", {}).items():
        if not isinstance(path_item, dict):
            continue
        path_level_parameters = [
            dereference(param, swagger)
            for param in path_item.get("parameters", [])
        ]
        new_path_item: Dict[str, Any] = {}
        for method, operation in path_item.items():
            if method == "parameters" or method not in HTTP_METHODS:
                continue
            operation = dereference(operation, swagger)
            consumes = operation.get("consumes", global_consumes)
            produces = operation.get("produces", global_produces)

            new_operation: Dict[str, Any] = {}
            for key in ("summary", "description", "operationId", "deprecated", "tags"):
                if key in operation:
                    new_operation[key] = copy.deepcopy(operation[key])

            combined_parameters = [
                dereference(param, swagger)
                for param in path_level_parameters + operation.get("parameters", [])
            ]
            parameters_result: List[Dict[str, Any]] = []
            request_body: Optional[Dict[str, Any]] = None

            seen_params = set()
            for param in combined_parameters:
                name = param.get("name")
                param_in = param.get("in")
                if not name or not param_in:
                    continue
                key = (param_in, name)
                if key in seen_params:
                    continue
                seen_params.add(key)

                if param_in == "body":
                    content_type = (consumes or ["application/json"])[0]
                    request_body = {
                        "required": param.get("required", False),
                        "content": {
                            content_type: {}
                        }
                    }
                    if "description" in param:
                        request_body["description"] = param["description"]
                    schema = param.get("schema")
                    if schema:
                        request_body["content"][content_type]["schema"] = copy.deepcopy(schema)
                    if "example" in param:
                        request_body["content"][content_type]["example"] = copy.deepcopy(param["example"])
                    continue

                oas_param: Dict[str, Any] = {
                    "name": name,
                    "in": param_in,
                }
                if "description" in param:
                    oas_param["description"] = param["description"]
                if "required" in param:
                    oas_param["required"] = param["required"]
                schema_fields = (
                    "type",
                    "format",
                    "items",
                    "default",
                    "enum",
                    "maximum",
                    "minimum",
                    "maxLength",
                    "minLength",
                    "pattern",
                    "collectionFormat",
                    "allowEmptyValue",
                )
                schema: Dict[str, Any] = {}
                for field in schema_fields:
                    if field in param:
                        schema[field] = copy.deepcopy(param[field])
                if schema:
                    collection_format = schema.pop("collectionFormat", None)
                    allow_empty = schema.pop("allowEmptyValue", None)
                    oas_param["schema"] = schema
                    if collection_format == "multi":
                        oas_param["style"] = "form"
                        oas_param["explode"] = True
                    if allow_empty is not None:
                        oas_param["allowEmptyValue"] = allow_empty
                parameters_result.append(oas_param)

            if parameters_result:
                new_operation["parameters"] = parameters_result
            if request_body:
                new_operation["requestBody"] = request_body

            responses_result: Dict[str, Any] = {}
            for status, response in operation.get("responses", {}).items():
                response = dereference(response, swagger)
                if not isinstance(response, dict):
                    continue
                new_response: Dict[str, Any] = {}
                new_response["description"] = response.get("description", "")
                content: Dict[str, Any] = {}
                schema = response.get("schema")
                examples = response.get("examples")
                content_types = produces or ["application/json"]
                if schema:
                    ct = content_types[0]
                    content[ct] = {"schema": copy.deepcopy(schema)}
                    if examples and isinstance(examples, dict) and ct in examples:
                        content[ct]["example"] = copy.deepcopy(examples[ct])
                elif examples and isinstance(examples, dict):
                    for ct, example in examples.items():
                        content[ct] = {"example": copy.deepcopy(example)}
                if content:
                    new_response["content"] = content
                if "headers" in response:
                    new_response["headers"] = copy.deepcopy(response["headers"])
                responses_result[str(status)] = new_response

            if responses_result:
                new_operation["responses"] = responses_result
            else:
                new_operation["responses"] = {"default": {"description": ""}}

            if "security" in operation:
                new_operation["security"] = copy.deepcopy(operation["security"])

            new_path_item[method] = new_operation
        if new_path_item:
            paths_oas[path] = new_path_item

    oas["paths"] = replace_refs(paths_oas)

    if "components" in oas:
        oas["components"] = replace_refs(oas["components"])

    return oas


def normalize_operation(
    path: str,
    method: str,
    source_file: Path,
    lines: List[str],
    operation: Dict[str, Any],
) -> Operation:
    parameters_map: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for param in operation.get("parameters", []):
        name = param.get("name")
        loc = param.get("in")
        if name and loc:
            parameters_map[(loc, name)] = param

    responses_map: Dict[str, Dict[str, Any]] = {}
    for status, response in operation.get("responses", {}).items():
        responses_map[str(status)] = response

    needle_path = f"'{path}':" if source_file.suffix in ('.yaml', '.yml') else f'\"{path}\":'
    path_line = find_line(lines, needle_path) if lines else None
    method_line = None
    if path_line is not None:
        method_line = find_line(lines, f"{method}:", path_line - 1)

    return Operation(
        path=path,
        method=method.upper(),
        source_file=source_file,
        line=method_line or path_line,
        raw=operation,
        parameters=parameters_map,
        responses=responses_map,
        security=operation.get("security", []),
        description=operation.get("description", "") or "",
        summary=operation.get("summary", "") or "",
    )


def load_operations_from_spec(
    spec: Dict[str, Any],
    source_file: Path,
    lines: List[str],
) -> Dict[Tuple[str, str], Operation]:
    operations: Dict[Tuple[str, str], Operation] = {}
    for path, path_item in spec.get("paths", {}).items():
        if not isinstance(path_item, dict):
            continue
        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue
            op = normalize_operation(path, method.lower(), source_file, lines, operation)
            operations[(op.method, op.path)] = op
    return operations


def compare_parameters(
    code_op: Operation,
    doc_op: Operation,
) -> List[Dict[str, Any]]:
    discrepancies: List[Dict[str, Any]] = []
    code_params = code_op.parameters
    doc_params = doc_op.parameters
    code_keys = set(code_params.keys())
    doc_keys = set(doc_params.keys())

    only_in_code = code_keys - doc_keys
    for loc, name in sorted(only_in_code):
        code_param = code_params[(loc, name)]
        discrepancies.append({
            "type": "param_mismatch",
            "severity": "high" if code_param.get("required") else "medium",
            "details": {
                "expected_from_docs": None,
                "found_in_code": {
                    "name": name,
                    "in": loc,
                    "required": code_param.get("required"),
                    "schema": code_param.get("schema"),
                    "description": code_param.get("description"),
                },
                "notes": "Parameter implemented in code spec but missing from docs.",
            },
            "path": code_op.path,
            "method": code_op.method,
        })

    only_in_docs = doc_keys - code_keys
    for loc, name in sorted(only_in_docs):
        doc_param = doc_params[(loc, name)]
        discrepancies.append({
            "type": "param_mismatch",
            "severity": "high" if doc_param.get("required") else "medium",
            "details": {
                "expected_from_docs": {
                    "name": name,
                    "in": loc,
                    "required": doc_param.get("required"),
                    "schema": doc_param.get("schema"),
                    "description": doc_param.get("description"),
                },
                "found_in_code": None,
                "notes": "Docs describe parameter that is absent from code spec.",
            },
            "path": code_op.path,
            "method": code_op.method,
        })

    common = code_keys & doc_keys
    for key in sorted(common):
        loc, name = key
        code_param = code_params[key]
        doc_param = doc_params[key]

        mismatches = []
        if code_param.get("required") != doc_param.get("required"):
            mismatches.append(
                f"required differs (code={code_param.get('required')} docs={doc_param.get('required')})"
            )

        code_schema = code_param.get("schema")
        doc_schema = doc_param.get("schema")
        if isinstance(code_schema, dict) and isinstance(doc_schema, dict):
            for field in ("type", "format", "default", "enum"):
                if code_schema.get(field) != doc_schema.get(field):
                    mismatches.append(
                        f"{field} differs (code={code_schema.get(field)} docs={doc_schema.get(field)})"
                    )
        elif code_schema != doc_schema:
            mismatches.append("schema structure differs")

        if mismatches:
            discrepancies.append({
                "type": "param_mismatch",
                "severity": "medium",
                "details": {
                    "expected_from_docs": {
                        "name": name,
                        "in": loc,
                        "required": doc_param.get("required"),
                        "schema": doc_schema,
                        "description": doc_param.get("description"),
                    },
                    "found_in_code": {
                        "name": name,
                        "in": loc,
                        "required": code_param.get("required"),
                        "schema": code_schema,
                        "description": code_param.get("description"),
                    },
                    "notes": "; ".join(mismatches),
                },
                "path": code_op.path,
                "method": code_op.method,
            })

    return discrepancies


def compare_responses(
    code_op: Operation,
    doc_op: Operation,
) -> Tuple[List[Dict[str, Any]], List[Tuple[str, str, str]]]:
    discrepancies: List[Dict[str, Any]] = []
    example_mismatches: List[Tuple[str, str, str]] = []

    code_responses = code_op.responses
    doc_responses = doc_op.responses
    code_statuses = set(code_responses.keys())
    doc_statuses = set(doc_responses.keys())

    for status in sorted(code_statuses - doc_statuses):
        discrepancies.append({
            "type": "status_code_mismatch",
            "severity": "medium",
            "details": {
                "expected_from_docs": None,
                "found_in_code": {"status": status},
                "notes": "Status code present in code but missing from docs.",
            },
            "path": code_op.path,
            "method": code_op.method,
        })

    for status in sorted(doc_statuses - code_statuses):
        discrepancies.append({
            "type": "status_code_mismatch",
            "severity": "medium",
            "details": {
                "expected_from_docs": {"status": status},
                "found_in_code": None,
                "notes": "Docs list status code that is absent from code.",
            },
            "path": code_op.path,
            "method": code_op.method,
        })

    for status in sorted(code_statuses & doc_statuses):
        code_resp = code_responses[status]
        doc_resp = doc_responses[status]
        code_schema = _extract_schema_snapshot(code_resp)
        doc_schema = _extract_schema_snapshot(doc_resp)
        if code_schema != doc_schema:
            discrepancies.append({
                "type": "response_field_mismatch",
                "severity": "medium",
                "details": {
                    "expected_from_docs": doc_schema,
                    "found_in_code": code_schema,
                    "notes": "Response schema differs after normalisation.",
                },
                "path": code_op.path,
                "method": code_op.method,
            })

        code_example = _extract_example(code_resp)
        doc_example = _extract_example(doc_resp)
        if code_example is not None and doc_example is not None and code_example != doc_example:
            example_mismatches.append((status, json.dumps(code_example, indent=2, ensure_ascii=False), json.dumps(doc_example, indent=2, ensure_ascii=False)))

    return discrepancies, example_mismatches


def _extract_schema_snapshot(response: Dict[str, Any]) -> Any:
    content = response.get("content")
    if not isinstance(content, dict):
        return None
    first_ct = next(iter(content))
    schema = content[first_ct].get("schema")
    if schema is None:
        return None
    return schema


def _extract_example(response: Dict[str, Any]) -> Any:
    content = response.get("content")
    if not isinstance(content, dict):
        return None
    for payload in content.values():
        if isinstance(payload, dict):
            if "example" in payload:
                return payload["example"]
            examples = payload.get("examples")
            if isinstance(examples, dict):
                first = next(iter(examples.values()))
                if isinstance(first, dict) and "value" in first:
                    return first["value"]
                return first
    return None


def compare_security(code_op: Operation, doc_op: Operation) -> Optional[Dict[str, Any]]:
    if code_op.security == doc_op.security:
        return None
    return {
        "type": "auth_mismatch",
        "severity": "medium",
        "details": {
            "expected_from_docs": doc_op.security,
            "found_in_code": code_op.security,
            "notes": "Security requirements differ.",
        },
        "path": code_op.path,
        "method": code_op.method,
    }


def stable_operation_key(item: Tuple[str, str]) -> Tuple[str, str]:
    method, path = item
    return path, method


def generate_coverage_table(
    code_ops: Dict[Tuple[str, str], Operation],
    doc_ops: Dict[Tuple[str, str], Operation],
) -> str:
    lines = ["| Method | Path | Code | Docs |", "| --- | --- | --- | --- |"]
    all_keys = sorted(set(code_ops.keys()) | set(doc_ops.keys()), key=stable_operation_key)
    for method, path in all_keys:
        code_flag = "yes" if (method, path) in code_ops else "no"
        doc_flag = "yes" if (method, path) in doc_ops else "no"
        lines.append(f"| {method} | {path} | {code_flag} | {doc_flag} |")
    return "\n".join(lines)


def generate_params_table(
    code_ops: Dict[Tuple[str, str], Operation],
    doc_ops: Dict[Tuple[str, str], Operation],
) -> str:
    lines = ["| Method | Path | Name | In | Code | Docs |", "| --- | --- | --- | --- | --- | --- |"]
    all_keys = sorted(set(code_ops.keys()) | set(doc_ops.keys()), key=stable_operation_key)
    for method, path in all_keys:
        code_op = code_ops.get((method, path))
        doc_op = doc_ops.get((method, path))
        code_params = code_op.parameters if code_op else {}
        doc_params = doc_op.parameters if doc_op else {}
        all_params = sorted(set(code_params.keys()) | set(doc_params.keys()))
        if not all_params:
            code_flag = "yes" if code_op else "no"
            doc_flag = "yes" if doc_op else "no"
            lines.append(f"| {method} | {path} | - | - | {code_flag} | {doc_flag} |")
            continue
        for loc, name in all_params:
            code_flag = "yes" if (loc, name) in code_params else "no"
            doc_flag = "yes" if (loc, name) in doc_params else "no"
            lines.append(f"| {method} | {path} | {name} | {loc} | {code_flag} | {doc_flag} |")
    return "\n".join(lines)


def generate_responses_table(
    code_ops: Dict[Tuple[str, str], Operation],
    doc_ops: Dict[Tuple[str, str], Operation],
) -> str:
    lines = ["| Method | Path | Status | Code | Docs |", "| --- | --- | --- | --- | --- |"]
    all_keys = sorted(set(code_ops.keys()) | set(doc_ops.keys()), key=stable_operation_key)
    for method, path in all_keys:
        code_op = code_ops.get((method, path))
        doc_op = doc_ops.get((method, path))
        code_statuses = set(code_op.responses.keys()) if code_op else set()
        doc_statuses = set(doc_op.responses.keys()) if doc_op else set()
        all_statuses = sorted(code_statuses | doc_statuses)
        if not all_statuses:
            code_flag = "yes" if code_op else "no"
            doc_flag = "yes" if doc_op else "no"
            lines.append(f"| {method} | {path} | - | {code_flag} | {doc_flag} |")
            continue
        for status in all_statuses:
            code_flag = "yes" if status in code_statuses else "no"
            doc_flag = "yes" if status in doc_statuses else "no"
            lines.append(f"| {method} | {path} | {status} | {code_flag} | {doc_flag} |")
    return "\n".join(lines)


def build_summary(discrepancies: List[Dict[str, Any]]) -> Tuple[str, Dict[str, int], Dict[str, int]]:
    type_counts: Dict[str, int] = {}
    severity_counts: Dict[str, int] = {}
    for item in discrepancies:
        type_counts[item["type"]] = type_counts.get(item["type"], 0) + 1
        severity_counts[item["severity"]] = severity_counts.get(item["severity"], 0) + 1
    verdict = "Docs align with code." if not discrepancies else "Docs diverge from code."
    return verdict, type_counts, severity_counts


def format_fix_list(discrepancies: List[Dict[str, Any]]) -> List[str]:
    if not discrepancies:
        return []
    severity_order = {"blocker": 0, "high": 1, "medium": 2, "low": 3}
    sorted_items = sorted(
        discrepancies,
        key=lambda d: (severity_order.get(d["severity"], 99), d["type"], d["path"], d["method"]),
    )
    fixes = []
    for item in sorted_items[:10]:
        note = item["details"].get("notes", "")
        fixes.append(
            f"- [{item['severity']}] {item['method']} {item['path']} -> {item['type'].replace('_', ' ')} ({note.rstrip('.')})."
        )
    return fixes


def write_yaml(path: Path, data: Dict[str, Any]) -> None:
    path.write_text(_to_yaml(data), encoding="utf-8")


def _to_yaml(obj: Any, indent: int = 0) -> str:
    spaces = "  " * indent
    if isinstance(obj, dict):
        lines: List[str] = []
        for key, value in obj.items():
            if value is None:
                continue
            if isinstance(value, (dict, list)):
                lines.append(f"{spaces}{key}:")
                lines.append(_to_yaml(value, indent + 1))
            else:
                lines.append(f"{spaces}{key}: {_format_scalar(value)}")
        return "\n".join(lines)
    if isinstance(obj, list):
        lines = []
        for item in obj:
            if isinstance(item, (dict, list)):
                lines.append(f"{spaces}-")
                lines.append(_to_yaml(item, indent + 1))
            else:
                lines.append(f"{spaces}- {_format_scalar(item)}")
        return "\n".join(lines)
    return f"{spaces}{_format_scalar(obj)}"


def _format_scalar(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    if text == "":
        return "''"
    if any(c in text for c in [":", "-", "{", "}", "[", "]", ",", "#", "\n", "'", "\""]):
        return json.dumps(text, ensure_ascii=False)
    return text


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare Quran.com API code spec with docs spec.")
    parser.add_argument("--code-spec", type=Path, default=Path(r"d:\quran.com-api\stoplight.yaml"))
    parser.add_argument("--docs-spec", type=Path, default=Path("openAPI/content/v4.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("api-docs-audit"))
    parser.add_argument("--routes-file", type=Path, default=Path(r"d:\quran.com-api\config/routes/api/v4.rb"))
    args = parser.parse_args()

    code_spec_path = args.code_spec.resolve()
    docs_spec_path = args.docs_spec.resolve()
    output_dir = args.output_dir.resolve()
    routes_file = args.routes_file.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    code_lines = read_lines(code_spec_path)
    docs_lines = read_lines(docs_spec_path)

    swagger_spec = yaml.safe_load(code_spec_path.read_text(encoding="utf-8"))
    docs_spec = json.loads(docs_spec_path.read_text(encoding="utf-8-sig"))
    doc_ops = load_operations_from_spec(docs_spec, docs_spec_path, docs_lines)
    doc_signature_map = {(op.method, path_signature(op.path)): op for op in doc_ops.values()}

    route_pairs = extract_routes_from_file(routes_file)
    route_signature_map = {(route.method, path_signature(route.path)): route for route in route_pairs}
    route_signature_keys = set(route_signature_map.keys())
    code_spec = convert_swagger2_to_openapi3(swagger_spec)
    code_spec = replace_refs(code_spec)

    # Align converted spec with actual routes
    spec_paths = code_spec.setdefault("paths", {})
    for path in list(spec_paths.keys()):
        path_item = spec_paths[path]
        for method in list(path_item.keys()):
            key = (method.upper(), path_signature(path))
            if key not in route_signature_keys:
                del path_item[method]
        if not path_item:
            del spec_paths[path]

    spec_signature_keys: Set[Tuple[str, str]] = set()
    for path, path_item in spec_paths.items():
        sig = path_signature(path)
        for method in path_item.keys():
            spec_signature_keys.add((method.upper(), sig))

    for method, sig in route_signature_keys:
        route_def = route_signature_map[(method, sig)]
        method_lower = method.lower()
        if (method, sig) in spec_signature_keys:
            continue
        doc_op = doc_signature_map.get((method, sig))
        target_path = doc_op.path if doc_op else route_def.path
        path_item = spec_paths.setdefault(target_path, {})
        if method_lower not in path_item:
            if doc_op:
                path_item[method_lower] = copy.deepcopy(doc_op.raw)
            else:
                path_item[method_lower] = {"responses": {"200": {"description": ""}}}
        spec_signature_keys.add((method, sig))

    code_ops = load_operations_from_spec(code_spec, code_spec_path, code_lines)
    code_signature_map = {(op.method, path_signature(op.path)): op for op in code_ops.values()}

    write_yaml(output_dir / "openapi.generated.yaml", code_spec)

    discrepancies: List[Dict[str, Any]] = []
    example_diffs: List[Tuple[str, str, str, str, str]] = []

    route_signature_keys = set(route_signature_map.keys())
    doc_signature_keys = set(doc_signature_map.keys())
    code_signature_keys = set(code_signature_map.keys())

    for key in sorted(route_signature_keys - doc_signature_keys, key=lambda k: (route_signature_map[k].path, k[0])):
        method, _ = key
        route_def = route_signature_map[key]
        code_op = code_signature_map.get(key)
        discrepancies.append({
            "type": "endpoint_missing_in_docs",
            "severity": "blocker",
            "path": route_def.path,
            "method": method,
            "where_in_docs": None,
            "where_in_code": format_location(routes_file, route_def.line),
            "details": {
                "expected_from_docs": None,
                "found_in_code": {
                    "summary": code_op.summary if code_op else None,
                    "description": code_op.description if code_op else None,
                },
                "notes": "Operation implemented in code routes but missing from docs spec.",
            },
        })

    for key in sorted(doc_signature_keys - route_signature_keys, key=lambda k: (doc_signature_map[k].path, k[0])):
        method, _ = key
        doc_op = doc_signature_map[key]
        discrepancies.append({
            "type": "endpoint_missing_in_code",
            "severity": "blocker",
            "path": doc_op.path,
            "method": method,
            "where_in_docs": format_location(doc_op.source_file, doc_op.line),
            "where_in_code": None,
            "details": {
                "expected_from_docs": {
                    "summary": doc_op.summary,
                    "description": doc_op.description,
                },
                "found_in_code": None,
                "notes": "Docs list operation that is absent from code routes.",
            },
        })

    common_keys = route_signature_keys & doc_signature_keys & code_signature_keys
    for key in sorted(common_keys, key=lambda k: (doc_signature_map[k].path, k[0])):
        method, _ = key
        doc_op = doc_signature_map[key]
        code_op = code_signature_map[key]

        param_discrepancies = compare_parameters(code_op, doc_op)
        for item in param_discrepancies:
            item["where_in_docs"] = format_location(doc_op.source_file, doc_op.line)
            item["where_in_code"] = format_location(code_op.source_file, code_op.line)
        discrepancies.extend(param_discrepancies)

        response_discrepancies, example_mism = compare_responses(code_op, doc_op)
        for item in response_discrepancies:
            item["where_in_docs"] = format_location(doc_op.source_file, doc_op.line)
            item["where_in_code"] = format_location(code_op.source_file, code_op.line)
        discrepancies.extend(response_discrepancies)

        for status, code_example, doc_example in example_mism:
            example_diffs.append((method, doc_op.path, status, code_example, doc_example))
            discrepancies.append({
                "type": "example_mismatch",
                "severity": "medium",
                "path": doc_op.path,
                "method": method,
                "where_in_docs": format_location(doc_op.source_file, doc_op.line),
                "where_in_code": format_location(code_op.source_file, code_op.line),
                "details": {
                    "expected_from_docs": doc_example,
                    "found_in_code": code_example,
                    "notes": f"Example payload differs for status {status}.",
                },
            })

        sec = compare_security(code_op, doc_op)
        if sec:
            sec["where_in_docs"] = format_location(doc_op.source_file, doc_op.line)
            sec["where_in_code"] = format_location(code_op.source_file, code_op.line)
            discrepancies.append(sec)

    discrepancies_sorted = sorted(
        discrepancies,
        key=lambda d: (d["type"], d["path"], d["method"]),
    )

    (output_dir / "discrepancies.json").write_text(
        json.dumps(discrepancies_sorted, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    coverage_lines = [
        "# Endpoint Coverage",
        generate_coverage_table(code_ops, doc_ops),
        "",
        "# Parameter Coverage",
        generate_params_table(code_ops, doc_ops),
        "",
        "# Response Coverage",
        generate_responses_table(code_ops, doc_ops),
    ]
    (output_dir / "coverage.md").write_text("\n".join(coverage_lines), encoding="utf-8")

    if example_diffs:
        lines: List[str] = []
        for method, path, status, code_example, doc_example in example_diffs:
            lines.append(f"## {method} {path} - {status}")
            diff = "\n".join(
                difflib.unified_diff(
                    doc_example.splitlines(),
                    code_example.splitlines(),
                    fromfile="docs",
                    tofile="code",
                    lineterm="",
                )
            )
            lines.append("```diff")
            lines.append(diff or "(no textual diff generated)")
            lines.append("```")
        (output_dir / "examples-mismatch.md").write_text("\n".join(lines), encoding="utf-8")
    else:
        (output_dir / "examples-mismatch.md").write_text("No example mismatches detected.", encoding="utf-8")

    verdict, type_counts, severity_counts = build_summary(discrepancies_sorted)
    fixes = format_fix_list(discrepancies_sorted)
    summary_lines = [
        verdict,
        "",
        "## Totals by type",
    ]
    if type_counts:
        for key, count in sorted(type_counts.items()):
            summary_lines.append(f"- {key}: {count}")
    else:
        summary_lines.append("- None")
    summary_lines.extend(["", "## Totals by severity"])
    if severity_counts:
        for key, count in sorted(severity_counts.items()):
            summary_lines.append(f"- {key}: {count}")
    else:
        summary_lines.append("- None")

    if fixes:
        summary_lines.extend(["", "## Top fixes"])
        summary_lines.extend(fixes)

    if discrepancies_sorted:
        summary_lines.extend([
            "",
            "## Suggested action plan",
            "1. Align specifications between code and docs based on discrepancy list.",
            "2. Update automated tests or generators to keep specs synchronised.",
            "3. Communicate changes to stakeholders before rollout.",
        ])

    (output_dir / "summary.md").write_text("\n".join(summary_lines), encoding="utf-8")


if __name__ == "__main__":
    main()
