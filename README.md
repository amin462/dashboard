# แดชบอร์ดวิเคราะห์ข้อมูลนักท่องเที่ยว — วัดคูหาภิมุข (ยะลา)

เว็บแดชบอร์ดอ่านอย่างเดียวสำหรับผู้ประกอบการ จากผลแบบสำรวจนักท่องเที่ยว (งานวิจัยระดับปริญญาตรี สาขาคอมพิวเตอร์ธุรกิจและเทคโนโลยีดิจิทัล มหาวิทยาลัยราชภัฏยะลา)
ผลนี้สรุปจากผู้ตอบ ณ วัดคูหาภิมุข (ตัวอย่างแบบสะดวก) ไม่ใช่ยอดนักท่องเที่ยวทั้งหมด

- โค้ดแอปอยู่ในโฟลเดอร์ `web/` (Next.js App Router, TypeScript, Tailwind v4, Recharts, Supabase)
- กฎการคำนวณทั้งหมดอยู่ที่ `web/lib/survey/` และกฎข้อมูลดู `docs/DATA_CONTRACT.md`
- ไม่มีค่า env → เว็บใช้ข้อมูลจำลอง 300 แถวอัตโนมัติ (เดโม่ได้ทันที)

## รันในเครื่อง

ต้องมี Node และ pnpm (ใช้ pnpm เท่านั้น)

```bash
pnpm -C web install
pnpm -C web dev        # เปิด http://localhost:3000
```

คำสั่งตรวจก่อนส่งงาน:

```bash
pnpm -C web lint
pnpm -C web exec tsc --noEmit
pnpm -C web test
pnpm -C web build
```

ฐานข้อมูลทดลองในเครื่อง: `pnpm -C web seed` (ใส่ข้อมูลตัวอย่างเข้า Supabase — ใช้กับฐานทดลองเท่านั้น ห้ามรันกับฐานที่มีข้อมูลจริง) และ `pnpm -C web seed:clear` (ลบ)

## ตัวแปรสภาพแวดล้อม (`web/.env.local`)

คัดลอกจาก `web/.env.example` แล้วใส่ค่าจริงเอง ห้าม commit ไฟล์นี้

```
NEXT_PUBLIC_SUPABASE_URL=<ค่า Project URL จาก Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — ใช้ฝั่ง server เท่านั้น>
ADMIN_PASSCODE=<รหัสผู้ดูแลที่ตั้งเอง>
NEXT_PUBLIC_MAIN_SITE_URL=https://travel-zeta-lac.vercel.app
NEXT_PUBLIC_SURVEY_URL=<ลิงก์ Google Form ที่ผู้วิจัยใช้>
GEMINI_API_KEY=<คีย์ Google AI Studio — ไม่ตั้ง = ปิดแชต AI>
GEMINI_MODEL=gemini-flash-lite-latest
NEXT_PUBLIC_RESEARCH_FROM=<YYYY-MM-DD วันเริ่มข้อมูลวิจัย ไม่บังคับ>
NEXT_PUBLIC_RESEARCH_TO=<YYYY-MM-DD วันตัดข้อมูลวิจัย ไม่บังคับ>
NEXT_PUBLIC_RESEARCH_CREDIT=<ชื่อผู้จัดทำ/อาจารย์ที่ปรึกษา ไม่บังคับ>
```

- `GEMINI_API_KEY` / `GEMINI_MODEL` ใช้กับแชต AI (`/api/chat`) ; `CHAT_MOCK=1` ใช้ดูหน้าตาแชตตอนไม่มีคีย์ (dev เท่านั้น ห้ามใช้บน production)
- `NEXT_PUBLIC_RESEARCH_FROM/TO` เปิดปุ่ม "ช่วงข้อมูลวิจัย" ในตัวกรองวันที่ (ไม่ตั้ง = ซ่อนปุ่ม) ; `NEXT_PUBLIC_RESEARCH_CREDIT` แสดงที่ `/about` (ไม่บังคับ)
- ค่า `NEXT_PUBLIC_*` ฝังตอน build → หลังแก้ค่าบน Vercel ต้อง redeploy

- ไม่ตั้ง `ADMIN_PASSCODE` = ปิดหน้า `/admin/*` ทั้งหมด (fail closed)
- `SUPABASE_SERVICE_ROLE_KEY` ห้ามใส่ในตัวแปรที่ขึ้นต้น `NEXT_PUBLIC_`

## ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่บน Supabase (ไม่ต้องรัน `supabase start` ในเครื่อง)
2. เปิด SQL Editor แล้วรันไฟล์ `supabase/schema.sql` ทั้งไฟล์ (สร้างตาราง `survey_responses` และ `import_logs`)
3. คัดลอก Project URL และ keys ไปใส่ `.env.local` (และตั้งค่าเดียวกันบน Vercel)

## ตั้งค่า Google Apps Script (ส่งคำตอบเข้า Supabase อัตโนมัติ)

อ้างอิงหัวไฟล์ `script_googleForm/syncToSupabase.gs`

1. เปิด Google Form เดิม (ฟอร์มที่มี QR แล้ว) > ⋮ > Script editor แล้ววางโค้ดจากไฟล์นี้
2. Project Settings > Script properties ใส่ `SUPABASE_URL` (ค่า Project URL) และ `SUPABASE_SERVICE_KEY` (service role key)
3. รัน `installTrigger()` 1 ครั้ง และอนุญาตสิทธิ์ → คำตอบใหม่จะถูกส่งเข้า Supabase อัตโนมัติ
4. รัน `backfillAll()` 1 ครั้ง เพื่อส่งคำตอบเก่า (รันซ้ำได้ ไม่เกิดข้อมูลซ้ำ เพราะใช้ `dedupe_key`)

ข้อควรระวัง: อย่ารัน `createYalaTouristSurveyForm()` ซ้ำ เพราะจะสร้างฟอร์มใหม่และ QR เดิมจะใช้ไม่ได้

## นำเข้าข้อมูลจาก Google Sheets (ทางเลือกสำรอง)

ผู้ดูแลเข้า `/admin/import` (ต้องกรอก passcode) อัปโหลดไฟล์ CSV → ดูตัวอย่าง (preview) → ยืนยัน ระบบแสดงจำนวนเพิ่มใหม่ / ซ้ำ / ผิดพลาด และบันทึกประวัติ (ดูที่ `/admin/quality`)

## Deploy บน Vercel

1. Import repo นี้ใน Vercel
2. ตั้ง **Root Directory = `web`**
3. ใส่ Environment Variables ชุดเดียวกับ `.env.local` (รวม `GEMINI_*` และ `NEXT_PUBLIC_RESEARCH_*` ถ้าใช้) (ใช้ placeholder ตามข้างบน ค่าจริงใส่ใน Vercel เท่านั้น)
4. Deploy แล้วเปิด `/`, `/guide`, `/survey-poster` และทดสอบ `/admin/login`

## โครงหน้า

| เส้นทาง | หน้า |
|---|---|
| `/` | ภาพรวม |
| `/visitors`, `/travel`, `/awareness`, `/spending`, `/satisfaction`, `/business` | วิเคราะห์ตามหัวข้อ |
| `/reports` | รายงานและส่งออก CSV / พิมพ์ |
| `/about` | เกี่ยวกับงานวิจัย (วัตถุประสงค์ วิธีเก็บ ข้อจำกัด) |
| `/guide` | คู่มือผู้ประกอบการ |
| `/survey-poster` | โปสเตอร์ QR พิมพ์ A4 |
| `/admin/login`, `/admin/import`, `/admin/quality` | ผู้ดูแล (ต้องมี passcode) |
| `/api/chat`, `/api/pulse` | API ภายใน: แชต AI / ตัวบ่งชี้ข้อมูลใหม่ (แดชบอร์ดเรียกทุก 15 วินาที) |

## ฟีเจอร์เพิ่มเติม

- **แชต AI** (ปุ่มลอยมุมขวาล่าง): ต้องมี `GEMINI_API_KEY` ; ผู้ใช้เลือกประเภทธุรกิจก่อนจึงถามได้ ; คำตอบอิงสถิติจาก `web/lib/survey` เท่านั้น
- **ตัวกรองเดือน/ปี** และ **ช่วงข้อมูลวิจัย** (ดู env ข้างบน)
- **การ์ดความคืบหน้าเก็บข้อมูล** นับเทียบเป้า 267 ชุด และแถบเตือนเมื่อกลุ่มตัวอย่าง n < 30
- **ดาวน์โหลดกราฟเป็น PNG** จากปุ่มบนทุกการ์ดกราฟ
- **อัปเดตอัตโนมัติ**: หน้าเว็บตรวจข้อมูลใหม่ทุก 15 วินาทีขณะเปิดแท็บ (ไม่ต้องกดรีเฟรช)

## เอกสารประกอบ

- `PLAN.md` แผนงานและสถานะ task
- `docs/DATA_CONTRACT.md` รหัสข้อ ตัวเลือก กฎคำนวณ (แหล่งความจริง)
- `docs/QA_CHECKLIST.md` รายการทดสอบ EXP / EVA และวิธีเทียบกับ Google Sheets
- `docs/HANDOFF_NOTES.md` บันทึกส่งต่องาน
