import { describe, expect, it } from 'vitest'
import { normalize } from '@/lib/survey/normalize'
import { bySlot, collectionProgress, crosstab, daily, freq, multiFreq, overview, quality, satisfaction } from '@/lib/survey/aggregate'
import { QUESTIONS } from '@/lib/survey/schema'
import { many, mk } from './helpers'

describe('schema', () => {
  it('ช่วงตัวเลขใช้ en dash U+2013', () => {
    expect(QUESTIONS.sur01.choices[0]).toBe('18–24 ปี')
    expect(QUESTIONS.sur07.choices[1]).toBe('301–600 บาท')
    expect(QUESTIONS.sur07.choices[2]).toBe('601–1,000 บาท')
  })
})

describe('freq', () => {
  // sur05: 4 พักผ่อน, 3 ศาสนา, 1 อื่น(พิมพ์เอง), 2 ข้าม => base 8
  const raws = [
    ...many(4, () => ({ sur05: 'พักผ่อนหรือถ่ายภาพ' })),
    ...many(3, () => ({ sur05: 'ท่องเที่ยวเชิงศาสนาและวัฒนธรรม' })),
    mk({ sur05: 'มาทำบุญ' }),
    mk({ sur05: null }),
    mk({ sur05: '  ' }),
  ]
  const { rows } = normalize(raws)

  it('ตัวหาร = ผู้ตอบข้อนั้น ไม่รวมคนข้าม', () => {
    const f = freq(rows, 'sur05')
    expect(f.base).toBe(8)
    expect(f.skipped).toBe(2)
    const get = (l: string) => f.items.find((i) => i.label === l)!
    expect(get('พักผ่อนหรือถ่ายภาพ')).toMatchObject({ count: 4, pct: 50 })
    expect(get('ท่องเที่ยวเชิงศาสนาและวัฒนธรรม')).toMatchObject({ count: 3, pct: 37.5 })
    expect(get('อื่น ๆ')).toMatchObject({ count: 1, pct: 12.5 })
    expect(f.others).toEqual(['มาทำบุญ'])
    expect(get('ศึกษาประวัติศาสตร์และโบราณสถาน').count).toBe(0)
  })

  it('แยก "ไม่ตอบ" ออกจาก "ไม่ประสงค์ระบุ" และ normalize - เป็น en dash', () => {
    const { rows: r } = normalize([
      mk({ sur07: '301-600 บาท' }),
      mk({ sur07: '301—600 บาท' }),
      mk({ sur07: 'ไม่ประสงค์ระบุ' }),
      mk({ sur07: 'ยังประเมินไม่ได้' }),
      mk({ sur07: null }),
    ])
    const f = freq(r, 'sur07')
    expect(f.base).toBe(4)
    expect(f.skipped).toBe(1)
    expect(f.notSpecified).toBe(2)
    expect(f.items.find((i) => i.label === '301–600 บาท')).toMatchObject({ count: 2, pct: 50 })
  })
})

describe('multiFreq sur08', () => {
  const { rows, all } = normalize([
    mk({ sur08: 'อาหารและเครื่องดื่ม, ของฝาก / ผลิตภัณฑ์ชุมชน' }),
    mk({ sur08: 'อาหารและเครื่องดื่ม' }),
    mk({ sur08: 'ไม่มีความสนใจเป็นพิเศษ, อาหารและเครื่องดื่ม' }), // ขัดแย้ง
    mk({ sur08: 'ไม่มีความสนใจเป็นพิเศษ' }),
    mk({ sur08: null }),
  ])

  it('ตัวหารคือคนที่ตอบข้อ 8 และ % รวมเกิน 100 ได้', () => {
    const f = multiFreq(rows)
    expect(f.base).toBe(4)
    expect(f.skipped).toBe(1)
    const get = (l: string) => f.items.find((i) => i.label === l)!
    expect(get('อาหารและเครื่องดื่ม')).toMatchObject({ count: 3, pct: 75 })
    expect(get('ของฝาก / ผลิตภัณฑ์ชุมชน')).toMatchObject({ count: 1, pct: 25 })
    expect(get('ไม่มีความสนใจเป็นพิเศษ')).toMatchObject({ count: 1, pct: 25 })
  })

  it('conflict: ตัด "ไม่มีความสนใจ" ทิ้งและนับเป็นข้อมูลขัดแย้ง', () => {
    expect(rows[2].sur08list).toEqual(['อาหารและเครื่องดื่ม'])
    expect(rows[2].sur08conflict).toBe(true)
    expect(rows[3].sur08list).toEqual(['ไม่มีความสนใจเป็นพิเศษ'])
    expect(rows[3].sur08conflict).toBe(false)
    expect(quality(all).sur08Conflicts).toBe(1)
  })
})

describe('satisfaction', () => {
  // [5,4,4,3,5] + 1 ประเมินไม่ได้ + 1 ข้าม ; mean 4.2 ; sample SD = sqrt(2.8/4) = 0.8367
  const { rows } = normalize([
    mk({ sur09: '5 (มากที่สุด)' }),
    mk({ sur09: '4 (มาก)' }),
    mk({ sur09: '4 (มาก)' }),
    mk({ sur09: '3 (ปานกลาง)' }),
    mk({ sur09: '5 (มากที่สุด)' }),
    mk({ sur09: 'ยังไม่สามารถประเมินได้' }),
    mk({ sur09: null }),
  ])
  it('mean, SD (n-1), แปลผล, cannotRate', () => {
    const s = satisfaction(rows)
    expect(s.n).toBe(5)
    expect(s.mean).toBe(4.2)
    expect(s.sd).toBe(0.84)
    expect(s.level).toBe('มาก') // 3.41-4.20
    expect(s.cannotRate).toBe(1)
    expect(s.skipped).toBe(1)
    expect(s.dist.find((d) => d.score === 5)).toMatchObject({ count: 2, pct: 40 })
    expect(s.dist.find((d) => d.score === 1)).toMatchObject({ count: 0, pct: 0 })
  })
  it('n=1 -> sd null ; n=0 -> mean null', () => {
    expect(satisfaction(normalize([mk({ sur09: '5 (มากที่สุด)' })]).rows).sd).toBeNull()
    const e = satisfaction([])
    expect(e.mean).toBeNull()
    expect(e.level).toBeNull()
  })
})

describe('date/slot (Asia/Bangkok = UTC+7)', () => {
  const at = (iso: string) => normalize([mk({ submitted_at: iso })]).rows[0]
  it('ข้ามเที่ยงคืนเป็นวันถัดไป', () => {
    const r = at('2026-11-01T17:30:00Z')
    expect(r.date).toBe('2026-11-02')
    expect(r.slot).toBe('อื่น')
  })
  it('ขอบเขตช่วงเวลา', () => {
    expect(at('2026-11-01T04:59:59Z').slot).toBe('เช้า') // 11:59
    expect(at('2026-11-01T05:00:00Z').slot).toBe('บ่าย') // 12:00
    expect(at('2026-11-01T08:59:59Z').slot).toBe('บ่าย') // 15:59
    expect(at('2026-11-01T09:00:00Z').slot).toBe('เย็น') // 16:00
    expect(at('2026-11-01T12:59:59Z').slot).toBe('เย็น') // 19:59
    expect(at('2026-11-01T13:00:00Z').slot).toBe('อื่น') // 20:00
    expect(at('2026-11-01T22:59:59Z').slot).toBe('อื่น') // 05:59
    expect(at('2026-11-01T23:00:00Z').slot).toBe('เช้า') // 06:00 วันถัดไป
  })
  it('daily เติมวันที่ว่าง และ bySlot รวมตัวหารทั้งหมด', () => {
    const { rows } = normalize([
      mk({ submitted_at: '2026-11-01T03:00:00Z' }),
      mk({ submitted_at: '2026-11-01T03:10:00Z' }),
      mk({ submitted_at: '2026-11-03T10:00:00Z' }),
    ])
    expect(daily(rows)).toEqual([
      { date: '2026-11-01', count: 2 },
      { date: '2026-11-02', count: 0 },
      { date: '2026-11-03', count: 1 },
    ])
    const s = bySlot(rows)
    expect(s.find((x) => x.slot === 'เช้า')).toMatchObject({ count: 2, pct: 66.7 })
    expect(s.find((x) => x.slot === 'เย็น')).toMatchObject({ count: 1, pct: 33.3 })
  })
})

describe('crosstab', () => {
  it('ค่าใช้จ่าย x ความสนใจ (multi)', () => {
    const { rows } = normalize([
      mk({ sur07: 'ไม่เกิน 300 บาท', sur08: 'อาหารและเครื่องดื่ม, ของฝาก / ผลิตภัณฑ์ชุมชน' }),
      mk({ sur07: 'ไม่เกิน 300 บาท', sur08: 'อาหารและเครื่องดื่ม' }),
      mk({ sur07: '301–600 บาท', sur08: 'ของฝาก / ผลิตภัณฑ์ชุมชน' }),
      mk({ sur07: null, sur08: 'อาหารและเครื่องดื่ม' }), // ไม่นับ
    ])
    const c = crosstab(rows, 'sur07', 'sur08')
    expect(c.n).toBe(3)
    const cell = (r: string, col: string) => c.cells[c.rowLabels.indexOf(r)][c.colLabels.indexOf(col)]
    expect(cell('ไม่เกิน 300 บาท', 'อาหารและเครื่องดื่ม')).toBe(2)
    expect(cell('ไม่เกิน 300 บาท', 'ของฝาก / ผลิตภัณฑ์ชุมชน')).toBe(1)
    expect(cell('301–600 บาท', 'ของฝาก / ผลิตภัณฑ์ชุมชน')).toBe(1)
    expect(c.rowTotals[c.rowLabels.indexOf('ไม่เกิน 300 บาท')]).toBe(3)
  })
})

describe('overview & quality', () => {
  it('overview KPI', () => {
    const { rows } = normalize([
      mk({ sur07: '301–600 บาท', sur08: 'อาหารและเครื่องดื่ม', sur09: '5 (มากที่สุด)', sur10: 'ตั้งใจจะกลับมาอีก' }),
      mk({ sur07: '301–600 บาท', sur08: 'อาหารและเครื่องดื่ม', sur09: '4 (มาก)', sur10: 'อาจจะกลับมาอีก' }),
      mk({ sur07: 'ไม่ประสงค์ระบุ', sur08: 'ไม่มีความสนใจเป็นพิเศษ', sur10: null }),
      mk({ sur07: null, sur08: 'ของฝาก / ผลิตภัณฑ์ชุมชน', sur10: 'ตั้งใจจะกลับมาอีก' }),
    ])
    const o = overview(rows)
    expect(o.n).toBe(4)
    expect(o.returnIntent).toEqual({ count: 2, base: 3, pct: 66.7 })
    expect(o.topSpend).toMatchObject({ label: '301–600 บาท', count: 2, base: 3, pct: 66.7 })
    expect(o.topInterest).toMatchObject({ label: 'อาหารและเครื่องดื่ม', count: 2, base: 4, pct: 50 })
    expect(o.satisfaction.mean).toBe(4.5)
    expect(o.target.pctOfMin).toBe(1.5)
  })

  it('quality แยกสาเหตุที่ไม่สมบูรณ์', () => {
    const { all } = normalize([
      mk(),
      mk({ sur09: null }),
      mk({ scr02: 'ไม่ใช่', is_complete: false }),
      mk({ con01: 'ไม่ยินยอม', is_complete: false }),
      mk({ sur03: null, is_complete: false }),
    ])
    const q = quality(all)
    expect(q).toMatchObject({ total: 5, complete: 2, failedScreening: 1, noConsent: 1, missingRequired: 1 })
    expect(q.missingByQuestion.find((m) => m.code === 'sur09')).toMatchObject({ missing: 2, pct: 100 })
  })
})

describe('collectionProgress', () => {
  it('ยังไม่มีข้อมูล', () => {
    const p = collectionProgress([])
    expect(p.n).toBe(0)
    expect(p.status).toBe('none')
    expect(p.remainingToMin).toBe(267)
    expect(p.lastSubmittedAt).toBeNull()
    expect(p.perActiveDay).toBe(0)
  })

  it('เทียบเป้า 267/300, ผู้ตอบ 7 วันล่าสุดนับย้อนจากวันที่ตอบล่าสุด', () => {
    const raws = [
      ...many(2, () => ({ submitted_at: '2026-11-01T03:00:00Z' })),
      ...many(3, () => ({ submitted_at: '2026-11-10T03:00:00Z' })),
      ...many(1, () => ({ submitted_at: '2026-11-14T03:00:00Z' })),
    ]
    const p = collectionProgress(normalize(raws).rows)
    expect(p.n).toBe(6)
    expect(p.status).toBe('collecting')
    expect(p.pctOfMin).toBe(2.2)
    expect(p.remainingToMin).toBe(261)
    expect(p.remainingToFull).toBe(294)
    expect(p.firstDate).toBe('2026-11-01')
    expect(p.lastDate).toBe('2026-11-14')
    expect(p.activeDays).toBe(3)
    expect(p.perActiveDay).toBe(2)
    expect(p.last7).toBe(4) // ช่วง 8–14 พ.ย.: วันที่ 10 (3 คน) + วันที่ 14 (1 คน) ; วันที่ 1 อยู่นอกช่วง
  })

  it('สถานะตามเกณฑ์', () => {
    expect(collectionProgress(normalize(many(267, () => ({}))).rows).status).toBe('reached_min')
    expect(collectionProgress(normalize(many(300, () => ({}))).rows).status).toBe('reached_full')
    expect(collectionProgress(normalize(many(266, () => ({}))).rows).status).toBe('collecting')
  })
})
