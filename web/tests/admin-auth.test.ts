import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SESSION_MAX_AGE_SEC, createSession, isValidAdminCookie, isValidPasscode, sessionExpiry } from '@/lib/import/auth'
import { LOCK_MS, MAX_FAILS, WINDOW_MS, lockedForSec, recordFailure, recordSuccess, resetLoginLimit } from '@/lib/import/loginLimit'
import { isSameOrigin } from '@/lib/import/originCheck'

const T0 = 1_800_000_000_000

describe('เซสชันผู้ดูแล (cookie ลงลายเซ็น)', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSCODE = 'test-passcode-1'
    delete process.env.ADMIN_SESSION_SECRET
  })
  afterEach(() => {
    delete process.env.ADMIN_PASSCODE
    delete process.env.ADMIN_SESSION_SECRET
  })

  it('สร้างแล้วตรวจผ่าน และคืนเวลาหมดอายุ 8 ชั่วโมง', () => {
    const s = createSession(T0, 'aabbccddeeff00112233aabb')
    expect(sessionExpiry(s.value, T0 + 1000)).toBe(T0 + SESSION_MAX_AGE_SEC * 1000)
    expect(isValidAdminCookie(s.value, T0 + 1000)).toBe(true)
  })

  it('หมดอายุแล้วใช้ไม่ได้ (ตรวจฝั่งเซิร์ฟเวอร์ ไม่พึ่ง maxAge ของ cookie)', () => {
    const s = createSession(T0)
    expect(isValidAdminCookie(s.value, T0 + SESSION_MAX_AGE_SEC * 1000 + 1)).toBe(false)
  })

  it('แก้ไขค่า/ลายเซ็นปลอม/รูปแบบผิด = ไม่ผ่าน', () => {
    const s = createSession(T0)
    const parts = s.value.split('.')
    const forgedExp = [parts[0], String(Number(parts[1]) + 3_600_000), parts[2], parts[3]].join('.')
    expect(isValidAdminCookie(forgedExp, T0)).toBe(false)
    expect(isValidAdminCookie(s.value.slice(0, -1) + (s.value.endsWith('0') ? '1' : '0'), T0)).toBe(false)
    expect(isValidAdminCookie('', T0)).toBe(false)
    expect(isValidAdminCookie(null, T0)).toBe(false)
    expect(isValidAdminCookie('admin-hash-old-style', T0)).toBe(false)
  })

  it('เปลี่ยนรหัสผ่าน = เซสชันเดิมใช้ไม่ได้ทันที', () => {
    const s = createSession(T0)
    process.env.ADMIN_PASSCODE = 'another-passcode'
    expect(isValidAdminCookie(s.value, T0 + 1000)).toBe(false)
  })

  it('ADMIN_SESSION_SECRET แยกกุญแจจากรหัสผ่าน', () => {
    process.env.ADMIN_SESSION_SECRET = 'secret-a'
    const s = createSession(T0)
    process.env.ADMIN_SESSION_SECRET = 'secret-b'
    expect(isValidAdminCookie(s.value, T0 + 1000)).toBe(false)
    process.env.ADMIN_SESSION_SECRET = 'secret-a'
    expect(isValidAdminCookie(s.value, T0 + 1000)).toBe(true)
  })

  it('ไม่ได้ตั้ง ADMIN_PASSCODE = ปิดทั้งหมด (fail closed)', () => {
    const s = createSession(T0)
    delete process.env.ADMIN_PASSCODE
    expect(isValidAdminCookie(s.value, T0 + 1000)).toBe(false)
    expect(isValidPasscode('anything')).toBe(false)
  })

  it('ตรวจรหัสผ่าน', () => {
    expect(isValidPasscode('test-passcode-1')).toBe(true)
    expect(isValidPasscode('test-passcode-2')).toBe(false)
    expect(isValidPasscode('')).toBe(false)
  })
})

describe('จำกัดการเดารหัสผ่าน', () => {
  beforeEach(() => resetLoginLimit())

  it('ผิดครบ 5 ครั้ง = ล็อก 15 นาที และล้างเมื่อพ้นเวลา', () => {
    for (let i = 0; i < MAX_FAILS - 1; i++) expect(recordFailure('ip1', T0 + i)).toBe(0)
    expect(lockedForSec('ip1', T0 + 10)).toBe(0)
    expect(recordFailure('ip1', T0 + 10)).toBe(LOCK_MS / 1000)
    expect(lockedForSec('ip1', T0 + 20_000)).toBeGreaterThan(0)
    expect(lockedForSec('ip1', T0 + 10 + LOCK_MS + 1)).toBe(0)
  })

  it('นับแยกตาม key และผิดเก่านอกหน้าต่างเวลาไม่นับ', () => {
    for (let i = 0; i < MAX_FAILS - 1; i++) recordFailure('ip2', T0 + i)
    expect(lockedForSec('ip3', T0 + 5)).toBe(0)
    expect(recordFailure('ip2', T0 + WINDOW_MS + 1000)).toBe(0) // ครั้งเก่า ๆ หลุดหน้าต่างแล้ว
  })

  it('ล็อกอินสำเร็จ = ล้างประวัติ', () => {
    for (let i = 0; i < MAX_FAILS - 1; i++) recordFailure('ip4', T0 + i)
    recordSuccess('ip4')
    expect(recordFailure('ip4', T0 + 100)).toBe(0)
  })
})

describe('ตรวจ Origin', () => {
  it('Origin เดียวกับ host ผ่าน ; ต่างโฮสต์/ผิดรูปแบบไม่ผ่าน ; ไม่มี Origin ผ่าน', () => {
    expect(isSameOrigin('https://dash.example.com', 'dash.example.com')).toBe(true)
    expect(isSameOrigin('https://evil.example.net', 'dash.example.com')).toBe(false)
    expect(isSameOrigin('null', 'dash.example.com')).toBe(false)
    expect(isSameOrigin(null, 'dash.example.com')).toBe(true)
    expect(isSameOrigin('https://dash.example.com', null)).toBe(false)
  })
})
