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
