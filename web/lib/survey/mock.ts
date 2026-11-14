import { QUESTIONS, type Code, type RawRow } from './schema'

/** PRNG แบบกำหนด seed (mulberry32) -> ผลลัพธ์เหมือนเดิมทุกครั้ง */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rng = () => number

function pickW<T>(rng: Rng, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let x = rng() * total
  for (let i = 0; i < items.length; i++) {
    x -= weights[i]
    if (x < 0) return items[i]
  }
  return items[items.length - 1]
}

function choices(code: Code) {
  return QUESTIONS[code].choices
}

const OTHER_TEXT: Partial<Record<Code, string[]>> = {
  sur02: ['กรุงเทพมหานคร', 'ประเทศมาเลเซีย', 'จังหวัดภูเก็ต'],
  sur03: ['เดินทางกับเพื่อนร่วมงาน'],
  sur04: ['รถตู้ส่วนบุคคล', 'เดินเท้า'],
  sur05: ['มาทำบุญ', 'มาตามหาบรรพบุรุษ'],
  sur06: ['ผ่านมาเห็นเอง', 'ข่าวโทรทัศน์'],
  sur08: ['ที่จอดรถ', 'ห้องน้ำสะอาด'],
}

const COMMENTS = [
  'ควรมีป้ายบอกทางชัดเจนกว่านี้',
  'ห้องน้ำควรเพิ่มจำนวน',
  'อยากให้มีร้านอาหารใกล้วัด',
  'บรรยากาศดีมาก สงบ',
  'ที่จอดรถไม่เพียงพอวันหยุด',
  'ควรมีไกด์อธิบายประวัติ',
  'อยากให้มีของฝากขายมากขึ้น',
  'ควรประชาสัมพันธ์ทาง TikTok',
  'สถานที่สวยงามน่าประทับใจ',
  'ทางเดินในถ้ำควรมีไฟเพิ่ม',
]

// สัดส่วนชั่วโมง (เวลาไทย) ที่ผู้ตอบแบบสำรวจมา: เช้า-บ่ายหนาแน่น
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 5, 20]
const HOUR_W = [4, 8, 12, 14, 10, 6, 8, 9, 7, 6, 4, 2, 1, 1]

const BASE_DAY_UTC = Date.UTC(2026, 10, 1) // 1 พ.ย. 2569 (ค.ศ. 2026) 00:00 UTC
const DAYS = 14

/** สร้างข้อมูลจำลอง n แถว (ค่าเริ่มต้น 300, seed 42) — deterministic */
export function makeMock(n = 300, seed = 42): RawRow[] {
  const rng = mulberry32(seed)
  const rows: RawRow[] = []
  for (let i = 0; i < n; i++) {
    const day = pickW(rng, Array.from({ length: DAYS }, (_, d) => d), [1, 1, 2, 3, 1, 1, 2, 3, 1, 1, 2, 3, 4, 3])
    const hour = pickW(rng, HOURS, HOUR_W)
    const minute = Math.floor(rng() * 60)
    const sec = Math.floor(rng() * 60)
    // เวลาไทย = UTC+7 -> ลบ 7 ชม. ให้เป็น UTC
    const ts = BASE_DAY_UTC + day * 86400000 + ((hour - 7) * 60 + minute) * 60000 + sec * 1000

    const row: RawRow = {
      id: `mock-${String(i + 1).padStart(4, '0')}`,
      source: 'seed',
      submitted_at: new Date(ts).toISOString(),
      is_complete: false,
    }

    const r = rng()
    const failScreen = r < 0.03
    const noConsent = !failScreen && r < 0.05
    const missingRequired = !failScreen && !noConsent && r < 0.08
    row.scr01 = 'ใช่'
    row.scr02 = failScreen ? 'ไม่ใช่' : 'ใช่'
    row.con01 = noConsent ? 'ไม่ยินยอม' : 'ยินยอม'

    const other = (code: Code) => pickW(rng, OTHER_TEXT[code] ?? [''], (OTHER_TEXT[code] ?? ['']).map(() => 1))
    const single = (code: Code, w: number[], otherP = 0.03): string => {
      if (OTHER_TEXT[code] && rng() < otherP) return other(code)
      return pickW(rng, choices(code), w)
    }

    row.sur01 = single('sur01', [18, 30, 24, 16, 8, 4], 0)
    row.sur02 = single('sur02', [30, 22, 18, 12, 10, 3, 5], 0.02)
    row.sur03 = single('sur03', [8, 38, 25, 18, 7, 4])
    row.sur04 = single('sur04', [48, 30, 6, 5, 7, 4])
    row.sur05 = single('sur05', [35, 22, 30, 13])
    row.sur06 = single('sur06', [42, 20, 22, 10, 6])
    row.sur07 = single('sur07', [25, 33, 20, 9, 4, 6, 3], 0)

    const picks = choices('sur08').slice(0, 5)
    const w8 = [60, 45, 15, 12, 14]
    const chosen = picks.filter((_, k) => rng() * 100 < w8[k])
    if (chosen.length === 0) chosen.push(rng() < 0.7 ? 'ไม่มีความสนใจเป็นพิเศษ' : picks[0])
    else if (rng() < 0.03) chosen.push('ไม่มีความสนใจเป็นพิเศษ') // ข้อมูลขัดแย้ง
    if (rng() < 0.03) chosen.push(other('sur08'))
    row.sur08 = chosen.join(', ')

    row.sur09 = pickW(rng, choices('sur09'), [38, 40, 14, 3, 1, 4])
    row.sur10 = single('sur10', [48, 36, 13, 3], 0)
    row.sur11 = rng() < 0.3 ? COMMENTS[Math.floor(rng() * COMMENTS.length)] : null

    // ข้ามข้อไม่บังคับ ~8%
    for (const code of ['sur05', 'sur06', 'sur07', 'sur08', 'sur09', 'sur10'] as Code[]) {
      if (rng() < 0.08) row[code] = null
    }
    if (missingRequired) {
      const code = pickW(rng, ['sur01', 'sur02', 'sur03', 'sur04'] as Code[], [1, 1, 1, 1])
      row[code] = null
    }

    row.is_complete =
      row.scr01 === 'ใช่' && row.scr02 === 'ใช่' && row.con01 === 'ยินยอม' &&
      !!row.sur01 && !!row.sur02 && !!row.sur03 && !!row.sur04
    rows.push(row)
  }
  return rows
}
