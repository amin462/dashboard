// กัน CSRF ชั้นที่ 2 สำหรับ API ผู้ดูแลที่เขียนข้อมูล (ชั้นแรกคือ cookie SameSite=Strict)
// คำขอจากเบราว์เซอร์ที่ส่ง Origin มา ต้องเป็นโฮสต์เดียวกับเว็บ ; ไม่มี Origin (เช่นสคริปต์/curl ที่มี cookie เอง) = ผ่าน

export function isSameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) return true
  if (!host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
