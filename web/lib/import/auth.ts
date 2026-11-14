// สิทธิ์ผู้ดูแล (DATA_CONTRACT ข้อ 6 — EXP-09 ไม่ทำล็อกอินเต็ม)
// ADMIN_PASSCODE (env) -> cookie httpOnly เก็บ sha256(passcode) ไม่เก็บรหัสดิบ
// ถ้าไม่ได้ตั้ง ADMIN_PASSCODE = โหมดเดโม่: หน้า /admin เปิดให้ดูได้ (ไม่มีข้อมูลจริง)
// แต่ API เขียนยัง 503 เพราะไม่มี Supabase env
import crypto from 'node:crypto'

export const ADMIN_COOKIE = 'admin_auth'
export const COOKIE_MAX_AGE = 60 * 60 * 12 // 12 ชม.

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSCODE
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** ค่า token ที่เก็บใน cookie — มาจาก passcode ปัจจุบันใน env */
export function sessionToken(): string {
  return sha256(`admin:${process.env.ADMIN_PASSCODE ?? ''}`)
}

/** ตรวจรหัสที่กรอกในหน้าล็อกอิน (เทียบแบบ timing-safe) */
export function isValidPasscode(input: string): boolean {
  if (!adminConfigured()) return false
  // เติม prefix เดียวกับ sessionToken() ไม่งั้นจะเทียบกับ sha256 ของรหัสดิบและไม่มีทางตรงกัน
  const a = sha256(`admin:${input}`)
  const b = sessionToken()
  return a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/** ตรวจ cookie ที่ส่งมากับ request (ใช้ใน proxy.ts และ route เขียนข้อมูล) */
export function isValidAdminCookie(value: string | undefined | null): boolean {
  if (!adminConfigured() || !value) return false
  const expected = sessionToken()
  return value.length === expected.length && crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: COOKIE_MAX_AGE,
  secure: process.env.NODE_ENV === 'production',
} as const
