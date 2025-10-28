# v4 API Docs Audit

Automated auditor that compares the implemented `/api/v4` endpoints in `quran.com-api` against the v4 documentation in `qf-api-docs`. It extracts metadata from both repos, runs consistency checks, and renders actionable reports (Markdown + CSV).

## Prerequisites

- Python 3.10+
- Local access to both repos:
  - Code repo (implementation): `\\wsl.localhost\Ubuntu\home\basit3407\quran.com-api`
  - Docs repo (this project): `qf-api-docs`

## Installation & Running

```bash
cd qf-api-docs/tools/audit/v4
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run_all.py --config config.yaml
# Reports land in outputs/
```

Notes:

- Update `config.yaml` if repo paths differ locally.
- The script only considers `/api/v4/` endpoints and skips any entry containing `qdc` or `/api/v3/`.

## Outputs

All generated artefacts live in `outputs/` (ignored by git):

- `implemented.json` — extracted code-side endpoints.
- `documented.json` — extracted doc-side endpoints.
- `missing_endpoints.csv` — implemented but undocumented endpoints.
- `missing_query_params.csv` — query param mismatches.
- `incorrect_docs.csv` — discrepancies (auth, status codes, pagination, naming, rate limits, etc.).
- `missing_response_schemas.csv` — response schema/example gaps.
- `REPORT.md` — consolidated Markdown summary with quick wins, extra audits, and recommended fixes.

## Extending the Audit

- Adjust glob patterns in `config.yaml` to fine-tune the code/doc scanners.
- The extractors are modular; add new heuristics (e.g., framework-specific parsers) in `extract_code_endpoints.py` or `extract_docs_endpoints.py`.
- Extra audits (naming, enums, defaults, rate limits, error envelopes, date formats, idempotency, pagination style) are assembled in `run_all.py::build_extra_insights`.
- Set `report.fail_on_any_issue: true` in `config.yaml` to turn the audit into a CI gate.

## Troubleshooting

- If extraction misses endpoints, ensure route/controller globs include the relevant files.
- Markdown-only docs: the auditor gracefully falls back when no OpenAPI definitions exist.
- Large repos: consider trimming `*_file_globs` for faster scans.
