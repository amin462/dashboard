# รอบ 4 — ก่อน deploy และเก็บข้อมูลจริง (15 พ.ย. 2569)

สถานะ: UI redesign ✓, seed guard ✓, คู่มือ + สคริปต์ทดลองใช้ ✓ (แก้จำนวนกลุ่มให้ตรงตารางที่ 4 แล้ว: 12/6/8/4)
ฐานข้อมูลจริงยังมีแต่ seed 300 แถว (google_form 0)

## opencode — R4-O1 สคริปต์ smoke test หลัง deploy (ไม่แตะ UI)
```
สร้างไฟล์ใหม่ web/scripts/smoke.ts + script "smoke": "tsx scripts/smoke.ts" ใน web/package.json
ใช้: pnpm -C web smoke -- https://<โดเมน>   (ไม่ใส่ = http://localhost:3000)
ตรวจด้วย fetch ล้วน (ห้ามใช้ Playwright/browser):
 1) GET ทุก route: / /visitors /travel /awareness /spending /satisfaction /business /reports /guide /survey-poster /admin/login → 200 และ HTML มีคำไทย "วัดคูหาภิมุข"
 2) GET /admin/quality ไม่มี cookie (redirect: 'manual') → 307/308 ไป /admin/login
 3) POST /api/admin/import ไม่มี cookie → 401
 4) หน้า / ต้องไม่มีข้อความ "ข้อมูลตัวอย่าง" ถ้าใส่ flag --expect-real (ใช้หลังลบ seed)
พิมพ์ผลเป็นตาราง ✓/✗ ภาษาไทย, exit 1 ถ้ามี ✗ ; ห้ามแก้ web/app/**, web/components/**, web/lib/**
ผ่าน lint/tsc/test แล้วสรุป 3 บรรทัดใน docs/HANDOFF_NOTES.md
```

## Gemini — R4-G1 ภาพหน้าจอ + ใส่ในคู่มือ (ไม่แตะโค้ด)
```
ห้ามแก้ไฟล์ใน web/ ; เปิด http://localhost:3000 (รัน pnpm -C web dev ถ้ายังไม่รัน)
ถ่ายภาพทุกหน้าที่ 1280×800 และ 375×812 เก็บ docs/screenshots/demo/<route>-<desktop|mobile>.png
  (route "/" ใช้ชื่อ home ; หน้า admin ขอรหัสจากผู้ใช้ ห้ามบันทึกรหัสลงไฟล์ใด ๆ)
  ภาพเพิ่ม: ตัวกรองที่เปิด popover (desktop) และ bottom sheet (mobile), หน้า /reports ตอน print preview
แทน placeholder [ภาพที่ X: ...] ใน docs/USER_MANUAL.md ด้วยลิงก์ภาพ markdown + คำบรรยายใต้ภาพแบบวิชาการ ("ภาพที่ ก-1 หน้าภาพรวม...")
ภาพชุดนี้เป็นข้อมูลทดสอบ ใส่หมายเหตุใต้ภาพ "ภาพประกอบจากข้อมูลทดสอบ" ; หลังมีข้อมูลจริงจะถ่ายใหม่ใน docs/screenshots/real/
ถ้าเจอบั๊กหน้าจอ เขียนรายการใน docs/HANDOFF_NOTES.md หัวข้อ "## UI bugs found — Gemini" (ห้ามแก้เอง)
```

## Gemini — R4-G2 (หลังมีข้อมูลจริง ≥ 30 ชุด) = R3-G2 เดิม
ร่างบทผลการวิจัย `docs/REPORT_RESULTS_DRAFT.md` (คัดลอกตัวเลขจาก /reports ห้ามคำนวณ/แต่งเอง)

## Claude — ทำให้เมื่อสั่ง
- ตรวจ print `/reports`, แก้ UI bugs จากรายการของ Gemini
- หลังมีข้อมูลจริง: เทียบตัวเลขกับ Google Sheets (EXP-01/04) + ถ่ายภาพชุด real

## คุณ (ผู้ใช้) — สำคัญที่สุด เรียงตามลำดับ
1. **แก้ฟอร์มจริงด้วยมือ** ตาม `docs/SURVEY_REVIEW.md` ข้อ 1–3, 6 (~5 นาที)
2. **ติดตั้ง sync:** ฟอร์ม → ⋮ → Apps Script → วาง `script_googleForm/syncToSupabase.gs` → Project Settings → Script properties: `SUPABASE_URL` = https://deibtxlboswdzmptsfve.supabase.co, `SUPABASE_SERVICE_KEY` = ค่า sb_secret_… (อยู่ใน web/.env.local) → รัน `installTrigger` → `backfillAll`
3. ตอบฟอร์มทดสอบ 1 ครั้ง → `pnpm -C web seed:count` ต้องเห็น google_form ≥ 1 (บอก Claude ลบแถวทดสอบนี้ได้)
4. **ลบ seed:** `pnpm -C web seed:clear`
5. **Deploy Vercel:** vercel.com → Add New Project → Import `amin462/dashboard` → Root Directory = `web` → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSCODE`, `NEXT_PUBLIC_MAIN_SITE_URL`, `NEXT_PUBLIC_SURVEY_URL` (คัดลอกจาก web/.env.local) → Deploy
6. `pnpm -C web smoke -- https://<โดเมน vercel> --expect-real`
