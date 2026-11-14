# HANDOFF NOTES (append only, newest at bottom)

## T0 — Claude Opus (2026-11-14)
- docs/DATA_CONTRACT.md, docs/SURVEY_REVIEW.md, supabase/schema.sql, script_googleForm/syncToSupabase.gs, snippet.js synced with docx
- web/ scaffolded (Next.js + Tailwind v4), deps: supabase-js, recharts, papaparse, vitest

## T1 — Claude sonnet survey-core (2026-11-14)
- web/lib/survey/{schema,normalize,filters,aggregate,insights,mock,data}.ts ครบ ; vitest 25 tests ผ่าน (web/tests/*, `pnpm -C web test`)
- ส่วนต่างจาก API ใน PLAN: `getRawRows()` คืน `{rows, source:'supabase'|'mock', error?}` (ไม่ throw, error → fallback mock); `Row` เพิ่ม `sur08conflict`; เพิ่ม `overviewInsights(rows)`, `INSIGHT_DISCLAIMER`, `THRESHOLDS`, `hasFilters`, `DISCLAIMER/SMALL_N_WARNING` ใน schema.ts
- Filters ใน URL: key `from,to,age,origin,companion,transport` ค่าหลายตัวใช้ key ซ้ำ (`filtersToQuery` คืน string ไม่มี `?`) ; ค่าในตาราง (Row) ยังเป็นข้อความดิบ (trim + en dash) — "อื่น ๆ" จัดกลุ่มใน freq/crosstab
- ความพึงพอใจ: sd = sample (n-1), mean/sd ปัด 2 ตำแหน่ง, % ปัด 1 ตำแหน่ง ; ข้อค้นพบ/insight แต่ละข้อมี n ของตัวเอง ถ้า n<5 ไม่แสดง
- `pnpm exec tsc --noEmit` เหลือ error เดียวใน app/layout.tsx (`LayoutProps` ไม่พบ — เป็นไฟล์ของ T2/scaffold ไม่ใช่ lib)
- (Opus) vitest.config.ts → vitest.config.mts (โหลดเป็น CJS แล้วพัง) ; ก่อน tsc ต้องรัน `pnpm -C web exec next typegen` เพื่อสร้าง LayoutProps

## T3 — opencode (2026-11-14): web/lib/import/csv.ts
- เพิ่ม `web/lib/import/csv.ts` + `web/lib/import/csv.test.ts`: `parseGoogleSheetsCsv(text)` → `{ rows: InsertRow[]; errors: {line, reason}[] }` — map คอลัมน์ตรรกะเดียวกับ `codeOf_` (GS), เวลา Asia/Bangkok + พ.ศ.>2400, ตัด ms, แก้ขีด→en dash เฉพาะเมื่อตรงตัวเลือก (ใช้ `cleanValue` จาก `lib/survey/normalize` — ไม่แก้ lib/survey, import อย่างเดียว) ; สถานะ: tsc/lint/test ผ่าน
- ⚠️ ให้เจ้าของ `web/vitest.config.mts` (T1/survey-core) เพิ่ม `'lib/**/*.test.ts'` ใน `test.include` — ตอนนี้ `pnpm -C web test` ยังไม่รัน test ใน lib (run ตรง ๆ ได้ที่ `pnpm -C web exec vitest run --config lib/import/vitest.import.mts`, config ชั่วคราวของ T3 จะลบเมื่อ include ถูกแก้)
