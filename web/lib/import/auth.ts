// สิทธิ์ผู้ดูแล (DATA_CONTRACT ข้อ 6 — EXP-09 ไม่ทำล็อกอินเต็ม)
// ADMIN_PASSCODE (env) -> cookie เซสชันแบบ "ลงลายเซ็น" (HMAC-SHA256) มีเวลาหมดอายุอยู่ในตัว ไม่เก็บรหัสผ่านหรือแฮชของรหัสผ่านใน cookie
//   รูปแบบ: v1.<หมดอายุ (ms)>.<nonce>.<ลายเซ็น hex>
//   - กุญแจลงลายเซ็น = ADMIN_SESSION_SECRET (ถ้าตั้ง) ไม่งั้นอนุพันธ์จาก ADMIN_PASSCODE → เปลี่ยนรหัสผ่าน = เซสชันเดิมทุกตัวใช้ไม่ได้ทันที ("ออกจากระบบทุกเครื่อง")
//   - ตรวจเวลาหมดอายุฝั่งเซิร์ฟเวอร์ทุกครั้ง (ไม่เชื่อ maxAge ของ cookie อย่างเดียว) ; เทียบลายเซ็นแบบ timing-safe
// ไม่ได้ตั้ง ADMIN_PASSCODE = ปิด /admin และ /api/admin ทั้งหมด (fail closed)
import crypto from 'node:crypto'

export const ADMIN_COOKIE = 'admin_session'
/** อายุเซสชันสูงสุด (ไม่ต่ออายุอัตโนมัติ — ครบแล้วต้องล็อกอินใหม่) */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 8
const VERSION = 'v1'

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSCODE
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function signingKey(): string {
  return process.env.ADMIN_SESSION_SECRET || sha256(`admin-session-key:${process.env.ADMIN_PASSCODE ?? ''}`)
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', signingKey()).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  return a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/** ตรวจรหัสที่กรอกในหน้าล็อกอิน (เทียบแบบ timing-safe) */
export function isValidPasscode(input: string): boolean {
  if (!adminConfigured()) return false
  return safeEqual(sha256(`admin:${input}`), sha256(`admin:${process.env.ADMIN_PASSCODE}`))
}

/** สร้างค่า cookie เซสชันใหม่ ; now/nonce ใส่เองได้เพื่อทดสอบ */
export function createSession(now: number = Date.now(), nonce: string = crypto.randomBytes(12).toString('hex')): { value: string; expiresAt: number } {
  const expiresAt = now + SESSION_MAX_AGE_SEC * 1000
  const payload = `${VERSION}.${expiresAt}.${nonce}`
  return { value: `${payload}.${sign(payload)}`, expiresAt }
}

/** เวลาหมดอายุ (ms) ของเซสชันที่ถูกต้องและยังไม่หมดอายุ ; ไม่ถูกต้อง/หมดอายุ/ไม่ได้ตั้ง passcode = null */
export function sessionExpiry(value: string | undefined | null, now: number = Date.now()): number | null {
  if (!adminConfigured() || !value) return null
  const parts = value.split('.')
  if (parts.length !== 4 || parts[0] !== VERSION) return null
  const [, exp, nonce, sig] = parts
  if (!/^\d{10,16}$/.test(exp) || !/^[0-9a-f]{8,64}$/.test(nonce) || !/^[0-9a-f]{64}$/.test(sig)) return null
  if (!safeEqual(sig, sign(`${VERSION}.${exp}.${nonce}`))) return null
  const expiresAt = Number(exp)
  // เพดานกันค่าที่ลงลายเซ็นไว้ไกลเกินจริง (ป้องกันกรณีกุญแจรั่ว/ตั้งเวลาผิด)
  if (expiresAt <= now || expiresAt > now + SESSION_MAX_AGE_SEC * 1000 + 60_000) return null
  return expiresAt
}

/** ตรวจ cookie ที่ส่งมากับ request (ใช้ใน proxy.ts และ route เขียนข้อมูล) */
export function isValidAdminCookie(value: string | undefined | null, now: number = Date.now()): boolean {
  return sessionExpiry(value, now) !== null
}

export const cookieOptions = {
  httpOnly: true,
  // strict: เบราว์เซอร์ไม่ส่ง cookie ผู้ดูแลไปกับคำขอข้ามเว็บ (กัน CSRF) ; ผู้ดูแลเปิดหน้า /admin จากลิงก์ภายนอกแล้วต้องผ่านหน้าล็อกอินปกติ
  sameSite: 'strict',
  path: '/',
  maxAge: SESSION_MAX_AGE_SEC,
  secure: process.env.NODE_ENV === 'production',
} as const
