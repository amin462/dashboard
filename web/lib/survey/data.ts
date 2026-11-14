import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { makeMock } from './mock'
import { CODES, type RawRow } from './schema'

export type RawRowsResult = {
  rows: RawRow[]
  source: 'supabase' | 'mock'
  error?: string
}

const PAGE = 1000
const COLUMNS = ['id', 'source', 'submitted_at', 'is_complete', ...CODES].join(',')

/** ดึงข้อมูลดิบทุกแถว: Supabase ถ้ามี env ไม่งั้น mock ; ไม่ throw (error บอกใน result, fallback เป็น mock) */
export async function getRawRows(): Promise<RawRowsResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { rows: makeMock(300, 42), source: 'mock' }

  try {
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
    return { rows, source: 'supabase' }
  } catch (e) {
    return {
      rows: makeMock(300, 42),
      source: 'mock',
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
