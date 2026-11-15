import { QUESTIONS } from "@/lib/survey/schema";
import { filterMonth, filterYear, type Filters } from "@/lib/survey/filters";
import { formatThaiDate } from "../format";

export type MultiFilterKey = "age" | "origin" | "companion" | "transport";

export const FILTER_GROUPS: { key: MultiFilterKey; label: string; options: string[] }[] = [
  { key: "age", label: "อายุ", options: QUESTIONS.sur01.choices },
  { key: "origin", label: "พื้นที่", options: QUESTIONS.sur02.choices },
  { key: "companion", label: "ผู้ร่วมเดินทาง", options: QUESTIONS.sur03.choices },
  { key: "transport", label: "พาหนะ", options: QUESTIONS.sur04.choices },
];

/** จำนวนเงื่อนไขที่ใช้อยู่ (ช่วงวันที่นับเป็น 1) */
export function countActive(f: Filters): number {
  return (f.from || f.to ? 1 : 0) + FILTER_GROUPS.reduce((n, g) => n + (f[g.key]?.length ?? 0), 0);
}

/** เดือน+ปี พ.ศ. จาก 'YYYY-MM' เช่น "พ.ย. 2569" */
export function formatThaiMonthShort(ym: string): string {
  const d = new Date(`${ym}-15T12:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return ym;
  return new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", month: "short", year: "numeric" }).format(d);
}

/** ข้อความย่อบนชิปวันที่ (ทั้งเดือน/ทั้งปี/ช่วงวิจัย แสดงชื่อสั้น) */
export function dateLabel(f: Filters, research?: { from?: string; to?: string } | null): string {
  if (!f.from && !f.to) return "ช่วงวันที่";
  if (research && (research.from || research.to) && research.from === f.from && research.to === f.to) return "ช่วงข้อมูลวิจัย";
  const ym = filterMonth(f);
  if (ym) return formatThaiMonthShort(ym);
  const y = filterYear(f);
  if (y) return `ปี ${y + 543}`;
  const a = f.from ? formatThaiDate(f.from) : "…";
  const b = f.to ? formatThaiDate(f.to) : "…";
  return `${a} – ${b}`;
}
