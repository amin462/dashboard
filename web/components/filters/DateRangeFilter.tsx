"use client";

import { useState } from "react";
import { filterMonth, filterYear, monthRange, quickRange, yearRange, type MonthInfo, type QuickRangeKind } from "@/lib/survey/filters";
import { addDays, bangkokDate } from "../format";
import { formatThaiMonthShort } from "./filter-config";

export type ResearchRange = { from?: string; to?: string };
type Range = { from?: string; to?: string };

type DateRangeFilterProps = {
  from?: string;
  to?: string;
  /** วันล่าสุดของข้อมูล (YYYY-MM-DD) ใช้เป็นปลายช่วงของปุ่ม 7 / 30 วัน */
  anchor: string | null;
  /** เดือนที่มีข้อมูล (ใหม่ → เก่า) ใช้เลือกเดือน/ปี */
  months?: MonthInfo[];
  /** ช่วงข้อมูลวิจัย (วันตัดข้อมูลของรายงาน) ; ไม่มี = ซ่อนปุ่ม */
  research?: ResearchRange | null;
  onChange: (range: Range) => void;
};

const btn = "btn btn-secondary h-8 px-3 text-[13px]";
const btnOn = "btn h-8 border border-amber/60 bg-amber-soft px-3 text-[13px] font-medium text-navy";

/** ปุ่มช่วงเวลา: ลัด (7/30 วัน, เดือนนี้/ที่แล้ว, ปีนี้, ช่วงวิจัย) + เลือกปี/เดือน (พ.ศ.) + กำหนดวันเอง */
export function DateRangeFilter({ from, to, anchor, months = [], research, onChange }: DateRangeFilterProps) {
  const current = { from, to };
  const years = Array.from(new Set(months.map((m) => m.year))); // ใหม่ → เก่า
  const selMonth = filterMonth(current);
  const selYear = filterYear(current);
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const year = pickedYear ?? (selMonth ? Number(selMonth.slice(0, 4)) : selYear) ?? years[0] ?? null;
  const monthsOfYear = months.filter((m) => m.year === year).sort((a, b) => a.month - b.month);

  const today = () => bangkokDate(new Date().toISOString()) ?? "";
  const quick = (kind: QuickRangeKind) => quickRange(kind, today()) ?? {};
  const quickButtons: { label: string; title: string; kind: QuickRangeKind }[] = [
    { label: "เดือนนี้", title: "ตั้งแต่ต้นถึงสิ้นเดือนปัจจุบัน", kind: "thisMonth" },
    { label: "เดือนที่แล้ว", title: "ทั้งเดือนที่ผ่านมา", kind: "lastMonth" },
    { label: "ปีนี้", title: "ตั้งแต่ 1 ม.ค. ถึง 31 ธ.ค. ของปีปัจจุบัน", kind: "thisYear" },
  ];
  const researchOn = Boolean(research && (research.from || research.to) && research.from === from && research.to === to);

  return (
    <div className="space-y-3 p-2.5">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" title="7 วันล่าสุดของข้อมูล" disabled={!anchor} onClick={() => anchor && onChange({ from: addDays(anchor, -6), to: anchor })} className={btn}>
          7 วัน
        </button>
        <button type="button" title="30 วันล่าสุดของข้อมูล" disabled={!anchor} onClick={() => anchor && onChange({ from: addDays(anchor, -29), to: anchor })} className={btn}>
          30 วัน
        </button>
        {quickButtons.map((b) => (
          <button key={b.kind} type="button" title={b.title} onClick={() => onChange(quick(b.kind))} className={btn}>
            {b.label}
          </button>
        ))}
        {research && (research.from || research.to) && (
          <button
            type="button"
            title="ช่วงวันที่ตัดข้อมูลสำหรับรายงานวิจัย (ตัวเลขตรงกับเล่ม)"
            aria-pressed={researchOn}
            onClick={() => onChange({ from: research.from, to: research.to })}
            className={researchOn ? btnOn : btn}
          >
            ช่วงข้อมูลวิจัย
          </button>
        )}
        <button type="button" title="ล้างช่วงวันที่" onClick={() => onChange({})} className={btn}>
          ทั้งหมด
        </button>
      </div>

      {months.length > 0 && (
        <div className="space-y-1.5">
          <span className="type-meta text-ink-3">เลือกเดือน/ปี (เฉพาะที่มีข้อมูล)</span>
          <div className="flex flex-wrap gap-1.5">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                aria-pressed={selYear === y}
                onClick={() => {
                  setPickedYear(y);
                  onChange(yearRange(y));
                }}
                className={selYear === y ? btnOn : btn}
              >
                ทั้งปี {y + 543}
              </button>
            ))}
          </div>
          {years.length > 1 && (
            <label className="block">
              <span className="sr-only">ปี</span>
              <select className="field" value={year ?? ""} onChange={(e) => setPickedYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    ปี พ.ศ. {y + 543}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="flex flex-wrap gap-1.5">
            {monthsOfYear.map((m) => {
              const on = selMonth === m.ym;
              return (
                <button
                  key={m.ym}
                  type="button"
                  aria-pressed={on}
                  title={`${m.count.toLocaleString("th-TH")} ชุด`}
                  onClick={() => onChange(monthRange(m.ym) ?? {})}
                  className={on ? btnOn : btn}
                >
                  {formatThaiMonthShort(m.ym)}
                  <span className="ml-1 text-ink-3">({m.count.toLocaleString("th-TH")})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="block">
        <span className="type-meta text-ink-3">ตั้งแต่วันที่</span>
        <input
          type="date"
          className="field mt-1"
          value={from ?? ""}
          max={to || undefined}
          onChange={(e) => onChange({ from: e.target.value || undefined, to })}
        />
      </label>
      <label className="block">
        <span className="type-meta text-ink-3">ถึงวันที่</span>
        <input
          type="date"
          className="field mt-1"
          value={to ?? ""}
          min={from || undefined}
          onChange={(e) => onChange({ from, to: e.target.value || undefined })}
        />
      </label>
    </div>
  );
}
