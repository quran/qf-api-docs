"""Generate human-friendly markdown reports for the audit."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable, List


def _format_summary_table(summary_rows: List[dict]) -> List[str]:
    lines = ["| Check | Issues | CSV |", "| --- | ---: | --- |"]
    for row in summary_rows:
        lines.append(f"| {row['label']} | {row['count']} | {row['link']} |")
    return lines


def _render_top_issues(title: str, items: Iterable[str]) -> List[str]:
    lines = [f"## {title}"]
    for item in items:
        lines.append(f"- {item}")
    if len(lines) == 1:
        lines.append("- No issues detected.")
    return lines


def _format_issue_line(prefix: str, entry: dict) -> str:
    return f"`{entry.get('method')} {entry.get('path')}` — {prefix}"


def write_markdown_report(
    output_dir: Path,
    implemented_total: int,
    documented_total: int,
    results: Dict[str, List[dict]],
    csv_locations: Dict[str, str],
    extra_insights: Dict[str, List[str]],
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    destination = output_dir / "REPORT.md"

    summary_rows = [
        {
            "label": "Missing endpoints",
            "count": len(results.get("missing_endpoints", [])),
            "link": f"[missing_endpoints.csv]({csv_locations.get('missing_endpoints', 'missing_endpoints.csv')})",
        },
        {
            "label": "Missing query params",
            "count": len(results.get("missing_query_params", [])),
            "link": f"[missing_query_params.csv]({csv_locations.get('missing_query_params', 'missing_query_params.csv')})",
        },
        {
            "label": "Incorrect docs",
            "count": len(results.get("incorrect_docs", [])),
            "link": f"[incorrect_docs.csv]({csv_locations.get('incorrect_docs', 'incorrect_docs.csv')})",
        },
        {
            "label": "Missing response schemas",
            "count": len(results.get("missing_response_schemas", [])),
            "link": f"[missing_response_schemas.csv]({csv_locations.get('missing_response_schemas', 'missing_response_schemas.csv')})",
        },
    ]

    lines: List[str] = [
        "# v4 API Docs Audit",
        "",
        f"- Implemented endpoints analysed: **{implemented_total}**",
        f"- Documented endpoints analysed: **{documented_total}**",
        "",
        "## Summary",
        "",
    ]
    lines.extend(_format_summary_table(summary_rows))
    lines.append("")

    # Missing endpoints (top 10)
    missing_endpoint_items = []
    for entry in results.get("missing_endpoints", [])[:10]:
        hint = entry.get("hint_source_file") or "source unknown"
        missing_endpoint_items.append(_format_issue_line(f"not documented (evidence: {hint})", entry))
    lines.extend(_render_top_issues("Missing Endpoints (top 10)", missing_endpoint_items))
    lines.append("")

    # Missing query params
    missing_param_items = []
    for entry in results.get("missing_query_params", [])[:10]:
        notes = entry.get("notes")
        evidence = entry.get("evidence_in_code") or "no code evidence captured"
        missing_param_items.append(
            f"`{entry.get('method')} {entry.get('path')}` — `{entry.get('param')}` ({notes}, evidence: {evidence})"
        )
    lines.extend(_render_top_issues("Missing Query Parameters (top 10)", missing_param_items))
    lines.append("")

    # Incorrect docs
    incorrect_items = []
    for entry in results.get("incorrect_docs", [])[:10]:
        incorrect_items.append(
            f"`{entry.get('method')} {entry.get('path')}` — {entry.get('field')}: "
            f"code=`{entry.get('code_value')}` vs docs=`{entry.get('docs_value')}` "
            f"→ {entry.get('suggested_fix')}"
        )
    lines.extend(_render_top_issues("Discrepancies (top 10)", incorrect_items))
    lines.append("")

    # Response schema gaps
    schema_items = []
    for entry in results.get("missing_response_schemas", [])[:10]:
        missing_parts = ", ".join(entry.get("missing", []))
        location = entry.get("docs_location_hint") or "location unknown"
        schema_items.append(
            f"`{entry.get('method')} {entry.get('path')}` — missing {missing_parts} (docs: {location})"
        )
    lines.extend(_render_top_issues("Response Schema & Example Gaps (top 10)", schema_items))
    lines.append("")

    # Quick wins section
    quick_wins: List[str] = []
    if results.get("missing_response_schemas"):
        quick_wins.append("Add response schemas/examples for flagged endpoints.")
    if results.get("missing_query_params"):
        quick_wins.append("Document query params detected in code but absent from docs.")
    if results.get("missing_endpoints"):
        quick_wins.append("Draft docs for unlisted implemented endpoints.")
    if results.get("incorrect_docs"):
        quick_wins.append("Resolve mismatched auth/status codes before release.")

    lines.extend(_render_top_issues("Quick Wins", quick_wins))
    lines.append("")

    # Extra audits
    lines.append("## Extra Audits")
    for topic, observations in extra_insights.items():
        pretty_topic = topic.replace("_", " ").title()
        lines.append(f"### {pretty_topic}")
        if observations:
            for observation in observations[:10]:
                lines.append(f"- {observation}")
        else:
            lines.append("- No issues detected.")
        lines.append("")

    # Recommended fixes section (aggregate)
    recommendations = []
    if results.get("missing_endpoints"):
        recommendations.append("Prioritise documenting the missing endpoints list.")
    if results.get("missing_query_params"):
        recommendations.append("Align query parameter tables with implementation hints.")
    if any(extra_insights.values()):
        recommendations.append("Review extra audit observations for naming, enums, rate limits, and error envelopes.")
    if results.get("incorrect_docs"):
        recommendations.append("Resolve auth, pagination, and status code mismatches.")
    if not recommendations:
        recommendations.append("No blockers detected; keep audit scripts updated as code evolves.")

    lines.extend(_render_top_issues("Recommended Fixes", recommendations))
    lines.append("")

    destination.write_text("\n".join(lines), encoding="utf-8")
    return destination
