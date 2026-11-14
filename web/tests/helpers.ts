import type { RawRow } from '@/lib/survey/schema'

let seq = 0

/** แถวดิบที่สมบูรณ์ (ผ่านคัดกรอง ยินยอม ตอบข้อบังคับครบ) เขียนทับด้วย over */
export function mk(over: Partial<RawRow> = {}): RawRow {
  seq++
  return {
    id: `t${seq}`,
    source: 'seed',
    submitted_at: '2026-11-03T03:00:00Z', // 10:00 เวลาไทย
    is_complete: true,
    scr01: 'ใช่',
    scr02: 'ใช่',
    con01: 'ยินยอม',
    sur01: '25–34 ปี',
    sur02: 'จังหวัดยะลา',
    sur03: 'เพื่อน',
    sur04: 'รถยนต์ส่วนตัว',
    ...over,
  }
}

export function many(n: number, over: (i: number) => Partial<RawRow>): RawRow[] {
  return Array.from({ length: n }, (_, i) => mk(over(i)))
}
