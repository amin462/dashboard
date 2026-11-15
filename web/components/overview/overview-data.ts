import { daily, multiFreq, round1, type FreqItem, type FreqResult } from "@/lib/survey/aggregate";
import { applyFilters } from "@/lib/survey/filters";
import { QUESTIONS, SMALL_N, SUR08_NONE, type Row } from "@/lib/survey/schema";

export const YALA = "จังหวัดยะลา";
/** นอกจังหวัด = ทุกตัวเลือกพื้นที่ที่ไม่ใช่ยะลา (รวมต่างประเทศ) ไม่นับ "ไม่ประสงค์ระบุ" */
export const OUTSIDE = QUESTIONS.sur02.choices.filter((c) => c !== YALA && !QUESTIONS.sur02.notSpecified?.includes(c));

/** แยกผู้ตอบเป็น 2 กลุ่มด้วย applyFilters ของ lib (ไม่นับเอง) */
export function splitByOrigin(rows: Row[]) {
  return { yala: applyFilters(rows, { origin: [YALA] }), outside: applyFilters(rows, { origin: OUTSIDE }) };
}

export type OriginCompare = {
  yala: FreqResult;
  outside: FreqResult;
  cats: { label: string; yala: FreqItem; outside: FreqItem }[];
  /** หมวดที่ 2 กลุ่มต่างกันมากสุด (จุดร้อยละ) */
  gap: { label: string; points: number; outsideHigher: boolean } | null;
  /** ผู้ตอบข้อ 8 ที่ยังขาดเพื่อให้แต่ละกลุ่มถึงเกณฑ์ขั้นต่ำ SMALL_N (0 = ถึงแล้ว) */
  need: { yala: number; outside: number };
};

const zero = (label: string): FreqItem => ({ label, count: 0, pct: 0 });

/** SUR-08 แยกกลุ่ม: multiFreq() ของแต่ละกลุ่ม (% ภายในกลุ่มของตัวเอง) ; ตัด "ไม่มีความสนใจเป็นพิเศษ" และ "อื่น ๆ" ออกจากแกน */
export function originCompare(rows: Row[]): OriginCompare {
  const { yala: yRows, outside: oRows } = splitByOrigin(rows);
  const yala = multiFreq(yRows);
  const outside = multiFreq(oRows);
  const cats = QUESTIONS.sur08.choices
    .filter((c) => c !== SUR08_NONE)
    .map((label) => ({
      label,
      yala: yala.items.find((i) => i.label === label) ?? zero(label),
      outside: outside.items.find((i) => i.label === label) ?? zero(label),
    }));
  let gap: OriginCompare["gap"] = null;
  if (yala.base > 0 && outside.base > 0) {
    for (const c of cats) {
      const d = round1(c.outside.pct - c.yala.pct);
      if (!gap || Math.abs(d) > gap.points) gap = { label: c.label, points: Math.abs(d), outsideHigher: d >= 0 };
    }
  }
  return { yala, outside, cats, gap, need: { yala: Math.max(0, SMALL_N - yala.base), outside: Math.max(0, SMALL_N - outside.base) } };
}

export function originTakeaway(oc: OriginCompare): string | undefined {
  const g = oc.gap;
  if (!g) return undefined;
  if (g.points === 0) return "คนยะลากับคนต่างถิ่นสนใจใกล้เคียงกันทุกหมวด";
  const [more, less] = g.outsideHigher ? ["คนต่างถิ่น", "คนในพื้นที่"] : ["คนในพื้นที่", "คนต่างถิ่น"];
  return `${more}สนใจ${g.label}มากกว่า${less} ${g.points.toFixed(1)} จุด`;
}

export type DailyPoint = { date: string; all: number; outsiders: number };

/** daily() ของทั้งหมด + daily() ของผู้มาจากนอกจังหวัด ซ้อนบนแกนวันเดียวกัน (วันที่ไม่มี = 0) */
export function dailyBoth(all: Row[], outside: Row[]): DailyPoint[] {
  const o = new Map(daily(outside).map((d) => [d.date, d.count]));
  return daily(all).map((d) => ({ date: d.date, all: d.count, outsiders: o.get(d.date) ?? 0 }));
}
