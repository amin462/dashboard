# AGENTS.md — กฎร่วมของทุก agent (Claude / Gemini Antigravity / opencode)

โปรเจกต์: แดชบอร์ดวิเคราะห์ข้อมูลนักท่องเที่ยว (วัดคูหาภิมุข) **เพื่อช่วยผู้ประกอบการตัดสินใจ** — งานวิจัย ป.ตรี กำหนดส่ง 4 วัน (ภายใน 18 พ.ย. 2569)
แยกจากโปรเจกต์เก่า `D:\project-next\fullstack-tourism` (ห้ามแก้ ห้าม import โค้ดจากที่นั่น อ่านดูเป็นตัวอย่างได้)

## อ่านก่อนทำงาน (ตามลำดับ อ่านเฉพาะที่ต้องใช้)
1. `PLAN.md` — งานของคุณคือ task ไหน ไฟล์ไหนเป็นของคุณ
2. `docs/DATA_CONTRACT.md` — รหัสข้อ ตัวเลือก กฎคำนวณ หน้าเว็บ **(ห้ามขัดแย้ง)**
3. `supabase/schema.sql` — โครงสร้างตาราง

## Stack (ห้ามเปลี่ยน)
- แอปอยู่ใน `web/` : Next.js (App Router) + TypeScript + Tailwind v4 + Recharts + `@supabase/supabase-js` + papaparse + vitest
- package manager: **pnpm เท่านั้น** ; ใช้ Node ที่ติดตั้งอยู่
- ภาษา UI: ไทยทั้งหมด ฟอนต์ Noto Sans Thai (next/font)
- Deploy: Vercel (root = `web/`)

## ⚠️ ไดรฟ์ C เหลือน้อย
- ทุกอย่างอยู่ไดรฟ์ D ; pnpm store = `D:/.pnpm-store` (มี `web/.npmrc` แล้ว) ; npm cache = `D:/.npm-cache`
- ห้ามติดตั้ง global package, ห้ามดาวน์โหลด Playwright browsers/Docker/โมเดล, ห้าม `supabase start` (local Docker)
- ไฟล์ชั่วคราวไว้ที่ `D:\project-next\dashboard\.tmp\`

## กฎการทำงาน
- **แก้เฉพาะไฟล์ที่ PLAN.md กำหนดให้ task ของคุณ** ถ้าต้องแก้ไฟล์ของคนอื่น → เขียนบันทึกใน `docs/HANDOFF_NOTES.md` แทน
- การคำนวณสถิติทั้งหมดอยู่ใน `web/lib/survey/*` เท่านั้น UI เรียกใช้ฟังก์ชัน ไม่คำนวณเอง
- ไม่มี env → ใช้ mock data (`web/lib/survey/mock.ts`) อัตโนมัติ เว็บต้องรันได้เสมอ
- ไม่ใส่ข้อมูลส่วนตัว ไม่สร้างระบบล็อกอินเต็ม (ใช้ passcode admin ตาม DATA_CONTRACT ข้อ 6)
- เสร็จ task แล้วต้องผ่าน: `pnpm -C web lint` , `pnpm -C web exec tsc --noEmit` , `pnpm -C web test` (ถ้ามี test) , `pnpm -C web build`
- อัปเดตสถานะ task ใน `PLAN.md` (ช่อง Status) + เขียนสรุปสั้น ๆ ใน `docs/HANDOFF_NOTES.md`
- ประหยัด token: อย่าอ่านไฟล์ใน `new_docs/`, `old_docs/`, `ui/index.html` ทั้งไฟล์ (ใหญ่) ข้อมูลที่จำเป็นสรุปไว้ใน docs/ แล้ว
