import { describe, expect, it } from 'vitest'
import { MAX_DELETE_IDS, parseDeleteIds } from '@/lib/import/deleteRows'

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

describe('parseDeleteIds', () => {
  it('รับ UUID ที่ถูกต้อง ตัดซ้ำ และแปลงเป็นตัวพิมพ์เล็ก', () => {
    const r = parseDeleteIds({ ids: [id(1), id(1).toUpperCase(), id(2)] })
    expect(r).toEqual({ ok: true, ids: [id(1), id(2)] })
  })
  it('ปฏิเสธทั้งคำขอเมื่อมีค่าผิดรูปแบบ (ไม่ลบบางส่วน)', () => {
    expect(parseDeleteIds({ ids: [id(1), "1' or '1'='1"] }).ok).toBe(false)
    expect(parseDeleteIds({ ids: [id(1), 5] }).ok).toBe(false)
  })
  it('ต้องมี ids 1–50 รายการ', () => {
    expect(parseDeleteIds({ ids: [] }).ok).toBe(false)
    expect(parseDeleteIds({}).ok).toBe(false)
    expect(parseDeleteIds(null).ok).toBe(false)
    expect(parseDeleteIds({ ids: Array.from({ length: MAX_DELETE_IDS + 1 }, (_, i) => id(i)) }).ok).toBe(false)
    expect(parseDeleteIds({ ids: Array.from({ length: MAX_DELETE_IDS }, (_, i) => id(i)) }).ok).toBe(true)
  })
  it('ไม่มีโหมดลบทั้งหมด (all/filter ถูกเมินและไม่มี ids = ปฏิเสธ)', () => {
    expect(parseDeleteIds({ all: true }).ok).toBe(false)
    expect(parseDeleteIds({ filter: 'seed' }).ok).toBe(false)
  })
})
