import { describe, expect, it } from 'vitest'
import { codeOfHeader, parseGoogleSheetsCsv, parseSubmittedAt } from './csv'

// หัวคอลัมน์จริงตาม script_googleForm/snippet.js (Google Sheets export จะมี Timestamp นำหน้า)
const HEADER_ROW = [
  'Timestamp',
  'คัดกรองข้อที่ 1: ท่านมีอายุ 18 ปีบริบูรณ์ขึ้นไปหรือไม่',
  'คัดกรองข้อที่ 2: ขณะนี้ท่านกำลังมาเยี่ยมชมวัดคูหาภิมุข (วัดหน้าถ้ำ) เพื่อการท่องเที่ยวหรือเยี่ยมชมสถานที่ใช่หรือไม่',
  'ท่านได้รับทราบคำชี้แจงข้างต้น และยินยอมเข้าร่วมการสำรวจนี้โดยสมัครใจหรือไม่',
  '1. ช่วงอายุของท่าน',
  '2. ปัจจุบันท่านอาศัยอยู่ในจังหวัดใดหรือประเทศใดเป็นหลัก',
  '3. ท่านมาเยี่ยมชมวัดคูหาภิมุข (วัดหน้าถ้ำ) ในครั้งนี้กับใครเป็นหลัก',
  '4. พาหนะหลักที่ท่านใช้เดินทางมายังวัดคูหาภิมุข (วัดหน้าถ้ำ) ในครั้งนี้คือข้อใด',
  '5. วัตถุประสงค์หลักของการมาเยือนวัดคูหาภิมุข (วัดหน้าถ้ำ) ในครั้งนี้คืออะไร',
  '6. ท่านรู้จักวัดคูหาภิมุข (วัดหน้าถ้ำ) จากช่องทางใดเป็นหลัก',
  '7. ค่าใช้จ่ายโดยประมาณต่อคนสำหรับการท่องเที่ยวในอำเภอเมืองยะลาครั้งนี้เป็นเท่าใด (นับรวมที่จ่ายแล้วและที่คาดว่าจะจ่ายตลอดทริปนี้ ไม่รวมค่าเดินทางมาจากภูมิลำเนาหรือต่างจังหวัด)',
  '8. ในการท่องเที่ยวอำเภอเมืองยะลาครั้งนี้ ท่านสนใจสินค้าและบริการประเภทใดบ้าง (เลือกได้มากกว่า 1 ข้อ)',
  '9. โดยรวมแล้ว ท่านมีความพึงพอใจต่อการเยี่ยมชมวัดคูหาภิมุข (วัดหน้าถ้ำ) ในครั้งนี้ระดับใด',
  '10. หากมีโอกาส ท่านมีแนวโน้มจะกลับมาเยือนวัดคูหาภิมุข (วัดหน้าถ้ำ) อีกหรือไม่',
  '11. ท่านมีข้อเสนอแนะเพิ่มเติมเกี่ยวกับสินค้า บริการ หรือการจัดการท่องเที่ยวในพื้นที่อำเภอเมืองยะลาอย่างไรบ้าง',
]

const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const csv = (...data: string[][]) => [HEADER_ROW, ...data].map((r) => r.map(esc).join(',')).join('\n')

describe('codeOfHeader — ตรรกะเดียวกับ codeOf_ ใน syncToSupabase.gs', () => {
  it('หัวคอลัมน์จริงทั้ง 15 คอลัมน์', () => {
    expect(HEADER_ROW.map(codeOfHeader)).toEqual([
      'time',
      'scr01',
      'scr02',
      'con01',
      'sur01',
      'sur02',
      'sur03',
      'sur04',
      'sur05',
      'sur06',
      'sur07',
      'sur08',
      'sur09',
      'sur10',
      'sur11',
    ])
  })
  it('คอลัมน์อื่น / เลขข้อเกิน 11 -> null', () => {
    expect(codeOfHeader('คะแนน')).toBeNull()
    expect(codeOfHeader('12. อื่น ๆ')).toBeNull()
    expect(codeOfHeader('  Timestamp  ')).toBe('time')
  })
})

describe('parseSubmittedAt (Asia/Bangkok = +07:00)', () => {
  it('ค.ศ. d/m/yyyy', () => {
    expect(parseSubmittedAt('14/11/2026 10:30:00')).toBe('2026-11-14T03:30:00.000Z')
    expect(parseSubmittedAt('7/11/2026 09:05')).toBe('2026-11-07T02:05:00.000Z')
  })
  it('พ.ศ. (ปี > 2400) และแบบมี comma', () => {
    expect(parseSubmittedAt('14/11/2569, 10:30:00')).toBe('2026-11-14T03:30:00.000Z')
    expect(parseSubmittedAt('1/1/2570 06:00:00')).toBe('2026-12-31T23:00:00.000Z') // ข้ามปี/ข้ามวัน
  })
  it('m/d เมื่อเลขที่สอง > 12', () => {
    expect(parseSubmittedAt('11/14/2026 10:30:00')).toBe('2026-11-14T03:30:00.000Z')
  })
  it('ISO: ไม่มีเขตเวลา = เวลาไทย, Z = +07:00, ตัดมิลลิวินาที', () => {
    expect(parseSubmittedAt('2026-11-14T10:30:00')).toBe('2026-11-14T03:30:00.000Z')
    expect(parseSubmittedAt('2026-11-14T10:30:00+07:00')).toBe('2026-11-14T03:30:00.000Z')
    expect(parseSubmittedAt('2026-11-14T03:30:00Z')).toBe('2026-11-14T03:30:00.000Z')
    expect(parseSubmittedAt('2026-11-14T03:30:00.123Z')).toBe('2026-11-14T03:30:00.000Z')
  })
  it('เวลา parse ไม่ได้ -> null', () => {
    expect(parseSubmittedAt('')).toBeNull()
    expect(parseSubmittedAt('สิบสาม')).toBeNull()
    expect(parseSubmittedAt('14/11/2569')).toBeNull() // ไม่มีส่วนเวลา
    expect(parseSubmittedAt('31/13/2569 10:30:00')).toBeNull() // เดือน 13
    expect(parseSubmittedAt('29/2/2569 10:30:00')).toBeNull() // 2026 ไม่อธิกสุรทิน
    expect(parseSubmittedAt('25/12/2569 24:00:00')).toBeNull() // ชั่วโมง 24
  })
})

describe('parseGoogleSheetsCsv', () => {
  it('หัวคอลัมน์จริงจาก snippet.js + Timestamp ค.ศ.', () => {
    const { rows, errors } = parseGoogleSheetsCsv(
      csv([
        '14/11/2026 10:30:00',
        'ใช่',
        'ใช่',
        'ยินยอม',
        '18–24 ปี',
        'จังหวัดยะลา',
        'เพื่อน',
        'รถยนต์ส่วนตัว',
        'พักผ่อนหรือถ่ายภาพ',
        'สื่อสังคมออนไลน์ (เช่น Facebook / TikTok)',
        '301–600 บาท',
        'อาหารและเครื่องดื่ม, ของฝาก / ผลิตภัณฑ์ชุมชน',
        '5 (มากที่สุด)',
        'ตั้งใจจะกลับมาอีก',
        'มาทำบุญเพิ่มเติม',
      ]),
    )
    expect(errors).toEqual([])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      source: 'csv',
      submitted_at: '2026-11-14T03:30:00.000Z', // 10:30 เวลาไทย
      scr01: 'ใช่',
      scr02: 'ใช่',
      con01: 'ยินยอม',
      sur01: '18–24 ปี',
      sur02: 'จังหวัดยะลา',
      sur03: 'เพื่อน',
      sur04: 'รถยนต์ส่วนตัว',
      sur05: 'พักผ่อนหรือถ่ายภาพ',
      sur06: 'สื่อสังคมออนไลน์ (เช่น Facebook / TikTok)',
      sur07: '301–600 บาท',
      sur08: 'อาหารและเครื่องดื่ม, ของฝาก / ผลิตภัณฑ์ชุมชน', // checkbox หลายค่าคงรูป ', '
      sur09: '5 (มากที่สุด)',
      sur10: 'ตั้งใจจะกลับมาอีก',
      sur11: 'มาทำบุญเพิ่มเติม',
    })
  })

  it('Timestamp พ.ศ. + ช่องว่าง -> ไม่ใส่ key (null ตอน insert)', () => {
    const { rows, errors } = parseGoogleSheetsCsv(
      csv([
        '14/11/2569, 10:30:00',
        'ใช่',
        'ใช่',
        'ยินยอม',
        '55 ปีขึ้นไป',
        'ต่างประเทศ',
        'คณะทัวร์ / หมู่คณะ',
        'รถเช่า',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ]),
    )
    expect(errors).toEqual([])
    expect(rows[0]!.submitted_at).toBe('2026-11-14T03:30:00.000Z')
    expect(rows[0]!.sur05).toBeUndefined()
    expect(rows[0]!.sur08).toBeUndefined()
  })

  it('แก้ขีดเป็น en dash เฉพาะค่าที่ตรงตัวเลือก ; ข้อความอิสระคงขีดเดิม', () => {
    const { rows, errors } = parseGoogleSheetsCsv(
      csv([
        '14/11/2026 10:30:00',
        'ใช่',
        'ใช่',
        'ยินยอม',
        '18-24 ปี',
        'จังหวัดยะลา',
        'คู่รัก / คู่สมรส',
        'รถจักรยานยนต์',
        '',
        '',
        '1,001—2,000 บาท',
        '',
        '',
        '',
        'มาก่อน 2019-2020',
      ]),
    )
    expect(errors).toEqual([])
    expect(rows[0]!.sur01).toBe('18–24 ปี')
    expect(rows[0]!.sur07).toBe('1,001–2,000 บาท')
    expect(rows[0]!.sur11).toBe('มาก่อน 2019-2020') // ไม่ตรงตัวเลือก -> เก็บข้อความเดิม
  })

  it('แถวเสีย (เวลาว่าง/parse ไม่ได้) -> errors พร้อมเลขบรรทัด', () => {
    const { rows, errors } = parseGoogleSheetsCsv(
      csv(
        [
          '14/11/2026 10:30:00',
          'ใช่',
          'ใช่',
          'ยินยอม',
          '25–34 ปี',
          'จังหวัดยะลา',
          'เพื่อน',
          'รถยนต์ส่วนตัว',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ],
        ['สิบสาม', 'ใช่', 'ใช่', 'ยินยอม', '', '', '', '', '', '', '', '', '', '', ''],
        [' ', 'ใช่', 'ใช่', 'ยินยอม', '', '', '', '', '', '', '', '', '', '', ''],
      ),
    )
    expect(rows).toHaveLength(1)
    expect(errors).toEqual([
      { line: 3, reason: expect.stringContaining('เวลาไม่ถูกต้อง') },
      { line: 4, reason: expect.stringContaining('เวลาไม่ถูกต้อง') },
    ])
  })

  it('ไม่มีคอลัมน์เวลา -> ทุกแถวเป็น error', () => {
    const { rows, errors } = parseGoogleSheetsCsv(
      'คัดกรองข้อที่ 1: ท่านมีอายุ 18 ปีบริบูรณ์ขึ้นไปหรือไม่\nใช่\nไม่ใช่\n',
    )
    expect(rows).toEqual([])
    expect(errors.map((e) => e.line)).toEqual([2, 3])
    expect(errors[0]!.reason).toContain('ไม่พบคอลัมน์เวลา')
  })

  it('ลบ BOM, หัวคอลัมน์ "ประทับเวลา", ข้ามบรรทัดว่าง, รองรับ CRLF', () => {
    const text = [
      '\uFEFFประทับเวลา,คัดกรองข้อที่ 1: ท่านมีอายุ 18 ปีบริบูรณ์ขึ้นไปหรือไม่',
      '',
      '14/11/2569 10:30:00,ใช่',
      '',
      '14/11/2569 10:31:00,ใช่',
    ].join('\r\n')
    const { rows, errors } = parseGoogleSheetsCsv(text)
    expect(errors).toEqual([])
    expect(rows.map((r) => r.submitted_at)).toEqual([
      '2026-11-14T03:30:00.000Z',
      '2026-11-14T03:31:00.000Z',
    ])
    expect(rows[0]!.scr01).toBe('ใช่')
  })

  it('ไฟล์ว่าง / เฉพาะหัวคอลัมน์ -> ว่างเปล่า', () => {
    expect(parseGoogleSheetsCsv('')).toEqual({ rows: [], errors: [] })
    expect(parseGoogleSheetsCsv(csv())).toEqual({ rows: [], errors: [] })
  })
})
