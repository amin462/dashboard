"use client";

import { BottomSheet } from "../ui/BottomSheet";
import { CheckList } from "./CheckList";
import { DateRangeFilter } from "./DateRangeFilter";
import { FILTER_GROUPS, countActive } from "./filter-config";
import type { Filters } from "@/lib/survey/filters";

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  anchor: string | null;
  update: (next: Filters) => void;
  reset: () => void;
};

/** มือถือ: ตัวกรองทั้งหมดใน bottom sheet เดียว */
export function FilterSheet({ open, onClose, filters, anchor, update, reset }: FilterSheetProps) {
  const active = countActive(filters);
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={active > 0 ? `ตัวกรอง (${active})` : "ตัวกรอง"}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={reset} disabled={active === 0} className="btn btn-secondary flex-1">
            ล้างทั้งหมด
          </button>
          <button type="button" onClick={onClose} className="btn btn-primary flex-1">
            ดูผลลัพธ์
          </button>
        </div>
      }
    >
      <div className="divide-y divide-line">
        <section className="py-2">
          <h3 className="px-4 pt-1 type-section">ช่วงวันที่</h3>
          <div className="px-2">
            <DateRangeFilter from={filters.from} to={filters.to} anchor={anchor} onChange={(r) => update({ ...filters, ...r })} />
          </div>
        </section>
        {FILTER_GROUPS.map((g) => (
          <section key={g.key} className="py-2">
            <h3 className="px-4 py-1 type-section">{g.label}</h3>
            <div className="px-2">
              <CheckList
                large
                options={g.options}
                selected={filters[g.key] ?? []}
                onChange={(vals) => update({ ...filters, [g.key]: vals.length ? vals : undefined })}
              />
            </div>
          </section>
        ))}
      </div>
    </BottomSheet>
  );
}
