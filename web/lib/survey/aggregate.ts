import { valuesOf } from './normalize'
import {
  CODES,
  OTHERS_LABEL,
  QUESTIONS,
  SLOTS,
  TARGET_FULL,
  TARGET_MIN,
  type Code,
  type Row,
  type Slot,
} from './schema'

export type FreqItem = { label: string; count: number; pct: number }
export type FreqResult = {
  code: Code
  title: string
  /** ผู้ตอบข้อนี้ (ไม่รวมคนข้าม) = ตัวหารร้อยละ */
  base: number
  /** ไม่ตอบ (null/ว่าง) */
  skipped: number
  /** ตอบ "ไม่ประสงค์ระบุ"/"ยังประเมินไม่ได้" (นับรวมใน base) */
  notSpecified: number
  items: FreqItem[]
  /** ข้อความ "อื่น ๆ" ที่ผู้ตอบพิมพ์เอง */
  others: string[]
}

export const round1 = (x: number) => Math.round(x * 10) / 10
export const round2 = (x: number) => Math.round(x * 100) / 100
const pctOf = (count: number, base: number) => (base > 0 ? round1((count / base) * 100) : 0)

function buildFreq(code: Code, labelsPerRow: (string[] | null)[]): FreqResult {
  const q = QUESTIONS[code]
  const counts = new Map<string, number>()
  for (const c of q.choices) counts.set(c, 0)
  const others: string[] = []
  let base = 0
  let skipped = 0
  let notSpecified = 0
  let othersCount = 0
  for (const vals of labelsPerRow) {
    if (vals === null) {
      skipped++
      continue
    }
    base++
    let rowNotSpecified = false
    for (const v of vals) {
      if (counts.has(v)) {
        counts.set(v, (counts.get(v) ?? 0) + 1)
        if (q.notSpecified?.includes(v)) rowNotSpecified = true
      } else {
        othersCount++
        others.push(v)
      }
    }
    if (rowNotSpecified) notSpecified++
  }
  const items: FreqItem[] = q.choices.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
    pct: pctOf(counts.get(label) ?? 0, base),
  }))
  if (othersCount > 0) items.push({ label: OTHERS_LABEL, count: othersCount, pct: pctOf(othersCount, base) })
  return { code, title: q.title, base, skipped, notSpecified, items, others }
}

/** ความถี่ข้อเดี่ยว: ตัวหาร = ผู้ตอบข้อนั้น (ไม่รวมคนข้าม) */
export function freq(rows: Row[], code: Code): FreqResult {
  if (code === 'sur08') return multiFreq(rows)
  return buildFreq(
    code,
    rows.map((r) => {
      const v = r[code]
      return v ? [v] : null
    }),
  )
}

/** sur08 หลายข้อ: ตัวหาร = คนที่ตอบข้อ 8 (รวม % > 100 ได้) */
export function multiFreq(rows: Row[]): FreqResult {
  return buildFreq(
    'sur08',
    rows.map((r) => (r.sur08 ? r.sur08list : null)),
  )
}

export type SatLevel = 'มากที่สุด' | 'มาก' | 'ปานกลาง' | 'น้อย' | 'น้อยที่สุด'

export function satLevel(mean: number): SatLevel {
  const m = round2(mean)
  if (m >= 4.21) return 'มากที่สุด'
  if (m >= 3.41) return 'มาก'
  if (m >= 2.61) return 'ปานกลาง'
  if (m >= 1.81) return 'น้อย'
  return 'น้อยที่สุด'
}

export type SatResult = {
  /** จำนวนที่ให้คะแนน 1-5 */
  n: number
  mean: number | null
  /** ส่วนเบี่ยงเบนมาตรฐานของตัวอย่าง (n-1) ; null ถ้า n < 2 */
  sd: number | null
  level: SatLevel | null
  dist: { score: number; count: number; pct: number }[]
  /** ตอบ "ยังไม่สามารถประเมินได้" */
  cannotRate: number
  /** ไม่ตอบ (null) */
  skipped: number
}

export function satisfaction(rows: Row[]): SatResult {
  const scores: number[] = []
  let cannotRate = 0
  let skipped = 0
  for (const r of rows) {
    if (r.sat !== null) scores.push(r.sat)
    else if (r.sur09) cannotRate++
    else skipped++
  }
  const n = scores.length
  const mean = n ? scores.reduce((a, b) => a + b, 0) / n : null
  let sd: number | null = null
  if (n >= 2 && mean !== null) {
    const ss = scores.reduce((a, b) => a + (b - mean) ** 2, 0)
    sd = Math.sqrt(ss / (n - 1))
  }
  const dist = [5, 4, 3, 2, 1].map((score) => {
    const count = scores.filter((s) => s === score).length
    return { score, count, pct: pctOf(count, n) }
  })
  return {
    n,
    mean: mean === null ? null : round2(mean),
    sd: sd === null ? null : round2(sd),
    level: mean === null ? null : satLevel(mean),
    dist,
    cannotRate,
    skipped,
  }
}

/** จำนวนผู้ตอบรายวัน (เติมวันที่ว่างเป็น 0 ระหว่างวันแรก-วันสุดท้าย) */
export function daily(rows: Row[]): { date: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const r of rows) {
    if (!r.date) continue
    counts.set(r.date, (counts.get(r.date) ?? 0) + 1)
  }
  if (counts.size === 0) return []
  const dates = Array.from(counts.keys()).sort()
  const out: { date: string; count: number }[] = []
  const end = Date.parse(dates[dates.length - 1] + 'T00:00:00Z')
  for (let t = Date.parse(dates[0] + 'T00:00:00Z'); t <= end; t += 86400000) {
    const d = new Date(t).toISOString().slice(0, 10)
    out.push({ date: d, count: counts.get(d) ?? 0 })
  }
  return out
}

export function bySlot(rows: Row[]): { slot: Slot; count: number; pct: number }[] {
  const total = rows.length
  return SLOTS.map((slot) => {
    const count = rows.filter((r) => r.slot === slot).length
    return { slot, count, pct: pctOf(count, total) }
  })
}

export type CrosstabResult = {
  a: Code
  b: Code
  /** จำนวนแถวที่ตอบทั้งสองข้อ */
  n: number
  rowLabels: string[]
  colLabels: string[]
  /** cells[i][j] = จำนวนคนที่ตอบ rowLabels[i] และ colLabels[j] (b เป็น multi ได้) */
  cells: number[][]
  rowTotals: number[]
  colTotals: number[]
}

function labelOf(code: Code, v: string): string {
  return QUESTIONS[code].choices.includes(v) ? v : OTHERS_LABEL
}

export function crosstab(rows: Row[], a: Code, b: Code): CrosstabResult {
  const rowLabels = [...QUESTIONS[a].choices]
  const colLabels = [...QUESTIONS[b].choices]
  const hasOther = { a: false, b: false }
  const pairs: [string, string][] = []
  let n = 0
  for (const r of rows) {
    const av = valuesOf(r, a)
    const bv = valuesOf(r, b)
    if (!av.length || !bv.length) continue
    n++
    for (const x of av) {
      const lx = labelOf(a, x)
      if (lx === OTHERS_LABEL) hasOther.a = true
      for (const y of bv) {
        const ly = labelOf(b, y)
        if (ly === OTHERS_LABEL) hasOther.b = true
        pairs.push([lx, ly])
      }
    }
  }
  if (hasOther.a) rowLabels.push(OTHERS_LABEL)
  if (hasOther.b) colLabels.push(OTHERS_LABEL)
  const cells = rowLabels.map(() => colLabels.map(() => 0))
  for (const [x, y] of pairs) cells[rowLabels.indexOf(x)][colLabels.indexOf(y)]++
  return {
    a,
    b,
    n,
    rowLabels,
    colLabels,
    cells,
    rowTotals: cells.map((r) => r.reduce((s, v) => s + v, 0)),
    colTotals: colLabels.map((_, j) => cells.reduce((s, r) => s + r[j], 0)),
  }
}

export type Overview = {
  n: number
  target: { min: number; full: number; pctOfMin: number }
  satisfaction: SatResult
  /** % ตั้งใจจะกลับมาอีก (ฐาน = ผู้ตอบ sur10) */
  returnIntent: { count: number; base: number; pct: number }
  /** ช่วงค่าใช้จ่ายที่พบมากสุด (ไม่นับ ไม่ประสงค์ระบุ/ยังประเมินไม่ได้) */
  topSpend: { label: string; count: number; base: number; pct: number } | null
  /** สินค้า/บริการที่สนใจอันดับ 1 (ไม่นับ "ไม่มีความสนใจเป็นพิเศษ") */
  topInterest: { label: string; count: number; base: number; pct: number } | null
  daily: { date: string; count: number }[]
  slots: { slot: Slot; count: number; pct: number }[]
}

export function topItem(f: FreqResult, exclude: string[] = []): FreqItem | null {
  let best: FreqItem | null = null
  for (const it of f.items) {
    if (exclude.includes(it.label) || it.count === 0) continue
    if (!best || it.count > best.count) best = it
  }
  return best
}

export function overview(rows: Row[]): Overview {
  const n = rows.length
  const s10 = freq(rows, 'sur10')
  const intent = s10.items.find((i) => i.label === 'ตั้งใจจะกลับมาอีก')
  const s7 = freq(rows, 'sur07')
  const spend = topItem(s7, [...(QUESTIONS.sur07.notSpecified ?? [])])
  const s8 = multiFreq(rows)
  const interest = topItem(s8, ['ไม่มีความสนใจเป็นพิเศษ'])
  return {
    n,
    target: { min: TARGET_MIN, full: TARGET_FULL, pctOfMin: round1((n / TARGET_MIN) * 100) },
    satisfaction: satisfaction(rows),
    returnIntent: { count: intent?.count ?? 0, base: s10.base, pct: intent?.pct ?? 0 },
    topSpend: spend ? { label: spend.label, count: spend.count, base: s7.base, pct: spend.pct } : null,
    topInterest: interest ? { label: interest.label, count: interest.count, base: s8.base, pct: interest.pct } : null,
    daily: daily(rows),
    slots: bySlot(rows),
  }
}

export type CollectionStatus = 'none' | 'collecting' | 'reached_min' | 'reached_full'

export type CollectionProgress = {
  n: number
  min: number
  full: number
  pctOfMin: number
  pctOfFull: number
  remainingToMin: number
  remainingToFull: number
  status: CollectionStatus
  /** ISO เวลาที่ตอบล่าสุด ; null ถ้ายังไม่มีข้อมูล */
  lastSubmittedAt: string | null
  /** วันแรก/วันสุดท้ายที่มีผู้ตอบ (YYYY-MM-DD เวลาไทย) */
  firstDate: string | null
  lastDate: string | null
  /** จำนวนวันที่มีผู้ตอบจริง และค่าเฉลี่ยต่อวันที่มีผู้ตอบ */
  activeDays: number
  perActiveDay: number
  /** ผู้ตอบใน 7 วันล่าสุด (นับย้อนจาก today ถ้าส่งมา ไม่งั้นจากวันที่ตอบล่าสุด ; รวมวันนั้น) */
  last7: number
  /** จำนวนที่เกินเป้าเต็ม (0 ถ้ายังไม่ถึง) — ใช้แสดง "ข้อมูลสะสม" */
  surplus: number
}

/**
 * ความคืบหน้าการเก็บข้อมูลเทียบเป้า (ใช้กับข้อมูลทั้งหมด ไม่ใช่ข้อมูลหลังกรอง)
 * today = YYYY-MM-DD (เวลาไทย) วันนี้ ; ส่งมาเพื่อนับ "7 วันล่าสุด" ย้อนจากวันนี้ (ไม่ส่ง = ย้อนจากวันที่ตอบล่าสุด)
 */
export function collectionProgress(rows: Row[], today?: string | null): CollectionProgress {
  const n = rows.length
  const days = new Map<string, number>()
  let last: string | null = null
  for (const r of rows) {
    if (r.date) days.set(r.date, (days.get(r.date) ?? 0) + 1)
    if (r.submitted_at && (!last || r.submitted_at > last)) last = r.submitted_at
  }
  const dates = Array.from(days.keys()).sort()
  const lastDate = dates.length ? dates[dates.length - 1] : null
  const ref = today && /^\d{4}-\d{2}-\d{2}$/.test(today) ? today : lastDate
  const cutoff = ref ? new Date(Date.parse(ref + 'T00:00:00Z') - 6 * 86400000).toISOString().slice(0, 10) : null
  const last7 = cutoff && ref ? rows.filter((r) => r.date && r.date >= cutoff && r.date <= ref).length : 0
  const status: CollectionStatus = n === 0 ? 'none' : n < TARGET_MIN ? 'collecting' : n < TARGET_FULL ? 'reached_min' : 'reached_full'
  return {
    n,
    min: TARGET_MIN,
    full: TARGET_FULL,
    pctOfMin: round1((n / TARGET_MIN) * 100),
    pctOfFull: round1((n / TARGET_FULL) * 100),
    remainingToMin: Math.max(0, TARGET_MIN - n),
    remainingToFull: Math.max(0, TARGET_FULL - n),
    status,
    lastSubmittedAt: last,
    firstDate: dates[0] ?? null,
    lastDate,
    activeDays: dates.length,
    perActiveDay: dates.length ? round1(n / dates.length) : 0,
    last7,
    surplus: Math.max(0, n - TARGET_FULL),
  }
}

export type Quality = {
  total: number
  complete: number
  failedScreening: number
  noConsent: number
  /** ผ่านคัดกรอง+ยินยอม แต่ข้อบังคับไม่ครบ */
  missingRequired: number
  /** แถวที่ sur08 ขัดแย้ง (ไม่มีความสนใจ + ข้ออื่น) ในทุกแถว */
  sur08Conflicts: number
  /** ข้อมูลขาดรายข้อ นับเฉพาะแถวสมบูรณ์ */
  missingByQuestion: { code: Code; title: string; required: boolean; missing: number; pct: number }[]
  bySource: { source: string; count: number }[]
  firstSubmittedAt: string | null
  lastSubmittedAt: string | null
}

export function quality(all: Row[]): Quality {
  let complete = 0
  let failedScreening = 0
  let noConsent = 0
  let missingRequired = 0
  let sur08Conflicts = 0
  const sources = new Map<string, number>()
  const completeRows: Row[] = []
  let first: string | null = null
  let last: string | null = null
  for (const r of all) {
    sources.set(r.source, (sources.get(r.source) ?? 0) + 1)
    if (r.sur08conflict) sur08Conflicts++
    if (!first || r.submitted_at < first) first = r.submitted_at
    if (!last || r.submitted_at > last) last = r.submitted_at
    if (r.is_complete) {
      complete++
      completeRows.push(r)
    } else if (r.scr01 !== 'ใช่' || r.scr02 !== 'ใช่') failedScreening++
    else if (r.con01 !== 'ยินยอม') noConsent++
    else missingRequired++
  }
  const missingByQuestion = CODES.filter((c) => c.startsWith('sur')).map((code) => {
    const q = QUESTIONS[code]
    const missing = completeRows.filter((r) => !r[code]).length
    return { code, title: q.title, required: q.required, missing, pct: pctOf(missing, completeRows.length) }
  })
  return {
    total: all.length,
    complete,
    failedScreening,
    noConsent,
    missingRequired,
    sur08Conflicts,
    missingByQuestion,
    bySource: Array.from(sources, ([source, count]) => ({ source, count })),
    firstSubmittedAt: first,
    lastSubmittedAt: last,
  }
}
