# DESIGN.md — Yala Insight redesign (source of truth for all UI)

## Concept: "ถ้ำยามค่ำ · ทองคำเปลว" (cave at night · gold leaf)
Calm, editorial analytics. A dark navy frame (the cave), white paper content, one gold accent (the gilded reclining Buddha) used sparingly for "what matters".
The operator should find **the answer** in each chart in 3 seconds → highlight the top answer, mute the rest.

## Tokens (`web/app/globals.css`, Tailwind v4 `@theme`) — replace old palette completely
| token | light | dark | use |
|---|---|---|---|
| canvas | #F5F4F0 | #0E1422 | page background (warm paper) |
| surface | #FFFFFF | #151D2E | cards |
| surface-2 | #FAF9F6 | #1B2438 | table stripes, inputs |
| line | #E6E3DC | #263049 | 1px borders/dividers |
| ink | #141B2D | #E8ECF4 | primary text |
| ink-2 | #4A5265 | #A9B3C7 | secondary text |
| ink-3 | #7A8296 | #7C879D | meta, captions |
| frame | #121A2B | #0A0F1A | sidebar / mobile tab bar |
| frame-ink | #C5CDDC | #C5CDDC | sidebar text ; active = #FFFFFF |
| brand | #2F55C9 | #6E8FF0 | links, active controls, **highlighted data** |
| brand-soft | #EAF0FD | #1C2A4E | selected chip bg |
| gold | #B7862C | #D9AE55 | accent: active-nav bar, insight rule, KPI "best" marker (≤ 3 uses per screen) |
| gold-soft | #FBF4E4 | #2E2716 | insight card bg |
| data-muted | #CDD3DF | #34405A | non-highlighted bars |
| warn / warn-soft | #A15C07 / #FFF5DF | #F0B95A / #33280F | seed/mock banner |
| danger | #B42318 | #F97066 | errors |
| ok | #157F3D | #4ADE80 | sync OK |

Diverging (satisfaction 1→5, revisit ไม่น่า→ตั้งใจ): `#C2410C #E8A33D #CDD3DF #7C9BEA #2F55C9` ("ยังไม่สามารถประเมินได้"/ไม่ตอบ = hatched or #E6E3DC, shown separately, never in the scale).
Contrast: all text ≥ 4.5:1 on its bg. Gold never used for body text on white.

## Type
- Font: **IBM Plex Sans Thai** (next/font/google, weights 400/500/600/700) for everything; `font-variant-numeric: tabular-nums` on all numbers.
- Scale: page title 24/32 600 · section 15/22 600 · body 14/22 · meta 12/18 · KPI value 30/36 600. No ALL CAPS, no letter-spaced Thai.

## Layout
- Desktop ≥1024: fixed sidebar 232px (frame color) + content max-width 1240px, padding 24/32.
- **Top bar (56px, sticky, surface, bottom line):** left = page title (h1) ; right = source pill (● ข้อมูลจริง / ● ข้อมูลตัวอย่าง) + "อัปเดต 20:11" + theme toggle. No external-link buttons here (move "เว็บหลัก/แบบสำรวจ" to sidebar footer).
- **Filters (one 44px row under top bar, sticky):** compact dropdown chips `ช่วงวันที่ ▾ · อายุ ▾ · พื้นที่ ▾ · ผู้ร่วมเดินทาง ▾ · พาหนะ ▾` ; active chip = brand-soft with count ; "ล้าง" text button appears only when active ; result text right-aligned `278 คน`. Each chip opens a popover with checkboxes (date = 2 inputs + presets 7 วัน / 30 วัน / ทั้งหมด). Mobile: one "ตัวกรอง (2)" button → bottom sheet.
- Banners (seed/mock/error): single 36px line, warn-soft, icon + one sentence + optional "รายละเอียด" disclosure. Never more than one line by default.
- Page body: header (title is in top bar → here only 1-line description in ink-2) → **StatStrip** → chart grid (2 cols ≥1024, 1 col below; gap 16).
- Sidebar: logo "Yala Insight" + "วัดคูหาภิมุข · อ.เมืองยะลา" ; nav groups "วิเคราะห์" / "ช่วยเหลือ" / "ผู้ดูแล" ; active item = white text + 3px gold left bar + rgba(255,255,255,.06) bg ; footer links เว็บหลัก · แบบสำรวจ · โปสเตอร์ QR.
- Mobile <768: no sidebar; bottom tab bar (frame color, 5 items: ภาพรวม, ผู้ตอบ, ใช้จ่าย, ธุรกิจ, เพิ่มเติม→sheet).

## Components (rebuild, keep props driven by `lib/survey` results)
- **StatStrip**: one bordered row split by vertical dividers (not separate boxes). Each stat: label (meta) / value (KPI) / context (meta, e.g. "จาก 255 คนที่ตอบข้อ 10"). Target progress (278/300) = thin 4px bar under value.
- **ChartCard**: surface, 1px line, radius 12, padding 20, no shadow. Header: title (section) + code chip `SUR-07` (ink-3, 11px, line border) + right icon button table/chart toggle. **Takeaway line** under title in ink-2: auto sentence from data, e.g. "พบมากที่สุด: 301–600 บาท (37.5%)". Footer meta: `ฐาน n = 256 · ไม่ตอบ 22 · ไม่ประสงค์ระบุ 5`.
- **FreqBar** (horizontal): row = label (left, full Thai, wraps max 2 lines, width 40%) | bar track (data-muted at 100% length scale = max) | value `96 · 37.5%` right-aligned tabular. **Top item bar = brand, others = data-muted**; "อื่น ๆ"/"ไม่ประสงค์ระบุ" always last and muted. Row height 32. Built with plain divs (not Recharts) → crisp, accessible, prints well.
- **SatisfactionChart**: 100% stacked single bar with diverging colors + legend row, mean big number "4.16 / 5 · มาก" + SD meta.
- **DailyLine**: Recharts area, brand line 2px, brand 8% fill, no gridlines except light horizontal, weekend ticks muted.
- **CrosstabTable**: heatmap cells brand at alpha by %, numbers inside, sticky first column.
- **InsightCard**: gold-soft bg, 3px gold left rule, label "ข้อเสนอเบื้องต้น" (meta, gold-ink), title 15/600, evidence chips `n = 120 · 47%`.
- EmptyState: icon line-art, one sentence reason, "ล้างตัวกรอง" button. Skeletons match final layout.
- Buttons: 36px, radius 8; primary = brand bg white text; secondary = surface + line.
- Focus ring: 2px brand offset 2. Motion: 150ms ease-out, respect prefers-reduced-motion.

## Business page (`/business`)
Segmented control of 4 types (icons: utensils, bed, gift, bus). Under it: StatStrip of that type's 3 key numbers → InsightCards (max 3) → the 2 supporting charts. Copy speaks to the owner ("ลูกค้าของคุณ…").

## Print (`/reports`)
A4, black on white, hide frame/filters/banners, show filter summary + data source + date at top, page-break-inside: avoid on cards.

## Don'ts
No gradients, no glassmorphism, no drop shadows heavier than `0 1px 2px rgb(0 0 0 / .04)`, no pie/donut, no icon tiles in colored squares on KPIs, no emoji, no more than 1 gold element per card.

---

# v2 OVERRIDES (14 พ.ย. 2569) — ใช้แทนส่วนที่ขัดกันด้านบน
อ้างอิงภาพที่ผู้ใช้ให้: sidebar กรมท่า, การ์ดขาวลอยบนพื้นเทาฟ้า, กราฟ 2 โทน **กรมท่า + อำพัน**, การ์ด KPI ใบแรกพื้นกรมท่าทึบ, แท่งคู่, area ไล่สี, donut ค่าเดียว, ปฏิทินเล็ก

## Palette v2 (light ; dark ปรับให้คู่กัน)
| token | ค่า | ใช้ |
|---|---|---|
| canvas | #EEF1F6 | พื้นหลังเทาฟ้า |
| surface | #FFFFFF | การ์ด, เงา `0 4px 16px rgb(20 40 80 / .06)`, radius 14, ไม่มีเส้นขอบ |
| frame | #1E3A5F | sidebar (ตัวหนังสือขาว, active = พื้น rgba(255,255,255,.10) + ขีดอำพันซ้าย) |
| navy (data-1) | #1E3A5F | ซีรีส์หลัก / แท่งปกติ |
| navy-2 | #3D6A9E | ซีรีส์รอง/ไล่น้ำหนัก |
| amber (data-2) | #F4A52B | ซีรีส์ที่สอง + **ไฮไลต์คำตอบอันดับ 1** + ปุ่ม CTA |
| amber-soft | #FDF1DC | พื้นการ์ดข้อเสนอ, ชิปที่เลือก |
| muted bar | #D5DCE8 | แท่งที่ไม่ใช่จุดสนใจ / "ไม่ประสงค์ระบุ" |
| ink / ink-2 / ink-3 | #1B2433 / #4B5568 / #667085 | ตัวหนังสือ |
| diverging 1→5 | #E4572E #F4A52B #D5DCE8 #6E93C4 #1E3A5F | ความพึงพอใจ, กลับมาเยือน |
ยกเลิกสีทอง/น้ำเงิน v1 ทั้งหมด ; ห้ามสีอื่นนอกตารางนี้ในกราฟ

## กฎ v2
- **อนุญาต:** gradient เฉพาะ fill ของ area chart (สีเส้น → โปร่งใส), donut **เฉพาะค่าเดียว** (สัดส่วน 1 ค่า เช่น % ตั้งใจกลับมา, ความคืบหน้าเป้า 300) ; ห้าม pie หลายชิ้นเหมือนเดิม
- แท่งมุมบนมน radius 4, ความกว้างแท่งเท่ากันทุกกราฟ, gridline แนวนอนจาง #EEF1F6 เท่านั้น, tooltip การ์ดขาวเงา
- กราฟ Recharts สำหรับ bar/area/donut (div-bar เดิมใช้ต่อในหน้าย่อยได้ แต่สี v2)
- KPI ใบแรกของทุกหน้า = พื้นกรมท่าตัวหนังสือขาว ; ใบอื่นขาว ; มุมขวาบนมีไอคอนเล็กสีอำพัน (ไม่ใช่กล่องสี)
- legend จุดกลม 8px ชิดบนขวาของการ์ด
- ปุ่ม CTA อำพันมน (เช่น "ดูรายละเอียด" ลิงก์ไปหน้าย่อย)

## หน้าภาพรวม `/` — ออกแบบเพื่อผู้ประกอบการตัดสินใจ (grid 12 คอลัมน์)
แถว 1 — KPI 4 ใบ (3 คอลัมน์ต่อใบ):
 1. **ผู้ตอบสมบูรณ์** (กรมท่าทึบ) 278 คน + แถบความคืบหน้า /300
 2. ความพึงพอใจเฉลี่ย 4.16/5 + แปลผล
 3. ตั้งใจกลับมาอีก 47.1%
 4. งบต่อคนที่พบมากสุด 301–600 บาท
แถว 2:
 - ซ้าย (8 คอล): **"ลูกค้าสนใจอะไร — คนยะลา vs คนต่างถิ่น"** แท่งคู่ กรมท่า = ในจังหวัดยะลา, อำพัน = นอกจังหวัด (รวมต่างประเทศ ; ไม่นับ "ไม่ประสงค์ระบุ") แกน X = หมวด SUR-08, ค่า = % ของแต่ละกลุ่ม ; คำนวณด้วย applyFilters(origin) + multiFreq() ของ lib (ห้ามนับเองใน UI) ; takeaway: "คนต่างถิ่นสนใจที่พักมากกว่าคนในพื้นที่ X จุด"
 - ขวา (4 คอล): **donut "ตั้งใจกลับมาอีก 47%"** + รายการ 4 ระดับ SUR-10 (จุดสี + คน + %) + ปุ่ม "ดูความพึงพอใจ" → /satisfaction
แถว 3:
 - ซ้าย (8 คอล): **area 2 ชั้น "จำนวนผู้ตอบรายวัน"** (กรมท่า = ทั้งหมด, อำพัน = ผู้มาจากนอกจังหวัด) จาก daily() ของแต่ละกลุ่ม + ปฏิทินเดือนเล็กด้านขวาในการ์ดเดียวกัน: วันที่มีผู้ตอบไล่ความเข้มกรมท่า, วันที่มากสุดเป็นอำพัน (บอกผู้ประกอบการว่าวันไหนคนมาเยอะ)
 - ขวา (4 คอล): **"ช่วงเวลาที่มา"** แท่งแนวนอน เช้า/บ่าย/เย็น (bySlot) อันดับ 1 อำพัน
แถว 4:
 - ซ้าย (6): "ช่องทางที่รู้จัก" (SUR-06) แท่งแนวนอน อันดับ 1 อำพัน → ใช้ตัดสินใจลงโฆษณา
 - ขวา (6): **ข้อเสนอสำหรับธุรกิจ 3 ข้อ** (overviewInsights) การ์ดพื้น amber-soft + ปุ่ม "ดูตามประเภทธุรกิจ" → /business
มือถือ: เรียงเป็นคอลัมน์เดียวตามลำดับเดิม ; KPI 2×2
หน้าย่อยอื่นปรับสี/การ์ด/แท่งตาม v2 ให้เป็นชุดเดียวกัน (โครงเดิมใช้ต่อได้)

# v3 COLOR OVERRIDE (15 พ.ย. 2569) — ใช้แทนค่าสีใน v2
ชุดสีเปลี่ยนเป็นดินเผา (#b3512d) + ครีม (#faf5ef) ; ค่าจริงและความหมายของแต่ละตัวแปรดูที่คอมเมนต์หัว `web/app/globals.css` ; กฎอื่นของ v2 (การ์ดลอย, type scale, ซีรีส์ข้อมูลน้อยสี) ยังใช้เหมือนเดิม
