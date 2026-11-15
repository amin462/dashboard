import { describe, expect, it } from 'vitest'
import { freq, multiFreq, satisfaction } from '@/lib/survey/aggregate'
import { normalize } from '@/lib/survey/normalize'
import { DISCLAIMER } from '@/lib/survey/schema'
import { buildReportWordHtml, escapeHtml } from '@/app/(dash)/reports/report-word'
import { many } from './helpers'

describe('buildReportWordHtml', () => {
  const rows = normalize([
    ...many(6, () => ({ sur02: 'จังหวัดยะลา', sur08: 'อาหารและเครื่องดื่ม', sur09: '5' })),
    ...many(6, () => ({ sur02: 'จังหวัดปัตตานี', sur08: 'ของฝากและผลิตภัณฑ์ชุมชน', sur09: '4' })),
  ]).rows
  const results = [freq(rows, 'sur01'), freq(rows, 'sur02'), multiFreq(rows)]
  const build = (comments = [] as typeof rows, withRows = true, filter = '') =>
    buildReportWordHtml(results, satisfaction(rows), comments, rows.length, filter, withRows ? rows : undefined)

  it('มีโครงสร้าง Word (charset, namespace, ฟอนต์ไทย) และตารางครบทุกข้อ', () => {
    const html = build()
    expect(html).toContain('<meta charset="utf-8">')
    expect(html).toContain('xmlns:w="urn:schemas-microsoft-com:office:word"')
    expect(html).toContain('TH Sarabun New')
    expect(html).toContain('ตารางที่ 1 แสดงจำนวนและร้อยละของช่วงอายุ')
    expect(html).toContain('ตารางที่ 2 แสดงจำนวนและร้อยละของอาศัยอยู่')
    expect(html).toContain('ตารางที่ 3 ')
    expect(html).toContain('n = 12 คน')
    expect(html).toContain(DISCLAIMER)
  })

  it('มีช่วงเชื่อมั่น 95% และส่วนสถิติเปรียบเทียบเมื่อส่ง rows', () => {
    const html = build()
    expect(html).toContain('ช่วงเชื่อมั่น 95%')
    expect(html).toMatch(/\d+\.\d–\d+\.\d/)
    expect(html).toContain('สถิติประกอบการอ่านผล')
    expect(html).toContain('p-value')
  })

  it('ไม่ส่ง rows = ไม่มีส่วนสถิติ', () => {
    expect(build([], false)).not.toContain('สถิติประกอบการอ่านผล')
  })

  it('escape HTML จากข้อมูลผู้ตอบ (ข้อเสนอแนะ/ตัวกรอง)', () => {
    const bad = { ...rows[0], sur11: '<script>alert(1)</script> & "x"\nบรรทัดสอง' }
    const html = build([bad], true, '<img src=x onerror=alert(1)>')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;<br>บรรทัดสอง')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('escapeHtml', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
  })
})
