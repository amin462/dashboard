// จำกัดการเดารหัสผ่านผู้ดูแล: ผิดครบ MAX_FAILS ครั้งภายใน WINDOW_MS → ล็อก LOCK_MS (นับแยกตาม IP)
// ที่เก็บอยู่ในหน่วยความจำของ instance (Vercel serverless แต่ละ instance นับแยกกัน) = กันการเดาแบบอัตโนมัติระดับพื้นฐาน
// ไม่ใช่ระบบกันโจมตีเต็มรูปแบบ → รหัสผ่านต้องยาวและเดายาก ; ใส่ now ได้เพื่อทดสอบ

export const MAX_FAILS = 5
export const WINDOW_MS = 10 * 60_000
export const LOCK_MS = 15 * 60_000
const MAX_TRACKED = 2000

type Entry = { fails: number[]; lockedUntil: number }
const store = new Map<string, Entry>()

function prune(now: number): void {
  if (store.size < MAX_TRACKED) return
  for (const [k, e] of store) if (e.lockedUntil <= now && e.fails.every((t) => now - t > WINDOW_MS)) store.delete(k)
  if (store.size >= MAX_TRACKED) store.clear() // กันหน่วยความจำโตไม่จำกัด
}

/** ถูกล็อกอยู่ไหม → วินาทีที่ต้องรอ (0 = ลองได้) */
export function lockedForSec(key: string, now: number = Date.now()): number {
  const e = store.get(key)
  if (!e || e.lockedUntil <= now) return 0
  return Math.ceil((e.lockedUntil - now) / 1000)
}

/** บันทึกการล็อกอินผิด 1 ครั้ง → วินาทีที่ถูกล็อก (0 = ยังไม่ล็อก) */
export function recordFailure(key: string, now: number = Date.now()): number {
  prune(now)
  const e = store.get(key) ?? { fails: [], lockedUntil: 0 }
  e.fails = e.fails.filter((t) => now - t <= WINDOW_MS)
  e.fails.push(now)
  if (e.fails.length >= MAX_FAILS) {
    e.lockedUntil = now + LOCK_MS
    e.fails = []
  }
  store.set(key, e)
  return lockedForSec(key, now)
}

/** ล็อกอินสำเร็จ → ล้างประวัติผิดของ key นี้ */
export function recordSuccess(key: string): void {
  store.delete(key)
}

export function resetLoginLimit(): void {
  store.clear()
}
