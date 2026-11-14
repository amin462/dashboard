"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatThaiDate } from "../format";
import type { DailyPoint } from "./overview-data";

const DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** ระดับความเข้มแบบขั้น (ให้ตัวอักษรผ่าน contrast ทุกขั้น): ส่วนผสมของ navy-solid กับพื้นการ์ด */
const LEVELS = [
  { mix: 20, light: true },
  { mix: 38, light: true },
  { mix: 82, light: false },
  { mix: 100, light: false },
];
const levelOf = (count: number, max: number) => {
  const r = count / max;
  return r <= 0.25 ? 0 : r <= 0.5 ? 1 : r <= 0.75 ? 2 : 3;
};

/** ปฏิทินเดือนเล็ก: วันที่มีผู้ตอบไล่ความเข้มกรมท่า, วันที่มากสุดเป็นอำพัน (ค่ามาจาก daily() ของ lib) */
export function MonthHeat({ data }: { data: DailyPoint[] }) {
  const { max, peakDate, months } = useMemo(() => {
    let m = 0;
    let p = "";
    for (const d of data) {
      if (d.all > m) {
        m = d.all;
        p = d.date;
      }
    }
    const set = Array.from(new Set(data.map((d) => d.date.slice(0, 7)))).sort();
    return { max: m, peakDate: p, months: set };
  }, [data]);
  const byDate = useMemo(() => new Map(data.map((d) => [d.date, d.all])), [data]);

  const [picked, setPicked] = useState<string | null>(null);
  const ym = picked && months.includes(picked) ? picked : (peakDate || months[0] || "").slice(0, 7);
  const idx = months.indexOf(ym);
  if (!ym || max === 0) return null;

  const [y, mo] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, mo - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-[280px] lg:mx-0 lg:w-[232px]">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPicked(months[idx - 1])}
          disabled={idx <= 0}
          aria-label="เดือนก่อนหน้า"
          className="no-print btn btn-secondary h-7 w-7 px-0 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="font-semibold text-ink">
          {MONTHS[mo - 1]} {y + 543}
        </p>
        <button
          type="button"
          onClick={() => setPicked(months[idx + 1])}
          disabled={idx >= months.length - 1}
          aria-label="เดือนถัดไป"
          className="no-print btn btn-secondary h-7 w-7 px-0 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center type-meta text-ink-3" aria-hidden="true">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <ul className="mt-1 grid grid-cols-7 gap-1" aria-label={`ปฏิทินจำนวนผู้ตอบรายวัน ${MONTHS[mo - 1]} ${y + 543}`}>
        {cells.map((date, i) => {
          if (!date) return <li key={`e${i}`} aria-hidden="true" />;
          const count = byDate.get(date) ?? 0;
          const peak = date === peakDate;
          const lv = count > 0 ? LEVELS[levelOf(count, max)] : null;
          const style = peak
            ? { backgroundColor: "var(--amber)", color: "var(--amber-fg)" }
            : lv
              ? {
                  backgroundColor: `color-mix(in srgb, var(--navy-solid) ${lv.mix}%, var(--surface))`,
                  color: lv.light ? "var(--ink)" : "#fff",
                }
              : undefined;
          return (
            <li
              key={date}
              title={`${formatThaiDate(date)}: ${count} คน${peak ? " (มากที่สุด)" : ""}`}
              aria-label={`${formatThaiDate(date)} ${count} คน${peak ? " มากที่สุด" : ""}`}
              className={`flex aspect-square items-center justify-center rounded-md text-[12px] ${count === 0 ? "bg-surface-2 text-ink-3" : "font-medium"} ${peak ? "font-semibold" : ""}`}
              style={style}
            >
              {Number(date.slice(8))}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 type-meta text-ink-3">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" aria-hidden="true" />
          วันที่ผู้ตอบมากสุด ({max} คน)
        </span>
        <span>เข้มขึ้น = มากขึ้น</span>
      </p>
    </div>
  );
}
