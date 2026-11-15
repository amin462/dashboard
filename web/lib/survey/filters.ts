import type { Row } from './schema'

export type Filters = {
  from?: string
  to?: string
  age?: string[]
  origin?: string[]
  companion?: string[]
  transport?: string[]
}

type SP = URLSearchParams | Record<string, string | string[] | undefined>

const LIST_KEYS = ['age', 'origin', 'companion', 'transport'] as const

function getAll(sp: SP, key: string): string[] {
  if (sp instanceof URLSearchParams) return sp.getAll(key).filter(Boolean)
  const v = sp[key]
  if (v === undefined) return []
  return (Array.isArray(v) ? v : [v]).filter(Boolean)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function filtersFromSearchParams(sp: SP): Filters {
  const f: Filters = {}
  const from = getAll(sp, 'from')[0]
  const to = getAll(sp, 'to')[0]
  if (from && DATE_RE.test(from)) f.from = from
  if (to && DATE_RE.test(to)) f.to = to
  for (const k of LIST_KEYS) {
    const vals = getAll(sp, k)
    if (vals.length) f[k] = vals
  }
  return f
}

/** คืน query string (ไม่มี ?) ; ค่าหลายตัวใช้ key ซ้ำ */
export function filtersToQuery(f: Filters): string {
  const q = new URLSearchParams()
  if (f.from) q.set('from', f.from)
  if (f.to) q.set('to', f.to)
  for (const k of LIST_KEYS) for (const v of f[k] ?? []) q.append(k, v)
  return q.toString()
}

export function hasFilters(f: Filters): boolean {
  return filtersToQuery(f) !== ''
}

export function applyFilters(rows: Row[], f: Filters): Row[] {
  return rows.filter((r) => {
    if (f.from && (!r.date || r.date < f.from)) return false
    if (f.to && (!r.date || r.date > f.to)) return false
    if (f.age?.length && !(r.sur01 && f.age.includes(r.sur01))) return false
    if (f.origin?.length && !(r.sur02 && f.origin.includes(r.sur02))) return false
    if (f.companion?.length && !(r.sur03 && f.companion.includes(r.sur03))) return false
    if (f.transport?.length && !(r.sur04 && f.transport.includes(r.sur04))) return false
    return true
  })
}

// ---------- ตัวกรองเดือน/ปี (T15) ----------

export type MonthInfo = { ym: string; year: number; month: number; count: number }

const MONTH_RE = /^(\d{4})-(\d{2})$/

/** เดือนที่มีผู้ตอบจริง เรียงใหม่ → เก่า (ใช้เลือกเดือนในตัวกรอง) */
export function monthsWithData(rows: Row[]): MonthInfo[] {
  const m = new Map<string, number>()
  for (const r of rows) {
    if (!r.date) continue
    const ym = r.date.slice(0, 7)
    m.set(ym, (m.get(ym) ?? 0) + 1)
  }
  return Array.from(m.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([ym, count]) => ({ ym, year: Number(ym.slice(0, 4)), month: Number(ym.slice(5, 7)), count }))
}

/** ช่วงวันที่ทั้งเดือน จาก 'YYYY-MM' ; ไม่ถูกต้อง → null */
export function monthRange(ym: string): { from: string; to: string } | null {
  const m = MONTH_RE.exec(ym)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  if (mo < 1 || mo > 12) return null
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate()
  return { from: `${m[1]}-${m[2]}-01`, to: `${m[1]}-${m[2]}-${String(last).padStart(2, '0')}` }
}

export function yearRange(year: number): { from: string; to: string } {
  return { from: `${year}-01-01`, to: `${year}-12-31` }
}

export type QuickRangeKind = 'thisMonth' | 'lastMonth' | 'thisYear'

/** ปุ่มลัด อ้างอิงวันนี้ (today = YYYY-MM-DD เวลาไทย ส่งเข้ามาเพื่อให้ทดสอบได้) */
export function quickRange(kind: QuickRangeKind, today: string): { from: string; to: string } | null {
  const m = MONTH_RE.exec(today.slice(0, 7))
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  if (kind === 'thisYear') return yearRange(y)
  if (kind === 'thisMonth') return monthRange(today.slice(0, 7))
  const py = mo === 1 ? y - 1 : y
  const pm = mo === 1 ? 12 : mo - 1
  return monthRange(`${py}-${String(pm).padStart(2, '0')}`)
}

/** ตัวกรองวันที่ตรงกับ "ทั้งเดือน" ใด → 'YYYY-MM' ; ไม่ตรง → null */
export function filterMonth(f: Filters): string | null {
  if (!f.from || !f.to) return null
  const ym = f.from.slice(0, 7)
  const r = monthRange(ym)
  return r && r.from === f.from && r.to === f.to ? ym : null
}

/** ตัวกรองวันที่ตรงกับ "ทั้งปี" ใด → ปี ค.ศ. ; ไม่ตรง → null */
export function filterYear(f: Filters): number | null {
  if (!f.from || !f.to) return null
  const y = Number(f.from.slice(0, 4))
  const r = yearRange(y)
  return Number.isFinite(y) && r.from === f.from && r.to === f.to ? y : null
}
