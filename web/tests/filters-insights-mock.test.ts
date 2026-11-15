import { describe, expect, it } from 'vitest'
import { cleanValue, normalize } from '@/lib/survey/normalize'
import { applyFilters, filtersFromSearchParams, filtersToQuery } from '@/lib/survey/filters'
import { businessInsights } from '@/lib/survey/insights'
import { makeMock } from '@/lib/survey/mock'
import { quality } from '@/lib/survey/aggregate'
import { many, mk } from './helpers'

describe('filters', () => {
  const { rows } = normalize([
    mk({ submitted_at: '2026-11-01T03:00:00Z', sur01: '18–24 ปี', sur02: 'จังหวัดยะลา', sur03: 'เพื่อน', sur04: 'รถยนต์ส่วนตัว' }),
    mk({ submitted_at: '2026-11-02T03:00:00Z', sur01: '25–34 ปี', sur02: 'จังหวัดปัตตานี', sur03: 'เพื่อน', sur04: 'รถจักรยานยนต์' }),
    mk({ submitted_at: '2026-11-03T03:00:00Z', sur01: '25–34 ปี', sur02: 'จังหวัดยะลา', sur03: 'ครอบครัว / เครือญาติ', sur04: 'รถยนต์ส่วนตัว' }),
    mk({ submitted_at: '2026-11-01T18:00:00Z', sur01: '35–44 ปี' }), // = 2 พ.ย. 01:00 เวลาไทย
  ])
  it('ช่วงวันที่ใช้วันตามเวลาไทย (รวมปลายทาง)', () => {
    expect(applyFilters(rows, { from: '2026-11-02', to: '2026-11-02' })).toHaveLength(2)
    expect(applyFilters(rows, { from: '2026-11-02' })).toHaveLength(3)
    expect(applyFilters(rows, { to: '2026-11-01' })).toHaveLength(1)
  })
  it('หลายตัวกรอง = AND ; ค่าในกลุ่มเดียวกัน = OR', () => {
    expect(applyFilters(rows, { age: ['25–34 ปี'] })).toHaveLength(2)
    expect(applyFilters(rows, { age: ['25–34 ปี', '18–24 ปี'] })).toHaveLength(3)
    expect(applyFilters(rows, { age: ['25–34 ปี'], origin: ['จังหวัดยะลา'] })).toHaveLength(1)
    expect(applyFilters(rows, { transport: ['รถจักรยานยนต์'], companion: ['เพื่อน'] })).toHaveLength(1)
    expect(applyFilters(rows, {})).toHaveLength(4)
    expect(applyFilters(rows, { age: ['55 ปีขึ้นไป'] })).toHaveLength(0)
  })
  it('round trip query string', () => {
    const f = { from: '2026-11-01', to: '2026-11-07', age: ['18–24 ปี', '25–34 ปี'], transport: ['รถเช่า'] }
    const q = filtersToQuery(f)
    expect(filtersFromSearchParams(new URLSearchParams(q))).toEqual(f)
    expect(filtersFromSearchParams({ age: ['a', 'b'], from: 'bad', origin: 'x' })).toEqual({ age: ['a', 'b'], origin: ['x'] })
    expect(filtersToQuery({})).toBe('')
  })
})

describe('insights thresholds', () => {
  it('n < 5 -> ไม่คืนอะไร', () => {
    const { rows } = normalize(many(4, () => ({ sur02: 'จังหวัดปัตตานี', sur07: 'ไม่เกิน 300 บาท' })))
    for (const t of ['restaurant', 'hotel', 'shop', 'tour'] as const) {
      expect(businessInsights(rows, t)).toEqual([])
    }
  })

  it('hotel: นอกยะลา >= 40% -> แนะนำแพ็กเกจพักค้างคืนพร้อมหลักฐาน', () => {
    // ยะลา 3, ปัตตานี 2 => นอกยะลา 2/5 = 40% (ตรงเกณฑ์) ; ไม่ประสงค์ระบุ 1 ไม่นับ
    const { rows } = normalize([
      ...many(3, () => ({ sur02: 'จังหวัดยะลา' })),
      ...many(2, () => ({ sur02: 'จังหวัดปัตตานี' })),
      mk({ sur02: 'ไม่ประสงค์ระบุ' }),
    ])
    const ins = businessInsights(rows, 'hotel').find((i) => i.title.includes('นอกจังหวัดยะลา'))!
    expect(ins.detail).toContain('โปรโมตแพ็กเกจพักค้างคืน')
    expect(ins.detail).toContain('ข้อเสนอเบื้องต้นจากข้อมูลผู้ตอบ')
    expect(ins.n).toBe(5)
    expect(ins.evidence[0].value).toBe('2 คน (40.0%)')
  })

  it('hotel: นอกยะลา 39% (< 40%) -> ไม่แนะนำแพ็กเกจ', () => {
    // 11 ยะลา, 7 นอก = 7/18 = 38.9%
    const { rows } = normalize([
      ...many(11, () => ({ sur02: 'จังหวัดยะลา' })),
      ...many(7, () => ({ sur02: 'จังหวัดสงขลา' })),
    ])
    const all = businessInsights(rows, 'hotel')
    expect(all.some((i) => i.detail.includes('โปรโมตแพ็กเกจ'))).toBe(false)
    expect(all.find((i) => i.title.includes('นอกจังหวัดยะลา'))?.evidence[0].value).toBe('7 คน (38.9%)')
  })

  it('shop: ใช้จ่าย <= 600 ต้อง > 50% ถึงแนะนำสินค้าราคา <= 300', () => {
    const half = normalize([
      ...many(3, () => ({ sur07: 'ไม่เกิน 300 บาท' })),
      ...many(3, () => ({ sur07: '601–1,000 บาท' })),
    ]).rows
    expect(businessInsights(half, 'shop').some((i) => i.detail.includes('≤ 300'))).toBe(false) // 50% ไม่ใช่ส่วนใหญ่
    const most = normalize([
      ...many(3, () => ({ sur07: 'ไม่เกิน 300 บาท' })),
      mk({ sur07: '301–600 บาท' }),
      mk({ sur07: '601–1,000 บาท' }),
      mk({ sur07: 'ยังประเมินไม่ได้' }), // ไม่นับในฐาน
    ]).rows
    const ins = businessInsights(most, 'shop').find((i) => i.detail.includes('≤ 300'))!
    expect(ins.n).toBe(5)
    expect(ins.evidence[0].value).toBe('4 คน (80.0%)')
  })

  it('restaurant: ครอบครัวเป็นกลุ่มใหญ่สุดเท่านั้นที่แนะนำเมนูครอบครัว', () => {
    const fam = normalize([
      ...many(3, () => ({ sur03: 'ครอบครัว / เครือญาติ' })),
      ...many(2, () => ({ sur03: 'เพื่อน' })),
    ]).rows
    expect(businessInsights(fam, 'restaurant').some((i) => i.detail.includes('ครอบครัว'))).toBe(true)
    const fr = normalize([
      ...many(2, () => ({ sur03: 'ครอบครัว / เครือญาติ' })),
      ...many(3, () => ({ sur03: 'เพื่อน' })),
    ]).rows
    expect(businessInsights(fr, 'restaurant').some((i) => i.title.includes('ครอบครัว / เครือญาติ เป็นกลุ่ม'))).toBe(false)
  })

  it('ทุกข้อค้นพบมี evidence และ n >= 5', () => {
    const { rows } = normalize(makeMock(300, 7))
    for (const t of ['restaurant', 'hotel', 'shop', 'tour'] as const) {
      const ins = businessInsights(rows.filter((r) => r.is_complete), t)
      expect(ins.length).toBeGreaterThan(0)
      for (const i of ins) {
        expect(i.evidence.length).toBeGreaterThan(0)
        expect(i.n).toBeGreaterThanOrEqual(5)
      }
    }
  })

  it('ช่องทางอันดับ 1 -> แนะนำลงโฆษณา', () => {
    const { rows } = normalize([
      ...many(3, () => ({ sur06: 'สื่อสังคมออนไลน์ (เช่น Facebook / TikTok)' })),
      ...many(2, () => ({ sur06: 'เพื่อนหรือครอบครัวแนะนำ' })),
    ])
    const ins = businessInsights(rows, 'tour').find((i) => i.title.includes('ช่องทาง'))!
    expect(ins.evidence[0].value).toBe('3 คน (60.0%)')
  })
})

describe('mock', () => {
  const a = makeMock(300, 42)
  it('deterministic และมี 300 แถว', () => {
    expect(a).toHaveLength(300)
    expect(makeMock(300, 42)).toEqual(a)
    expect(makeMock(300, 43)).not.toEqual(a)
  })
  it('สมจริง: ไม่สมบูรณ์ ~ 8%, ข้าม, อื่น ๆ, 2 สัปดาห์', () => {
    const { rows, all } = normalize(a)
    const q = quality(all)
    expect(q.complete).toBe(rows.length)
    expect(q.total - q.complete).toBeGreaterThan(5)
    expect(q.total - q.complete).toBeLessThan(50)
    expect(rows.some((r) => r.sur05 === null)).toBe(true)
    expect(a.some((r) => r.sur02 && !['จังหวัดยะลา', 'จังหวัดปัตตานี', 'จังหวัดนราธิวาส', 'จังหวัดสงขลา', 'จังหวัดอื่นในประเทศไทย', 'ต่างประเทศ', 'ไม่ประสงค์ระบุ'].includes(r.sur02))).toBe(true)
    const days = new Set(all.map((r) => r.date))
    expect(days.size).toBeGreaterThanOrEqual(12)
    expect(Array.from(days).every((d) => d >= '2026-11-01' && d <= '2026-11-14')).toBe(true)
  })
})

describe('cleanValue', () => {
  it('ตัดอักขระความกว้างศูนย์ และข้อความที่เหลือแต่ตัวล่องหน = ว่าง', () => {
    expect(cleanValue('ไม่\u200Bมี')).toBe('ไม่มี')
    expect(cleanValue('\uFEFF 25–34 ปี')).toBe('25–34 ปี')
    expect(cleanValue('\u200B\u200C')).toBeNull()
  })
})
