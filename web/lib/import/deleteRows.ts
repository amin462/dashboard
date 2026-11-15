// ตรวจคำขอลบแถวผู้ตอบ (ผู้ดูแล) — ฟังก์ชันล้วน ทดสอบได้ ไม่แตะฐานข้อมูล

export const MAX_DELETE_IDS = 50

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ParsedDelete = { ok: true; ids: string[] } | { ok: false; error: string }

/** body ต้องเป็น { ids: string[] } เป็น UUID ไม่ซ้ำ 1–50 รายการ ; ค่าอื่น = ปฏิเสธทั้งคำขอ (ไม่ลบบางส่วน) */
export function parseDeleteIds(body: unknown): ParsedDelete {
  if (!body || typeof body !== 'object') return { ok: false, error: 'body ต้องเป็น JSON' }
  const raw = (body as Record<string, unknown>).ids
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: 'ต้องระบุ ids อย่างน้อย 1 รายการ' }
  if (raw.length > MAX_DELETE_IDS) return { ok: false, error: `ลบได้ครั้งละไม่เกิน ${MAX_DELETE_IDS} แถว` }
  const ids: string[] = []
  for (const v of raw) {
    if (typeof v !== 'string' || !UUID_RE.test(v)) return { ok: false, error: 'รูปแบบ id ไม่ถูกต้อง' }
    const id = v.toLowerCase()
    if (!ids.includes(id)) ids.push(id)
  }
  return { ok: true, ids }
}
