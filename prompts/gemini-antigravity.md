# Prompt สำหรับ Gemini Antigravity (Task T2) — คัดลอกทั้งกล่องไปวาง

```
คุณคือ frontend engineer + UI designer ทำ Task T2 ของโปรเจกต์ D:\project-next\dashboard

อ่านก่อน (เท่านี้พอ): AGENTS.md, PLAN.md, docs/DATA_CONTRACT.md
ไฟล์ที่คุณแก้ได้เท่านั้น: web/app/(dash)/**, web/app/layout.tsx, web/app/globals.css, web/components/**
ห้ามแก้ web/lib/** (เป็นของ T1) — ถ้า API ขาดอะไร เขียนขอใน docs/HANDOFF_NOTES.md แล้วทำ adapter ชั่วคราวใน components/
ห้ามอ่าน ui/index.html ทั้งไฟล์ (ใหญ่) — ดูได้แค่ 200 บรรทัดแรกเพื่อเก็บ "แนวคิด" เมนู ไม่ต้องลอกดีไซน์

เป้าหมาย: แดชบอร์ดภาษาไทยสำหรับ "ผู้ประกอบการท่องเที่ยวอำเภอเมืองยะลา" (ร้านอาหาร ที่พัก ของฝาก นำเที่ยว)
อ่านแล้วตัดสินใจได้ภายใน 30 วินาที ผู้ใช้ไม่ใช่สายไอที ใช้บนมือถือได้ (ผู้ประกอบการเปิดจากโทรศัพท์) และโน้ตบุ๊ก

ดีไซน์:
- โทนสุภาพ น่าเชื่อถือ แรงบันดาลใจจากวัดถ้ำ/หินปูน/ธรรมชาติยะลา: พื้นหลังสว่างอุ่น (stone), สีหลัก teal เข้ม, accent ทอง/อำพัน 1 สี, รองรับ dark mode
- ฟอนต์ Noto Sans Thai (next/font/google), ตัวเลขใช้ tabular-nums, ขนาดอ่านง่าย (body ≥ 15px)
- Layout: sidebar (desktop) / bottom nav หรือ drawer (mobile) ; header มีชื่อระบบ, แหล่งข้อมูล (Supabase/ตัวอย่าง), เวลาอัปเดตล่าสุด, ลิงก์ "เว็บหลัก" (NEXT_PUBLIC_MAIN_SITE_URL) และ "แบบสำรวจ" (NEXT_PUBLIC_SURVEY_URL)
- แถบตัวกรองรวม sticky (ช่วงวันที่, อายุ, พื้นที่พำนัก, ผู้ร่วมเดินทาง, พาหนะ) ซิงก์กับ URL query ด้วย filtersFromSearchParams/filtersToQuery + chip แสดงตัวกรองที่ใช้ + ปุ่มล้าง
- ถ้าข้อมูลเป็น mock แสดงป้าย "ข้อมูลตัวอย่าง" ชัดเจน
- ใช้ Recharts; ไม่ใช้ pie ที่มี > 5 ชิ้น (ใช้ bar แนวนอนเรียงมาก→น้อย) ; สีหมวดคงที่ทุกหน้า ; label บนแท่งเป็น "count (pct%)"

Component ที่ต้องมี (web/components/):
- ChartCard: title, subtitle, footer แสดง "ฐาน n = X คน · ไม่ตอบ Y · ไม่ประสงค์ระบุ Z" (DATA_CONTRACT ข้อ 3), ปุ่มดูเป็นตาราง (toggle chart/table เพื่อการเข้าถึง)
- KpiCard, InsightCard (title, detail, evidence ตัวเลข, ป้าย "ข้อเสนอเบื้องต้นจากข้อมูลผู้ตอบ"), EmptyState (เหตุผล + ปุ่มล้างตัวกรอง), SmallSampleBadge (n < 5), Disclaimer (ข้อความประจำทุกหน้าใน contract)
- FreqBar (ใช้ผล freq/multiFreq), SatisfactionChart (dist 1–5 + mean/SD/แปลผล), DailyLine, SlotBar, CrosstabTable (heatmap สีอ่อน)

หน้า (route group web/app/(dash)/ ตาราง DATA_CONTRACT ข้อ 4): / , /visitors , /travel , /awareness , /spending , /satisfaction , /business , /reports
- Server component ดึง getRawRows() → normalize() → ส่ง rows ไป client component ที่ applyFilters + aggregate (ข้อมูล ≤ 1,000 แถว ทำฝั่ง client ได้)
- /business: segmented control 4 ประเภทธุรกิจ (BUSINESS_TYPES) → KPI ที่เกี่ยว + InsightCard จาก businessInsights()
- /satisfaction: ข้อเสนอแนะ SUR-11 เป็นรายการการ์ด + ช่องค้นหาคำ
- /reports: ตารางสรุปทุกข้อ + ปุ่ม "ส่งออก CSV" (สร้างฝั่ง client, BOM UTF-8 เพื่อเปิดใน Excel ภาษาไทยได้) + ปุ่ม "พิมพ์/บันทึก PDF" (print CSS ซ่อน nav/filters, A4)
- loading.tsx (skeleton) และ error.tsx ภาษาไทยในทุกกลุ่มหน้า

ลำดับทำ (หยุดรายงานหลังแต่ละขั้น):
1. design tokens ใน globals.css (@theme ของ Tailwind v4) + layout + nav + filter bar + ChartCard/KpiCard/EmptyState — ใช้ข้อมูลปลอมในคอมโพเนนต์ได้ถ้า web/lib/survey ยังไม่มี
2. เมื่อ web/lib/survey มีแล้ว (PLAN.md T1 ✅): ต่อทุกหน้ากับ API จริง
3. responsive ที่ 375px / 768px / 1280px, a11y (contrast AA, focus ring, aria-label กราฟ), print

Definition of done: pnpm -C web lint, pnpm -C web exec tsc --noEmit, pnpm -C web build ผ่าน ; ทุกหน้าเปิดได้ด้วย mock ; ตัวเลขทุกตัวมาจาก lib/survey
เสร็จแล้วตั้ง T2 ✅ ใน PLAN.md และสรุป ≤ 10 บรรทัดใน docs/HANDOFF_NOTES.md
ห้ามติดตั้ง package เพิ่มนอกจาก lucide-react และ clsx (ถ้าจำเป็น) ใช้ pnpm เท่านั้น ไดรฟ์ C เต็ม ห้ามลง global
```
