/** จำกัดจำนวนครั้งต่อ IP แบบ sliding window ในหน่วยความจำ (best-effort ต่อ instance ของ serverless) */
const hits = new Map<string, number[]>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { ok: boolean; retryAfterSec: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000)) }
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
  }
  return { ok: true, retryAfterSec: 0 }
}

export function resetRateLimit() {
  hits.clear()
}
