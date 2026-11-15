import { type Filters } from '@/lib/survey/filters'
import { BUSINESS_TYPES, type BusinessType } from '@/lib/survey/insights'
import { QUESTIONS } from '@/lib/survey/schema'

export const MAX_MESSAGES = 12
export const MAX_MESSAGE_LEN = 800
/** คำตอบเก่าของผู้ช่วยที่ส่งกลับมาเป็นประวัติ (ยาวกว่าข้อความผู้ใช้ได้) */
export const MAX_ASSISTANT_LEN = 2000

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ChatRequest = { messages: ChatMessage[]; business: BusinessType | null; page: string | null; filters: Filters }

/** ชื่อหน้าที่ผู้ใช้เปิดอยู่ (whitelist) → ใช้บอก AI ว่า "กราฟนี้" หมายถึงหน้าไหน */
export const PAGE_TITLES: Record<string, string> = {
  '/': 'ภาพรวม (ลูกค้าคนยะลา vs คนต่างถิ่น, โอกาสกลับมาซ้ำ, จำนวนผู้ตอบรายวัน, ช่วงเวลา, ช่องทางที่รู้จัก)',
  '/visitors': 'ผู้ตอบแบบสำรวจ (ช่วงอายุ, พื้นที่พำนัก)',
  '/travel': 'การเดินทาง (มากับใคร, พาหนะ)',
  '/awareness': 'วัตถุประสงค์และช่องทางรับรู้',
  '/spending': 'ค่าใช้จ่ายและความสนใจสินค้า/บริการ',
  '/satisfaction': 'ความพึงพอใจและข้อเสนอแนะ',
  '/business': 'มุมมองตามประเภทธุรกิจ',
  '/reports': 'รายงานและส่งออก',
  '/guide': 'คู่มือผู้ประกอบการ',
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const LIST_FILTERS = [
  ['age', 'sur01'],
  ['origin', 'sur02'],
  ['companion', 'sur03'],
  ['transport', 'sur04'],
] as const

/** ตัวกรองที่ผู้ใช้เปิดอยู่บนหน้าเว็บ (whitelist: วันที่รูปแบบถูก, ตัวเลือกต้องตรงกับแบบสำรวจ) */
export function parseFilters(raw: unknown): Filters {
  const f: Filters = {}
  if (!raw || typeof raw !== 'object') return f
  const r = raw as Record<string, unknown>
  if (typeof r.from === 'string' && DATE_RE.test(r.from)) f.from = r.from
  if (typeof r.to === 'string' && DATE_RE.test(r.to)) f.to = r.to
  for (const [key, code] of LIST_FILTERS) {
    const v = r[key]
    if (!Array.isArray(v)) continue
    const ok = v.filter((x): x is string => typeof x === 'string' && QUESTIONS[code].choices.includes(x)).slice(0, 12)
    if (ok.length) f[key] = ok
  }
  return f
}

/** ตรวจ body ของ /api/chat ; คืน null ถ้ารูปแบบไม่ถูกต้อง */
export function parseChatRequest(body: unknown): ChatRequest | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (!Array.isArray(b.messages) || b.messages.length === 0) return null
  const messages: ChatMessage[] = []
  for (const m of b.messages.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as Record<string, unknown>
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const text = content.trim().slice(0, role === 'user' ? MAX_MESSAGE_LEN : MAX_ASSISTANT_LEN)
    if (text) messages.push({ role, content: text })
  }
  // Gemini ต้องเริ่มด้วย user ; ข้อสุดท้ายต้องเป็นของผู้ใช้
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null
  const business = BUSINESS_TYPES.find((t) => t.key === b.business)?.key ?? null
  const page = typeof b.page === 'string' && b.page in PAGE_TITLES ? b.page : null
  return { messages, business, page, filters: parseFilters(b.filters) }
}
