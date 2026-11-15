import { describe, expect, it } from 'vitest'
import { normalize } from '@/lib/survey/normalize'
import { isNoSuggestion, summarizeComments, themesOf } from '@/lib/survey/comments'
import { mk } from './helpers'

const rowsOf = (texts: (string | null)[]) =>
  normalize(texts.map((t, i) => mk({ sur11: t, submitted_at: `2026-11-0${(i % 9) + 1}T03:00:00Z` }))).rows

describe('isNoSuggestion', () => {
  it('ว่าง / เครื่องหมาย / "ไม่มี(ครับ)" ไม่ใช่ข้อเสนอ', () => {
    for (const t of ['', '   ', '-', '.', '...', 'ไม่มี', 'ไม่มีครับ', 'ไม่มีค่ะ', 'ไม่มี.', 'ไม่มีเลยครับ', 'No', 'n/a']) {
      expect(isNoSuggestion(t), t).toBe(true)
    }
  })
  it('ประโยคที่ขึ้นต้นด้วย "ไม่มี" แต่มีเนื้อหา = ข้อเสนอจริง', () => {
    expect(isNoSuggestion('ไม่มีจุดขายของฝากเป็นศูนย์รวม')).toBe(false)
    expect(isNoSuggestion('อยากให้พัฒนามากกว่านี้')).toBe(false)
  })
})

describe('themesOf', () => {
  it('จับหัวข้อจากคำสำคัญ และหนึ่งความเห็นตรงได้หลายหัวข้อ', () => {
    expect(themesOf('เส้นทางเข้าควรที่สะดวกปลอกภัยกว่านี้')).toEqual(['access'])
    expect(themesOf('พัฒนาสถานที่ให้น่าท่องเที่ยวเพิ่มอีก')).toEqual(['improve'])
    expect(themesOf('ขอเชิญประชาชนมาเยือน เป็นมรดกที่มีคุณค่า')).toEqual(['activity', 'praise'])
    expect(themesOf('ข้อความที่ไม่ตรงคำสำคัญใดเลย')).toEqual([])
  })
})

describe('summarizeComments', () => {
  const rows = rowsOf([
    '-',
    'ไม่มีครับ',
    null,
    'อยากให้พัฒนามากกว่านี้',
    'ปรับปรุงห้องน้ำและที่จอดรถ',
    'ดีทุกที่ครับ',
    'ข้อความอื่นที่ไม่มีคำสำคัญ',
  ])
  const s = summarizeComments(rows)

  it('นับฐานและ "ไม่มีข้อเสนอ" แยกกัน', () => {
    expect(s.total).toBe(6) // null ไม่นับ
    expect(s.noSuggestion).toBe(2)
    expect(s.base).toBe(4)
  })
  it('หัวข้อเรียงมาก → น้อย, ร้อยละคิดจากฐานความเห็นที่มีสาระ', () => {
    const byKey = Object.fromEntries(s.themes.map((t) => [t.key, t]))
    expect(byKey.improve.count).toBe(2) // "พัฒนา", "ปรับปรุง"
    expect(byKey.access.count).toBe(1)
    expect(byKey.praise.count).toBe(1)
    expect(s.themes[0].key).toBe('improve')
    expect(byKey.improve.pct).toBe(50)
  })
  it('ข้อความที่ไม่ตรงหัวข้อไป "อื่น ๆ" และคำตอบใต้หัวข้อเป็นข้อความต้นฉบับ', () => {
    expect(s.other.count).toBe(1)
    expect(s.other.quotes[0].text).toBe('ข้อความอื่นที่ไม่มีคำสำคัญ')
    const improve = s.themes.find((t) => t.key === 'improve')!
    expect(improve.quotes.map((q) => q.text).sort()).toEqual(['ปรับปรุงห้องน้ำและที่จอดรถ', 'อยากให้พัฒนามากกว่านี้'])
  })
  it('ไม่มีความเห็น → ทุกค่าเป็น 0 ไม่หารศูนย์', () => {
    const e = summarizeComments([])
    expect(e).toMatchObject({ total: 0, base: 0, noSuggestion: 0, themes: [] })
    expect(e.other.pct).toBe(0)
  })
})
