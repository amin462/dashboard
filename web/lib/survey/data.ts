import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { makeMock } from './mock'
import { CODES, type RawRow } from './schema'

export type RawRowsResult = {
  rows: RawRow[]
  /** mock = ยังไม่ตั้งค่า Supabase (โหมดสาธิต) ; error = ตั้งค่าแล้วแต่อ่านไม่สำเร็จ → ไม่แสดงข้อมูลจำลองแทน (กันตัวเลขปลอมบน production) */
  source: 'supabase' | 'mock' | 'error'
  error?: string
}

const PAGE = 1000
const COLUMNS = ['id', 'source', 'submitted_at', 'is_complete', ...CODES].join(',')

/**
 * ดึงข้อมูลดิบทุกแถว: Supabase ถ้ามี env ไม่งั้น mock (สาธิต) ; ไม่ throw
 * ตั้ง env แล้วแต่อ่านไม่สำเร็จ (ลองซ้ำ 1 ครั้ง) → source='error' ไม่มีแถว (ห้ามเอาข้อมูลจำลองมาแทนข้อมูลจริง)
 */
export async function getRawRows(): Promise<RawRowsResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { rows: makeMock(300, 42), source: 'mock' }

  const load = async (): Promise<RawRow[]> => {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const rows: RawRow[] = []
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('survey_responses')
        .select(COLUMNS)
        .order('submitted_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + PAGE - 1)
      if (error) throw new Error(error.message)
      const page = (data ?? []) as unknown as RawRow[]
      rows.push(...page)
      if (page.length < PAGE) break
    }
    return rows
  }

  try {
    try {
      return { rows: await load(), source: 'supabase' }
    } catch {
      await new Promise((r) => setTimeout(r, 800))
      return { rows: await load(), source: 'supabase' }
    }
  } catch (e) {
    console.error('[data] Supabase read failed:', e instanceof Error ? e.message : e)
    return { rows: [], source: 'error', error: e instanceof Error ? e.message : String(e) }
  }
}
