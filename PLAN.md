# PLAN — แดชบอร์ดช่วยตัดสินใจผู้ประกอบการ (4 วัน: 15–18 พ.ย. 2569)

## สถาปัตยกรรม
```
QR → Google Form (ฟอร์มเดิม) ──onFormSubmit (syncToSupabase.gs)──▶ Supabase: survey_responses
Google Sheets → CSV ──/admin/import──────────────────────────────▶   (dedupe_key กันซ้ำทั้ง 2 ทาง)
Supabase ──server (lib/survey/data.ts)──▶ Next.js (web/) ──▶ ผู้ประกอบการ (อ่านอย่างเดียว) / admin (passcode)
```
ไม่มี env → mock 300 แถว (เว็บรัน/เดโมได้ก่อนต่อ DB)

## API กลางของ `web/lib/survey/` (T1 สร้าง, ทุกคนเรียกใช้)
```ts
// schema.ts
export type Code = 'scr01'|'scr02'|'con01'|'sur01'|...|'sur11'
export const QUESTIONS: Record<Code,{code;title;short;type:'single'|'multi'|'text';required;choices:string[];notSpecified?:string[]}>
export type RawRow = { id; source; submitted_at: string; is_complete: boolean } & Partial<Record<Code,string|null>>
export type Row = RawRow & { sur08list: string[]; sat: number|null; slot: 'เช้า'|'บ่าย'|'เย็น'|'อื่น'; date: string /*YYYY-MM-DD Asia/Bangkok*/ }
// normalize.ts   normalize(raw: RawRow[]): { rows: Row[] /*complete only*/; all: Row[] }
// filters.ts     type Filters = {from?;to?;age?:string[];origin?:string[];companion?:string[];transport?:string[]}
//                applyFilters(rows,f) ; filtersFromSearchParams(sp) ; filtersToQuery(f)
// aggregate.ts   freq(rows,code) -> {title,base,skipped,notSpecified,items:{label,count,pct}[],others:string[]}
//                multiFreq(rows) (sur08) ; satisfaction(rows) -> {n,mean,sd,level,dist,cannotRate}
//                daily(rows) ; bySlot(rows) ; crosstab(rows,a,b) ; overview(rows) ; quality(all)
// insights.ts    BUSINESS_TYPES ; businessInsights(rows,type) -> {title,detail,evidence:{label,value}[],n}[]
// data.ts        getRawRows(): Promise<RawRow[]> (Supabase หรือ mock) ; mock.ts makeMock(300, seed)
```

## Task board
| ID | งาน | เจ้าของ | ไฟล์ที่เป็นเจ้าของ | วัน | ขึ้นกับ | Status |
|---|---|---|---|---|---|---|
| T0 | contract, schema.sql, syncToSupabase.gs, ตรวจแบบสำรวจ, scaffold `web/` | Claude Opus | docs/*, supabase/*, script_googleForm/* | D0 | – | ✅ |
| T1 | แกนข้อมูล lib/survey/* + vitest + data.ts (Supabase/mock) | **Claude sonnet** (`survey-core`) | `web/lib/**`, `web/tests/**`, `web/vitest.config.mts` | D1 เช้า | T0 | ✅ |
| T2 | Design system + layout + 8 หน้าวิเคราะห์ + ตัวกรอง + print/export | **Gemini Antigravity** (`prompts/gemini-antigravity.md`) | `web/app/(dash)/**`, `web/app/layout.tsx`, `web/app/globals.css`, `web/components/**` | D1–D3 | T1 (layout เริ่มก่อนได้) | ✅ |
| T3 | admin: passcode, import CSV, quality page, API, seed script | **opencode** (`prompts/opencode.md`) | `web/app/admin/**`, `web/app/api/**`, `web/proxy.ts`, `web/lib/import/**`, `web/scripts/**` | D2 | T1 | ✅ |
| T4 | QA checklist EVA/EXP ↔ ฟีเจอร์, README/deploy, ตรวจตัวเลือกตรง contract | **Claude haiku** (`qa-docs`) | `docs/QA_CHECKLIST.md`, `README.md` | D3 | T2,T3 | ✅ |
| T5 | แก้ฟอร์มจริงด้วยมือ (docs/SURVEY_REVIEW.md), ติดตั้ง sync script, ใส่ `.env`, deploy Vercel | **คุณ (ผู้ใช้)** | `web/.env.local` | D1–D4 | – | ⬜ |
| T6 | review รวม + แก้บั๊ก + ทดสอบตัวเลขเทียบ Google Sheets | Claude sonnet | ทุกไฟล์ (หลังทุกคนเสร็จ) | D4 | ทั้งหมด | ⬜ |
| G1 | หน้าคู่มือผู้ประกอบการ `/guide` (อ่านกราฟ ตัวกรอง 4 ตัวอย่าง FAQ 5 ข้อ) | **Gemini Antigravity** (`prompts/gemini-round2.md`) | `web/app/(dash)/guide/page.tsx` | D3 | T2 | ✅ |
| G2 | โปสเตอร์ QR พิมพ์ A4 `/survey-poster` (ติดตั้ง `qrcode.react`) | **Gemini Antigravity** (`prompts/gemini-round2.md`) | `web/app/survey-poster/page.tsx`, `web/package.json` | D3 | T0 | ✅ |
| G3 | เอกสารบทพัฒนาระบบวิชาการ 7 หัวข้อ + Mermaid + Data Dictionary | **Gemini Antigravity** (`prompts/gemini-round2.md`) | `docs/REPORT_SYSTEM.md` | D3 | T0–T3 | ✅ |
| G4 | ปรับ Responsive, dark mode, label กราฟไทย, mobile filter drawer, contrast AA, A4 `/reports` *(ภาพหน้าจอชุด v2 ถ่ายใหม่แล้ว: `docs/screenshots/demo/`)* | **Gemini Antigravity** (`prompts/gemini-round2.md`) | `web/components/**`, `web/app/(dash)/**` | D3 | G1 | ✅ |
| G5 | เพิ่มเมนู `คู่มือ` (`/guide`) และ `โปสเตอร์ QR` (`/survey-poster`) ใน nav, ส่วนท้ายทุกหน้า (เว็บหลัก + ชื่อโครงการ + ปี 2569), อัปเดต PLAN & HANDOFF | **Gemini Antigravity** (`prompts/gemini-round2.md`) | `web/components/nav-config.ts`, `web/components/DashShell.tsx`, `web/components/Disclaimer.tsx`, `PLAN.md`, `docs/HANDOFF_NOTES.md` | D3 | G1–G4 | ✅ |
| T7 | UI v2: สีกรมท่า+อำพัน, การ์ดลอย, หน้าภาพรวมใหม่ (แท่งคู่ ยะลา vs ต่างถิ่น, donut, area+ปฏิทิน, ช่วงเวลา, ช่องทาง, ข้อเสนอ) + ปรับทุกหน้าให้เข้าชุด ตาม docs/DESIGN.md "v2 OVERRIDES" | Claude sonnet | `web/app/**`, `web/components/**`, `web/app/globals.css` | D1 | – | ✅ |
| T8 | UI polish: sidebar scrollbar/ป้ายเมนู, สมดุลความสูงการ์ดหน้าภาพรวม, ออกแบบ /satisfaction ใหม่ (ข้อเสนอแนะ 5,500px), แถวแรก /business | Claude sonnet | `web/app/**`, `web/components/**`, `web/app/globals.css` | D1 | T7 | ✅ |
| T9 | แชต AI ผู้ช่วยอ่านข้อมูล (Gemini): `/api/chat` ฝั่งเซิร์ฟเวอร์ + บริบทสถิติจาก `lib/survey` + กฎกัน hallucination + rate limit + fallback เมื่อติดโควตา | Claude | `web/app/api/chat/**`, `web/lib/ai/**`, `web/tests/**` | D1 | – | ⬜ |
| T10 | UI แชต: ปุ่มลอย/แผงแชต (มือถือเต็มจอ), ถามประเภทธุรกิจก่อน, ปุ่มคำถามสำเร็จรูป, รู้หน้าที่เปิดอยู่, แสดงฐาน n + คำเตือน, ธีม navy/amber | Claude | `web/components/chat/**`, `web/components/shell/DashShell.tsx` | D1–D2 | T9 (เริ่มด้วย mock ได้) | ⬜ |
| T11 | ทดสอบแชต: คำถามหลอก/นอกเรื่อง/ตัวเลขที่ไม่มี, ติดโควตา, มือถือ, production build ; ปรับ prompt | Claude | `web/lib/ai/**`, `web/tests/**` | D2 | T9,T10 | ⬜ |
| T12 | A1–A3: แถบความคืบหน้าเก็บข้อมูล (n/267 + เวลาตอบล่าสุด) บนภาพรวม, ข้อเสนอรายธุรกิจอ่านง่ายขึ้น, เตือนกลุ่มตัวอย่างน้อยทั้งหน้า | Claude sonnet | `web/app/(dash)/**`, `web/components/**` | D2 | – | ⬜ |
| T13 | B4–B5: ดาวน์โหลดกราฟเป็นภาพ + หน้า "เกี่ยวกับงานวิจัย" (วัตถุประสงค์ วิธีเก็บ ข้อจำกัด) | Claude sonnet | `web/app/(dash)/about/**`, `web/components/**` | D2–D3 | – | ⬜ (ถ้ามีเวลา) |
| T14 | เมื่อมีข้อมูลจริง ≥ 30: T6 เทียบตัวเลขกับ Google Sheets, ถ่ายภาพ real (`screenshots.mjs`), ร่างบทผล, rotate คีย์ Supabase | Claude + Gemini | docs/**, `docs/screenshots/real/` | D3–D4 | ข้อมูลจริง | ⬜ |

## ลำดับสั่งงาน
1. **วันนี้/D1 เช้า:** สั่ง Claude `survey-core` ทำ T1 ⟶ พร้อมกันสั่ง Gemini ทำ T2 ขั้น 1 (design system + layout เท่านั้น)
2. **D1 บ่าย–D3:** T1 เสร็จ → Gemini ทำหน้าทั้งหมด ; opencode ทำ T3 (ไฟล์ไม่ทับกัน)
3. **D3:** haiku ทำ T4 ; คุณใส่ `.env` + backfill ข้อมูลจริง
4. **D4:** T6 review/QA + deploy

## .env (`web/.env.local`, ผู้ใช้ใส่ภายหลัง)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSCODE=
NEXT_PUBLIC_MAIN_SITE_URL=https://travel-zeta-lac.vercel.app
NEXT_PUBLIC_SURVEY_URL=https://docs.google.com/forms/d/1uuheFOZgCXhNJBBLb62gnB3x0V10J6gxwmO3HiMLYc8/viewform
```

## วิธีสั่ง Claude subagent (พิมพ์ในแชต Claude Code)
- `ให้ survey-core ทำ T1 ตาม PLAN.md`
- `ให้ qa-docs ทำ T4 ตาม PLAN.md`

## แผนอัปเกรด D1–D4 (ตัดสินใจ 15 พ.ย. 2569)
สถานะ: deploy แล้วที่ https://dashboard-liart-six-41.vercel.app · sync Google Form ทำงาน (google_form = 4 แถว จริงจากเพื่อนผู้ใช้) · seed ลบแล้ว

**หลักการ**
- เป้าหมาย: ผู้ประกอบการ/ชาวบ้านที่อ่านกราฟไม่เข้าใจ ถามแชตแล้วได้คำตอบจากข้อมูลสำรวจจริง
- ขอบเขตแชต (แนะนำ): ตอบเฉพาะเรื่องข้อมูลสำรวจวัดคูหาภิมุข ; นอกเรื่องตอบสุภาพว่าช่วยได้เฉพาะข้อมูลสำรวจ
- ห้ามเปลี่ยนข้อคำถามฟอร์ม (กระทบ IOC) ; ข้อมูลจังหวัด/ประเทศจริง = ข้อเสนอแนะงานวิจัยครั้งต่อไป

**ข้อกำหนดแชต (T9–T11)**
1. คีย์ `GEMINI_API_KEY` (+ `GEMINI_MODEL` ปรับได้) อยู่ใน `web/.env.local` และ Vercel env เท่านั้น ห้ามส่งไปเบราว์เซอร์/ห้ามลง git/ห้ามพิมพ์ในแชต ; ไม่มีคีย์ = ปุ่มแชตซ่อนหรือแจ้งว่ายังไม่เปิดใช้ (เว็บต้องรันได้เสมอ)
2. ตัวเลขทุกค่ามาจาก `web/lib/survey` (aggregate/insights) ส่งให้ AI เป็นสรุปสถิติ + ฐาน n ; AI ห้ามคำนวณหรือเดาเอง ไม่มีข้อมูล = ตอบว่าไม่มี ; ส่งเฉพาะสถิติสรุป ไม่ส่งแถวรายคน ; ข้อ 11 ส่งเฉพาะที่คัดกรองแล้ว
3. ไม่เก็บบทสนทนาในฐานข้อมูล ; จำกัดต่อ IP ต่อนาที ; ติดโควตา/error = ข้อความสุภาพให้ลองใหม่ ไม่ล้มทั้งหน้า
4. ตอบภาษาไทยง่าย สั้น แสดงฐาน n + คำเตือน "ไม่ใช่คำแนะนำที่รับประกันผล" ; ข้อมูลน้อย (n < 30) ต้องเตือน
5. UI: ปุ่มลอยมุมขวาล่าง → แผงแชต (มือถือเต็มจอ), ถามประเภทธุรกิจก่อน (ร้านอาหาร/ที่พัก/ของฝาก/นำเที่ยว/อื่น ๆ), ปุ่มคำถามสำเร็จรูป + ช่องพิมพ์อิสระ, รู้หน้าที่เปิดอยู่ ("กราฟนี้คืออะไร"), ผ่าน a11y พื้นฐาน, ไม่ทับ bottom tab บนมือถือ

**ลำดับวัน**
- D1: T9 + T10 (เริ่มด้วยคำตอบจำลอง คีย์มาแล้วต่อจริง)
- D2: T11 ปรับจูน + T12 (+ T13 ถ้ามีเวลา)
- D3: สำรอง / T14 เมื่อข้อมูลจริงถึง 30
- ทุกงานผ่าน typegen, tsc, test, lint, build → commit + push → smoke บน production เมื่อผู้ใช้สั่ง

**ผู้ใช้ทำ:** เอา API key จาก Google AI Studio ใส่ `web/.env.local` และ Vercel (`GEMINI_API_KEY`) · แชร์ลิงก์ฟอร์มต่อให้ได้ข้อมูล ≥ 267 · ตัดสินใจขอบเขตแชต (เฉพาะข้อมูลสำรวจ = ค่าเริ่มต้น) · rotate คีย์ Supabase หลังทุกอย่างนิ่ง
