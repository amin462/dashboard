"use client";

import { addDays } from "../format";

type DateRangeFilterProps = {
  from?: string;
  to?: string;
  /** วันล่าสุดของข้อมูล (YYYY-MM-DD) ใช้เป็นปลายช่วงของปุ่ม 7 / 30 วัน */
  anchor: string | null;
  onChange: (range: { from?: string; to?: string }) => void;
};

export function DateRangeFilter({ from, to, anchor, onChange }: DateRangeFilterProps) {
  const presets: { label: string; title: string; range: { from?: string; to?: string }; disabled?: boolean }[] = [
    {
      label: "7 วัน",
      title: "7 วันล่าสุดของข้อมูล",
      range: anchor ? { from: addDays(anchor, -6), to: anchor } : {},
      disabled: !anchor,
    },
    {
      label: "30 วัน",
      title: "30 วันล่าสุดของข้อมูล",
      range: anchor ? { from: addDays(anchor, -29), to: anchor } : {},
      disabled: !anchor,
    },
    { label: "ทั้งหมด", title: "ล้างช่วงวันที่", range: {} },
  ];

  return (
    <div className="space-y-3 p-2.5">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            title={p.title}
            disabled={p.disabled}
            onClick={() => onChange(p.range)}
            className="btn btn-secondary h-8 px-3 text-[13px]"
          >
            {p.label}
          </button>
        ))}
      </div>
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
