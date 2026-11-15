import { round1 } from './aggregate'
import type { Row, Slot } from './schema'

/**
 * จัดข้อเสนอแนะ (ข้อ 11) เป็นหัวข้อ — ใช้ "คำสำคัญ" ที่กำหนดไว้ล่วงหน้าเท่านั้น (ไม่ใช้ AI, ไม่แต่งข้อความ)
 * ทุกคำตอบที่แสดงใต้หัวข้อเป็นข้อความต้นฉบับของผู้ตอบ ; ความเห็นหนึ่งอาจตรงหลายหัวข้อ (ร้อยละรวมเกิน 100% ได้)
 * คำตอบที่ไม่ตรงคำสำคัญใดเลยไปอยู่ "อื่น ๆ" ; คำตอบว่าง/"ไม่มี"/"-" ไม่นับเป็นข้อเสนอ
 */
export type CommentThemeDef = { key: string; label: string; keywords: string[] }

export const COMMENT_THEMES: CommentThemeDef[] = [
  {
    key: 'access',
    label: 'การเดินทางและสิ่งอำนวยความสะดวก',
    keywords: ['เส้นทาง', 'ถนน', 'ทางเข้า', 'ที่จอด', 'จอดรถ', 'ห้องน้ำ', 'ป้าย', 'ปลอดภัย', 'ปลอกภัย', 'สะดวก', 'ที่นั่ง', 'ร่มเงา', 'แสงสว่าง', 'ไฟ', 'รถรับ', 'ขนส่ง', 'เดินทาง'],
  },
  {
    key: 'improve',
    label: 'พัฒนาและปรับปรุงสถานที่',
    keywords: ['พัฒนา', 'ปรับปรุง', 'ซ่อม', 'สะอาด', 'ความสะอาด', 'ดูแล', 'น่าสนใจ', 'น่าท่องเที่ยว', 'น่าเที่ยว', 'ตกแต่ง', 'จัดสวน', 'รกร้าง'],
  },
  {
    key: 'activity',
    label: 'กิจกรรมและการประชาสัมพันธ์',
    keywords: ['กิจกรรม', 'จัดงาน', 'งานประเพณี', 'ประชาสัมพันธ์', 'โปรโมท', 'โปรโมต', 'โฆษณา', 'เชิญ', 'เผยแพร่', 'ตื่นเต้น', 'ตื่นตาตื่นใจ', 'รู้จักมากขึ้น'],
  },
  {
    key: 'shop',
    label: 'ร้านค้า ของฝาก และอาหาร',
    keywords: ['ของฝาก', 'ร้านค้า', 'ร้านอาหาร', 'อาหาร', 'ร้านกาแฟ', 'เครื่องดื่ม', 'ตลาด', 'จุดขาย', 'ขายของ', 'ที่พัก', 'โฮมสเตย์', 'ของที่ระลึก'],
  },
  {
    key: 'info',
    label: 'ข้อมูล ประวัติ และการให้ความรู้',
    keywords: ['ประวัติ', 'ความรู้', 'ข้อมูล', 'อธิบาย', 'มัคคุเทศก์', 'ไกด์', 'เจ้าหน้าที่', 'ป้ายความรู้', 'เล่าเรื่อง', 'ประวัติศาสตร์'],
  },
  {
    key: 'praise',
    label: 'ชื่นชมและให้กำลังใจ',
    keywords: ['ดีทุก', 'ดีมาก', 'ดีแล้ว', 'ดีครับ', 'ดีค่ะ', 'สวย', 'ประทับใจ', 'ชอบ', 'เยี่ยม', 'สุดยอด', 'ยอดเยี่ยม', 'คุณค่า', 'มรดก', 'ขอบคุณ', 'พอใจ', 'ประทับ'],
  },
]

export type CommentQuote = { text: string; date: string; slot: Slot; sat: number | null }

export type CommentThemeResult = {
  key: string
  label: string
  count: number
  /** % ของความเห็นที่มีสาระ (ฐาน = base) */
  pct: number
  /** ข้อความต้นฉบับ ใหม่ → เก่า */
  quotes: CommentQuote[]
}

export type CommentSummary = {
  /** ความเห็นที่กรอกข้อความทั้งหมด */
  total: number
  /** ความเห็นที่เป็นข้อเสนอจริง (ไม่นับ "ไม่มี" / "-" ) = ฐานของร้อยละ */
  base: number
  /** กรอกแต่ไม่มีข้อเสนอ เช่น "ไม่มี" "-" "." */
  noSuggestion: number
  /** หัวข้อที่มีอย่างน้อย 1 ความเห็น เรียงมาก → น้อย (เท่ากันเรียงตามลำดับในพจนานุกรม) */
  themes: CommentThemeResult[]
  /** ความเห็นที่ไม่ตรงคำสำคัญใดเลย */
  other: CommentThemeResult
}

const TRAIL = /(ครับผม|ครับ|ค่ะ|คะ|นะครับ|นะคะ|นะ|จ้า|จ้ะ)+$/u
const NONE_WORDS = ['ไม่มี', 'ไม่มีเลย', 'ไม่มีข้อเสนอแนะ', 'ไม่มีข้อเสนอ', 'ไม่ มี', 'ไม่', 'none', 'no', 'nope', 'na', 'n/a', 'nothing', 'ไม่ทราบ', 'ไม่แน่ใจ', 'ยังไม่มี']

/** ข้อความที่ไม่ใช่ข้อเสนอจริง: ว่าง, มีแต่เครื่องหมาย, หรือ "ไม่มี(ครับ/ค่ะ)" */
export function isNoSuggestion(text: string): boolean {
  const t = text.trim().toLowerCase()
  const letters = t.replace(/[\s\p{P}\p{S}_]+/gu, '')
  if (letters === '') return true
  const core = letters.replace(TRAIL, '')
  return NONE_WORDS.some((w) => w.replace(/[\s\p{P}\p{S}_]+/gu, '') === core)
}

/** หัวข้อที่ข้อความตรง (ว่างได้) */
export function themesOf(text: string): string[] {
  const t = text.toLowerCase()
  return COMMENT_THEMES.filter((th) => th.keywords.some((k) => t.includes(k))).map((th) => th.key)
}

export function summarizeComments(rows: Row[]): CommentSummary {
  const withText = rows
    .filter((r) => Boolean(r.sur11 && r.sur11.trim() !== ''))
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
  const real = withText.filter((r) => !isNoSuggestion(r.sur11 ?? ''))
  const base = real.length

  const buckets = new Map<string, CommentQuote[]>()
  const other: CommentQuote[] = []
  for (const r of real) {
    const q: CommentQuote = { text: (r.sur11 ?? '').trim(), date: r.date, slot: r.slot, sat: r.sat }
    const keys = themesOf(q.text)
    if (keys.length === 0) other.push(q)
    for (const k of keys) buckets.set(k, [...(buckets.get(k) ?? []), q])
  }

  const pct = (n: number) => (base > 0 ? round1((n / base) * 100) : 0)
  const themes = COMMENT_THEMES.map((th, i) => ({ th, i, quotes: buckets.get(th.key) ?? [] }))
    .filter((x) => x.quotes.length > 0)
    .sort((a, b) => b.quotes.length - a.quotes.length || a.i - b.i)
    .map(({ th, quotes }) => ({ key: th.key, label: th.label, count: quotes.length, pct: pct(quotes.length), quotes }))

  return {
    total: withText.length,
    base,
    noSuggestion: withText.length - base,
    themes,
    other: { key: 'other', label: 'อื่น ๆ (ไม่ตรงหัวข้อด้านบน)', count: other.length, pct: pct(other.length), quotes: other },
  }
}
