import { describe, expect, it } from 'vitest'
import { normalize } from '@/lib/survey/normalize'
import {
  betaInc,
  chiSquareP1,
  compareOriginInterest,
  compareOriginSatisfaction,
  fisherExact2x2,
  marginOfError,
  reliabilitySummary,
  test2x2,
  tTwoTailP,
  welchT,
  wilsonCI,
} from '@/lib/survey/stats'
import type { RawRow } from '@/lib/survey/schema'
import { mk } from './helpers'

const near = (a: number, b: number, d = 3) => expect(a).toBeCloseTo(b, d)

describe('wilsonCI / marginOfError', () => {
  it('50/100 = 40.4–59.6', () => {
    expect(wilsonCI(50, 100)).toEqual({ low: 40.4, high: 59.6, pct: 50, marginPts: 9.6 })
  })
  it('0/10 และ 10/10 ไม่เกินขอบ 0–100', () => {
    const z = wilsonCI(0, 10)!
    expect(z.low).toBe(0)
    expect(z.high).toBe(27.8) // z²/(n+z²) = 3.8416/13.8416
    const f = wilsonCI(10, 10)!
    expect(f.high).toBe(100)
    expect(f.low).toBe(72.2)
  })
  it('base 0 -> null', () => {
    expect(wilsonCI(0, 0)).toBeNull()
  })
  it('marginOfError: n=267 -> 6.0, n=100 -> 9.8, n<=0 -> null', () => {
    expect(marginOfError(100)).toBe(9.8)
    expect(marginOfError(267)).toBe(6)
    expect(marginOfError(0)).toBeNull()
    expect(marginOfError(-3)).toBeNull()
  })
})

describe('ฟังก์ชันกระจาย', () => {
  it('chi-square df1: 3.841 -> 0.05, 4.0 -> 0.0455', () => {
    near(chiSquareP1(3.841459), 0.05, 4)
    near(chiSquareP1(4), 0.0455, 4)
    expect(chiSquareP1(0)).toBe(1)
  })
  it('t สองทาง: df=1,t=1 -> 0.5 ; df=2,t=1 -> 1-1/sqrt3 ; df=10,t=2.228 -> 0.05', () => {
    near(tTwoTailP(1, 1), 0.5, 6)
    near(tTwoTailP(1, 2), 1 - 1 / Math.sqrt(3), 6)
    near(tTwoTailP(2.228139, 10), 0.05, 4)
    near(tTwoTailP(0, 5), 1, 9)
  })
  it('betaInc สมมาตร I_0.5(a,a) = 0.5', () => {
    near(betaInc(0.5, 3, 3), 0.5, 9)
  })
})

describe('test2x2', () => {
  it('[[30,20],[20,30]] -> chi2 = 4.0, p = 0.0455, significant', () => {
    const t = test2x2(30, 20, 20, 30)
    expect(t.method).toBe('chi-square')
    near(t.statistic!, 4, 9)
    near(t.p, 0.0455, 4)
    expect(t.significant).toBe(true)
  })
  it('[[25,25],[24,26]] ไม่ significant', () => {
    const t = test2x2(25, 25, 24, 26)
    expect(t.method).toBe('chi-square')
    expect(t.significant).toBe(false)
  })
  it('Fisher tea tasting [[3,1],[1,3]] -> p = 34/70 และใช้ Fisher เมื่อคาดหวัง < 5', () => {
    near(fisherExact2x2(3, 1, 1, 3), 34 / 70, 9)
    const t = test2x2(3, 1, 1, 3)
    expect(t.method).toBe('fisher')
    expect(t.statistic).toBeNull()
    expect(t.significant).toBe(false)
  })
  it('Fisher [[5,0],[0,5]] p = 2/252 significant ; แถว/คอลัมน์ว่าง p = 1', () => {
    near(fisherExact2x2(5, 0, 0, 5), 2 / 252, 9)
    expect(test2x2(5, 0, 0, 5).significant).toBe(true)
    expect(test2x2(0, 10, 0, 10).p).toBe(1)
    expect(test2x2(0, 0, 0, 0).p).toBe(1)
  })
})

describe('welchT', () => {
  // A=[1,2,3] mean2 var1 ; B=[2,4,6] mean4 var4 -> t = -2/sqrt(5/3), df = (5/3)^2/((1/3)^2/2+(4/3)^2/2)
  it('คำนวณมือ', () => {
    const w = welchT(2, 1, 3, 4, 2, 3)!
    near(w.t, -2 / Math.sqrt(5 / 3), 9)
    near(w.df, (25 / 9) / (1 / 18 + 16 / 18), 9)
    near(w.p, tTwoTailP(w.t, w.df), 12)
    expect(w.p).toBeGreaterThan(0.2)
    expect(w.p).toBeLessThan(0.25)
  })
  it('SD = 0 ทั้งคู่ -> null', () => {
    expect(welchT(3, 0, 5, 4, 0, 5)).toBeNull()
  })
})

const rowsOf = (specs: Partial<RawRow>[]) => normalize(specs.map((s) => mk(s))).rows
const rep = (n: number, over: Partial<RawRow>) => Array.from({ length: n }, () => over)

describe('compareOriginInterest', () => {
  // ยะลา 50 คน: อาหาร 30 ; นอกจังหวัด 50 คน: อาหาร 20 -> 2x2 ตัวอย่างข้างบน (ยะลา 60%, นอก 40%)
  const specs = [
    ...rep(30, { sur02: 'จังหวัดยะลา', sur08: 'อาหารและเครื่องดื่ม' }),
    ...rep(20, { sur02: 'จังหวัดยะลา', sur08: 'ไม่มีความสนใจเป็นพิเศษ' }),
    ...rep(20, { sur02: 'ต่างประเทศ', sur08: 'อาหารและเครื่องดื่ม' }),
    ...rep(30, { sur02: 'จังหวัดสงขลา', sur08: 'ไม่มีความสนใจเป็นพิเศษ' }),
    ...rep(4, { sur02: 'ไม่ประสงค์ระบุ', sur08: 'อาหารและเครื่องดื่ม' }), // ไม่นับกลุ่มใด
  ]
  it('นับ/ร้อยละ/ผลต่าง/ทดสอบ ถูกต้อง ไม่รวม "ไม่มีความสนใจ"', () => {
    const r = compareOriginInterest(rowsOf(specs))
    if (!r.ok) throw new Error('expected ok')
    expect(r.yalaBase).toBe(50)
    expect(r.outsideBase).toBe(50)
    expect(r.categories.map((c) => c.label)).not.toContain('ไม่มีความสนใจเป็นพิเศษ')
    expect(r.categories).toHaveLength(5)
    const food = r.categories.find((c) => c.label === 'อาหารและเครื่องดื่ม')!
    expect(food.yala).toEqual({ count: 30, base: 50, pct: 60 })
    expect(food.outside).toEqual({ count: 20, base: 50, pct: 40 })
    expect(food.diffPts).toBe(-20)
    expect(food.test.method).toBe('chi-square')
    near(food.test.statistic!, 4, 9)
    expect(food.significant).toBe(true)
    const gift = r.categories.find((c) => c.label === 'ของฝาก / ผลิตภัณฑ์ชุมชน')!
    expect(gift.yala.count).toBe(0)
    expect(gift.significant).toBe(false)
  })
  it('กลุ่มใดกลุ่มหนึ่ง < 5 -> ok:false พร้อม reason', () => {
    const r = compareOriginInterest(
      rowsOf([
        ...rep(10, { sur02: 'จังหวัดยะลา', sur08: 'อาหารและเครื่องดื่ม' }),
        ...rep(4, { sur02: 'ต่างประเทศ', sur08: 'อาหารและเครื่องดื่ม' }),
      ]),
    )
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.outsideBase).toBe(4)
      expect(r.reason).toContain('5')
    }
  })
  it('ใช้ Fisher เมื่อเซลล์คาดหวังเล็ก', () => {
    const r = compareOriginInterest(
      rowsOf([
        ...rep(5, { sur02: 'จังหวัดยะลา', sur08: 'อาหารและเครื่องดื่ม' }),
        ...rep(5, { sur02: 'ต่างประเทศ', sur08: 'ไม่มีความสนใจเป็นพิเศษ' }),
      ]),
    )
    if (!r.ok) throw new Error('expected ok')
    const food = r.categories.find((c) => c.label === 'อาหารและเครื่องดื่ม')!
    expect(food.test.method).toBe('fisher')
    near(food.test.p, 2 / 252, 9)
  })
})

describe('compareOriginSatisfaction', () => {
  const sat = (origin: string, scores: string[]) => scores.map((s) => ({ sur02: origin, sur09: s }))
  const five = '5 (มากที่สุด)'
  const four = '4 (มาก)'
  const three = '3 (ปานกลาง)'
  const two = '2 (น้อย)'
  const one = '1 (น้อยที่สุด)'

  it('คำนวณ mean/SD/t/df/d ตรงกับมือ', () => {
    // ยะลา [5,4,5,4,5,5] mean 4.6667 ; นอก [3,4,3,2,3,4]... ใช้ชุดง่าย: ยะลา [1,2,3,4,5] นอก [2,4,6→ไม่มี]
    // ยะลา [3,3,3,5,5]: mean 3.8 var = (0.64*3+1.44*2)/4=1.2 ; นอก [1,2,3,3,1]: mean 2 var = (1+0+1+1+1)/4=1
    const r = compareOriginSatisfaction(
      rowsOf([
        ...sat('จังหวัดยะลา', [three, three, three, five, five]),
        ...sat('จังหวัดสงขลา', [one, two, three, three, one]),
      ]),
    )
    if (!r.ok) throw new Error('expected ok')
    expect(r.yala).toEqual({ n: 5, mean: 3.8, sd: 1.1 })
    expect(r.outside).toEqual({ n: 5, mean: 2, sd: 1 })
    expect(r.diff).toBe(-1.8)
    // se² = 1/5 + 1.2/5 = 0.44 ; t = -1.8/0.66332 = -2.71
    expect(r.t).toBe(-2.71)
    // df = 0.44² / ((0.2²+0.24²)/4) = 0.1936/0.0244 = 7.93
    expect(r.df).toBe(7.9)
    expect(r.p).toBeGreaterThan(0.02)
    expect(r.p).toBeLessThan(0.03)
    expect(r.significant).toBe(true)
    // pooled sd = sqrt((4*1.2+4*1)/8) = sqrt(1.1) ; d = -1.8/1.0488 = -1.72
    expect(r.cohenD).toBe(-1.72)
  })
  it('n < 5 ต่อกลุ่ม -> ok:false', () => {
    const r = compareOriginSatisfaction(
      rowsOf([...sat('จังหวัดยะลา', [four, four, four, four, four]), ...sat('จังหวัดสงขลา', [four, five, four, three])]),
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.outsideN).toBe(4)
  })
  it('"ยังไม่สามารถประเมินได้" ไม่นับเป็นคะแนน ; SD = 0 ทั้งคู่ -> ok:false', () => {
    const r = compareOriginSatisfaction(
      rowsOf([
        ...sat('จังหวัดยะลา', [four, four, four, four, four, 'ยังไม่สามารถประเมินได้']),
        ...sat('จังหวัดสงขลา', [four, four, four, four, four]),
      ]),
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.yalaN).toBe(5)
  })
})

describe('reliabilitySummary', () => {
  it('n, ±, สัดส่วนเทียบเป้า 267', () => {
    const rows = rowsOf(rep(100, {}))
    expect(reliabilitySummary(rows)).toEqual({
      n: 100,
      marginOfError: 9.8,
      target: 267,
      targetRatio: 0.37,
      reachedTarget: false,
      marginAtTarget: 6,
    })
  })
  it('ไม่มีข้อมูล', () => {
    const s = reliabilitySummary([])
    expect(s.marginOfError).toBeNull()
    expect(s.targetRatio).toBe(0)
  })
})
