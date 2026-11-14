// แปลง CSV จาก Google Sheets (File > Download > CSV) เป็นแถวสำหรับ insert ลง survey_responses
// - map หัวคอลัมน์ด้วยตรรกะเดียวกับ codeOf_ ใน script_googleForm/syncToSupabase.gs (DATA_CONTRACT ข้อ 1)
// - เวลาถือเป็น Asia/Bangkok (+07:00), ปี > 2400 = พ.ศ. (ลบ 543), ตัดมิลลิวินาที (ตรงกับ dedupe_key ที่ใช้วินาที)
// - ห้ามคำนวณสถิติที่นี่: จัดกลุ่ม/สรุปทำใน web/lib/survey/* เท่านั้น (ไฟล์นี้แค่ normalize ค่าดิบก่อน insert)

import Papa from 'papaparse'
import { CODES, QUESTIONS, type Code } from '@/lib/survey/schema'
import { cleanValue } from '@/lib/survey/normalize'

/** แถวที่พร้อม insert ลง survey_responses (id / imported_at ให้ DB สร้าง, form_response_id เว้นไว้) */
export type InsertRow = {
  source: 'csv'
  submitted_at: string
} & Partial<Record<Code, string | null>>

export type CsvError = { line: number; reason: string }

export type ParseCsvResult = { rows: InsertRow[]; errors: CsvError[] }

const BKK_OFFSET_MS = 7 * 3600_000

/** หัวคอลัมน์ -> code / 'time' / null (คอลัมน์อื่น เช่น คะแนน ไม่เอา) */
export function codeOfHeader(header: string): Code | 'time' | null {
  const h = header.trim()
  if (h.toLowerCase() === 'timestamp' || h === 'ประทับเวลา') return 'time'
  if (h.startsWith('คัดกรองข้อที่ 1')) return 'scr01'
  if (h.startsWith('คัดกรองข้อที่ 2')) return 'scr02'
  if (h.startsWith('ท่านได้รับทราบคำชี้แจง')) return 'con01'
  const m = /^(\d{1,2})\.\s/.exec(h) // ตรรกะเดียวกับ codeOf_ ใน syncToSupabase.gs
  if (!m) return null
  const n = Number(m[1])
  return n >= 1 && n <= 11 ? (`sur${String(n).padStart(2, '0')}` as Code) : null
}

/** ISO UTC จากส่วนวันเวลาที่อ่านแล้ว ; ปี > 2400 = พ.ศ. - 543 ; shiftMs = ส่วนต่างเขตเวลา ; ผิด -> null */
function utcIso(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  shiftMs: number,
): string | null {
  if (y > 2400) y -= 543
  if ([y, mo, d, h, mi, s].some((n) => !Number.isFinite(n))) return null
  if (y < 1 || mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) return null
  // ตรวจวันที่จริงก่อน shift เขตเวลา (เช่น 31/2 ปัดไปเดือนถัดไป, 29/2 ปีไม่อธิกสุรทิน)
  const local = new Date(Date.UTC(y, mo - 1, d, h, mi, s))
  if (local.getUTCMonth() !== mo - 1 || local.getUTCDate() !== d) return null
  return new Date(local.getTime() + shiftMs).toISOString() // ms เป็น 000 เสมอ (ตัดมิลลิวินาที)
}

/** รองรับ 'd/m/yyyy[, ]H:mm[:ss]', 'm/d/yyyy H:mm:ss' (เลขแรก > 12 = d/m, กำกวม = d/m ตามฟอร์มไทย), ISO 8601 */
export function parseSubmittedAt(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null

  const mDm = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s)
  if (mDm) {
    const a = Number(mDm[1])
    const b = Number(mDm[2])
    const d = a > 12 ? a : b > 12 ? b : a
    const mo = a > 12 ? b : b > 12 ? a : b
    return utcIso(Number(mDm[3]), mo, d, Number(mDm[4]), Number(mDm[5]), Number(mDm[6] ?? 0), -BKK_OFFSET_MS)
  }

  const mIso =
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}(?::?\d{2})?)?)?$/.exec(
      s,
    )
  if (mIso) {
    let shift = -BKK_OFFSET_MS // ISO ไม่ระบุเขตเวลา = เวลาไทย
    const tz = mIso[7]
    if (tz) {
      if (tz === 'Z') {
        shift = 0
      } else {
        const sign = tz[0] === '-' ? -1 : 1
        const digits = tz.slice(1).replace(':', '')
        shift = -sign * (Number(digits.slice(0, 2)) * 60 + (digits.length > 2 ? Number(digits.slice(2)) : 0)) * 60_000
      }
    }
    return utcIso(
      Number(mIso[1]),
      Number(mIso[2]),
      Number(mIso[3]),
      Number(mIso[4] ?? 0),
      Number(mIso[5] ?? 0),
      Number(mIso[6] ?? 0),
      shift,
    )
  }

  return null
}

const CHOICES = new Map<string, Set<string>>(CODES.map((c) => [c, new Set(QUESTIONS[c].choices)]))

/** trim ; ว่าง -> null ; แก้ขีดระหว่างตัวเลข (-/— -> –) เฉพาะเมื่อผลตรงตัวเลือกของข้อนั้น (ข้อความอิสระคงเดิม) */
function cell(v: string | undefined, code: Code): string | null {
  if (v === undefined) return null
  const s = v.trim()
  if (!s) return null
  const fixed = cleanValue(s)
  if (fixed && fixed !== s && CHOICES.get(code)?.has(fixed)) return fixed
  return s
}

export function parseGoogleSheetsCsv(text: string): ParseCsvResult {
  // ลบ BOM ; greedy = ข้ามแถวที่ทุกช่องว่าง (เช่น บรรทัดว่างท้ายไฟล์)
  const parsed = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ''), {
    header: true,
    delimiter: ',', // CSV จาก Google Sheets เป็น comma เสมอ (กัน error "auto-detect delimiter" ตอนไฟล์ว่าง)
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  })

  const errors: CsvError[] = parsed.errors.map((e) => ({
    line: (e.row ?? 0) + 2, // แถวข้อมูลแรก = บรรทัดที่ 2 (หลังหัวคอลัมน์)
    reason: `รูปแบบ CSV ไม่ถูกต้อง: ${e.message}`,
  }))

  const headers = parsed.meta.fields ?? []
  const timeField = headers.find((h) => codeOfHeader(h) === 'time')
  const cols = headers.flatMap((h) => {
    const code = codeOfHeader(h)
    return code && code !== 'time' ? [{ header: h, code }] : []
  })

  const rows: InsertRow[] = []
  parsed.data.forEach((data, i) => {
    const line = i + 2
    const tsRaw = timeField ? data[timeField] : undefined
    const submittedAt = tsRaw !== undefined ? parseSubmittedAt(tsRaw) : null
    if (!submittedAt) {
      errors.push({
        line,
        reason: timeField
          ? `เวลาไม่ถูกต้อง: "${(tsRaw ?? '').trim()}"`
          : 'ไม่พบคอลัมน์เวลา (Timestamp หรือ ประทับเวลา)',
      })
      return
    }
    const row: InsertRow = { source: 'csv', submitted_at: submittedAt }
    for (const { header, code } of cols) {
      const v = cell(data[header], code)
      if (v !== null) row[code] = v
    }
    rows.push(row)
  })

  return { rows, errors }
}
