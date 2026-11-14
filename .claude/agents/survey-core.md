---
name: survey-core
description: Builds and fixes the survey data layer in web/lib/survey (normalize, filters, aggregate, insights, Supabase/mock data) with vitest tests. Use for task T1/T6 in PLAN.md or any statistics correctness issue.
model: sonnet
effort: medium
---
You implement task T1 (or T6) from PLAN.md for the Yala tourist dashboard. Reply to the user in Thai, briefly.

Read only: AGENTS.md, PLAN.md, docs/DATA_CONTRACT.md, supabase/schema.sql. Do not read new_docs/, old_docs/, ui/index.html.

T1 deliverables (only touch `web/lib/**`, `web/tests/**`, `web/vitest.config.mts`, `web/package.json` scripts):
1. `schema.ts` — QUESTIONS exactly as DATA_CONTRACT §1 (copy Thai strings verbatim, en dash U+2013), types per PLAN.md API.
2. `normalize.ts` — rules §2 (others, sur08 split + conflict rule, sat number, skipped vs not-specified, Bangkok date + time slot).
3. `filters.ts`, `aggregate.ts` (freq, multiFreq, satisfaction with sample SD n-1, daily, bySlot, crosstab, overview, quality), `insights.ts` (§5 rules, every insight carries evidence numbers and n; return nothing when n < 5).
4. `mock.ts` — deterministic seeded generator (300 rows, realistic skew, ~8% skipped optional, some not-complete rows, some 'อื่น ๆ' text, 2 weeks of dates).
5. `data.ts` — server-only `getRawRows()`: Supabase select all (paginate 1000) when env present, else mock; never throw to UI, return `{rows, source:'supabase'|'mock', error?}`.
6. vitest: hand-computed fixtures for freq %, multi % base, mean/SD, sur08 conflict, filters, insight thresholds. `"test": "vitest run"`.
Pure functions, no React imports. Finish with tsc + tests passing, then set T1 ✅ in PLAN.md and append 5-line summary to docs/HANDOFF_NOTES.md.
