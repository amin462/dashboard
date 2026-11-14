import { freq, multiFreq, topItem, round1, bySlot, type FreqResult } from './aggregate'
import { SMALL_N, type Row } from './schema'

export type BusinessType = 'restaurant' | 'hotel' | 'shop' | 'tour'

export const BUSINESS_TYPES: { key: BusinessType; label: string }[] = [
  { key: 'restaurant', label: 'ร้านอาหารและเครื่องดื่ม' },
  { key: 'hotel', label: 'โรงแรม / ที่พัก / โฮมสเตย์' },
  { key: 'shop', label: 'ร้านค้า / ของฝาก' },
  { key: 'tour', label: 'นำเที่ยว / ขนส่ง' },
]

export type Insight = {
  title: string
  detail: string
  evidence: { label: string; value: string }[]
  /** ฐาน n ที่ใช้คำนวณข้อค้นพบนี้ */
  n: number
}

/** เกณฑ์ของกฎทั้งหมด (แก้ที่นี่ที่เดียว) */
export const THRESHOLDS = {
  hotelOutsideYalaPct: 40,
  shopLowSpendPct: 50,
  tourNoPrivateVehiclePct: 30,
  minN: SMALL_N,
}

export const INSIGHT_DISCLAIMER = 'ข้อเสนอเบื้องต้นจากข้อมูลผู้ตอบ'

const LOW_SPEND = ['ไม่เกิน 300 บาท', '301–600 บาท']
const HIGH_SPEND = ['1,001–2,000 บาท', 'มากกว่า 2,000 บาท']
const NO_PRIVATE = ['รถโดยสารสาธารณะ', 'รถเช่า', 'รถนำเที่ยว / รถทัวร์']

const pctStr = (count: number, base: number) =>
  `${count} คน (${base > 0 ? round1((count / base) * 100).toFixed(1) : '0.0'}%)`

function countOf(f: FreqResult, labels: string[]): number {
  return f.items.filter((i) => labels.includes(i.label)).reduce((s, i) => s + i.count, 0)
}

/** ฐานของข้อที่ไม่นับ "ไม่ประสงค์ระบุ/ยังประเมินไม่ได้" */
function specifiedBase(f: FreqResult, notSpecified: string[]): number {
  return f.base - countOf(f, notSpecified)
}

function channelInsight(rows: Row[]): Insight[] {
  const f = freq(rows, 'sur06')
  if (f.base < THRESHOLDS.minN) return []
  const top = topItem(f)
  if (!top) return []
  return [
    {
      title: `ช่องทางที่ผู้ตอบรู้จักสถานที่มากที่สุด: ${top.label}`,
      detail: `${INSIGHT_DISCLAIMER}: ลงโฆษณา/โพสต์ประชาสัมพันธ์ผ่านช่องทางนี้`,
      evidence: [
        { label: top.label, value: pctStr(top.count, f.base) },
        { label: 'ฐานผู้ตอบข้อ 6', value: `${f.base} คน` },
      ],
      n: f.base,
    },
  ]
}

function interestMetric(rows: Row[], choice: string, name: string): Insight[] {
  const f = multiFreq(rows)
  if (f.base < THRESHOLDS.minN) return []
  const it = f.items.find((i) => i.label === choice)
  const count = it?.count ?? 0
  return [
    {
      title: `ผู้ตอบสนใจ${name}`,
      detail: 'ตอบได้หลายข้อ ร้อยละคิดจากผู้ตอบข้อ 8 (รวมกันเกิน 100% ได้)',
      evidence: [
        { label: `สนใจ${name}`, value: pctStr(count, f.base) },
        { label: 'ฐานผู้ตอบข้อ 8', value: `${f.base} คน` },
      ],
      n: f.base,
    },
  ]
}

function restaurant(rows: Row[]): Insight[] {
  const out: Insight[] = interestMetric(rows, 'อาหารและเครื่องดื่ม', 'อาหารและเครื่องดื่ม')
  const comp = freq(rows, 'sur03')
  if (comp.base >= THRESHOLDS.minN) {
    const top = topItem(comp, ['ไม่ประสงค์ระบุ'])
    if (top?.label === 'ครอบครัว / เครือญาติ') {
      out.push({
        title: 'ครอบครัว / เครือญาติ เป็นกลุ่มผู้ร่วมเดินทางที่ใหญ่สุด',
        detail: `${INSIGHT_DISCLAIMER}: จัดเมนู/ที่นั่งสำหรับครอบครัว`,
        evidence: [
          { label: top.label, value: pctStr(top.count, comp.base) },
          { label: 'ฐานผู้ตอบข้อ 3', value: `${comp.base} คน` },
        ],
        n: comp.base,
      })
    }
  }
  const spend = freq(rows, 'sur07')
  const spendTop = topItem(spend, ['ยังประเมินไม่ได้', 'ไม่ประสงค์ระบุ'])
  if (spend.base >= THRESHOLDS.minN && spendTop) {
    out.push({
      title: `ช่วงค่าใช้จ่ายที่พบมากสุด: ${spendTop.label}`,
      detail: 'ใช้ประกอบการกำหนดราคาเมนู',
      evidence: [
        { label: spendTop.label, value: pctStr(spendTop.count, spend.base) },
        { label: 'ฐานผู้ตอบข้อ 7', value: `${spend.base} คน` },
      ],
      n: spend.base,
    })
  }
  if (rows.length >= THRESHOLDS.minN) {
    const slots = bySlot(rows).filter((s) => s.slot !== 'อื่น')
    const top = [...slots].sort((a, b) => b.count - a.count)[0]
    if (top && top.count > 0) {
      out.push({
        title: `ช่วงเวลาที่ผู้ตอบมามากสุด: ${top.slot}`,
        detail: 'ใช้วางแผนเวลาเปิดบริการและเตรียมวัตถุดิบ (เช้า 06–11, บ่าย 12–15, เย็น 16–19)',
        evidence: [
          { label: `ช่วง${top.slot}`, value: pctStr(top.count, rows.length) },
          { label: 'ฐานผู้ตอบทั้งหมด', value: `${rows.length} คน` },
        ],
        n: rows.length,
      })
    }
  }
  return out
}

function hotel(rows: Row[]): Insight[] {
  const out: Insight[] = interestMetric(rows, 'โรงแรม / ที่พัก / โฮมสเตย์', 'ที่พัก')
  const origin = freq(rows, 'sur02')
  const base = specifiedBase(origin, ['ไม่ประสงค์ระบุ'])
  if (base >= THRESHOLDS.minN) {
    const yala = countOf(origin, ['จังหวัดยะลา'])
    const outside = base - yala
    const pct = (outside / base) * 100
    const ev = [
      { label: 'ผู้มาจากนอกจังหวัดยะลา', value: pctStr(outside, base) },
      { label: 'ฐานผู้ตอบข้อ 2 (ไม่นับไม่ประสงค์ระบุ)', value: `${base} คน` },
    ]
    out.push(
      pct >= THRESHOLDS.hotelOutsideYalaPct
        ? {
            title: `ผู้มาจากนอกจังหวัดยะลาตั้งแต่ ${THRESHOLDS.hotelOutsideYalaPct}%`,
            detail: `${INSIGHT_DISCLAIMER}: โปรโมตแพ็กเกจพักค้างคืน`,
            evidence: ev,
            n: base,
          }
        : {
            title: 'สัดส่วนผู้มาจากนอกจังหวัดยะลา',
            detail: `ต่ำกว่าเกณฑ์ ${THRESHOLDS.hotelOutsideYalaPct}% ที่ใช้แนะนำแพ็กเกจพักค้างคืน`,
            evidence: ev,
            n: base,
          },
    )
  }
  const spend = freq(rows, 'sur07')
  const sBase = specifiedBase(spend, ['ยังประเมินไม่ได้', 'ไม่ประสงค์ระบุ'])
  if (sBase >= THRESHOLDS.minN) {
    const high = countOf(spend, HIGH_SPEND)
    out.push({
      title: 'ผู้ที่คาดว่าจะใช้จ่ายมากกว่า 1,000 บาท',
      detail: 'ใช้ประเมินกำลังซื้อของกลุ่มที่อาจพักค้างคืน',
      evidence: [
        { label: 'ค่าใช้จ่าย > 1,000 บาท', value: pctStr(high, sBase) },
        { label: 'ฐานผู้ตอบข้อ 7 (ไม่นับประเมินไม่ได้/ไม่ประสงค์ระบุ)', value: `${sBase} คน` },
      ],
      n: sBase,
    })
  }
  return out
}

function shop(rows: Row[]): Insight[] {
  const out: Insight[] = interestMetric(rows, 'ของฝาก / ผลิตภัณฑ์ชุมชน', 'ของฝาก / ผลิตภัณฑ์ชุมชน')
  const spend = freq(rows, 'sur07')
  const base = specifiedBase(spend, ['ยังประเมินไม่ได้', 'ไม่ประสงค์ระบุ'])
  if (base >= THRESHOLDS.minN) {
    const low = countOf(spend, LOW_SPEND)
    const pct = (low / base) * 100
    const ev = [
      { label: 'ค่าใช้จ่าย ≤ 600 บาท', value: pctStr(low, base) },
      { label: 'ฐานผู้ตอบข้อ 7 (ไม่นับประเมินไม่ได้/ไม่ประสงค์ระบุ)', value: `${base} คน` },
    ]
    out.push(
      pct > THRESHOLDS.shopLowSpendPct
        ? {
            title: 'ผู้ตอบส่วนใหญ่ใช้จ่ายไม่เกิน 600 บาท',
            detail: `${INSIGHT_DISCLAIMER}: เน้นสินค้าราคา ≤ 300 บาท`,
            evidence: ev,
            n: base,
          }
        : {
            title: 'สัดส่วนผู้ใช้จ่ายไม่เกิน 600 บาท',
            detail: 'ไม่ถึงเกณฑ์ "ส่วนใหญ่" (> 50%) ที่ใช้แนะนำสินค้าราคาไม่เกิน 300 บาท',
            evidence: ev,
            n: base,
          },
    )
  }
  const purpose = freq(rows, 'sur05')
  const top = topItem(purpose)
  if (purpose.base >= THRESHOLDS.minN && top) {
    out.push({
      title: `วัตถุประสงค์การมาที่พบมากสุด: ${top.label}`,
      detail: 'ใช้คัดเลือกรูปแบบสินค้าที่สอดคล้องกับเหตุผลที่มา',
      evidence: [
        { label: top.label, value: pctStr(top.count, purpose.base) },
        { label: 'ฐานผู้ตอบข้อ 5', value: `${purpose.base} คน` },
      ],
      n: purpose.base,
    })
  }
  return out
}

function tour(rows: Row[]): Insight[] {
  const out: Insight[] = []
  const f8 = multiFreq(rows)
  if (f8.base >= THRESHOLDS.minN) {
    const a = f8.items.find((i) => i.label === 'บริการเดินทาง / ขนส่ง')?.count ?? 0
    const b = f8.items.find((i) => i.label === 'กิจกรรมท่องเที่ยว / นำเที่ยว')?.count ?? 0
    out.push(
      {
        title: 'ผู้ตอบสนใจบริการเดินทาง / ขนส่ง',
        detail: 'ตอบได้หลายข้อ ร้อยละคิดจากผู้ตอบข้อ 8',
        evidence: [
          { label: 'บริการเดินทาง / ขนส่ง', value: pctStr(a, f8.base) },
          { label: 'ฐานผู้ตอบข้อ 8', value: `${f8.base} คน` },
        ],
        n: f8.base,
      },
      {
        title: 'ผู้ตอบสนใจกิจกรรมท่องเที่ยว / นำเที่ยว',
        detail: 'ตอบได้หลายข้อ ร้อยละคิดจากผู้ตอบข้อ 8',
        evidence: [
          { label: 'กิจกรรมท่องเที่ยว / นำเที่ยว', value: pctStr(b, f8.base) },
          { label: 'ฐานผู้ตอบข้อ 8', value: `${f8.base} คน` },
        ],
        n: f8.base,
      },
    )
  }
  const veh = freq(rows, 'sur04')
  const vBase = specifiedBase(veh, ['ไม่ประสงค์ระบุ'])
  if (vBase >= THRESHOLDS.minN) {
    const np = countOf(veh, NO_PRIVATE)
    const pct = (np / vBase) * 100
    const ev = [
      { label: 'ไม่ใช้พาหนะส่วนตัว (รถโดยสาร/รถเช่า/รถทัวร์)', value: pctStr(np, vBase) },
      { label: 'ฐานผู้ตอบข้อ 4 (ไม่นับไม่ประสงค์ระบุ)', value: `${vBase} คน` },
    ]
    out.push(
      pct >= THRESHOLDS.tourNoPrivateVehiclePct
        ? {
            title: `ผู้ไม่ใช้พาหนะส่วนตัวตั้งแต่ ${THRESHOLDS.tourNoPrivateVehiclePct}%`,
            detail: `${INSIGHT_DISCLAIMER}: เปิดบริการรับส่ง`,
            evidence: ev,
            n: vBase,
          }
        : {
            title: 'สัดส่วนผู้ไม่ใช้พาหนะส่วนตัว',
            detail: `ต่ำกว่าเกณฑ์ ${THRESHOLDS.tourNoPrivateVehiclePct}% ที่ใช้แนะนำบริการรับส่ง`,
            evidence: ev,
            n: vBase,
          },
    )
  }
  const comp = freq(rows, 'sur03')
  const top = topItem(comp, ['ไม่ประสงค์ระบุ'])
  if (comp.base >= THRESHOLDS.minN && top) {
    out.push({
      title: `ผู้ร่วมเดินทางที่พบมากสุด: ${top.label}`,
      detail: 'ใช้ออกแบบแพ็กเกจและขนาดกลุ่ม',
      evidence: [
        { label: top.label, value: pctStr(top.count, comp.base) },
        { label: 'ฐานผู้ตอบข้อ 3', value: `${comp.base} คน` },
      ],
      n: comp.base,
    })
  }
  return out
}

/** ข้อค้นพบตามประเภทธุรกิจ ; rows ทั้งหมด < 5 -> คืน [] ; แต่ละข้อมี n ของตัวเอง (>= 5 เสมอ) */
export function businessInsights(rows: Row[], type: BusinessType): Insight[] {
  if (rows.length < THRESHOLDS.minN) return []
  const specific =
    type === 'restaurant' ? restaurant(rows)
    : type === 'hotel' ? hotel(rows)
    : type === 'shop' ? shop(rows)
    : tour(rows)
  return [...specific, ...channelInsight(rows)]
}

/** ข้อค้นพบ 3 ข้อสำหรับหน้าภาพรวม (ไม่ผูกประเภทธุรกิจ) */
export function overviewInsights(rows: Row[]): Insight[] {
  if (rows.length < THRESHOLDS.minN) return []
  const out: Insight[] = []
  const age = freq(rows, 'sur01')
  const topAge = topItem(age, ['ไม่ประสงค์ระบุ'])
  if (age.base >= THRESHOLDS.minN && topAge) {
    out.push({
      title: `ช่วงอายุที่พบมากสุด: ${topAge.label}`,
      detail: 'สะท้อนกลุ่มผู้ตอบแบบสำรวจ ไม่ใช่ประชากรนักท่องเที่ยวทั้งหมด',
      evidence: [
        { label: topAge.label, value: pctStr(topAge.count, age.base) },
        { label: 'ฐานผู้ตอบข้อ 1', value: `${age.base} คน` },
      ],
      n: age.base,
    })
  }
  out.push(...channelInsight(rows))
  const spend = freq(rows, 'sur07')
  const top = topItem(spend, ['ยังประเมินไม่ได้', 'ไม่ประสงค์ระบุ'])
  if (spend.base >= THRESHOLDS.minN && top) {
    out.push({
      title: `ช่วงค่าใช้จ่ายที่พบมากสุด: ${top.label}`,
      detail: 'ใช้ประกอบการวางราคาสินค้า/บริการ',
      evidence: [
        { label: top.label, value: pctStr(top.count, spend.base) },
        { label: 'ฐานผู้ตอบข้อ 7', value: `${spend.base} คน` },
      ],
      n: spend.base,
    })
  }
  return out.slice(0, 3)
}
