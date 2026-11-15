// สถิติสำหรับบทผลวิจัย (เขียนคณิตศาสตร์เอง ไม่พึ่ง dependency) — วิธีคำนวณดู docs/STATS_METHODS.md
// ฟังก์ชันบริสุทธิ์ ไม่ import React ; UI ห้ามคำนวณเอง
import { multiFreq, round1, round2, satisfaction } from './aggregate'
import { applyFilters } from './filters'
import { QUESTIONS, SMALL_N, SUR08_NONE, TARGET_MIN, type Row } from './schema'

export const ALPHA = 0.05
export const YALA = 'จังหวัดยะลา'
/** นอกจังหวัด = ทุกตัวเลือกพื้นที่ที่ไม่ใช่ยะลา (รวมต่างประเทศ) ไม่นับ "ไม่ประสงค์ระบุ" — ตรงกับ overview-data.ts */
export const OUTSIDE: string[] = QUESTIONS.sur02.choices.filter(
  (c) => c !== YALA && !QUESTIONS.sur02.notSpecified?.includes(c),
)

// ---------- คณิตศาสตร์พื้นฐาน ----------

const LANCZOS = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
]

/** ln Γ(x) (Lanczos) */
export function lnGamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x)
  const xx = x - 1
  let a = 0.99999999999980993
  const t = xx + 7.5
  for (let i = 0; i < 8; i++) a += LANCZOS[i] / (xx + i + 1)
  return 0.5 * Math.log(2 * Math.PI) + (xx + 0.5) * Math.log(t) - t + Math.log(a)
}

function betaCF(a: number, b: number, x: number): number {
  const TINY = 1e-300
  let c = 1
  let d = 1 - ((a + b) * x) / (a + 1)
  if (Math.abs(d) < TINY) d = TINY
  d = 1 / d
  let h = d
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < TINY) d = TINY
    c = 1 + aa / c
    if (Math.abs(c) < TINY) c = TINY
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1))
    d = 1 + aa * d
    if (Math.abs(d) < TINY) d = TINY
    c = 1 + aa / c
    if (Math.abs(c) < TINY) c = TINY
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-14) break
  }
  return h
}

/** regularized incomplete beta I_x(a, b) */
export function betaInc(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x))
  return x < (a + 1) / (a + b + 2) ? (bt * betaCF(a, b, x)) / a : 1 - (bt * betaCF(b, a, 1 - x)) / b
}

/** p-value สองทางของ t (df องศาเสรี) = I_{df/(df+t²)}(df/2, 1/2) */
export function tTwoTailP(t: number, df: number): number {
  if (!Number.isFinite(t) || !(df > 0)) return NaN
  return betaInc(df / (df + t * t), df / 2, 0.5)
}

/** regularized upper incomplete gamma Q(a, x) */
function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1
  const gln = lnGamma(a)
  if (x < a + 1) {
    let ap = a
    let sum = 1 / a
    let del = sum
    for (let n = 0; n < 500; n++) {
      ap++
      del *= x / ap
      sum += del
      if (Math.abs(del) < Math.abs(sum) * 1e-15) break
    }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - gln)
  }
  const TINY = 1e-300
  let b = x + 1 - a
  let c = 1 / TINY
  let d = 1 / b
  let h = d
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < TINY) d = TINY
    c = b + an / c
    if (Math.abs(c) < TINY) c = TINY
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-14) break
  }
  return Math.exp(-x + a * Math.log(x) - gln) * h
}

/** p-value ของไคสแควร์ df = 1 */
export function chiSquareP1(x: number): number {
  return x <= 0 ? 1 : gammaQ(0.5, x / 2)
}

function lnChoose(n: number, k: number): number {
  return lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1)
}

// ---------- 1-2 ช่วงความเชื่อมั่น / ความคลาดเคลื่อน ----------

export type WilsonCI = { low: number; high: number; pct: number; marginPts: number }

/** ช่วงความเชื่อมั่น Wilson ของสัดส่วน (หน่วยร้อยละ 0–100, ปัด 1 ตำแหน่ง) ; base = 0 -> null */
export function wilsonCI(count: number, base: number, z = 1.96): WilsonCI | null {
  if (!(base > 0)) return null
  const c = Math.min(Math.max(count, 0), base)
  const p = c / base
  const z2 = z * z
  const denom = 1 + z2 / base
  const center = (p + z2 / (2 * base)) / denom
  const half = (z * Math.sqrt((p * (1 - p)) / base + z2 / (4 * base * base))) / denom
  const low = Math.max(0, center - half) * 100
  const high = Math.min(1, center + half) * 100
  return { low: round1(low), high: round1(high), pct: round1(p * 100), marginPts: round1((high - low) / 2) }
}

/** ความคลาดเคลื่อน ± จุดร้อยละ ที่ p = 0.5 ที่ 95% ; n <= 0 -> null */
export function marginOfError(n: number): number | null {
  if (!(n > 0)) return null
  return round1(1.96 * Math.sqrt(0.25 / n) * 100)
}

// ---------- ทดสอบ 2x2 ----------

export type Test2x2 = {
  method: 'chi-square' | 'fisher'
  /** ค่าสถิติไคสแควร์ (ไม่ใช้ Yates) ; Fisher = null */
  statistic: number | null
  p: number
  significant: boolean
}

/** Fisher exact สองทาง (รวมทุกตารางที่ความน่าจะเป็น <= ตารางจริง) */
export function fisherExact2x2(a: number, b: number, c: number, d: number): number {
  const r1 = a + b
  const r2 = c + d
  const c1 = a + c
  const n = r1 + r2
  const lnP = (x: number) => lnChoose(r1, x) + lnChoose(r2, c1 - x) - lnChoose(n, c1)
  const obs = lnP(a)
  let p = 0
  for (let x = Math.max(0, c1 - r2); x <= Math.min(r1, c1); x++) {
    const l = lnP(x)
    if (l <= obs + 1e-9) p += Math.exp(l)
  }
  return Math.min(1, p)
}

/**
 * ทดสอบความต่างสัดส่วน 2 กลุ่ม: [[a,b],[c,d]] = [[กลุ่ม1 มี, ไม่มี],[กลุ่ม2 มี, ไม่มี]]
 * ไคสแควร์แบบไม่ใช้ Yates ; ถ้าเซลล์คาดหวังใด < 5 หรือมีผลรวมแถว/คอลัมน์เป็น 0 ใช้ Fisher
 */
export function test2x2(a: number, b: number, c: number, d: number): Test2x2 {
  const n = a + b + c + d
  const rows = [a + b, c + d]
  const cols = [a + c, b + d]
  const minExpected = Math.min(...rows.flatMap((r) => cols.map((cc) => (n > 0 ? (r * cc) / n : 0))))
  if (n === 0 || minExpected < 5) {
    const p = n === 0 ? 1 : fisherExact2x2(a, b, c, d)
    return { method: 'fisher', statistic: null, p, significant: p < ALPHA }
  }
  const chi = (n * (a * d - b * c) ** 2) / (rows[0] * rows[1] * cols[0] * cols[1])
  const p = chiSquareP1(chi)
  return { method: 'chi-square', statistic: chi, p, significant: p < ALPHA }
}

// ---------- 3 เทียบความสนใจ ยะลา vs นอกจังหวัด ----------

export type GroupShare = { count: number; base: number; pct: number }
export type InterestCategory = {
  label: string
  yala: GroupShare
  outside: GroupShare
  /** นอกจังหวัด - ยะลา (จุดร้อยละ) */
  diffPts: number
  test: Test2x2
  significant: boolean
}
export type OriginInterestComparison =
  | { ok: true; yalaBase: number; outsideBase: number; categories: InterestCategory[] }
  | { ok: false; reason: string; yalaBase: number; outsideBase: number }

export function splitByOrigin(rows: Row[]): { yala: Row[]; outside: Row[] } {
  return { yala: applyFilters(rows, { origin: [YALA] }), outside: applyFilters(rows, { origin: OUTSIDE }) }
}

export function compareOriginInterest(rows: Row[]): OriginInterestComparison {
  const { yala, outside } = splitByOrigin(rows)
  const y = multiFreq(yala)
  const o = multiFreq(outside)
  if (y.base < SMALL_N || o.base < SMALL_N) {
    return {
      ok: false,
      reason: `ผู้ตอบข้อ 8 น้อยกว่า ${SMALL_N} คนในบางกลุ่ม (ยะลา ${y.base}, นอกจังหวัด ${o.base}) เทียบไม่ได้`,
      yalaBase: y.base,
      outsideBase: o.base,
    }
  }
  const categories = QUESTIONS.sur08.choices
    .filter((c) => c !== SUR08_NONE)
    .map((label): InterestCategory => {
      const yi = y.items.find((i) => i.label === label)
      const oi = o.items.find((i) => i.label === label)
      const yc = yi?.count ?? 0
      const oc = oi?.count ?? 0
      const test = test2x2(yc, y.base - yc, oc, o.base - oc)
      return {
        label,
        yala: { count: yc, base: y.base, pct: yi?.pct ?? 0 },
        outside: { count: oc, base: o.base, pct: oi?.pct ?? 0 },
        diffPts: round1((oc / o.base - yc / y.base) * 100),
        test,
        significant: test.significant,
      }
    })
  return { ok: true, yalaBase: y.base, outsideBase: o.base, categories }
}

// ---------- 4 เทียบความพึงพอใจ ----------

export type GroupSat = { n: number; mean: number; sd: number }
export type OriginSatisfactionComparison =
  | {
      ok: true
      yala: GroupSat
      outside: GroupSat
      /** mean นอกจังหวัด - mean ยะลา */
      diff: number
      t: number
      df: number
      p: number
      significant: boolean
      /** Cohen's d (pooled SD) นอกจังหวัด - ยะลา ; null ถ้า SD รวม = 0 */
      cohenD: number | null
    }
  | { ok: false; reason: string; yalaN: number; outsideN: number }

export function welchT(
  m1: number, s1: number, n1: number,
  m2: number, s2: number, n2: number,
): { t: number; df: number; p: number } | null {
  const v1 = (s1 * s1) / n1
  const v2 = (s2 * s2) / n2
  const se2 = v1 + v2
  if (!(se2 > 0)) return null
  const t = (m1 - m2) / Math.sqrt(se2)
  const df = (se2 * se2) / ((v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1))
  return { t, df, p: tTwoTailP(t, df) }
}

export function compareOriginSatisfaction(rows: Row[]): OriginSatisfactionComparison {
  const { yala, outside } = splitByOrigin(rows)
  const ys = satisfaction(yala)
  const os = satisfaction(outside)
  if (ys.n < SMALL_N || os.n < SMALL_N || ys.mean === null || os.mean === null) {
    return {
      ok: false,
      reason: `ผู้ให้คะแนนน้อยกว่า ${SMALL_N} คนในบางกลุ่ม (ยะลา ${ys.n}, นอกจังหวัด ${os.n}) เทียบไม่ได้`,
      yalaN: ys.n,
      outsideN: os.n,
    }
  }
  // ใช้ค่าไม่ปัดในการทดสอบ: คำนวณจากคะแนนดิบ
  const stat = (g: Row[]) => {
    const xs = g.flatMap((r) => (r.sat === null ? [] : [r.sat]))
    const n = xs.length
    const m = xs.reduce((a, b) => a + b, 0) / n
    const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1)
    return { n, m, v }
  }
  const a = stat(yala)
  const b = stat(outside)
  const w = welchT(b.m, Math.sqrt(b.v), b.n, a.m, Math.sqrt(a.v), a.n)
  if (!w) {
    return {
      ok: false,
      reason: 'คะแนนของทั้งสองกลุ่มไม่มีความแปรปรวน (SD = 0) ทดสอบไม่ได้',
      yalaN: a.n,
      outsideN: b.n,
    }
  }
  const pooled = Math.sqrt(((a.n - 1) * a.v + (b.n - 1) * b.v) / (a.n + b.n - 2))
  return {
    ok: true,
    yala: { n: a.n, mean: ys.mean, sd: ys.sd ?? 0 },
    outside: { n: b.n, mean: os.mean, sd: os.sd ?? 0 },
    diff: round2(b.m - a.m),
    t: round2(w.t),
    df: round1(w.df),
    p: w.p,
    significant: w.p < ALPHA,
    cohenD: pooled > 0 ? round2((b.m - a.m) / pooled) : null,
  }
}

// ---------- 5 ความน่าเชื่อถือของตัวเลข ----------

export type ReliabilitySummary = {
  n: number
  /** ± จุดร้อยละ (95%, p = 0.5) ; n = 0 -> null */
  marginOfError: number | null
  target: number
  /** n / เป้า (0–1+) */
  targetRatio: number
  reachedTarget: boolean
  /** ± ถ้าเก็บครบเป้า */
  marginAtTarget: number | null
}

export function reliabilitySummary(rows: Row[]): ReliabilitySummary {
  const n = rows.length
  return {
    n,
    marginOfError: marginOfError(n),
    target: TARGET_MIN,
    targetRatio: round2(n / TARGET_MIN),
    reachedTarget: n >= TARGET_MIN,
    marginAtTarget: marginOfError(TARGET_MIN),
  }
}
