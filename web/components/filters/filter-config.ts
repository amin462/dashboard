import { QUESTIONS } from "@/lib/survey/schema";
import type { Filters } from "@/lib/survey/filters";
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

/** ข้อความย่อบนชิปวันที่ */
export function dateLabel(f: Filters): string {
  if (!f.from && !f.to) return "ช่วงวันที่";
  const a = f.from ? formatThaiDate(f.from) : "…";
  const b = f.to ? formatThaiDate(f.to) : "…";
  return `${a} – ${b}`;
}
