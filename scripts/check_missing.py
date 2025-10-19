import json
from pathlib import Path
spec = json.loads(Path("openAPI/content/v4.json").read_text(encoding="utf-8"))
missing = []
methods = {"get","post","put","patch","delete","options","head"}
for path, path_item in spec.get("paths", {}).items():
    if not isinstance(path_item, dict):
        continue
    for method, op in path_item.items():
        if method.lower() not in methods:
            continue
        if not isinstance(op, dict):
            continue
        if not op.get("summary") and not op.get("operationId"):
            missing.append((method.upper(), path))
print(len(missing))
for method, path in missing:
    print(method, path)
