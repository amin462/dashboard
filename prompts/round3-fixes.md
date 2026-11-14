# รอบ 3 — งานแก้ + งานต่อ (หลัง review รวมของ Claude, 14 พ.ย. 2569)

ผลตรวจรวม: tsc ✓ lint ✓ test 39/39 ✓ build ✓ ; หน้าเว็บอ่าน Supabase จริงได้ ; admin login ✓
Claude แก้ไปแล้ว: admin fail-open (ไม่ตั้ง ADMIN_PASSCODE เคยเปิดให้ทุกคน), banner เตือน seed, รวม test ของ import — **ห้ามย้อนกลับ** (ดู docs/HANDOFF_NOTES.md "Review รวม")

## opencode — R3-O1 (แก้, ไฟล์ของ T3)
```
อ่าน docs/HANDOFF_NOTES.md หัวข้อ "Review รวม — Opus" ก่อน
แก้ web/app/admin/quality/page.tsx:
1) สถานะ "ซิงก์ Google Form ทำงานปกติ" ตอนนี้ใช้เวลาล่าสุดของทุก source (รวม seed) → ผิด ต้องใช้เฉพาะแถว source='google_form'
   - ไม่มีแถว google_form เลย → "ยังไม่มีข้อมูลจาก Google Form (ตรวจการติดตั้ง syncToSupabase.gs)" สีเตือน
   - มี แต่ล่าสุดเกิน 24 ชม. → "ไม่มีคำตอบใหม่ใน 24 ชม." (เป็นข้อมูล ไม่ใช่ error)
2) เพิ่มการ์ดจำนวนแยกตาม source (google_form / csv / seed) ; seed > 0 → กล่องเตือนพร้อมคำสั่ง `pnpm -C web seed:clear`
แก้ web/scripts/seed.ts: ถ้า NEXT_PUBLIC_SUPABASE_URL ชี้ฐานจริง ให้ต้องใส่ --yes ถึงจะ insert (กันเผลอรันใส่ฐานจริง) ; --clear ไม่ต้องใช้ --yes
ผ่าน lint/tsc/test/build แล้วสรุป 3 บรรทัดใน docs/HANDOFF_NOTES.md
```

## Gemini — R3-G1 (ภาพหน้าจอ, ค้างจาก G4)
```
ถ่ายภาพหน้าจอทุกหน้า (desktop 1280 + mobile 375) เก็บ docs/screenshots/<route>-<desktop|mobile>.png
รวมหน้า /admin/login, /admin/import, /admin/quality (รหัส admin ขอจากผู้ใช้ ห้ามเขียนลงไฟล์)
ถ่ายตอนนี้ด้วยข้อมูล seed ได้ (ภาพสำหรับบทพัฒนาระบบ) แต่ตั้งชื่อโฟลเดอร์ docs/screenshots/demo/ ; หลังมีข้อมูลจริงค่อยถ่ายชุดใหม่ใน docs/screenshots/real/
ห้ามแก้โค้ดในรอบนี้ ถ้าเจอบั๊กหน้าจอ เขียนรายการใน docs/HANDOFF_NOTES.md
```

## Gemini — R3-G2 (ใช้ได้หลังมีข้อมูลจริง ≥ 30 ชุด)
```
อ่าน docs/REPORT_SYSTEM.md + เปิดแดชบอร์ด เขียน docs/REPORT_RESULTS_DRAFT.md: ร่างบทผลการวิจัยส่วนข้อมูลนักท่องเที่ยว
ตารางความถี่/ร้อยละ SUR-01–10 (คัดลอกตัวเลขจากหน้า /reports หรือไฟล์ CSV ที่ส่งออก ห้ามคำนวณเอง ห้ามแต่งตัวเลข), Mean/SD ความพึงพอใจพร้อมแปลผล, สรุปข้อเสนอแนะ SUR-11 เป็นประเด็น
ระบุฐาน n ทุกตาราง และใส่ข้อจำกัด (เลือกตัวอย่างแบบสะดวก)
```

## คุณ (ผู้ใช้) — ลำดับก่อนเก็บข้อมูลจริง
1. แก้ฟอร์มจริงด้วยมือตาม `docs/SURVEY_REVIEW.md` (ข้อ 1–3, 6)
2. ติดตั้ง `script_googleForm/syncToSupabase.gs` → ใส่ Script properties → `installTrigger()` → `backfillAll()`
3. ลองตอบฟอร์ม 1 ครั้ง → ดู /admin/quality ว่ามีแถว google_form (รอ ≤ 1 นาที)
4. ลบ seed: `pnpm -C web seed:clear` (หรือให้ Claude ทำ)
5. Deploy Vercel: root = `web`, ใส่ env ตาม `web/.env.example` + ADMIN_PASSCODE
