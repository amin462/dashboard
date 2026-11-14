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
