"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type FilterChipProps = {
  label: string;
  /** จำนวนที่เลือกอยู่ (0 = ไม่ active) */
  count: number;
  /** ปุ่ม "ล้างกลุ่มนี้" ในหัวป๊อปโอเวอร์ */
  onClear: () => void;
  /** แสดง (n) ต่อท้ายชื่อเมื่อ active (ปิดสำหรับชิปวันที่) */
  showCount?: boolean;
  /** ป๊อปโอเวอร์กว้างขึ้น (ตัวกรองวันที่) */
  wide?: boolean;
  children: ReactNode;
};

/** ชิปตัวกรอง: กดแล้วเปิดป๊อปโอเวอร์ (Esc / คลิกนอกกรอบเพื่อปิด) */
export function FilterChip({ label, count, onClear, showCount = true, wide = false, children }: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = count > 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] whitespace-nowrap transition-colors duration-150 ${
          active
            ? "border-amber/60 bg-amber-soft font-medium text-navy"
            : "border-transparent bg-surface text-ink-2 shadow-[0_1px_2px_rgb(20_40_80/.08)] hover:bg-surface-2"
        }`}
      >
        {label}
        {active && showCount && <span className="font-semibold">({count})</span>}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="group"
          aria-label={label}
          className={`absolute top-full left-0 z-40 mt-1 ${wide ? "w-80" : "w-64"} max-w-[90vw] rounded-xl bg-surface p-1 shadow-[0_8px_24px_rgb(20_40_80/.16)]`}
        >
          {active && (
            <div className="flex justify-end px-2 pt-1">
              <button type="button" onClick={onClear} className="type-meta text-navy hover:underline">
                ล้างกลุ่มนี้
              </button>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
