import { CODES, SUR08_NONE, type Code, type RawRow, type Row, type Slot } from './schema'

const BKK_OFFSET_MS = 7 * 3600 * 1000

/** แปลงเวลา ISO -> { date: YYYY-MM-DD, hour } ตาม Asia/Bangkok ด้วยการบวก 7 ชม. (ไม่ใช้ locale API) */
export function bangkokParts(iso: string): { date: string; hour: number } | null {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const d = new Date(t + BKK_OFFSET_MS)
  return { date: d.toISOString().slice(0, 10), hour: d.getUTCHours() }
}

export function slotOfHour(hour: number): Slot {
  if (hour >= 6 && hour <= 11) return 'เช้า'
  if (hour >= 12 && hour <= 15) return 'บ่าย'
  if (hour >= 16 && hour <= 19) return 'เย็น'
  return 'อื่น'
}

/** trim, ว่าง -> null, hyphen/em dash ระหว่างตัวเลข -> en dash (U+2013) */
export function cleanValue(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  if (s === '') return null
  return s.replace(/(\d)\s*[-‐‑‒—]\s*(\d)/g, '$1–$2')
}

export function parseSat(v: string | null | undefined): number | null {
  if (!v) return null
  const m = /^\s*([1-5])(?!\d)/.exec(v)
  return m ? Number(m[1]) : null
}

export function splitSur08(v: string | null | undefined): { list: string[]; conflict: boolean } {
  if (!v) return { list: [], conflict: false }
  const parts = v.split(',').map((s) => s.trim()).filter(Boolean)
  const uniq = Array.from(new Set(parts))
  if (uniq.includes(SUR08_NONE) && uniq.length > 1) {
    return { list: uniq.filter((x) => x !== SUR08_NONE), conflict: true }
  }
  return { list: uniq, conflict: false }
}

export function normalizeRow(raw: RawRow): Row {
  const base: Record<string, unknown> = { ...raw }
  for (const c of CODES) base[c] = cleanValue(raw[c])
  const parts = bangkokParts(raw.submitted_at)
  const { list, conflict } = splitSur08(base.sur08 as string | null)
  return {
    ...(base as RawRow),
    sur08list: list,
    sur08conflict: conflict,
    sat: parseSat(base.sur09 as string | null),
    slot: parts ? slotOfHour(parts.hour) : 'อื่น',
    date: parts ? parts.date : '',
  }
}

/** rows = เฉพาะ is_complete ; all = ทุกแถว (สำหรับหน้าคุณภาพข้อมูล) */
export function normalize(raw: RawRow[]): { rows: Row[]; all: Row[] } {
  const all = raw.map(normalizeRow)
  return { rows: all.filter((r) => r.is_complete), all }
}

/** ค่าของข้อ code ในแถวเป็น list (multi -> sur08list, null -> []) */
export function valuesOf(row: Row, code: Code): string[] {
  if (code === 'sur08') return row.sur08list
  const v = row[code]
  return v ? [v] : []
}
