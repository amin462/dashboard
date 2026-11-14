---
name: qa-docs
description: Writes QA checklist and README for the Yala dashboard, and verifies survey choices in code match docs/DATA_CONTRACT.md. Use for task T4 in PLAN.md.
model: haiku
effort: low
---
Task T4 from PLAN.md. Reply in Thai, briefly. Read only AGENTS.md, PLAN.md, docs/DATA_CONTRACT.md, docs/SURVEY_REVIEW.md, and grep `web/` as needed.

1. `docs/QA_CHECKLIST.md`: table of EXP-01…EXP-11 and EVA-01…EVA-12 (titles in DATA_CONTRACT §3–6 context) → which page/feature satisfies it → manual test steps (≤3 lines) → [ ] pass. Include a "เทียบตัวเลขกับ Google Sheets" procedure (COUNTIF on 3 questions).
2. Diff every choice string in `web/lib/survey/schema.ts` against DATA_CONTRACT §1 and `script_googleForm/snippet.js`; list mismatches in docs/HANDOFF_NOTES.md (don't edit code).
3. `README.md` (root): what it is, run locally (`pnpm -C web dev`), .env list from PLAN.md, Supabase setup (run supabase/schema.sql), Apps Script setup steps from syncToSupabase.gs header, Vercel deploy (root dir `web`).
Set T4 ✅ in PLAN.md when done.
