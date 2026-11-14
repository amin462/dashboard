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
| T2 | Design system + layout + 8 หน้าวิเคราะห์ + ตัวกรอง + print/export | **Gemini Antigravity** (`prompts/gemini-antigravity.md`) | `web/app/(dash)/**`, `web/app/layout.tsx`, `web/app/globals.css`, `web/components/**` | D1–D3 | T1 (layout เริ่มก่อนได้) | ⬜ |
| T3 | admin: passcode, import CSV, quality page, API, seed script | **opencode** (`prompts/opencode.md`) | `web/app/admin/**`, `web/app/api/**`, `web/proxy.ts`, `web/lib/import/**`, `web/scripts/**` | D2 | T1 | ⬜ |
| T4 | QA checklist EVA/EXP ↔ ฟีเจอร์, README/deploy, ตรวจตัวเลือกตรง contract | **Claude haiku** (`qa-docs`) | `docs/QA_CHECKLIST.md`, `README.md` | D3 | T2,T3 | ⬜ |
| T5 | แก้ฟอร์มจริงด้วยมือ (docs/SURVEY_REVIEW.md), ติดตั้ง sync script, ใส่ `.env`, deploy Vercel | **คุณ (ผู้ใช้)** | `web/.env.local` | D1–D4 | – | ⬜ |
| T6 | review รวม + แก้บั๊ก + ทดสอบตัวเลขเทียบ Google Sheets | Claude sonnet | ทุกไฟล์ (หลังทุกคนเสร็จ) | D4 | ทั้งหมด | ⬜ |

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
