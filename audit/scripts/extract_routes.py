#!/usr/bin/env python3
"""
Extract API routes from the Quran.com Rails codebase into structured JSON.

The script statically analyses the `config/routes/**/*.rb` files without executing
Rails. It supports common DSL constructs (`namespace`, `scope`, `resources`,
`member`, `collection`, HTTP verbs, and `draw_routes`). Nested contexts contribute
path prefixes, module/controller namespaces, and defaults so that each discovered
endpoint record contains at minimum:

* HTTP method
* Fully-qualified path (including parent scopes)
* Controller and action inference
* Source file/line
* Defaults inherited from scopes (e.g. response format)
* Extracted path parameters

When heuristics cannot confidently infer a detail, the route entry carries a
`notes` list with `TODO:` guidance. The output is deterministic so the script
remains idempotent.

Usage:
  python ./audit/scripts/extract_routes.py --api-root <path> --out <file>
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

LOGGER = logging.getLogger(__name__)

HTTP_METHODS = {"get", "post", "put", "patch", "delete", "options", "head"}


def strip_comments(line: str) -> str:
    """Remove Ruby-style inline comments, preserving literals."""
    result: List[str] = []
    in_single = False
    in_double = False
    escaped = False

    for char in line:
        if escaped:
            result.append(char)
            escaped = False
            continue

        if char == "\\":
            result.append(char)
            escaped = True
            continue

        if char == "'" and not in_double:
            in_single = not in_single
            result.append(char)
            continue

        if char == '"' and not in_single:
            in_double = not in_double
            result.append(char)
            continue

        if char == "#" and not in_single and not in_double:
            break

        result.append(char)

    return "".join(result)


class RubyLiteralParser:
    """Very small Ruby literal parser for the route DSL options."""

    def __init__(self, text: str):
        self.text = text
        self.length = len(text)
        self.pos = 0

    def eof(self) -> bool:
        return self.pos >= self.length

    def peek(self) -> str:
        return "" if self.eof() else self.text[self.pos]

    def advance(self, count: int = 1) -> None:
        self.pos = min(self.length, self.pos + count)

    def skip_ws(self) -> None:
        while not self.eof() and self.text[self.pos].isspace():
            self.pos += 1

    def parse_identifier(self) -> Optional[str]:
        self.skip_ws()
        start = self.pos
        while not self.eof() and (
            self.text[self.pos].isalnum() or self.text[self.pos] in "_"
        ):
            self.pos += 1
        if self.pos == start:
            return None
        return self.text[start:self.pos]

    def parse_value(self) -> Any:
        self.skip_ws()
        if self.eof():
            raise ValueError("Unexpected end of literal")

        char = self.peek()
        if char == "'":
            return self._parse_string("'")
        if char == '"':
            return self._parse_string('"')
        if char == ":":
            return self._parse_symbol()
        if char == "{":
            return self._parse_hash()
        if char == "[":
            return self._parse_array()
        if char.isdigit() or (char == "-" and self._peek_next().isdigit()):
            return self._parse_number()
        if self.text.startswith("true", self.pos):
            self.advance(4)
            return True
        if self.text.startswith("false", self.pos):
            self.advance(5)
            return False
        if self.text.startswith("nil", self.pos):
            self.advance(3)
            return None

        ident = self.parse_identifier()
        if ident is not None:
            return ident
        raise ValueError(f"Unsupported literal near: {self.text[self.pos:self.pos+20]}")

    def _peek_next(self) -> str:
        return "" if self.pos + 1 >= self.length else self.text[self.pos + 1]

    def _parse_string(self, quote: str) -> str:
        self.advance()
        chars: List[str] = []
        escaped = False
        while not self.eof():
            char = self.peek()
            self.advance()
            if escaped:
                chars.append(char)
                escaped = False
                continue
            if char == "\\":
                escaped = True
                continue
            if char == quote:
                break
            chars.append(char)
        return "".join(chars)

    def _parse_symbol(self) -> str:
        self.advance()
        start = self.pos
        while not self.eof() and (
            self.text[self.pos].isalnum() or self.text[self.pos] in "_"
        ):
            self.pos += 1
        return self.text[start:self.pos]

    def _parse_array(self) -> List[Any]:
        self.advance()
        items: List[Any] = []
        while not self.eof():
            self.skip_ws()
            if self.peek() == "]":
                self.advance()
                break
            item = self.parse_value()
            items.append(item)
            self.skip_ws()
            if self.peek() == ",":
                self.advance()
                continue
            if self.peek() == "]":
                continue
        return items

    def _parse_hash(self) -> Dict[str, Any]:
        self.advance()
        result: Dict[str, Any] = {}
        while not self.eof():
            self.skip_ws()
            if self.peek() == "}":
                self.advance()
                break
            key = self.parse_identifier()
            if key is None:
                raise ValueError("Expected identifier for hash key")
            self.skip_ws()
            if self.peek() != ":":
                raise ValueError("Expected ':' after hash key")
            self.advance()
            value = self.parse_value()
            result[key] = value
            self.skip_ws()
            if self.peek() == ",":
                self.advance()
                continue
            if self.peek() == "}":
                continue
        return result

    def _parse_number(self) -> Any:
        start = self.pos
        if self.peek() == "-":
            self.advance()
        while not self.eof() and self.peek().isdigit():
            self.advance()
        if not self.eof() and self.peek() == ".":
            self.advance()
            while not self.eof() and self.peek().isdigit():
                self.advance()
        num_str = self.text[start:self.pos]
        return float(num_str) if "." in num_str else int(num_str)

    def parse_option_pairs(self) -> Dict[str, Any]:
        options: Dict[str, Any] = {}
        while not self.eof():
            self.skip_ws()
            if self.eof():
                break
            if self.peek() == ",":
                self.advance()
                continue
            key = self.parse_identifier()
            if key is None:
                break
            self.skip_ws()
            if self.peek() != ":":
                break
            self.advance()
            value = self.parse_value()
            options[key] = value
            self.skip_ws()
            if self.peek() == ",":
                self.advance()
                continue
        return options


def normalise_path_segment(segment: Optional[str]) -> str:
    if segment is None:
        return ""
    trimmed = segment.strip()
    if trimmed.startswith(":"):
        return trimmed
    if trimmed.startswith("/") and trimmed != "/":
        trimmed = trimmed[1:]
    return trimmed


def singularize(name: str) -> str:
    if name.endswith("ies"):
        return f"{name[:-3]}y"
    if name.endswith("ses"):
        return name[:-2]
    if name.endswith("s") and not name.endswith("ss"):
        return name[:-1]
    return name


def ensure_leading_slash(path: str) -> str:
    if not path.startswith("/"):
        return f"/{path}"
    return path


@dataclass
class RouteFrame:
    type: str
    path_component: Optional[str] = None
    module_components: List[str] = field(default_factory=list)
    controller_override: Optional[str] = None
    defaults: Dict[str, Any] = field(default_factory=dict)
    resource_name: Optional[str] = None
    resource_actions: Optional[Dict[str, bool]] = None
    resource_param: str = "id"
    resource_nested_param: str = "id"
    parent_resource: Optional['RouteFrame'] = None
    absolute: bool = False
    options: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RouteRecord:
    method: str
    path: str
    controller: Optional[str]
    action: Optional[str]
    name: Optional[str]
    source: str
    defaults: Dict[str, Any]
    middlewares: List[str]
    scopes: List[str]
    path_params: List[str]
    notes: List[str] = field(default_factory=list)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "method": self.method,
            "path": self.path,
            "controller": self.controller,
            "action": self.action,
            "name": self.name,
            "source": self.source,
            "defaults": self.defaults,
            "middlewares": self.middlewares,
            "scopes": self.scopes,
            "path_params": self.path_params,
            "notes": self.notes,
        }


class RouteParser:
    """Parse Rails route DSL using deterministic heuristics."""

    def __init__(self, api_root: Path):
        self.api_root = api_root
        self.routes: List[RouteRecord] = []

    def parse(self) -> List[RouteRecord]:
        entry = self.api_root / "config" / "routes.rb"
        if not entry.exists():
            raise FileNotFoundError(f"Unable to find routes.rb under {self.api_root}")
        initial = RouteFrame(type="root", module_components=[], defaults={})
        self._parse_file(entry, [initial])
        return self.routes

    def _parse_file(self, file_path: Path, stack: List[RouteFrame]) -> None:
        LOGGER.debug("Parsing routes file %s", file_path)
        try:
            contents = file_path.read_text(encoding="utf-8").splitlines()
        except Exception as exc:
            LOGGER.error("Failed to read %s: %s", file_path, exc)
            return

        for idx, raw_line in enumerate(contents, start=1):
            stripped = strip_comments(raw_line).strip()
            if not stripped:
                continue

            if stripped == "end":
                if len(stack) > 1:
                    stack.pop()
                else:
                    LOGGER.warning(
                        "Unbalanced `end` in %s:%d (stack already at root)",
                        file_path,
                        idx,
                    )
                continue

            keyword = stripped.split()[0]
            if keyword in {"class", "module", "def"}:
                stack.append(RouteFrame(type="ruby"))
                continue
            handler = getattr(self, f"_handle_{keyword}", None)
            if handler:
                handler(stripped, file_path, idx, stack)
                continue

            if keyword in HTTP_METHODS:
                self._handle_http(stripped, file_path, idx, stack, keyword)
                continue

            if keyword == "root":
                self._handle_root(stripped, file_path, idx, stack)
                continue

            if keyword == "draw_routes":
                self._handle_draw_routes(stripped, file_path, idx, stack)
                continue

            if keyword in {"member", "collection"}:
                self._handle_member_collection(keyword, stripped, file_path, idx, stack)
                continue

            if stripped.endswith(" do"):
                stack.append(RouteFrame(type="ruby"))
                continue

            LOGGER.debug(
                "Ignoring unsupported line in %s:%d -> %s", file_path, idx, stripped
            )

    def _parse_command(
        self, stripped: str, expect_block: bool = False
    ) -> Tuple[Any, Dict[str, Any]]:
        parts = stripped.split(maxsplit=1)
        rest = parts[1] if len(parts) > 1 else ""
        rest = rest.strip()
        if expect_block and rest.endswith("do"):
            rest = rest[: -len("do")].rstrip()
        parser = RubyLiteralParser(rest)
        primary = parser.parse_value() if rest else None
        options = parser.parse_option_pairs()
        return primary, options

    def _current_module(self, stack: Sequence[RouteFrame]) -> List[str]:
        modules: List[str] = []
        for frame in stack:
            modules.extend(frame.module_components)
        return modules

    def _current_defaults(self, stack: Sequence[RouteFrame]) -> Dict[str, Any]:
        merged: Dict[str, Any] = {}
        for frame in stack:
            merged.update(frame.defaults)
        return merged

    def _current_scopes(self, stack: Sequence[RouteFrame]) -> List[str]:
        scopes: List[str] = []
        for frame in stack:
            if frame.type in {"namespace", "scope"} and frame.path_component:
                scopes.append(frame.path_component)
            if frame.type == "resources" and frame.resource_name:
                scopes.append(frame.resource_name)
        return scopes

    def _resource_mode(self, stack: Sequence[RouteFrame], resource: RouteFrame) -> str:
        for frame in stack:
            if frame.parent_resource is resource:
                return frame.type
        return "nested"

    def _build_path(
        self, stack: Sequence[RouteFrame], additional: Optional[str] = None
    ) -> str:
        parts: List[str] = []
        for frame in stack:
            if frame.path_component:
                if frame.absolute:
                    parts = [frame.path_component]
                    continue
                parts.append(frame.path_component)
            if frame.type == "resources":
                mode = self._resource_mode(stack, frame)
                if mode == "member":
                    parts.append(f":{frame.resource_param}")
                elif mode == "nested":
                    parts.append(f":{frame.resource_nested_param}")
        if additional:
            cleaned = normalise_path_segment(additional)
            if cleaned and cleaned != "/":
                parts.append(cleaned)
        joined = "/".join(filter(None, parts))
        return ensure_leading_slash(joined or "")

    def _determine_controller_action(
        self,
        options: Dict[str, Any],
        stack: Sequence[RouteFrame],
        path_fragment: Optional[str],
    ) -> Tuple[Optional[str], Optional[str]]:
        controller: Optional[str] = None
        action: Optional[str] = None
        to_value = options.get("to")
        if isinstance(to_value, str) and "#" in to_value:
            controller, action = to_value.split("#", 1)
        else:
            controller = options.get("controller")
            action = options.get("action")
        if controller is None:
            for frame in reversed(stack):
                if frame.controller_override:
                    controller = frame.controller_override
                    break
        if controller is None:
            modules = self._current_module(stack)
            if modules:
                controller = "/".join(modules)
        if controller and not controller.startswith("api/"):
            modules = self._current_module(stack)
            if modules and not controller.startswith("/"):
                controller = "/".join(modules[:-1] + [controller])
        if action is None:
            if isinstance(path_fragment, str):
                clean = normalise_path_segment(path_fragment)
                if clean:
                    action = clean.split("/")[-1].split(":")[-1]
            if action is None and to_value and "#" not in to_value:
                action = to_value
        return controller, action

    def _handle_namespace(
        self, stripped: str, file_path: Path, line_no: int, stack: List[RouteFrame]
    ) -> None:
        name, options = self._parse_command(stripped, expect_block=True)
        if not isinstance(name, str):
            LOGGER.warning("Unsupported namespace arg in %s:%d -> %s", file_path, line_no, stripped)
            return
        frame = RouteFrame(
            type="namespace",
            path_component=str(options.get("path") or name),
            module_components=[str(options.get("module") or name)],
            defaults=options.get("defaults") if isinstance(options.get("defaults"), dict) else {},
            options=options,
        )
        stack.append(frame)

    def _handle_scope(
        self, stripped: str, file_path: Path, line_no: int, stack: List[RouteFrame]
    ) -> None:
        arg, options = self._parse_command(stripped, expect_block=True)
        path_component = None
        absolute = False
        if isinstance(arg, str):
            path_component = normalise_path_segment(arg)
            absolute = arg.startswith("/")
        elif isinstance(arg, list):
            path_component = "/".join(arg)
        frame = RouteFrame(
            type="scope",
            path_component=path_component,
            module_components=(options.get("module").split("/") if isinstance(options.get("module"), str) else []),
            controller_override=options.get("controller") if isinstance(options.get("controller"), str) else None,
            defaults=options.get("defaults") if isinstance(options.get("defaults"), dict) else {},
            absolute=absolute,
            options=options,
        )
        stack.append(frame)

    def _handle_resources(
        self, stripped: str, file_path: Path, line_no: int, stack: List[RouteFrame]
    ) -> None:
        name, options = self._parse_command(stripped, expect_block=True)
        if not isinstance(name, str):
            LOGGER.warning("Unsupported resources arg in %s:%d -> %s", file_path, line_no, stripped)
            return
        path_component = options.get("path") or name
        param_name = options.get("param") or "id"
        nested_param = f"{singularize(name)}_id"
        only = options.get("only")
        except_actions = options.get("except")
        allowed = {
            "index": True,
            "show": True,
            "create": True,
            "update": True,
            "destroy": True,
            "new": True,
            "edit": True,
        }
        if isinstance(only, list):
            allowed = {action: action in only for action in allowed}
        elif isinstance(only, str):
            allowed = {action: action == only for action in allowed}
        if isinstance(except_actions, list):
            for action in except_actions:
                allowed[str(action)] = False
        elif isinstance(except_actions, str):
            allowed[str(except_actions)] = False
        frame = RouteFrame(
            type="resources",
            path_component=str(path_component),
            controller_override=options.get("controller") if isinstance(options.get("controller"), str) else None,
            module_components=(options.get("module").split("/") if isinstance(options.get("module"), str) else []),
            defaults=options.get("defaults") if isinstance(options.get("defaults"), dict) else {},
            resource_name=name,
            resource_actions=allowed,
            resource_param=str(param_name),
            resource_nested_param=str(nested_param),
            options=options,
        )
        stack.append(frame)
        modules = self._current_module(stack)
        controller_base = frame.controller_override or name
        controller_path = "/".join(modules[:-1] + [controller_base]) if modules else controller_base
        relative = file_path.relative_to(self.api_root).as_posix()
        source = f"{relative}:{line_no}"
        defaults = self._current_defaults(stack)
        scopes = self._current_scopes(stack)
        if frame.resource_actions.get("index"):
            path = self._build_path(stack[:-1], str(path_component))
            self._record_route("GET", path, controller_path, "index", None, source, defaults, scopes, [])
        if frame.resource_actions.get("show"):
            path = self._build_path(stack[:-1], f"{path_component}/:{frame.resource_param}")
            self._record_route("GET", path, controller_path, "show", None, source, defaults, scopes, [])
        if frame.resource_actions.get("create"):
            path = self._build_path(stack[:-1], str(path_component))
            self._record_route("POST", path, controller_path, "create", None, source, defaults, scopes, [])
        if frame.resource_actions.get("update"):
            path = self._build_path(stack[:-1], f"{path_component}/:{frame.resource_param}")
            for method in ("PUT", "PATCH"):
                self._record_route(method, path, controller_path, "update", None, source, defaults, scopes, [])
        if frame.resource_actions.get("destroy"):
            path = self._build_path(stack[:-1], f"{path_component}/:{frame.resource_param}")
            self._record_route("DELETE", path, controller_path, "destroy", None, source, defaults, scopes, [])
        if frame.resource_actions.get("new"):
            path = self._build_path(stack[:-1], f"{path_component}/new")
            self._record_route(
                "GET",
                path,
                controller_path,
                "new",
                None,
                source,
                defaults,
                scopes,
                ["TODO: confirm route helper targets HTML vs JSON"],
            )
        if frame.resource_actions.get("edit"):
            path = self._build_path(stack[:-1], f"{path_component}/:{frame.resource_param}/edit")
            self._record_route(
                "GET",
                path,
                controller_path,
                "edit",
                None,
                source,
                defaults,
                scopes,
                ["TODO: confirm edit route availability for API"],
            )

    def _handle_resource(
        self, stripped: str, file_path: Path, line_no: int, stack: List[RouteFrame]
    ) -> None:
        name, options = self._parse_command(stripped, expect_block=True)
        if not isinstance(name, str):
            LOGGER.warning("Unsupported resource arg in %s:%d -> %s", file_path, line_no, stripped)
            return
        frame = RouteFrame(
            type="resource",
            path_component=str(options.get("path") or name),
            controller_override=options.get("controller") if isinstance(options.get("controller"), str) else None,
            module_components=(options.get("module").split("/") if isinstance(options.get("module"), str) else []),
            defaults=options.get("defaults") if isinstance(options.get("defaults"), dict) else {},
            resource_name=name,
            resource_param=str(options.get("param") or name),
            resource_nested_param=str(options.get("param") or name),
            options=options,
        )
        stack.append(frame)
        controller_base = frame.controller_override or name
        modules = self._current_module(stack)
        controller_path = "/".join(modules[:-1] + [controller_base]) if modules else controller_base
        relative = file_path.relative_to(self.api_root).as_posix()
        source = f"{relative}:{line_no}"
        defaults = self._current_defaults(stack)
        scopes = self._current_scopes(stack)
        base_path = self._build_path(stack[:-1], frame.path_component)
        self._record_route("GET", base_path, controller_path, "show", None, source, defaults, scopes, [])

    def _handle_member_collection(
        self,
        keyword: str,
        stripped: str,
        file_path: Path,
        line_no: int,
        stack: List[RouteFrame],
    ) -> None:
        resource_frame = next((frame for frame in reversed(stack) if frame.type == "resources"), None)
        if resource_frame is None:
            LOGGER.warning("%s block without resources parent in %s:%d", keyword, file_path, line_no)
            return
        stack.append(RouteFrame(type=keyword, parent_resource=resource_frame))

    def _handle_http(
        self,
        stripped: str,
        file_path: Path,
        line_no: int,
        stack: Sequence[RouteFrame],
        keyword: str,
    ) -> None:
        method = keyword.upper()
        _, rest = stripped.split(maxsplit=1)
        rest = rest.strip()
        parser = RubyLiteralParser(rest)
        path_fragment = parser.parse_value()
        options = parser.parse_option_pairs()
        if path_fragment is None and "to" not in options:
            LOGGER.warning("Skipping ambiguous route in %s:%d -> %s", file_path, line_no, stripped)
            return
        controller, action = self._determine_controller_action(options, stack, path_fragment)
        path = self._build_path(stack, str(path_fragment) if path_fragment else "")
        relative = file_path.relative_to(self.api_root).as_posix()
        source = f"{relative}:{line_no}"
        defaults = self._current_defaults(stack)
        scopes = self._current_scopes(stack)
        notes: List[str] = []
        if options.get("via"):
            notes.append(f"TODO: verify `via` option {options['via']}")
        if options.get("constraints"):
            notes.append("TODO: constraints present on route")
        self._record_route(
            method,
            path,
            controller,
            action,
            options.get("as"),
            source,
            defaults,
            scopes,
            notes,
        )

    def _handle_root(
        self,
        stripped: str,
        file_path: Path,
        line_no: int,
        stack: Sequence[RouteFrame],
    ) -> None:
        _, rest = stripped.split(maxsplit=1)
        rest = rest.strip()
        parser = RubyLiteralParser(rest)
        options = parser.parse_option_pairs()
        controller, action = self._determine_controller_action(options, stack, "")
        path = self._build_path(stack, "")
        relative = file_path.relative_to(self.api_root).as_posix()
        source = f"{relative}:{line_no}"
        defaults = self._current_defaults(stack)
        scopes = self._current_scopes(stack)
        self._record_route("GET", path or "/", controller, action, "root", source, defaults, scopes, [])

    def _handle_draw_routes(
        self,
        stripped: str,
        file_path: Path,
        line_no: int,
        stack: List[RouteFrame],
    ) -> None:
        name, _ = self._parse_command(stripped)
        if not isinstance(name, str):
            LOGGER.warning("draw_routes expects symbol/string but saw %r in %s:%d", name, file_path, line_no)
            return
        namespace_parts = [
            frame.path_component
            for frame in stack
            if frame.type == "namespace" and frame.path_component
        ]
        relative_dir = Path("config") / "routes"
        for part in namespace_parts:
            relative_dir /= part
        target = self.api_root / relative_dir / f"{name}.rb"
        if not target.exists():
            LOGGER.warning("draw_routes target missing %s (from %s:%d)", target, file_path, line_no)
            return
        self._parse_file(target, stack.copy())

    def _record_route(
        self,
        method: str,
        path: str,
        controller: Optional[str],
        action: Optional[str],
        name: Optional[str],
        source: str,
        defaults: Dict[str, Any],
        scopes: List[str],
        notes: List[str],
    ) -> None:
        params = [segment[1:] for segment in path.split("/") if segment.startswith(":") and len(segment) > 1]
        self.routes.append(
            RouteRecord(
                method=method,
                path=path or "/",
                controller=controller,
                action=action,
                name=name,
                source=source,
                defaults=defaults,
                middlewares=[],
                scopes=scopes,
                path_params=params,
                notes=notes,
            )
        )


def write_output(out_path: Path, routes: Iterable[RouteRecord]) -> None:
    payload = {
        "meta": {
            "generated_at": None,
            "source_repo": "quran.com-api",
            "strategies": {
                "namespaces": True,
                "resources": True,
                "member_collection": True,
                "draw_routes": True,
            },
        },
        "endpoints": [route.as_dict() for route in routes],
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract API routes from the Rails project.")
    parser.add_argument("--api-root", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["ERROR", "WARNING", "INFO", "DEBUG"],
        help="Adjust verbosity for debugging heuristics.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    logging.basicConfig(level=args.log_level, format="%(levelname)s: %(message)s")
    parser = RouteParser(args.api_root)
    routes = parser.parse()
    LOGGER.info("Extracted %d routes", len(routes))
    write_output(args.out, routes)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
