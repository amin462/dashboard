# NEXT_SESSION — สถานะงาน ณ 15 พ.ย. 2569 (ส่งงาน 18 พ.ย.)

> 🆕 15 พ.ย.: deploy Vercel แล้ว (https://dashboard-liart-six-41.vercel.app) · sync Google Form ทำงาน (google_form = 4 แถวจริง) · seed ลบแล้ว · **แผนถัดไป = แชต AI (T9–T11) + T12–T14 ดู `PLAN.md` หัวข้อ "แผนอัปเกรด D1–D4"** · รอผู้ใช้เอา `GEMINI_API_KEY` (ห้ามส่งในแชต) · smoke บน production ยังไม่ได้รัน (ผู้ใช้สั่งเลื่อน)

> ✅ ไล่ตรวจหน้าย่อย v2 ทุกหน้า (1280/375 + admin) เสร็จ แก้จุดเพี้ยนแล้ว · ภาพคู่มือชุด v2 ถ่ายใหม่ครบ (`web/scripts/screenshots.mjs`) · print A4 /reports ตรวจแล้ว (รายละเอียด `docs/HANDOFF_NOTES.md` หัวข้อ "ไล่ตรวจหน้าย่อย v2")
> ✅ T8 UI polish เสร็จ (sidebar พอดีจอไม่มี scroll, การ์ดทุกแถวสูงเท่ากัน, /satisfaction ใหม่, /business hero) ตรวจบน production build แล้ว
> ⚠️ ถ้าเปิด dev แล้วกราฟไม่ขึ้น/ค้าง skeleton = dev server เก่าค้าง (HMR websocket fail) → ปิดแล้ว `pnpm -C web dev` ใหม่ หรือใช้ launch config `web-prod` (next start :3100 หลัง build)
> ✅ T7 UI v2 เสร็จและตรวจแล้ว

## เสร็จแล้ว ✅ (ตรวจโดย Claude Opus)
- T0–T4, G1–G5, R3, R4: แกนข้อมูล `web/lib/survey` (39 tests), UI redesign ตาม `docs/DESIGN.md`, admin (passcode, fail-closed), import CSV + กันซ้ำ, หน้าคุณภาพข้อมูล, seed guard (`--yes`), smoke test, คู่มือ + สคริปต์ทดลองใช้ + QA checklist + บทระบบ (docs/)
- Supabase: ตารางสร้างแล้ว (Tokyo) ; มี **seed 300 แถว** ; google_form = 0
- GitHub: push ได้แล้ว (credential manager จำ amin462 ไว้) ; `.env.local` ไม่ขึ้น git
- ตรวจล่าสุด: tsc ✓ lint ✓ test 39/39 ✓ build ✓ smoke 13/13 ✓ (`--expect-real` ✗ ถูกต้อง เพราะยังมี seed)

## ค้าง — ผู้ใช้ทำ (blocking)
1. แก้ฟอร์มจริงตาม `docs/SURVEY_REVIEW.md` ข้อ 1–3, 6
2. ติดตั้ง `script_googleForm/syncToSupabase.gs` (ขั้นตอนใน `prompts/round4.md`) → `installTrigger` → `backfillAll`
3. ตอบฟอร์มทดสอบ 1 ครั้ง → `pnpm -C web seed:count` เห็น google_form ≥ 1
4. `pnpm -C web seed:clear`
5. Deploy Vercel (root `web`, env จาก `web/.env.local`) → `pnpm -C web smoke -- https://<domain> --expect-real`
6. ภาพหน้าจอ Apps Script (ภาพที่ 12 ในคู่มือ)

## ค้าง — AI ทำ
| งาน | ใคร | เงื่อนไข |
|---|---|---|
| ช่วยติดตั้ง/ดีบัก sync Google Form → Supabase | Claude | เมื่อผู้ใช้ติดตั้งสคริปต์ |
| ลบแถวทดสอบจากฟอร์ม + `seed:clear` | Claude | หลังข้อ 3 |
| ช่วย deploy Vercel + smoke | Claude | หลังผู้ใช้สร้างโปรเจกต์ Vercel |
| T6: เทียบตัวเลขเว็บกับ Google Sheets (EXP-01/04) | Claude sonnet | มีข้อมูลจริง |
| ถ่ายภาพชุด real → docs/screenshots/real/ (`node web/scripts/screenshots.mjs docs/screenshots/real http://localhost:3100` ; ภาพ demo ใน USER_MANUAL ใช้ชุดนี้แทน) | Gemini / Claude | มีข้อมูลจริง ≥ 30 |
| R4-G2 ร่างบทผล `docs/REPORT_RESULTS_DRAFT.md` | Gemini | มีข้อมูลจริง ≥ 30 |

## ข้อควรรู้
- Next 16 + cacheComponents: ข้อมูลหน้า dashboard revalidate 60 วินาที (`app/(dash)/_data.ts`)
- ก่อน `tsc` ต้อง `pnpm -C web exec next typegen`
- ไดรฟ์ C เหลือ ~13GB: pnpm store = D:/.pnpm-store, ห้ามลง browser/Docker
- Git Bash บน Windows ทำภาษาไทยใน argument ของ curl เพี้ยน → ส่ง body จากไฟล์ (`--data-binary @file`)
- DB ต่อผ่าน pooler: `aws-0-ap-northeast-1.pooler.supabase.com:5432` user `postgres.deibtxlboswdzmptsfve` (ค่าอยู่ใน `web/.env.local` DATABASE_URL) ; มี `pg` ใน `.tmp/pg/` (`node .tmp/pg/run.js <url> <file.sql>`)

---

## Prompt สำหรับเปิด session ใหม่ (Claude Code, โฟลเดอร์ D:\project-next\dashboard)
```
อ่าน NEXT_SESSION.md, AGENTS.md, PLAN.md (ไม่ต้องอ่าน new_docs/ old_docs/ ui/)
โปรเจกต์: แดชบอร์ดช่วยผู้ประกอบการ (Next.js ใน web/, Supabase) ส่งงาน 18 พ.ย. 2569 ตอบภาษาไทยสั้น ๆ ประหยัด token
ใช้ subagent ตามความเหมาะสม (sonnet งานโค้ด, haiku งานเอกสาร) แต่ตรวจผลเองทุกครั้งก่อนรายงาน
ข้อ 0–2 เดิม (ไล่หน้าย่อย v2 / ภาพ admin / print A4) เสร็จแล้ว (ดู HANDOFF_NOTES) เริ่มที่:
3) ถามผมว่าทำข้อ "ค้าง — ผู้ใช้ทำ" ถึงข้อไหนแล้ว แล้วช่วยต่อจากตรงนั้น (sync Google Form / seed:clear / Vercel + smoke)
4) เมื่อมีข้อมูลจริง ≥ 30: ถ่ายภาพ real ด้วย screenshots.mjs, T6 เทียบตัวเลขกับ Google Sheets
ทุกครั้งที่แก้โค้ด: typegen, tsc, test, lint, build ต้องผ่าน แล้ว commit + push
```
