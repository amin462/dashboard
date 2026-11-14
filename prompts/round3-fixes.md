# รอบ 3 — งานแก้ + งานต่อ (อัปเดต 14 พ.ย. 2569)

ผลตรวจรวม: tsc ✓ lint ✓ test 39/39 ✓ build ✓ ; หน้าเว็บอ่าน Supabase จริงได้ ; admin login ✓
Claude แก้ไปแล้ว: admin fail-open, banner เตือน seed, รวม test ของ import — **ห้ามย้อนกลับ**

## ⚠️ งาน UI/UX ทั้งหมดย้ายไปให้ Claude (sonnet) ทำ redesign + refactor ตาม `docs/DESIGN.md`
ระหว่างนี้ **opencode และ Gemini ห้ามแก้ไฟล์เหล่านี้:** `web/app/**` (ทุกหน้า รวม admin), `web/components/**`, `web/app/globals.css`
งานแก้หน้า /admin/quality (สถานะซิงก์ Google Form + จำนวนแยก source) Claude รวมไปทำในรอบ redesign แล้ว

## opencode — R3-O1 (เหลือแค่สคริปต์ ไม่แตะ UI)
```
อ่าน docs/HANDOFF_NOTES.md หัวข้อ "Review รวม — Opus" ก่อน
แก้เฉพาะ web/scripts/seed.ts:
- ถ้า NEXT_PUBLIC_SUPABASE_URL มีค่า (ฐานจริง) ต้องใส่ flag --yes ถึงจะ insert ไม่งั้นพิมพ์คำเตือนภาษาไทยแล้ว exit 1 (กันเผลอรันใส่ฐานจริง)
- --clear ไม่ต้องใช้ --yes ; หลัง clear พิมพ์จำนวนแถวที่ลบ
- เพิ่ม script "seed:count" ใน web/package.json: พิมพ์จำนวนแถวแยกตาม source (google_form / csv / seed)
ห้ามแก้ web/app/**, web/components/** ; ผ่าน pnpm -C web lint / exec tsc --noEmit / test แล้วสรุป 3 บรรทัดใน docs/HANDOFF_NOTES.md
```

## Gemini — R3-G1 (เอกสาร ไม่แตะโค้ด) — เริ่มได้เลย
```
ห้ามแก้ไฟล์ใน web/ ทั้งหมด (Claude กำลัง redesign)
อ่าน docs/REPORT_SYSTEM.md, docs/QA_CHECKLIST.md, docs/DATA_CONTRACT.md
เขียน docs/USER_MANUAL.md: คู่มือการใช้งานระบบ (ภาคผนวกรายงาน) ภาษาไทยทางการ 2 ส่วน
  1) ผู้ประกอบการ: เข้าใช้งาน, เมนู 8 หน้า (หน้าละ: ใช้ตอบคำถามธุรกิจอะไร), วิธีใช้ตัวกรอง, วิธีอ่าน ฐาน n / ไม่ตอบ / ไม่ประสงค์ระบุ, ส่งออก CSV/พิมพ์
  2) ผู้ดูแล: เข้าสู่ระบบ, นำเข้า CSV จาก Google Sheets, อ่านหน้าคุณภาพข้อมูล, ลบข้อมูลทดสอบ (pnpm -C web seed:clear), ติดตั้ง Apps Script
  ใส่ placeholder [ภาพที่ X: ชื่อหน้า] ตรงที่ต้องใส่ภาพหน้าจอ (จะถ่ายหลัง redesign เสร็จ)
เขียน docs/EVAL_SESSION_SCRIPT.md: สคริปต์จัดทดลองใช้กับผู้ประกอบการ 30 ราย (ใช้ภารกิจในตาราง EVA ของ QA_CHECKLIST) เวลา ~15 นาที/ราย, คำชี้แจง, ลำดับภารกิจ, สิ่งที่ผู้วิจัยจดบันทึก
```

## Gemini — R3-G2 (หลังมีข้อมูลจริง ≥ 30 ชุด)
```
อ่าน docs/REPORT_SYSTEM.md + เปิดแดชบอร์ด เขียน docs/REPORT_RESULTS_DRAFT.md: ร่างบทผลการวิจัยส่วนข้อมูลนักท่องเที่ยว
ตารางความถี่/ร้อยละ SUR-01–10 (คัดลอกตัวเลขจากหน้า /reports หรือไฟล์ CSV ที่ส่งออก ห้ามคำนวณเอง ห้ามแต่งตัวเลข), Mean/SD ความพึงพอใจพร้อมแปลผล, สรุปข้อเสนอแนะ SUR-11 เป็นประเด็น
ระบุฐาน n ทุกตาราง และใส่ข้อจำกัด (เลือกตัวอย่างแบบสะดวก)
```

## ภาพหน้าจอ (หลัง redesign เสร็จ) — Claude ถ่ายให้ หรือ Gemini
`docs/screenshots/<route>-<desktop|mobile>.png` ทุกหน้า (1280 + 375)

## คุณ (ผู้ใช้) — ลำดับก่อนเก็บข้อมูลจริง
1. แก้ฟอร์มจริงด้วยมือตาม `docs/SURVEY_REVIEW.md` (ข้อ 1–3, 6)
2. ติดตั้ง `script_googleForm/syncToSupabase.gs` → ใส่ Script properties → `installTrigger()` → `backfillAll()`
3. ลองตอบฟอร์ม 1 ครั้ง → ดู /admin/quality ว่ามีแถว google_form (รอ ≤ 1 นาที)
4. ลบ seed: `pnpm -C web seed:clear` (หรือให้ Claude ทำ)
5. Deploy Vercel: root = `web`, ใส่ env ตาม `web/.env.example` + ADMIN_PASSCODE
