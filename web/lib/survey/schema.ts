// แหล่งความจริงของรหัสข้อ/ตัวเลือก — ตรงกับ docs/DATA_CONTRACT.md ข้อ 1
// หมายเหตุ: ขีดในช่วงตัวเลขเป็น en dash (U+2013)

export type Code =
  | 'scr01' | 'scr02' | 'con01'
  | 'sur01' | 'sur02' | 'sur03' | 'sur04' | 'sur05' | 'sur06'
  | 'sur07' | 'sur08' | 'sur09' | 'sur10' | 'sur11'

export const CODES: Code[] = [
  'scr01', 'scr02', 'con01',
  'sur01', 'sur02', 'sur03', 'sur04', 'sur05', 'sur06',
  'sur07', 'sur08', 'sur09', 'sur10', 'sur11',
]

export type Question = {
  code: Code
  title: string
  short: string
  type: 'single' | 'multi' | 'text'
  required: boolean
  choices: string[]
  /** ตัวเลือกที่แปลว่า "ตอบแต่ไม่ระบุ" (ต่างจากไม่ตอบ/ข้าม) */
  notSpecified?: string[]
}

export const OTHERS_LABEL = 'อื่น ๆ'
export const SUR08_NONE = 'ไม่มีความสนใจเป็นพิเศษ'

export const QUESTIONS: Record<Code, Question> = {
  scr01: {
    code: 'scr01', title: 'คัดกรองข้อที่ 1', short: 'คัดกรองข้อที่ 1',
    type: 'single', required: true, choices: ['ใช่', 'ไม่ใช่'],
  },
  scr02: {
    code: 'scr02', title: 'คัดกรองข้อที่ 2', short: 'คัดกรองข้อที่ 2',
    type: 'single', required: true, choices: ['ใช่', 'ไม่ใช่'],
  },
  con01: {
    code: 'con01', title: 'ท่านได้รับทราบคำชี้แจง', short: 'ความยินยอม',
    type: 'single', required: true, choices: ['ยินยอม', 'ไม่ยินยอม'],
  },
  sur01: {
    code: 'sur01', title: '1. ช่วงอายุ', short: 'ช่วงอายุ',
    type: 'single', required: true,
    choices: ['18–24 ปี', '25–34 ปี', '35–44 ปี', '45–54 ปี', '55 ปีขึ้นไป', 'ไม่ประสงค์ระบุ'],
    notSpecified: ['ไม่ประสงค์ระบุ'],
  },
  sur02: {
    code: 'sur02', title: '2. อาศัยอยู่', short: 'พื้นที่พำนัก',
    type: 'single', required: true,
    choices: ['จังหวัดยะลา', 'จังหวัดปัตตานี', 'จังหวัดนราธิวาส', 'จังหวัดสงขลา', 'จังหวัดอื่นในประเทศไทย', 'ต่างประเทศ', 'ไม่ประสงค์ระบุ'],
    notSpecified: ['ไม่ประสงค์ระบุ'],
  },
  sur03: {
    code: 'sur03', title: '3. มากับใคร', short: 'ผู้ร่วมเดินทาง',
    type: 'single', required: true,
    choices: ['เดินทางคนเดียว', 'ครอบครัว / เครือญาติ', 'เพื่อน', 'คู่รัก / คู่สมรส', 'คณะทัวร์ / หมู่คณะ', 'ไม่ประสงค์ระบุ'],
    notSpecified: ['ไม่ประสงค์ระบุ'],
  },
  sur04: {
    code: 'sur04', title: '4. พาหนะ', short: 'พาหนะ',
    type: 'single', required: true,
    choices: ['รถยนต์ส่วนตัว', 'รถจักรยานยนต์', 'รถโดยสารสาธารณะ', 'รถเช่า', 'รถนำเที่ยว / รถทัวร์', 'ไม่ประสงค์ระบุ'],
    notSpecified: ['ไม่ประสงค์ระบุ'],
  },
  sur05: {
    code: 'sur05', title: '5. วัตถุประสงค์', short: 'วัตถุประสงค์',
    type: 'single', required: false,
    choices: ['ท่องเที่ยวเชิงศาสนาและวัฒนธรรม', 'ศึกษาประวัติศาสตร์และโบราณสถาน', 'พักผ่อนหรือถ่ายภาพ', 'แวะเยี่ยมชมระหว่างการเดินทาง'],
  },
  sur06: {
    code: 'sur06', title: '6. รู้จักจากช่องทาง', short: 'ช่องทางรับรู้',
    type: 'single', required: false,
    choices: [
      'สื่อสังคมออนไลน์ (เช่น Facebook / TikTok)',
      'เว็บไซต์ / การค้นหาผ่าน Google',
      'เพื่อนหรือครอบครัวแนะนำ',
      'เคยมาเยือนสถานที่นี้มาก่อนแล้ว',
      'ป้ายประชาสัมพันธ์ / สื่อประชาสัมพันธ์อื่น',
    ],
  },
  sur07: {
    code: 'sur07', title: '7. ค่าใช้จ่าย', short: 'ค่าใช้จ่าย',
    type: 'single', required: false,
    choices: ['ไม่เกิน 300 บาท', '301–600 บาท', '601–1,000 บาท', '1,001–2,000 บาท', 'มากกว่า 2,000 บาท', 'ยังประเมินไม่ได้', 'ไม่ประสงค์ระบุ'],
    notSpecified: ['ยังประเมินไม่ได้', 'ไม่ประสงค์ระบุ'],
  },
  sur08: {
    code: 'sur08', title: '8. สนใจสินค้าและบริการ', short: 'สินค้า/บริการที่สนใจ',
    type: 'multi', required: false,
    choices: [
      'อาหารและเครื่องดื่ม', 'ของฝาก / ผลิตภัณฑ์ชุมชน', 'โรงแรม / ที่พัก / โฮมสเตย์',
      'บริการเดินทาง / ขนส่ง', 'กิจกรรมท่องเที่ยว / นำเที่ยว', 'ไม่มีความสนใจเป็นพิเศษ',
    ],
  },
  sur09: {
    code: 'sur09', title: '9. ความพึงพอใจ', short: 'ความพึงพอใจ',
    type: 'single', required: false,
    choices: ['5 (มากที่สุด)', '4 (มาก)', '3 (ปานกลาง)', '2 (น้อย)', '1 (น้อยที่สุด)', 'ยังไม่สามารถประเมินได้'],
    notSpecified: ['ยังไม่สามารถประเมินได้'],
  },
  sur10: {
    code: 'sur10', title: '10. กลับมาเยือน', short: 'ความตั้งใจกลับมา',
    type: 'single', required: false,
    choices: ['ตั้งใจจะกลับมาอีก', 'อาจจะกลับมาอีก', 'ยังไม่แน่ใจ', 'ไม่น่าจะกลับมาอีก'],
  },
  sur11: {
    code: 'sur11', title: '11. ข้อเสนอแนะ', short: 'ข้อเสนอแนะ',
    type: 'text', required: false, choices: [],
  },
}

export type Slot = 'เช้า' | 'บ่าย' | 'เย็น' | 'อื่น'
export const SLOTS: Slot[] = ['เช้า', 'บ่าย', 'เย็น', 'อื่น']

export type RawRow = {
  id: string
  source: string
  submitted_at: string
  is_complete: boolean
} & Partial<Record<Code, string | null>>

export type Row = RawRow & {
  sur08list: string[]
  /** true ถ้า sur08 มี "ไม่มีความสนใจเป็นพิเศษ" ร่วมกับข้ออื่น (ตัดทิ้งแล้ว) */
  sur08conflict: boolean
  sat: number | null
  slot: Slot
  /** YYYY-MM-DD เขตเวลา Asia/Bangkok (UTC+7) */
  date: string
}

export const DISCLAIMER =
  'ผลนี้สรุปจากผู้ตอบแบบสำรวจ ณ วัดคูหาภิมุข (เลือกตัวอย่างแบบสะดวก) ไม่ใช่ยอดนักท่องเที่ยวทั้งหมด'
export const SMALL_N_WARNING = 'จำนวนน้อย ตีความด้วยความระมัดระวัง'
export const SMALL_N = 5
/** ทั้งหน้า: ผู้ตอบหลังกรองน้อยกว่านี้ -> แสดงแถบเตือนกลุ่มตัวอย่างน้อย */
export const SMALL_PAGE_N = 30
export const TARGET_MIN = 267
export const TARGET_FULL = 300
