# NEXT_SESSION — สถานะงาน ณ 15 พ.ย. 2569 (ส่งงาน 18 พ.ย.)

## สถานะล่าสุด
- **Production:** https://dashboard-liart-six-41.vercel.app (Vercel root `web`, auto-deploy จาก main) · sync Google Form → Supabase ทำงาน (trigger อัตโนมัติ) · seed ลบแล้ว
- **ข้อมูลจริง:** ล่าสุดที่เห็น (15 พ.ย. บ่าย) ผู้ตอบสมบูรณ์ 51 ชุด → **ถึงเกณฑ์เริ่ม T14 (≥ 30) แล้ว** ; เป้าขั้นต่ำ 267 / เต็ม 300 ; ผู้ไม่ผ่านคัดกรองตัดออกตามกฎ ไม่ใช่บั๊ก ; คนยะลายังน้อย (การ์ดเทียบยะลา vs ต่างถิ่นต้องมี ≥ 5 ต่อกลุ่ม)
- **แชต AI (T9–T11):** `/api/chat` + ปุ่ม "ถามผู้ช่วย" ใช้ Gemini ผ่าน `GEMINI_API_KEY` (อยู่ใน `.env.local` และ Vercel) ; รุ่นเริ่มต้น `gemini-flash-lite-latest` (รุ่น flash ปกติ 503/ช้า) ; ประโยค "…เป็นใคร" เคยถูก Gemini บล็อกผิด (เลี่ยงในปุ่มสำเร็จรูปแล้ว) ; T11 จูนเพิ่มเมื่อมีข้อมูลมากขึ้น
- **เสร็จแล้ว:** T0–T10, T12, T13, T15–T22 · ความปลอดภัยผู้ดูแล (เซสชันลงลายเซ็น 8 ชม./ออกจากระบบ/ล็อกหลังผิด 5 ครั้ง) · ปุ่มลบแถวทดสอบ · Word export · พิมพ์รายงานธุรกิจ A4 (ตรวจจาก PDF แล้ว พอดี 1 หน้า) · favicon + อนิเมชันแชต/ฟองทักทาย · อัปเดตข้อมูลอัตโนมัติ · ดูรายละเอียดใน docs/HANDOFF_NOTES.md
- ตรวจล่าสุด: tsc ✓ lint ✓ test 109/109 ✓ build ✓ (commit ล่าสุดบน main)

## งานถัดไป (AI ทำ — ดูรายละเอียดใน PLAN.md ตาราง T11–T16 และหัวข้อ "แผนอัปเกรด D1–D4")
1. **T11 (เหลือ)** ลองแชตบน production + มือถือจริงหลัง deploy (จูน prompt/ตัวกรองในแชตเสร็จแล้ว)
2. **T14 (เหลือ)** T6 เทียบตัวเลขกับ Google Sheets (ต้องให้ผู้ใช้ส่งออก CSV) · รันร่างบท 4 ใหม่ตามวันตัดข้อมูล (`scripts/report-draft.ts --from --to`) แล้วตรวจอ่านทั้งบท · ถ่ายภาพ real ซ้ำเมื่อข้อมูลครบ (ภาพชุดแรกถ่ายแล้วที่ docs/screenshots/real)
3. smoke บน production: `pnpm -C web smoke -- https://dashboard-liart-six-41.vercel.app --expect-real` (ผู้ใช้สั่งเลื่อนไว้ก่อน — รันเมื่อผู้ใช้สั่ง)

## ค้าง — ผู้ใช้ทำ
- เก็บข้อมูลให้ถึง ≥ 267 ชุดสมบูรณ์ (แชร์ QR/ลิงก์ ; โปสเตอร์ที่ `/survey-poster`)
- **บอกวันตัดข้อมูลสำหรับรายงาน** → ตั้ง `NEXT_PUBLIC_RESEARCH_FROM` / `NEXT_PUBLIC_RESEARCH_TO` (YYYY-MM-DD) ใน Vercel แล้ว redeploy จะมีปุ่ม "ช่วงข้อมูลวิจัย" ในตัวกรองวันที่ (ไม่ตั้ง = ซ่อนปุ่ม)
- (ไม่บังคับ) ตั้ง `NEXT_PUBLIC_RESEARCH_CREDIT` ใน Vercel เพื่อแสดงชื่อผู้จัดทำ/อาจารย์ที่ปรึกษาใน `/about`
- **Rotate คีย์ก่อนส่งงาน:** Gemini (เคยถูกวางในแชต) และ Supabase service key (เคยโผล่ในภาพหน้าจอ) → แก้ใน `web/.env.local`, Vercel env, และ Apps Script Script properties (Supabase)
- ภาพที่ 12 ในคู่มือ (หน้าจอ Apps Script บันทึกการดำเนินการ — ห้ามให้เห็นค่าคีย์)

## ข้อควรรู้
- Next 16 + cacheComponents: ข้อมูลหน้า dashboard revalidate 15 วินาที + `AutoRefresh` ถาม `/api/pulse` ทุก 15 วินาที (`app/(dash)/_data.ts`) ; ผู้ตอบที่ไม่ผ่านคัดกรอง/ไม่ยินยอม/ตอบไม่ครบ จะไม่นับ (is_complete=false) — ดู `/admin/quality`
- ก่อน `tsc` ต้อง `pnpm -C web exec next typegen`
- ไดรฟ์ C เหลือน้อย: pnpm store = D:/.pnpm-store, ห้ามลง browser/Docker (screenshots.mjs ใช้ Edge ที่ติดตั้งอยู่)
- ไฟล์ในโปรเจกต์ปน LF/CRLF: แก้ด้วยสคริปต์ให้คงสไตล์เดิม (ดู `git ls-files --eol`) อย่าให้ diff ทั้งไฟล์
- Git Bash บน Windows: ภาษาไทยใน argument ของ curl เพี้ยน → ส่ง body จากไฟล์ (`--data-binary @file`) ; อย่าพิมพ์คีย์/passcode ลงแชตหรือไฟล์ที่ commit
- ถ้าเปิด dev แล้วกราฟไม่ขึ้น = dev server เก่าค้าง → ใช้ `pnpm -C web build` + `next start -p 3101` แล้วดูด้วยสคริปต์ screenshots
- DB ต่อผ่าน pooler (ค่าอยู่ใน `web/.env.local` DATABASE_URL) ; มี `pg` ใน `.tmp/pg/`

---

## Prompt สำหรับเปิด session ใหม่ (Claude Code, โฟลเดอร์ D:\project-next\dashboard)
```
อ่าน NEXT_SESSION.md แล้วถามผมว่าจะทำ "งานถัดไป" ข้อไหน (T11 / T14 / smoke) ; อ่าน PLAN.md เฉพาะแถว T11–T16 และ AGENTS.md ตามต้องการ ห้ามอ่าน new_docs/ old_docs/ ui/
โปรเจกต์: แดชบอร์ดผลสำรวจนักท่องเที่ยววัดคูหาภิมุข (Next.js ใน web/, Supabase, Vercel) ส่งงาน 18 พ.ย. 2569 ตอบไทยสั้น ๆ ประหยัด token
กฎ: ตัวเลขทั้งหมดคำนวณใน web/lib/survey เท่านั้น (UI ไม่คำนวณ) · แก้ไฟล์ให้คงสไตล์ LF/CRLF เดิม · ทุกครั้งที่แก้โค้ด: typegen, tsc, lint, test, build ต้องผ่าน แล้ว commit + push (commit ต้องมีบรรทัด Co-Authored-By ตามที่ระบบกำหนด)
ตรวจหน้าตาด้วย `pnpm -C web build` + `next start -p 3101` + `node web/scripts/screenshots.mjs .tmp/shots http://localhost:3101 --only=<ชื่อ>` แล้ว Read ภาพ (อย่าถ่ายทั้งชุดถ้าไม่จำเป็น) ; ปิดเซิร์ฟเวอร์ 3101 เมื่อเสร็จ
ใช้ subagent เฉพาะงานที่แยกอิสระจริง ๆ (sonnet งานโค้ด, haiku งานเอกสาร) และตรวจผลเองก่อนรายงาน

```
