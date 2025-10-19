Docs diverge from code.

## Totals by type
- endpoint_missing_in_code: 7
- endpoint_missing_in_docs: 31
- example_mismatch: 4
- param_mismatch: 23
- response_field_mismatch: 13
- status_code_mismatch: 332

## Totals by severity
- blocker: 38
- medium: 372

## Top fixes
- [blocker] GET /quran/verses/code_v1 -> endpoint missing in code (Docs list operation that is absent from code routes).
- [blocker] GET /quran/verses/code_v2 -> endpoint missing in code (Docs list operation that is absent from code routes).
- [blocker] GET /quran/verses/imlaei -> endpoint missing in code (Docs list operation that is absent from code routes).
- [blocker] GET /quran/verses/indopak -> endpoint missing in code (Docs list operation that is absent from code routes).
- [blocker] GET /quran/verses/uthmani -> endpoint missing in code (Docs list operation that is absent from code routes).
- [blocker] GET /quran/verses/uthmani_simple -> endpoint missing in code (Docs list operation that is absent from code routes).
- [blocker] GET /quran/verses/uthmani_tajweed -> endpoint missing in code (Docs list operation that is absent from code routes).
- [blocker] GET / -> endpoint missing in docs (Operation implemented in code routes but missing from docs spec).
- [blocker] GET /audio/qaris -> endpoint missing in docs (Operation implemented in code routes but missing from docs spec).
- [blocker] GET /audio/qaris/related/{id} -> endpoint missing in docs (Operation implemented in code routes but missing from docs spec).

## Suggested action plan
1. Align specifications between code and docs based on discrepancy list.
2. Update automated tests or generators to keep specs synchronised.
3. Communicate changes to stakeholders before rollout.