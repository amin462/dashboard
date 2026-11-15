/**
 * ธีมกราฟกลาง (v2): สี / แกน / กริด / ขนาดแท่ง ใช้ร่วมกันทุกกราฟ
 * ห้ามใช้สีนอกชุดนี้ในกราฟ — ค่ามาจาก CSS variables ใน globals.css (สลับ light/dark อัตโนมัติ)
 */
export const C = {
  navy: "var(--navy)",
  navy2: "var(--navy-2)",
  amber: "var(--amber)",
  series2: "var(--series-2)",
  muted: "var(--muted-bar)",
  grid: "var(--grid)",
  ink2: "var(--ink-2)",
  ink3: "var(--ink-3)",
  surface: "var(--surface)",
} as const;

/** ซีรีส์ 2 ชุดที่ใช้ซ้ำ: ดินเผา = ทั้งหมด / กลุ่มแรก, เขียวเข้ม = กลุ่มที่สอง (นอกจังหวัด) */
export const SERIES = { primary: C.navy, secondary: C.series2 } as const;

export const AXIS_TICK = { fill: C.ink3, fontSize: 12 } as const;
export const AXIS_LINE = { stroke: C.grid } as const;
export const GRID = { stroke: C.grid, vertical: false } as const;

/** แท่งมุมบนมน radius 4 และกว้างเท่ากันทุกกราฟ */
export const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
export const BAR_SIZE = 24;

export const CHART_MARGIN = { top: 12, right: 8, bottom: 0, left: -12 } as const;

export type Tone = 1 | 2 | 3 | 4 | 5;
/** สเกล diverging 1→5 (ความพึงพอใจ, กลับมาเยือน) */
export const divColor = (t: Tone) => `var(--div-${t})`;
/** สีตัวอักษรบนช่วงสี diverging ที่ผ่าน contrast 4.5:1 */
export const divFg = (t: Tone) => `var(--div-fg-${t})`;

/** ป้ายสั้นของหมวด SUR-08 สำหรับแกน X (ขึ้นบรรทัดใหม่ด้วย "|") */
export const SHORT_INTEREST: Record<string, string> = {
  "อาหารและเครื่องดื่ม": "อาหาร|เครื่องดื่ม",
  "ของฝาก / ผลิตภัณฑ์ชุมชน": "ของฝาก|ชุมชน",
  "โรงแรม / ที่พัก / โฮมสเตย์": "ที่พัก|โฮมสเตย์",
  "บริการเดินทาง / ขนส่ง": "เดินทาง|ขนส่ง",
  "กิจกรรมท่องเที่ยว / นำเที่ยว": "กิจกรรม|นำเที่ยว",
};
