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

## T2 — Gemini Antigravity (2026-11-14)
- เพิ่มหน้า `web/app/(dash)/guide/page.tsx` (`/guide`) คู่มือผู้ประกอบการภาษาไทย (วิธีอ่านกราฟ ฐาน n/ไม่ตอบ/ไม่ประสงค์ระบุ/% > 100, ตัวกรอง, 4 ตัวอย่างธุรกิจ, ข้อจำกัด, FAQ 5 ข้อ)
- **คำขอเพิ่มเมนู (ไม่ได้แก้ไฟล์เดิมตามคำสั่ง):** ขอให้เพิ่มรายการ `{ href: "/guide", label: "คู่มือผู้ประกอบการ", ... }` ใน `web/components/nav-config.ts` (และลิงก์ใน `DashShell.tsx` ถ้าต้องการ) เพื่อเข้าถึง `/guide` จากแถบเมนูได้สะดวก
- (Opus) vitest.config.ts → vitest.config.mts (โหลดเป็น CJS แล้วพัง) ; ก่อน tsc ต้องรัน `pnpm -C web exec next typegen` เพื่อสร้าง LayoutProps

## T3 — opencode (2026-11-14): web/lib/import/csv.ts
- เพิ่ม `web/lib/import/csv.ts` + `web/lib/import/csv.test.ts`: `parseGoogleSheetsCsv(text)` → `{ rows: InsertRow[]; errors: {line, reason}[] }` — map คอลัมน์ตรรกะเดียวกับ `codeOf_` (GS), เวลา Asia/Bangkok + พ.ศ.>2400, ตัด ms, แก้ขีด→en dash เฉพาะเมื่อตรงตัวเลือก (ใช้ `cleanValue` จาก `lib/survey/normalize` — ไม่แก้ lib/survey, import อย่างเดียว) ; สถานะ: tsc/lint/test ผ่าน
- ⚠️ ให้เจ้าของ `web/vitest.config.mts` (T1/survey-core) เพิ่ม `'lib/**/*.test.ts'` ใน `test.include` — ตอนนี้ `pnpm -C web test` ยังไม่รัน test ใน lib (run ตรง ๆ ได้ที่ `pnpm -C web exec vitest run --config lib/import/vitest.import.mts`, config ชั่วคราวของ T3 จะลบเมื่อ include ถูกแก้)

## T2 review (Sonnet): freshness + contract pass
- _data.ts: เปลี่ยนจาก react cache() เป็น 'use cache' + cacheLife({stale:30, revalidate:60, expire:3600}) -> build แสดง Revalidate 1m ทุกหน้า, แถวใหม่ขึ้นภายใน ~1 นาที
- MockBanner แสดง "สาเหตุ: <error>" เมื่อ fallback เป็น mock; ไม่ crash (error.tsx มีอยู่แล้ว)
- CrosstabTable: ยอดรวมมุมล่างขวาใช้ result.n แทน reduce ใน UI; FreqBar ใส่โน้ต "ตอบได้หลายข้อ >100%" อัตโนมัติสำหรับ sur08
- ผ่าน: next typegen, tsc, vitest 25, eslint, next build

## T3 — opencode (2026-11-14): admin + import + quality + seed เสร็จสมบูรณ์
- **สิทธิ์ผู้ดูแล (ข้อ 6):** `web/proxy.ts` (matcher `/admin/:path*`, `/api/admin/:path*`; API→401 JSON, หน้า→redirect login) + `web/lib/import/auth.ts` (cookie `admin_auth` เก็บ sha256(`admin:<passcode>`), httpOnly 12 ชม. ; ไม่ตั้ง ADMIN_PASSCODE = โหมดเดโม่ เปิดดูได้ แต่เขียน DB ยัง 503) + Server Actions login/logout ใน `web/app/admin/login/`
- **Import:** `web/app/api/admin/import/route.ts` (multipart/JSON, preview ไม่เขียน DB, commit = upsert ทีละ 200 onConflict `dedupe_key` ignoreDuplicates + นับ before/after + เขียน import_logs ; commit ไม่มีแถว valid → ไม่แตะ DB) + UI `web/app/admin/import/` (ลากวาง, preview, สถิติ, ปุ่มยืนยัน, วิธี export CSV)
- **Quality:** `web/app/admin/quality/page.tsx` — KPI (ทั้งหมด/สมบูรณ์/ไม่ผ่านคัดกรอง/ไม่ยินยอม/ไม่ครบข้อบังคับ/sur08 ขัดแย้ง), ตารางขาดรายข้อ sur05–sur11, คำตอบ "อื่น ๆ" ที่ต้องตรวจ (sur02–sur08 + sur11), import_logs 20 ล่าสุด, สถานะซิงก์ Form จาก lastSubmittedAt ; ใช้ `getRawRows/normalize/quality` จาก lib/survey เท่านั้น (อ่านอย่างเดียว)
- **Seed:** `web/scripts/seed.ts` — `pnpm seed` = makeMock(300,42) upsert (ข้ามซ้ำอัตโนมัติ, รันซ้ำได้: ทดสอบแล้ว 0 เพิ่ม/300 ข้าม) ; `pnpm seed:clear` = ลบเฉพาะ source='seed' ; env: `--env-file` ถ้ามี ไม่งั้นอ่าน .env.local เอง (ไม่ override, ไม่พิมพ์ค่า)
- ⚠️ **แก้ package.json (นอกลิสต์ไฟล์ T3 แต่สเปกสั่ง):** เพิ่ม scripts `seed`/`seed:clear` + devDependency `tsx` (node --experimental-strip-types รันไม่ได้เพราะ lib/survey/* ใช้ import ไม่มีนามสกุล)
- **บั๊กที่เจอและแก้ระหว่างทาง:** (1) `dynamic="force-dynamic"` ห้ามใช้กับ cacheComponents → ใช้ Suspense + `connection()` ตามแบบ (dash)/layout (2) TS union `"preview"|"commit"|string` ยุบเป็น string → normalizeMode คืน mode ที่ปลอดภัย (3) **isValidPasscode เทียบ sha256(input) กับ sha256(`admin:…`) ไม่มีทางตรงกัน** → เติม prefix ให้ตรงกัน (ล็อกอินรหัสถูกไม่เคยผ่าน — ทดสอบ E2E แล้ว: 303 + Set-Cookie + redirect ทำงาน)
- ผ่านครบ: next typegen, tsc --noEmit, eslint, vitest 25 + import 14, next build (routes: /admin/import ◐, /admin/login ◐, /admin/quality ◐, /api/admin/import ƒ, Proxy ✓) ; ทดสอบจริง dev server: 307/401 กันคนไม่มี cookie, login ผิด→?error=1, ถูก→/admin/import, อัปโหลด CSV preview 3/2/1 ถูกต้อง, หน้า quality แสดงข้อมูลจริง (read-only เท่านั้น — **ไม่เคยรัน commit กับ DB จริง**)
- คำเตือน dev จาก Next: `<html>` มี scroll-behavior: smooth → แนะให้ T2 ใส่ `data-scroll-behavior="smooth"` ใน layout (ไม่ได้แก้ ไม่ใช่ไฟล์ผม) ; ยังขอ include `'lib/**/*.test.ts'` ใน vitest.config.mts ตามหมายเหตุ T3 ข้างบน

## T3 re-verify — opencode (2026-11-14)
- ตรวจซ้ำตรงสเปก T3: quality page แสดง KPI ครบ (ทั้งหมด/สมบูรณ์/ไม่ผ่าน scr01–02/ไม่ยินยอม/ไม่ครบข้อบังคับ/sur08 ขัดแย้ง), ตารางขาด sur05–sur11, "อื่น ๆ" (sur02–sur08 + sur11), import_logs 20, เวลา submitted_at ล่าสุด + สถานะซิงก์ Form ; seed ใช้ makeMock(300,42) + `--clear` ลบเฉพาะ source='seed'
- รันผ่าน: `pnpm -C web lint` ✓, `tsc --noEmit` ✓, `test` ✓ (2 ไฟล์/25 tests), import tests `--config lib/import/vitest.import.mts` ✓ (14 tests), `build` ✓ (/admin/quality อยู่ใน route), `pnpm -C web seed` ✓ (เพิ่ม 0/ข้าม 300 — idempotent)
- ข้อจำกัดเดิม: `pnpm -C web test` ยังไม่รวม `web/lib/import/csv.test.ts` เพราะ `web/vitest.config.mts` (ไฟล์ของ T1) include เฉพาะ `tests/**` ; ต้องรัน config แยกจนกว่าเจ้าของไฟล์จะเพิ่ม `lib/**/*.test.ts` (บันทึกไว้แล้วข้างบน)


## T2 Round 2 (G1–G5) — Gemini Antigravity (2026-11-14)
- **G1 (`/guide`):** หน้า `web/app/(dash)/guide/page.tsx` อธิบายวิธีอ่านกราฟ (ฐาน n/ไม่ตอบ/ไม่ประสงค์ระบุ/ข้อหลายตัวเลือก > 100%), ตัวกรอง, 4 ตัวอย่างการตัดสินใจ, ข้อจำกัด, FAQ 5 ข้อ
- **G2 (`/survey-poster`):** ติดตั้ง `qrcode.react` (`4.2.0`) และสร้าง `web/app/survey-poster/page.tsx` โปสเตอร์ QR แนวตั้งขนาด A4 พร้อม print CSS และปุ่มพิมพ์ที่ซ่อนตอนพิมพ์
- **G3 (`docs/REPORT_SYSTEM.md`):** เอกสารบทพัฒนาระบบวิชาการ 7 หัวข้อครบ (Mermaid architecture, Data Dictionary + `dedupe_key`, `is_complete`/cleaning rules, ตารางเมนู-SUR-ประโยชน์, RBAC, tech stack, ตารางเทียบ EXP-01–11) ใช้ `[รอผลจริง]` ทุกผลวิจัย
- **G4 (Responsive / Contrast / Mobile Drawer / Thai Chart Labels):** ปรับ `chart-helpers.tsx` (`Intl.Segmenter("th")`), `FreqBar.tsx` (yAxisWidth `138`/`216`, เพิ่มความสูงแถว), `FilterBar.tsx` (Mobile Filter Drawer + backdrop + Escape), `DashShell.tsx`/`EmptyState.tsx`/`BusinessClient.tsx`/`ReportsClient.tsx`/`guide/page.tsx` (`dark:bg-[#0d736b]` สำหรับ AA contrast บนปุ่มข้อความขาว, `print:bg-white`, `print:grid-cols-2` บน `/reports`) — **หมายเหตุ:** ยังไม่ได้บันทึกภาพหน้าจอ `docs/screenshots/` เนื่องจากผู้ใช้ยกเลิกคำสั่ง browser audit กลางคัน
- **G5 (Nav + Footer + Layout polish):**
  - `web/components/nav-config.ts` + `DashShell.tsx`: เพิ่มเมนู `"คู่มือ"` (`/guide`) และลิงก์ `"โปสเตอร์ QR"` (`/survey-poster`, ไม่ต่อ query string) ในกลุ่ม "ช่วยเหลือ & เครื่องมือ" ทั้ง desktop sidebar และ mobile drawer (ลบการ์ดซ้ำจาก SidebarFooter)
  - `web/components/Disclaimer.tsx` + `web/app/survey-poster/page.tsx`: เพิ่มส่วนท้ายทุกหน้าพร้อมชื่อโครงการวิจัย, คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏยะลา, ปีที่จัดทำ `2569` และลิงก์ `"เว็บหลักโครงการ"` (`NEXT_PUBLIC_MAIN_SITE_URL` / `EXTERNAL_LINKS.mainSite`)
  - `web/app/layout.tsx`: เพิ่ม `data-scroll-behavior="smooth"` บน `<html>` ตามคำแนะนำจาก T3
- **ผลตรวจสอบล่าสุด (หลังแก้ไฟล์ทั้งหมด):** `pnpm -C web exec next typegen` ✓, `pnpm -C web lint` ✓, `pnpm -C web exec tsc --noEmit` ✓, `pnpm -C web test` ✓ (2 files / 25 tests passed), `pnpm -C web build` ✓ (17/17 static pages, routes: `/`, `/awareness`, `/business`, `/guide`, `/reports`, `/satisfaction`, `/spending`, `/survey-poster`, `/travel`, `/visitors`, `/admin/*`, `/api/admin/import`).

## Review รวม — Opus (2026-11-14)
- vitest.config.mts include lib/**/*.test.ts แล้ว (ลบ lib/import/vitest.import.mts) → pnpm test = 39 tests
- แก้ช่องโหว่: ไม่ตั้ง ADMIN_PASSCODE เดิมเปิด /admin + import API ให้ทุกคน → ตอนนี้ fail closed (proxy.ts, route.ts, login/actions.ts, login/page.tsx)
- Supabase จริงมี seed 300 แถว → เพิ่ม banner เตือน seedCount (_data.ts, MockBanner.tsx, (dash)/layout.tsx) ; ต้อง `pnpm -C web seed:clear` ก่อนเก็บข้อมูลจริง
- smoke test localhost:3000: หน้าภาพรวมอ่าน Supabase ได้, /api/admin ไม่ล็อกอิน=401, login→/admin/quality ได้

## T4 (qa-docs, Claude Haiku) — ตรวจตัวเลือกเทียบ DATA_CONTRACT §1 และ script_googleForm/snippet.js

ผล: `web/lib/survey/schema.ts` ตรงกับ DATA_CONTRACT §1 ทุกข้อ (ข้อความ, en dash, ลำดับ) และตรงกับ snippet.js ทุกตัวเลือกที่ตั้งไว้ใน setChoiceValues/createChoice
ความไม่ตรงที่พบ (ไม่ได้แก้โค้ด):
1. **"+อื่น" ตาม DATA_CONTRACT §1 ไม่ถูกตั้งใน snippet.js** — contract ระบุ sur03, sur04, sur05, sur06, sur08 เป็น "+อื่น" แต่ snippet.js ไม่มี `addOtherOption` ที่ข้อใดเลย (มีเฉพาะคอมเมนต์ sur02 ว่าตั้งใจไม่เปิด) → ต้องตัดสินใจ: เพิ่ม "อื่น ๆ" ในฟอร์มจริง หรือแก้ contract ให้ตรงฟอร์ม (ตัวเลือกจริงในฟอร์มยังไม่รวม "อื่น ๆ" จึงไม่มีผลกับ schema.ts ที่คำนวณ "อื่น ๆ" จากค่านอกรายการ)
2. sur02 ใน DATA_CONTRACT ไม่มี "+อื่น" ตรงกับ snippet.js แล้ว — ไม่ใช่ความไม่ตรง (บันทึกไว้เพื่อยืนยัน)
3. ชื่อหัวข้อ Form (title) ไม่ตรงตัวอักษรกับ contract ในบางข้อ (เช่น sur02 "2. ปัจจุบันท่านอาศัยอยู่…" vs "2. อาศัยอยู่") — ไม่กระทบ เพราะ `codeOf_` ใน syncToSupabase.gs จับด้วยเลขนำหน้า/ข้อความขึ้นต้น แต่ควรระวังหากเปลี่ยนชื่อข้อใน Form ในอนาคต
ข้อสังเกต: ฟอร์มจริงยังต้องแก้มือ (SURVEY_REVIEW) — ข้อ 2 ของคำชี้แจงและ help text ข้อ 8 อยู่ใน snippet.js แล้ว แต่ฟอร์มจริงต้องตรวจเอง

- QA: ดู docs/QA_CHECKLIST.md (ชื่อ EXP/EVA สรุปจากบริบท DATA_CONTRACT ต้องตรวจกับเอกสารต้นฉบับ)
- README.md ราก: เขียนแล้ว (ไม่มีค่า secret จริง)
- (Opus) แก้รายงาน T4: snippet.js มี showOtherOption(true) ครบ 5 ข้อ (sur03/04/05/06/08) ตรง contract — ข้อ "+อื่น ไม่ตรง" ของ haiku ไม่ถูกต้อง ; QA_CHECKLIST เขียนตาราง EXP/EVA ใหม่ตามเครื่องมือจริง

## Seed safety — opencode (2026-11-14)
- `web/scripts/seed.ts`: insert ต้องมี `--yes`; ถ้ามี NEXT_PUBLIC_SUPABASE_URL แต่ไม่ใส่ จะพิมพ์คำเตือนภาษาไทยแล้ว exit 1 (ทดสอบแล้ว exit=1 และไม่แตะ DB)
- `--clear` ไม่ต้องใช้ `--yes` และพิมพ์จำนวนแถวที่ลบจริง (ทดสอบลบ 300) ; เพิ่ม `seed:count` ใน package.json พิมพ์จำนวนแยก source google_form/csv/seed (ทดสอบ 0/0/300)
- ผ่าน `pnpm -C web lint`, `tsc --noEmit`, `pnpm test` (3 ไฟล์/39 tests) ; ทดสอบครบวงจร clear → `seed -- --yes` → count แล้ว seed กลับครบ 300 แถว

## Smoke test — opencode (2026-11-14)
- สร้าง `web/scripts/smoke.ts` + script `smoke`: ใช้ fetch ล้วน ตรวจ 11 route (200 + คำว่า "วัดคูหาภิมุข"), `/admin/quality` ไม่มี cookie ต้อง 307/308 → `/admin/login`, POST `/api/admin/import` ต้อง 401, และ `--expect-real` ตรวจหน้า / ว่าไม่มี "ข้อมูลตัวอย่าง"
- พิมพ์ตาราง ✓/✗ ภาษาไทย + exit 1 เมื่อมีข้อไม่ผ่าน ; ทดสอบ localhost:3000 ผ่าน 13/13, โหมด `--expect-real` ผ่าน 14/14, ยิง URL ที่ไม่มีเซิร์ฟเวอร์ได้ exit=1
- ผ่าน `pnpm -C web lint`, `tsc --noEmit`, `pnpm test` (3 ไฟล์/39 tests) ; ไม่แตะ `web/app/**`, `web/components/**`, `web/lib/**`

## UI redesign — sonnet
- รื้อ UI ตาม docs/DESIGN.md ทั้งหมด: tokens ใหม่ใน globals.css (light+dark, ลบ teal/orange), ฟอนต์ IBM Plex Sans Thai ; โค้ดจัดเป็น `components/{shell,filters,charts,ui,page}/` (ลบ KpiCard/DashPageHeader/MockBanner/FilterBar/DashShell เดิม)
- ทุกหน้าวิเคราะห์ใช้เทมเพลตเดียว: `app/(dash)/_route.tsx` (DashRoute = Suspense + getSurveyBundle) + `components/page/DashPage.tsx` (กรอง→description→EmptyState/เนื้อหา) ; หน้า admin ใช้ `shell/AdminFrame.tsx` ; ตัวเลขทั้งหมดยังมาจาก lib/survey (UI เลือกอันดับ 1 จาก freq()/topItem() เท่านั้น)
- /admin/quality: สถานะซิงก์ Google Form นับเฉพาะ source='google_form' (ไม่มี → warn "ตรวจ syncToSupabase.gs", >24 ชม. → info) + แถวจำนวนต่อ source (google_form/csv/seed) ใน `admin/quality/sync-status.ts`
- Print (/reports): A4, override token เป็นขาวดำ, ซ่อน `.no-print`, หัวรายงาน `.print-only` (ตัวกรอง+แหล่งข้อมูล+วันที่ข้อมูลล่าสุด)
- ปรับจาก DESIGN.md เล็กน้อย: `--ink-3` เข้มขึ้นเป็น #667085 (ให้ผ่าน contrast 4.5:1), KPI ที่เป็นข้อความยาวใช้ 20/28 แทน 30/36, ตัวกรองแบบชิป ≥1024px (ต่ำกว่านั้นใช้ bottom sheet), ปุ่ม 7/30 วัน อิงวันล่าสุดของข้อมูล
- ทอง: ขอบการ์ด InsightCard + แถบเมนู active อาจรวมเกิน 3 จุดต่อจอบนหน้าภาพรวม/ธุรกิจ (3 การ์ด + 1 แถบเมนู)
- ตรวจแล้ว: typegen, tsc, test 39/39, lint, build ผ่าน ; dev server :3000 แสดง CSS เก่าค้าง (Turbopack cache) ต้อง restart `pnpm dev` ถึงจะเห็นหน้าตาใหม่
- (Opus) smoke --expect-real ไม่จับแบนเนอร์ seed ("ข้อมูลทดสอบ") → แก้แล้ว ; ใส่ภาพ 9 ตำแหน่งใน USER_MANUAL (เหลือ 10–12) ; สถานะรวมอยู่ใน NEXT_SESSION.md

## UI v2 — sonnet
- T7 เสร็จ: token v2 (navy/amber/muted-bar/diverging, light+dark) ใน `globals.css` ; ชื่อ token ใหม่: `navy` `navy-solid` `navy-2` `amber` `amber-soft` `amber-ink` `muted-bar` (เลิกใช้ brand/gold/data-muted) ; คลาส `.card` `.kpi-solid` ; `.btn-primary` = อำพันมน
- ธีมกราฟกลางอยู่ที่ `components/charts/theme.ts` (สี/แกน/กริด/BAR_SIZE/ป้ายสั้น SUR-08) + `ChartTooltip` + `LegendDots` ; BarRows = navy, อันดับ 1 = amber, tail = muted
- หน้าภาพรวมใหม่แยกที่ `components/overview/*` (OriginCompareCard, RevisitDonutCard, DailyCard+MonthHeat, overview-data.ts, overview-kpis.ts) ; ตัวเลขทุกค่าจาก `applyFilters`+`multiFreq`/`daily`/`freq`/`overview` ของ lib ; ลบ `DailyLine.tsx` (แทนด้วย DailyCard)
- ส่วนต่างในการ์ดแท่งคู่ = round1(pct ต่างถิ่น − pct ยะลา) ของหมวดที่ต่างมากสุด ; แกน SUR-08 ตัด "ไม่มีความสนใจเป็นพิเศษ"/"อื่น ๆ" ; ป้ายค่าบนแท่งซ่อนบนจอ < 640px (ใช้ทูลทิป/ตาราง)
- StatStrip เป็นการ์ดลอยแยก ใบแรก navy ทึบ (print = ขาว) ; ปฏิทินความเข้ม 4 ขั้นเพื่อให้ตัวอักษรผ่าน contrast ; โปสเตอร์ QR ใช้ค่าสี hex ตายตัวชุด v2 (พิมพ์)
- ตรวจแล้ว: typegen, tsc, test 39/39, lint, build ผ่าน ; ทุกเส้นทาง 200 (admin import/quality 307 = fail-closed) ; ดูหน้า / ที่ 1024/375 + dark ไม่มี overflow ; ยังไม่ได้ดู admin import/quality ด้วยตา (ต้องล็อกอิน) และยังไม่ได้พิมพ์ /reports จริง

## UI polish T8 — sonnet
- แถบข้าง 248px, เมนู 36px, ป้ายเมนูสั้น (`navLabel` ใน nav-config ; หัวหน้ายังใช้ `label` เต็ม) ไม่ถูกตัดที่ 1280, ไม่ต้องเลื่อนที่ 1280×800 ; scrollbar บาง/โปร่ง (`.sidebar-scroll`, `.thin-scroll` ใน globals.css) ; โหมด dev เว้นขอบล่างให้พ้นปุ่ม Next dev indicator
- การ์ดสูงเท่ากันทุกแถวด้วย `ui/Cell` (flex stretch) + ChartCard/BarRows ยืดเนื้อหา ; ภาพรวมเรียงใหม่: 8/4 → daily 12 → slot 4/ช่องทาง 8 → มากับใคร 6/พาหนะ 6 → ข้อเสนอ 3 ใบเต็มแถว (FreqBar `hideOthers`)
- /satisfaction ใหม่: `components/satisfaction/*` (ค่าเฉลี่ยตามถิ่นพำนัก/ผู้ร่วมเดินทางด้วย applyFilters+satisfaction, heatmap crosstab sur09×sur10) ; CommentList สูงคงที่ 520px เลื่อนในกรอบ + ค้นหา + ชิปกลุ่ม + แสดงเพิ่มทีละ 30 ; ลบ RevisitChart (ใช้ RevisitDonutCard แทน)
- /business: tabs 4 ประเภทเต็มแถว → การ์ดโปรไฟล์กรมท่า 5 คอล + KPI 3 ใบ 7 คอล (StatStrip `solidFirst={false}`)
- ตรวจ (build + start :3100): ทุกแถวสูงเท่ากันที่ 1280/1440 ทุกหน้า, ไม่มี overflow แนวนอนที่ 375 ; ภาพรวม 2,053→2,553px (เพิ่มการ์ดมากับใคร/พาหนะ), satisfaction ~5,5xx→1,729px

## ไล่ตรวจหน้าย่อย v2 + ภาพคู่มือชุดใหม่ — Claude (15 พ.ย. 2569)
- ตรวจ production build (:3100) ทุกหน้าที่ 1280 และ 375 ด้วย JS audit (ล้นจอแนวนอน / สีนอกชุด token / ข้อความถูกตัด) + ดูภาพจริงจาก Edge headless ; ไม่พบสีหลุดชุด, ไม่มีหน้าล้นจอ (ตาราง crosstab เลื่อนแนวนอนในการ์ดตามตั้งใจ)
- แก้: ชื่อหน้าบน top bar ถูกตัด (`...`) บนมือถือ → ขึ้น 2 บรรทัดได้ (`line-clamp-2`, TopBar + AdminFrame) ; แบนเนอร์เตือนข้อมูลทดสอบถูกตัด → ขึ้น 2 บรรทัดได้
- แก้ความขัดแย้ง: ป้ายมุมขวาบนเคยเขียน "ข้อมูลจริง" ทั้งที่มี seed 300 แถวปน → ตอนนี้เป็น "ข้อมูลทดสอบปนอยู่" (สีเหลือง) เมื่อ `seedCount > 0` ; `/admin/quality` แจ้งเตือนเดียวกันพร้อมคำสั่ง `pnpm seed:clear` ; หัวรายงานตอนพิมพ์ `/reports` บอกจำนวนแถวทดสอบด้วย ; ข้อความท้ายใน `/guide` อัปเดต (smoke `--expect-real` ยังจับข้อความ "ข้อมูลทดสอบ" ได้เหมือนเดิม)
- Print A4 `/reports`: ตรวจทีละหน้าจาก PDF จริง (6 หน้า) — การ์ดไม่ถูกตัดกลาง, KPI 3 ใบขึ้นแถวเดียว (`print:grid-cols-N` ใน StatStrip), ตัดจุด `·` ที่ท้ายหมายเหตุที่เหลือเดี่ยวตอนพิมพ์ ; รายการข้อเสนอแนะ SUR-11 (79 รายการ) ไหลข้าม 3 หน้า ยอมรับได้
- เพิ่ม `web/scripts/screenshots.mjs`: ถ่ายภาพคู่มือทั้งชุด (desktop 1280×800 + mobile 390×844 + popover/sheet/ตาราง/พรีวิวนำเข้า CSV/print A4) ด้วย Edge ที่ติดตั้งอยู่ (CDP, ไม่ลง browser เพิ่ม) ; ใช้ซ้ำกับข้อมูลจริง: `node web/scripts/screenshots.mjs docs/screenshots/real http://localhost:3100` (ต้องเปิดเว็บ production ที่ :3100 ก่อน ; `--pdf-preview` ถ่ายทีละหน้า A4 ไว้ใน `.tmp/print-preview/`)
- ภาพ `docs/screenshots/demo/*` ถ่ายใหม่ทั้งชุดเป็นหน้าตา v2 (ชื่อไฟล์เดิม) + เพิ่ม admin-import / admin-import-preview / admin-quality (desktop, mobile) ; USER_MANUAL แทน [ภาพที่ 10–11] แล้ว เหลือเฉพาะ [ภาพที่ 12] (Apps Script ผู้ใช้ถ่ายเอง)

## T15 + T16 + T12 (ส่วนที่เหลือ) — Claude (15 พ.ย. 2569)
- T15 ตัวกรองเดือน/ปี: `lib/survey/filters.ts` เพิ่ม `monthsWithData` `monthRange` `yearRange` `quickRange` `filterMonth` `filterYear` (+ `tests/filters-range.test.ts`) ; `DateRangeFilter` มีปุ่ม เดือนนี้/เดือนที่แล้ว/ปีนี้ + ปุ่ม "ทั้งปี" + ชิปเดือน (พ.ศ., เฉพาะเดือนที่มีข้อมูล พร้อมจำนวน) ใช้กลไก from/to เดิม (ทุกหน้า/พิมพ์/แชตได้ทันที) ; ป้ายชิปแสดง "พ.ย. 2569" / "ปี 2569" ; FilterChip เพิ่ม prop `wide`
- T16: `NEXT_PUBLIC_RESEARCH_FROM/TO` (อ่านใน `app/(dash)/layout.tsx`, ไม่ตั้ง = ซ่อนปุ่ม "ช่วงข้อมูลวิจัย") ; `collectionProgress(rows, today)` นับ 7 วันล่าสุดย้อนจากวันนี้ + `surplus` ; การ์ดความคืบหน้าเป็น client (รับ `rows`, ใช้ `useBangkokToday` เพื่อไม่ให้ prerender แช่วันเก่า) ; เกินเป้า = "ข้อมูลสะสม N ชุด (เกินเป้าเต็ม +X ชุด)"
- T12: `InsightCard` มีเลขลำดับ + "ลองทำ:" (ข้อเสนอ) / "วิธีใช้ข้อมูล:" แยกชัด ข้อความเตือน "ข้อเสนอเบื้องต้น…" ย้ายไปหัวส่วนครั้งเดียว ; `DashPage` แสดง `SmallPageNotice` เมื่อผู้ตอบหลังกรอง < `SMALL_PAGE_N` (30, ใน schema.ts)
- ตรวจ: typegen/tsc/lint/test 62/62/build ผ่าน ; ดูบน `next start :3101` (ตัวกรองเดือน, ปุ่มช่วงวิจัย, หน้า /business) ไม่มี console error

## T11 จูนแชต — Claude (15 พ.ย. 2569)
- แชตตอบจาก "กลุ่มที่ผู้ใช้กรองอยู่" : ChatWidget ส่ง `filters` (จาก URL) → `parseFilters` (whitelist วันที่/ตัวเลือก) → `buildContext` กรองแถวก่อนคำนวณ + ใส่บรรทัดบอก AI ว่ามีตัวกรอง, วันนี้, ช่วงวันที่ของข้อมูล (รูปแบบ พ.ศ. ผ่าน `thaiDate`) ; กรองจนว่าง = บอกให้ปรับตัวกรอง
- `askGemini` ลองซ้ำ 1 ครั้งเมื่อถูกบล็อกผิด (prefix "คำถามเชิงสถิติ…") ; quota/error ไม่ retry
- prompt: คำเตือน n น้อยไว้ท้ายคำตอบ, "ส่วนใหญ่" ต้อง >50%, ห้ามเดาพฤติกรรมที่ไม่มีในบริบท, ไม่เข้าใจโดยไม่บอกว่าตรงไหน = อธิบายหน้าสั้น ๆ แล้วถามกลับ
- UI: "ลูกค้าส่วนใหญ่…" บนหน้าธุรกิจ → "กลุ่มลูกค้าที่พบมากที่สุด…" (ร้อยละมักไม่ถึง 50%)
- ทดสอบจริง (Gemini, :3101, n=7–9): ตอบตรงข้อมูล/ฐาน n/นอกเรื่อง/prompt injection/ไม่มีข้อมูล/ไม่รับประกันรายได้ ผ่าน · test 66/66 · เหลือทดสอบบน Vercel + มือถือจริง

## T17 อัปเดตอัตโนมัติ + T18 แชตชวนเล่าธุรกิจ — Claude (15 พ.ย. 2569)
- ปัญหา: ต้องรีเฟรชถึงเห็นผู้ตอบใหม่ (แคชฝั่งเซิร์ฟเวอร์ 60 วินาที ไม่มีการดึงซ้ำฝั่งเบราว์เซอร์) → `_data.ts` revalidate 15 วินาที ; `AutoRefresh` (top bar, ไฟเขียว) ถาม `GET /api/pulse` ทุก 15 วินาที ถ้า `version` (จำนวนส่ง.สมบูรณ์.เวลาล่าสุด) ต่างจากที่หน้าแสดง → `router.refresh()` (ไม่ refresh เมื่อไม่มีข้อมูลใหม่ ; หยุดเมื่อแท็บไม่ได้เปิด) ; ผู้ตอบใหม่ปรากฏราว 15–40 วินาที ; ตรวจแล้วด้วยการจำลอง version ใหม่ใน browser → ยิง refresh 1 ครั้ง
- แชต: หลังเลือกธุรกิจ ผู้ช่วยชวนเล่าธุรกิจ + ปุ่มหัวข้อเติมแบบฟอร์มลงช่องพิมพ์ (`TOPIC_STARTERS`) ; ข้อความผู้ใช้ยาวได้ 800 ตัวอักษร (คำตอบเก่า 2000) ; prompt โหมดวางแผน ; ทดสอบจริงกับ Gemini ผ่าน

## Favicon + อนิเมชันแชต — Claude (15 พ.ย. 2569)
- ไอคอนใหม่ (โค้งถ้ำสีอำพันบนพื้นกรมท่า + แท่งกราฟ 3 แท่ง): `web/app/icon.svg` (ต้นฉบับ) · `favicon.ico` (32+48) · `apple-icon.png` (180, ไม่มุมโค้งตามข้อกำหนด iOS) — สร้าง PNG ด้วย Edge headless (`--screenshot`) ไม่ลงเครื่องมือเพิ่ม
- อนิเมชันแชต (CSS ใน `globals.css` + `ChatWidget.tsx`): ปุ่มลอยเด้งเข้า + วงแหวนกะพริบ 3 รอบ · แผงเด้งขึ้น (มือถือเลื่อนขึ้น) · ฟองข้อความ/ปุ่มลอยเข้าทีละใบ · คำตอบ AI "พิมพ์ทีละนิด" (`TypedReply` 0.9–3 วินาที, กดฟองเพื่อข้าม) ; ปิดทั้งหมดอัตโนมัติเมื่อผู้ใช้ตั้ง prefers-reduced-motion
- หมายเหตุทดสอบ: ถ้า Browser pane ถูกซ่อน อนิเมชัน/rAF จะค้าง (ต้อง `tabs_select` ให้แสดงก่อนทดสอบ)
- ฟองทักทายข้างปุ่มแชต (`TEASERS` ใน ChatWidget): รอ 4 วินาที → เด้งสปริงเข้า 7 วินาที → หดออก → ข้อความถัดไป (3 ข้อความ) ; กด ✕ / เปิดแชต = หยุดตลอดแท็บ (`sessionStorage yala-chat-teaser-off`) ; ไอคอนปุ่มส่ายเบา ๆ ทุก 5 วินาที

## T19 + T20 + T21 + T22 (บางส่วน) — Claude + survey-core(sonnet) + qa-docs(haiku) (15 พ.ย. 2569)
- T21: `lib/survey/data.ts` — ตั้ง Supabase env แล้วอ่านไม่สำเร็จ (ลองซ้ำ 1 ครั้ง) → `source='error'` ไม่มีแถว **ไม่ใช้ mock แทนอีกต่อไป** (mock เฉพาะตอนไม่ได้ตั้ง env) ; แบนเนอร์แดง + ป้าย "เชื่อมต่อฐานข้อมูลไม่ได้" + หน้า admin/quality/reports รองรับ ; ทดสอบด้วยคีย์ผิด (`SUPABASE_SERVICE_ROLE_KEY=bad next start`) ผ่าน ; ปุ่ม "ลองตอบแบบสำรวจ" ที่ top bar (จอ md ขึ้นไป ใช้ `NEXT_PUBLIC_SURVEY_URL`) ; **ยังไม่ทำ** ลบ/ซ่อนแถวทดสอบจาก admin (ต้องเขียนฐานข้อมูลจริง → ขอผู้ใช้ก่อน ; ตอนนี้ลบใน Supabase Table Editor หรือใช้ช่วงข้อมูลวิจัยตัดแถวที่หลังวันตัด)
- T19: การ์ดคนยะลา vs ต่างถิ่น แสดงจำนวนที่ขาด (ขั้นต่ำ 5/กลุ่ม, `originCompare().need`) + วิธีเก็บ
- T20 (survey-core): `lib/survey/stats.ts` (Wilson CI, ไคสแควร์/Fisher 2×2, Welch t + Cohen d, marginOfError, reliabilitySummary) + `tests/stats.test.ts` + `docs/STATS_METHODS.md` ; UI: `components/stats/ReliabilityCard` ใน /reports, คอลัมน์ "ช่วงเชื่อมั่น 95%" ในตารางรายข้อ, p-value + สรุปในการ์ด SUR-08 หน้าภาพรวม
- T22: CSV ส่งออกมีช่วงเชื่อมั่น 95% + ส่วนสถิติท้ายไฟล์ (`tests/report-csv.test.ts`) ; Word ยังไม่ทำ
- qa-docs(haiku): เพิ่ม NEW-01..13 ใน docs/QA_CHECKLIST.md + ตาราง env/ฟีเจอร์ใน README.md (ยังไม่ติ๊กผ่าน — ต้องทดสอบด้วยมือ)

## ปุ่มลบแถวทดสอบ (หน้า /admin/quality) — Claude (15 พ.ย. 2569)
- แผง "แถวผู้ตอบล่าสุด — ลบแถวที่ทดสอบกรอก" (`app/admin/quality/RecentRowsPanel.tsx`): แสดง 40 แถวล่าสุด (รวมที่ไม่นับ) เลือกด้วยช็อกบ็อกซ์ (ปุ่มลัดเลือก source=seed) → "ลบถาวร" → ยืนยัน 2 ขั้น → `POST /api/admin/delete`
- API (`app/api/admin/delete/route.ts` + `lib/import/deleteRows.ts`): ตรวจ cookie ผู้ดูแลซ้ำ · รับเฉพาะ `{ids: uuid[]}` 1–50 รายการ (ผิดรูปแบบ = ปฏิเสธทั้งคำขอ ไม่มีโหมดลบทั้งหมด) · อ่านแถวเดิมส่งกลับเป็นไฟล์สำรอง `.json` ที่เบราว์เซอร์ดาวน์โหลดให้อัตโนมัติ · บันทึก `import_logs` (source=admin_delete) เป็นหลักฐาน
- **ลบจริง (hard delete) ไม่ได้ย้อนกลับในระบบ** และคำตอบยังอยู่ใน Google Form/Sheets → ถ้ารัน `backfillAll()` ใน Apps Script ซ้ำ แถวที่ลบจะกลับมา (ไม่ควรรันซ้ำ) ; ไม่เปลี่ยนโครงสร้างฐานข้อมูล
- ทดสอบ e2e กับฐานข้อมูลจริงด้วยแถวทดสอบที่สร้างเอง 1 แถว (ไม่ผ่านคัดกรอง) → ลบสำเร็จ + ไฟล์สำรองถูกต้อง + 401/400 ตามคาด ; ทดสอบ 4 เคสใน `tests/delete-rows.test.ts` ; **ยังไม่ได้ดูหน้าตาแผงด้วยตา** (ต้องล็อกอินผู้ดูแล)

## ความปลอดภัยผู้ดูแล + Word export + พิมพ์รายงานธุรกิจ A4 — Claude + subagent sonnet/haiku (15 พ.ย. 2569)
- เซสชันผู้ดูแล (`lib/import/auth.ts`): cookie `admin_session` = `v1.<หมดอายุ>.<nonce>.<HMAC-SHA256>` (เดิม `admin_auth` = sha256 ของรหัสผ่านคงที่ ไม่มีวันหมดอายุฝั่งเซิร์ฟเวอร์) · อายุ 8 ชม. ตรวจฝั่งเซิร์ฟเวอร์ · HttpOnly + SameSite=Strict + Secure(prod) · กุญแจ = `ADMIN_SESSION_SECRET` หรืออนุพันธ์จาก `ADMIN_PASSCODE` → เปลี่ยนรหัส/secret = ออกจากระบบทุกเครื่อง · **ผู้ที่ล็อกอินค้างด้วย cookie เก่าต้องล็อกอินใหม่ 1 ครั้ง**
- `AdminSession` ใน `AdminFrame`: ปุ่มออกจากระบบ (server action ลบ cookie) + เวลาหมดอายุ ทุกหน้าผู้ดูแล (เดิมมีเฉพาะหน้า import)
- เดารหัสผิด 5 ครั้ง/10 นาที (ต่อ IP) → ล็อก 15 นาที (`loginLimit.ts` ในหน่วยความจำต่อ instance = กันเบื้องต้น ไม่ใช่ทั้งระบบ) + หน่วง 0.6 วินาทีทุกครั้งที่ผิด · ตรวจ Origin ใน API import/delete (403 ถ้าข้ามเว็บ) · `/admin`+`/api/admin` ส่ง no-store + noindex · `robots.txt` ปิด /admin และ /api/ · security headers ทุกหน้า (nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy ; ยังไม่ใส่ CSP เพราะเสี่ยงชน inline script ของ Next)
- ทดสอบ e2e กับ server จริง (`.tmp/admin_e2e.ts`) 21 เช็ก: 401/403, cookie ปลอม/หมดอายุ/แบบเก่า, flags ของ cookie, ล็อกอิน/ออกจากระบบผ่านฟอร์ม, ล็อกหลังผิดซ้ำ · unit test `tests/admin-auth.test.ts`
- ยังไม่ได้ทำ (ข้อเสนอถ้าจะเข้มขึ้น): ต่ออายุเซสชันตามการใช้งาน/idle timeout · ตารางเซสชันในฐานข้อมูลเพื่อ revoke รายเครื่อง · 2FA · rate limit กลาง (Redis/Upstash) · CSP
- Word export (sonnet): ปุ่ม "ส่งออก Word (.doc)" ใน /reports — `report-word.ts` สร้าง HTML ที่ Word เปิดได้ ตาราง "ตารางที่ N…" + ช่วงเชื่อมั่น 95% + ส่วนสถิติ ยะลา vs นอกจังหวัด · escape HTML ข้อความผู้ตอบ · ทดสอบด้วย unit test เท่านั้น **ยังไม่ได้เปิดไฟล์ใน Word จริง**
- พิมพ์รายงานธุรกิจ A4 (sonnet): ปุ่ม "พิมพ์รายงานธุรกิจนี้" ใน /business + หัวรายงาน print-only + CSS print ท้าย globals.css · **ยังไม่ได้ลองพิมพ์จริง** (ไม่แน่ใจว่าพอดี 1 หน้า A4 ; ถ้าล้นให้ลดขนาด/ใช้ zoom ใน `.biz-print`)

## T14 (ส่วนที่ทำได้ตอนนี้) + แก้ปุ่มล้นจอมือถือ — Claude + survey-core(sonnet) (15 พ.ย. 2569)
- แก้ `DashPage`: กล่องปุ่ม actions เดิม `shrink-0` ทำให้ /reports (CSV/Word/PDF) ล้นจอมือถือ → `max-w-full min-w-0 flex-wrap` ; ตรวจ 375px ทุกหน้าไม่มี scroll แนวนอน
- ภาพ real ชุดเต็ม 39 ภาพ: `docs/screenshots/real/` (ถ่ายด้วย `screenshots.mjs` ตอนผู้ตอบสมบูรณ์ ~52 ชุด) ; USER_MANUAL อ้างภาพชุดนี้แล้ว ; ถ่ายซ้ำก่อนส่งงานเมื่อข้อมูลครบ (`node web/scripts/screenshots.mjs docs/screenshots/real http://localhost:3101`)
- `web/scripts/report-draft.ts`: สร้าง `docs/REPORT_RESULTS_DRAFT.md` (บทที่ 4 หัวข้อ 4.1–4.9, ตาราง "ตารางที่ N…" + ช่วงเชื่อมั่น 95% + ประโยคตีความตามกฎตายตัว) จากฐานข้อมูลจริงด้วยฟังก์ชัน lib เดียวกับแดชบอร์ด ; รัน `pnpm -C web exec tsx scripts/report-draft.ts --from=YYYY-MM-DD --to=YYYY-MM-DD` ตามวันตัดข้อมูลเพื่อให้ตรงกับเล่ม (ตอนนี้ร่างจากข้อมูลทั้งหมด n=54)
- `web/scripts/verify-counts.ts`: นับอิสระจากข้อความดิบเทียบ `freq/multiFreq` ของแอป → ตรงทั้ง 67 ตัวเลือกข้อ 1–10 (exit 1 ถ้าไม่ตรง) ; **ไม่ใช่การเทียบกับ Google Sheets** (T6 ยังต้องใช้ CSV จากผู้ใช้)
- พบข้อมูลสกปรก: ข้อเสนอแนะ "ไม่มี" ที่มีอักขระความกว้างศูนย์ → `cleanValue` ตัด U+200B–200D/FEFF แล้ว (+test) ; ข้อเสนอแนะ 19 คนกรอก แต่มีเนื้อหาจริงราว 9 (ที่เหลือ "-"/"ไม่มี") ; ร่างไม่แก้คำผิดของผู้ตอบ

## ปรับสี v3 (ดินเผา + ครีม) + หน้าคู่มือใหม่ — Claude (15 พ.ย. 2569)
- ผู้ใช้รู้สึกว่าน้ำเงินกรมท่าเข้ม/มืดไป → เปลี่ยนชุดสีเป็น "ดินเผา + ครีม" (ตัวแปรกลางใน `app/globals.css` ; ชื่อตัวแปรเดิม navy/amber คงไว้เพื่อไม่ให้ต้องแก้ทุกคอมโพเนนต์ — ความหมายใหม่ดูคอมเมนต์หัวไฟล์) : แถบข้าง/แท็บล่างเป็นสีครีมสว่าง · แท่งปกติเทาอุ่น (`--bar`) อันดับ 1 + ปุ่มหลักดินเผา · กราฟเทียบ 2 กลุ่มใช้ดินเผา + เขียวเข้ม (`--series-2`) · diverging แดง→ทอง→เทา→เขียว · KPI ใบแรกพื้นดินเผาอ่อน (`--kpi-bg`) ไม่ทึบเข้ม · โหมดมืดพื้นน้ำตาลเข้มอุ่น
- คอนทราสต์ข้อความผ่าน AA ทุกคู่ทั้งสองโหมด (คำนวณด้วย .tmp/contrast.mjs) ; แท่ง `--bar` เป็นกราฟิกมีตัวเลขกำกับ จึงไม่บังคับ 3:1
- InsightCard: เลิกพื้นส้มทึบ/กล่องซ้อน → การ์ดพื้นอ่อนมีขอบ · favicon เปลี่ยนเป็นดินเผา+ครีม · เงาการ์ดโทนอุ่น
- หน้า /guide เขียนใหม่ : เริ่มใน 3 ขั้น → อ่านกราฟใน 10 วินาที (ภาพประกอบคงที่ ระบุว่าไม่ใช่ข้อมูลจริง) → ธุรกิจของฉัน → รายละเอียดเพิ่มเติม (พับเก็บ) → ข้อจำกัด → FAQ ; สารบัญติดข้างบนเดสก์ท็อป/เลื่อนแนวนอนบนมือถือ ; ตัดข้อความล้าสมัย (ข้อมูลจำลอง 300 ชุด)
- ยังไม่ได้ทำ : หน้า /survey-poster ยังใช้สีกรมท่า+อำพันแบบ hardcode (ออกแบบเป็นโปสเตอร์แยก) · ภาพ docs/screenshots/real และคู่มือ USER_MANUAL ยังเป็นสีเดิม → ถ่ายใหม่ตอนข้อมูลครบ · ตัดไอคอนถ้วย/ป้าย SUR-xx ในหน้าผู้ใช้ทั่วไป และสรุปข้อเสนอแนะเป็นหัวข้อ (ข้อเสนอรอบก่อน) ยังรอสั่ง
