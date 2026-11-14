// ลูกค้า Supabase ฝั่ง server ด้วย SERVICE_ROLE (ใช้เขียนข้อมูลเท่านั้น — DATA_CONTRACT ข้อ 6)
// ห้าม import ไฟล์นี้ใน client component (มี 'server-only' กันไว้)
import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type SupabaseAdmin = SupabaseClient

/** true เมื่อตั้ง env ครบ (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) */
export function hasSupabaseEnv(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/** client สำหรับเขียนข้อมูล (service role) ; ไม่มี env -> null (โหมดเดโม่) */
export function getSupabaseAdmin(): SupabaseAdmin | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}
