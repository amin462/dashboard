import { describe, expect, it } from 'vitest'
import { freq, multiFreq, satisfaction } from '@/lib/survey/aggregate'
import { normalize } from '@/lib/survey/normalize'
import { buildReportCsv } from '@/app/(dash)/reports/report-csv'
import { many } from './helpers'

describe('buildReportCsv', () => {
  const rows = normalize([
    ...many(6, () => ({ sur02: 'จังหวัดยะลา', sur08: 'อาหารและเครื่องดื่ม', sur09: '5' })),
    ...many(6, () => ({ sur02: 'จังหวัดปัตตานี', sur08: 'ของฝากและผลิตภัณฑ์ชุมชน', sur09: '4' })),
  ]).rows

  it('มีคอลัมน์ช่วงเชื่อมั่น 95% และส่วนสถิติท้ายไฟล์', () => {
    const csv = buildReportCsv([freq(rows, 'sur02'), multiFreq(rows)], satisfaction(rows), [], rows.length, '', rows)
    expect(csv).toContain('ช่วงเชื่อมั่น 95% ต่ำ (%)')
    expect(csv).toContain('สถิติประกอบการอ่านผล')
    expect(csv).toContain('ความคลาดเคลื่อนของร้อยละที่ความเชื่อมั่น 95%')
    expect(csv).toContain('p-value')
  })

  it('ไม่ส่ง rows = ไม่มีส่วนสถิติ (เข้ากันได้กับเดิม)', () => {
    const csv = buildReportCsv([freq(rows, 'sur02')], satisfaction(rows), [], rows.length, '')
    expect(csv).not.toContain('สถิติประกอบการอ่านผล')
  })
})
