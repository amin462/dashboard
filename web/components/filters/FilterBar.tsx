"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CheckList } from "./CheckList";
import { DateRangeFilter } from "./DateRangeFilter";
import { FilterChip } from "./FilterChip";
import { FilterSheet } from "./FilterSheet";
import { FILTER_GROUPS, countActive, dateLabel } from "./filter-config";
import { useResultCount } from "./result-count";
import { useFilters } from "./useFilters";

/** แถวตัวกรอง 44px (sticky ใต้ top bar): ชิปดรอปดาวน์ ≥1024px, ปุ่มเดียว + bottom sheet บนจอเล็ก */
export function FilterBar({ anchor }: { anchor: string | null }) {
  const { filters, update, reset } = useFilters();
  const [sheetOpen, setSheetOpen] = useState(false);
  const result = useResultCount();
  const active = countActive(filters);
  const dateActive = Boolean(filters.from || filters.to);

  return (
    <section aria-label="ตัวกรองข้อมูล" className="no-print sticky top-14 z-20 h-11 bg-canvas">
      <div className="mx-auto flex h-full max-w-[1240px] items-center gap-2 px-4 lg:px-8">
        {/* จอเล็ก */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] lg:hidden ${
            active > 0 ? "border-amber/60 bg-amber-soft font-medium text-navy" : "border-transparent bg-surface text-ink-2 shadow-[0_1px_2px_rgb(20_40_80/.08)]"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          ตัวกรอง{active > 0 && ` (${active})`}
        </button>

        {/* จอใหญ่ */}
        <div className="hidden items-center gap-2 lg:flex">
          <FilterChip label={dateLabel(filters)} count={dateActive ? 1 : 0} showCount={false} onClear={() => update({ ...filters, from: undefined, to: undefined })}>
            <DateRangeFilter from={filters.from} to={filters.to} anchor={anchor} onChange={(r) => update({ ...filters, ...r })} />
          </FilterChip>
          {FILTER_GROUPS.map((g) => {
            const selected = filters[g.key] ?? [];
            return (
              <FilterChip key={g.key} label={g.label} count={selected.length} onClear={() => update({ ...filters, [g.key]: undefined })}>
                <CheckList
                  options={g.options}
                  selected={selected}
                  onChange={(vals) => update({ ...filters, [g.key]: vals.length ? vals : undefined })}
                />
              </FilterChip>
            );
          })}
          {active > 0 && (
            <button type="button" onClick={reset} className="px-1 text-[13px] text-navy hover:underline">
              ล้าง
            </button>
          )}
        </div>

        <p className="ml-auto whitespace-nowrap text-ink-2" aria-live="polite">
          {result ? (
            <>
              <strong className="font-semibold text-ink">{result.filtered.toLocaleString("th-TH")}</strong> คน
              {result.filtered !== result.total && (
                <span className="hidden text-ink-3 sm:inline"> จาก {result.total.toLocaleString("th-TH")}</span>
              )}
            </>
          ) : (
            <span className="text-ink-3">—</span>
          )}
        </p>
      </div>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} filters={filters} anchor={anchor} update={update} reset={reset} />
    </section>
  );
}
