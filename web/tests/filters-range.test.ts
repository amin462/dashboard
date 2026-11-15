import { describe, expect, it } from 'vitest'
import { normalize } from '@/lib/survey/normalize'
import { filterMonth, filterYear, monthRange, monthsWithData, quickRange, yearRange } from '@/lib/survey/filters'
import { mk } from './helpers'

describe('ตัวกรองเดือน/ปี', () => {
  const { rows } = normalize([
    mk({ submitted_at: '2026-11-03T03:00:00Z' }),
    mk({ submitted_at: '2026-11-10T03:00:00Z' }),
    mk({ submitted_at: '2026-12-31T20:00:00Z' }), // = 1 ม.ค. 2027 03:00 เวลาไทย
    mk({ submitted_at: '2026-09-15T03:00:00Z' }),
  ])

  it('monthsWithData: เฉพาะเดือนที่มีข้อมูล เรียงใหม่→เก่า พร้อมจำนวน', () => {
    expect(monthsWithData(rows).map((m) => [m.ym, m.count])).toEqual([
      ['2027-01', 1],
      ['2026-11', 2],
      ['2026-09', 1],
    ])
    expect(monthsWithData([])).toEqual([])
  })

  it('monthRange: วันสุดท้ายของเดือนถูกต้อง (รวม ก.พ. ปีอธิกสุรทิน)', () => {
    expect(monthRange('2026-11')).toEqual({ from: '2026-11-01', to: '2026-11-30' })
    expect(monthRange('2026-12')).toEqual({ from: '2026-12-01', to: '2026-12-31' })
    expect(monthRange('2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(monthRange('2026-02')?.to).toBe('2026-02-28')
    expect(monthRange('2026-13')).toBeNull()
    expect(monthRange('x')).toBeNull()
  })

  it('quickRange: เดือนนี้ / เดือนที่แล้ว (ข้ามปี) / ปีนี้', () => {
    expect(quickRange('thisMonth', '2026-11-15')).toEqual({ from: '2026-11-01', to: '2026-11-30' })
    expect(quickRange('lastMonth', '2026-11-15')).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(quickRange('lastMonth', '2027-01-05')).toEqual({ from: '2026-12-01', to: '2026-12-31' })
    expect(quickRange('thisYear', '2026-11-15')).toEqual(yearRange(2026))
    expect(quickRange('thisYear', 'bad')).toBeNull()
  })

  it('filterMonth/filterYear: ตรวจว่าช่วงที่เลือกคือทั้งเดือน/ทั้งปี', () => {
    expect(filterMonth({ from: '2026-11-01', to: '2026-11-30' })).toBe('2026-11')
    expect(filterMonth({ from: '2026-11-01', to: '2026-11-29' })).toBeNull()
    expect(filterMonth({ from: '2026-11-01' })).toBeNull()
    expect(filterYear({ from: '2026-01-01', to: '2026-12-31' })).toBe(2026)
    expect(filterYear({ from: '2026-01-01', to: '2026-11-30' })).toBeNull()
    expect(filterMonth({ from: '2026-01-01', to: '2026-12-31' })).toBeNull()
  })
})
