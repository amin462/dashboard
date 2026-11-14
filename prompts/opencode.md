# Prompt สำหรับ opencode (Task T3)

แนะนำโมเดล: `deepseek 4.1 flash (free)` เป็นหลัก ถ้าโดน rate limit สลับ `glm 5.3 flash (free)` — สั่งทีละขั้น (ขั้นละ 1 prompt) เพื่อให้โมเดล flash ไม่หลง
เริ่มหลัง PLAN.md T1 ✅ (ต้องใช้ `web/lib/survey/schema.ts`)

## Prompt 0 (ใส่ครั้งแรก)
```
อ่าน AGENTS.md, PLAN.md, docs/DATA_CONTRACT.md (ข้อ 1, 2, 6), supabase/schema.sql, script_googleForm/syncToSupabase.gs
คุณทำ Task T3 เท่านั้น ไฟล์ที่แก้ได้: web/app/admin/**, web/app/api/**, web/proxy.ts, web/lib/import/**, web/scripts/**
ห้ามแก้ web/lib/survey/** และ web/components/** (ใช้ได้แต่ import) ใช้ pnpm, ห้ามติดตั้ง global, ไดรฟ์ C เต็ม
ตอบสั้น ๆ ว่าเข้าใจขอบเขตแล้ว ยังไม่ต้องเขียนโค้ด
```

## Prompt 1 — parser CSV
```
สร้าง web/lib/import/csv.ts + web/lib/import/csv.test.ts (vitest)
parseGoogleSheetsCsv(text: string): { rows: InsertRow[]; errors: {line:number; reason:string}[] }
- ใช้ papaparse, header แถวแรก ; ลบ BOM
- map คอลัมน์ตามหัวข้อ: ขึ้นต้น "คัดกรองข้อที่ 1"→scr01, "คัดกรองข้อที่ 2"→scr02, "ท่านได้รับทราบคำชี้แจง"→con01, /^(\d{1,2})\.\s/ → sur01..sur11 (ตรรกะเดียวกับ codeOf_ ใน syncToSupabase.gs) ; คอลัมน์เวลา "Timestamp" หรือ "ประทับเวลา"
- parse เวลา: รองรับ "d/m/yyyy, HH:mm:ss", "d/m/yyyy HH:mm:ss", "m/d/yyyy H:mm:ss" (ถ้าเลขแรก > 12 = d/m), ISO ; ปี > 2400 = พ.ศ. ลบ 543 ; ถือเป็นเวลา Asia/Bangkok (+07:00) ; ตัดมิลลิวินาที
- normalize ขีดในช่วงตัวเลข '-' หรือ '—' → '–' (U+2013) เฉพาะค่าที่หลัง normalize แล้วตรงตัวเลือกใน QUESTIONS
- ช่องว่าง → null ; trim ; source='csv'
- แถวที่ไม่มีเวลา/parse ไม่ได้ → errors
test: Timestamp พ.ศ., ค.ศ., หัวคอลัมน์จริงจาก snippet.js, checkbox หลายค่า, แถวเสีย
```

## Prompt 2 — admin passcode
```
web/proxy.ts (Next.js 16 ใช้ proxy.ts แทน middleware.ts): ทุก path /admin/* และ /api/admin/* ยกเว้น /admin/login ต้องมี cookie "admin_session" = sha256(ADMIN_PASSCODE) (ใช้ Web Crypto) ไม่มี → redirect /admin/login (API ตอบ 401 JSON)
web/app/admin/login/page.tsx: ฟอร์มกรอกรหัส (ภาษาไทย) → server action ตรวจกับ process.env.ADMIN_PASSCODE → set cookie httpOnly, sameSite=lax, secure ใน production, 7 วัน ; ปุ่มออกจากระบบ
ไม่มี ADMIN_PASSCODE ใน env → หน้า login แจ้ง "ยังไม่ได้ตั้งค่า ADMIN_PASSCODE" และไม่ให้เข้า
```

## Prompt 3 — import API + หน้า
```
web/lib/import/supabaseAdmin.ts: createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) server-only (import 'server-only')
POST /api/admin/import (multipart file หรือ JSON {rows}) :
 - mode=preview → คืน {total, valid, errors[], sample 10 แถว} ไม่เขียน DB
 - mode=commit → upsert ทีละ 200 แถว onConflict 'dedupe_key', ignoreDuplicates:true, นับ inserted จากจำนวนแถวก่อน/หลัง (select count head:true) → duplicates = valid - inserted → insert import_logs → คืนสรุป
 - ไม่มี env → 503 ข้อความไทย
web/app/admin/import/page.tsx: ลากวางไฟล์ CSV, แสดง preview + errors, ปุ่มยืนยันนำเข้า, ผลลัพธ์ (เพิ่มใหม่/ซ้ำ/ผิดพลาด), คำอธิบายวิธี export CSV จาก Google Sheets (ไฟล์ > ดาวน์โหลด > .csv)
ใช้คอมโพเนนต์จาก web/components ถ้ามี ถ้ายังไม่มีใช้ Tailwind ธรรมดา
```

## Prompt 4 — quality page + seed
```
web/app/admin/quality/page.tsx: server component เรียก getRawRows() + normalize() + quality(all) จาก web/lib/survey แสดง: ทั้งหมด, สมบูรณ์, ไม่ผ่าน scr01/scr02, ไม่ยินยอม, ไม่ครบข้อบังคับ, ข้อมูลขาดรายข้อ sur05–sur11 (ตาราง), sur08 ขัดแย้ง, คำตอบ "อื่น ๆ" ที่ต้องตรวจ, import_logs 20 รายการล่าสุด, เวลา submitted_at ล่าสุด (บอกว่าซิงก์ Google Form ทำงานไหม)
web/scripts/seed.ts: อ่าน .env.local, ใช้ makeMock(300, 42) จาก lib/survey/mock.ts → insert source='seed' ; flag --clear ลบเฉพาะ source='seed' ; เพิ่ม script "seed": "node --env-file=.env.local --experimental-strip-types scripts/seed.ts" (ถ้าไม่ได้ ใช้ tsx เป็น devDependency)
เสร็จแล้วรัน pnpm -C web lint, tsc --noEmit, test, build ให้ผ่าน แล้วตั้ง T3 ✅ ใน PLAN.md + สรุปใน docs/HANDOFF_NOTES.md
```
