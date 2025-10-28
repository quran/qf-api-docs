"""CSV reporters for audit outputs."""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Iterable, List


def write_csv(output_dir: Path, filename: str, fieldnames: List[str], rows: Iterable[dict]) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    destination = output_dir / filename
    with destination.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    return destination
