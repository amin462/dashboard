"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Filter,
  FilterX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  filtersFromSearchParams,
  filtersToQuery,
  hasFilters,
  type Filters,
} from "@/lib/survey/filters";
import { QUESTIONS } from "@/lib/survey/schema";
import { formatThaiDate } from "./nav-config";

type MultiFilterKey = "age" | "origin" | "companion" | "transport";

type FilterGroupConfig = {
  key: MultiFilterKey;
  label: string;
  options: string[];
};

const FILTER_GROUPS: FilterGroupConfig[] = [
  { key: "age", label: "ช่วงอายุ", options: QUESTIONS.sur01.choices },
  { key: "origin", label: "พื้นที่พำนัก", options: QUESTIONS.sur02.choices },
  {
    key: "companion",
    label: "ผู้ร่วมเดินทาง",
    options: QUESTIONS.sur03.choices,
  },
  { key: "transport", label: "พาหนะ", options: QUESTIONS.sur04.choices },
];

type MultiSelectProps = {
  group: FilterGroupConfig;
  selected: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  onChange: (next: string[]) => void;
};

function MultiSelectDropdown({
  group,
  selected,
  isOpen,
  onToggleOpen,
  onClose,
  onChange,
}: MultiSelectProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((x) => x !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const active = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors sm:w-auto sm:min-w-[146px] ${
          active
            ? "border-brand/40 bg-brand-soft text-brand-ink"
            : "border-line bg-surface text-ink-secondary hover:border-line-strong hover:text-ink"
        }`}
      >
        <span className="truncate">
          {group.label}
          {active ? ` (${selected.length})` : ""}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="group"
          aria-label={`ตัวเลือก${group.label}`}
          className="absolute left-0 z-40 mt-1.5 w-64 rounded-2xl border border-line bg-surface p-2 shadow-xl"
        >
          <div className="mb-1 flex items-center justify-between border-b border-line/70 px-2 py-1.5">
            <span className="text-xs font-bold text-ink-secondary">
              {group.label}
            </span>
            {active && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-semibold text-brand hover:underline"
              >
                ล้างกลุ่มนี้
              </button>
            )}
          </div>
          <div className="max-h-60 space-y-0.5 overflow-y-auto py-1">
            {group.options.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                    checked
                      ? "bg-brand-soft/70 font-semibold text-brand-ink"
                      : "text-ink-secondary hover:bg-surface-subtle hover:text-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(opt)}
                    className="h-4 w-4 rounded border-line-strong accent-brand"
                  />
                  <span className="leading-snug">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openKey, setOpenKey] = useState<MultiFilterKey | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  );

  const active = hasFilters(filters);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileDrawerOpen]);

  const updateFilters = (next: Filters) => {
    const query = filtersToQuery(next);
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const resetAll = () => {
    setOpenKey(null);
    router.replace(pathname, { scroll: false });
  };

  const chips = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];
    if (filters.from) {
      list.push({
        id: "from",
        label: `ตั้งแต่: ${formatThaiDate(filters.from)}`,
        onRemove: () => updateFilters({ ...filters, from: undefined }),
      });
    }
    if (filters.to) {
      list.push({
        id: "to",
        label: `ถึง: ${formatThaiDate(filters.to)}`,
        onRemove: () => updateFilters({ ...filters, to: undefined }),
      });
    }
    for (const g of FILTER_GROUPS) {
      for (const val of filters[g.key] ?? []) {
        list.push({
          id: `${g.key}:${val}`,
          label: `${g.label}: ${val}`,
          onRemove: () => {
            const nextVals = (filters[g.key] ?? []).filter((x) => x !== val);
            updateFilters({
              ...filters,
              [g.key]: nextVals.length ? nextVals : undefined,
            });
          },
        });
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pathname]);

  const activeCount = chips.length;

  const toggleMobileValue = (key: MultiFilterKey, val: string) => {
    const curr = filters[key] ?? [];
    const nextVals = curr.includes(val)
      ? curr.filter((x) => x !== val)
      : [...curr, val];
    updateFilters({
      ...filters,
      [key]: nextVals.length ? nextVals : undefined,
    });
  };

  return (
    <>
      <section
        aria-label="ตัวกรองข้อมูลแบบสำรวจ"
        className="no-print sticky top-16 z-20 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85"
      >
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          {/* แถบตัวกรองบนมือถือ (< md) — เปิด Drawer ใช้งานง่าย */}
          <div className="flex items-center justify-between gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-filter-drawer"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface-subtle px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
            >
              <SlidersHorizontal
                className="h-4 w-4 text-brand"
                aria-hidden="true"
              />
              <span>ตัวกรองข้อมูล</span>
              {activeCount > 0 && (
                <span className="tabular-nums rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white dark:bg-[#0d736b]">
                  {activeCount}
                </span>
              )}
            </button>

            {active && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink-secondary hover:bg-surface-muted hover:text-ink"
              >
                <FilterX className="h-3.5 w-3.5" aria-hidden="true" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>

          {/* แผงตัวกรองเดสก์ท็อปและแท็บเล็ต (>= md) */}
          <div className="hidden flex-wrap items-center gap-2.5 md:flex">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted">
              <Filter className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              <span>กรองตาม:</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-sm">
                <Calendar
                  className="h-4 w-4 shrink-0 text-ink-muted"
                  aria-hidden="true"
                />
                <span className="sr-only">ตั้งแต่วันที่</span>
                <input
                  type="date"
                  aria-label="ตั้งแต่วันที่"
                  value={filters.from ?? ""}
                  max={filters.to || undefined}
                  onChange={(e) =>
                    updateFilters({
                      ...filters,
                      from: e.target.value || undefined,
                    })
                  }
                  className="w-34 bg-transparent text-sm text-ink tabular-nums focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-sm">
                <span className="text-xs font-medium text-ink-muted">ถึง</span>
                <span className="sr-only">ถึงวันที่</span>
                <input
                  type="date"
                  aria-label="ถึงวันที่"
                  value={filters.to ?? ""}
                  min={filters.from || undefined}
                  onChange={(e) =>
                    updateFilters({
                      ...filters,
                      to: e.target.value || undefined,
                    })
                  }
                  className="w-34 bg-transparent text-sm text-ink tabular-nums focus:outline-none"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTER_GROUPS.map((group) => (
                <MultiSelectDropdown
                  key={group.key}
                  group={group}
                  selected={filters[group.key] ?? []}
                  isOpen={openKey === group.key}
                  onToggleOpen={() =>
                    setOpenKey((curr) =>
                      curr === group.key ? null : group.key
                    )
                  }
                  onClose={() => setOpenKey(null)}
                  onChange={(vals) =>
                    updateFilters({
                      ...filters,
                      [group.key]: vals.length ? vals : undefined,
                    })
                  }
                />
              ))}
            </div>

            {active && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-3 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <FilterX className="h-3.5 w-3.5" aria-hidden="true" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>

          {/* Chips แสดงตัวกรองที่ใช้งานอยู่ */}
          {chips.length > 0 && (
            <div
              aria-label="ตัวกรองที่กำลังใช้งาน"
              className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-2"
            >
              {chips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-ink"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`นำตัวกรอง ${chip.label} ออก`}
                    className="rounded-full p-0.5 transition-colors hover:bg-brand/15"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mobile Filter Drawer (ใช้งานง่ายบนหน้าจอ 375px) */}
      {mobileDrawerOpen && (
        <div
          id="mobile-filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="ตัวกรองข้อมูลแบบสำรวจ"
          className="no-print fixed inset-0 z-50 flex items-end justify-center md:hidden"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 flex max-h-[85dvh] w-full flex-col rounded-t-3xl border-t border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  className="h-4 w-4 text-brand"
                  aria-hidden="true"
                />
                <h2 className="text-base font-bold text-ink">
                  ตัวกรองข้อมูล
                </h2>
                {activeCount > 0 && (
                  <span className="tabular-nums rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-ink">
                    {activeCount} รายการ
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="ปิดหน้าต่างตัวกรอง"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-secondary hover:bg-surface-muted"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              {/* ช่วงวันที่ */}
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-ink-secondary uppercase">
                  ช่วงวันที่ส่งแบบสำรวจ
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block rounded-xl border border-line bg-surface-subtle px-3 py-2">
                    <span className="block text-[11px] font-semibold text-ink-muted">
                      ตั้งแต่วันที่
                    </span>
                    <input
                      type="date"
                      aria-label="ตั้งแต่วันที่"
                      value={filters.from ?? ""}
                      max={filters.to || undefined}
                      onChange={(e) =>
                        updateFilters({
                          ...filters,
                          from: e.target.value || undefined,
                        })
                      }
                      className="mt-0.5 w-full bg-transparent text-sm text-ink tabular-nums focus:outline-none"
                    />
                  </label>
                  <label className="block rounded-xl border border-line bg-surface-subtle px-3 py-2">
                    <span className="block text-[11px] font-semibold text-ink-muted">
                      ถึงวันที่
                    </span>
                    <input
                      type="date"
                      aria-label="ถึงวันที่"
                      value={filters.to ?? ""}
                      min={filters.from || undefined}
                      onChange={(e) =>
                        updateFilters({
                          ...filters,
                          to: e.target.value || undefined,
                        })
                      }
                      className="mt-0.5 w-full bg-transparent text-sm text-ink tabular-nums focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              {/* 4 กลุ่มตัวกรอง */}
              {FILTER_GROUPS.map((group) => {
                const selected = filters[group.key] ?? [];
                return (
                  <fieldset key={group.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <legend className="text-xs font-bold tracking-wide text-ink-secondary uppercase">
                        {group.label}
                      </legend>
                      {selected.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateFilters({ ...filters, [group.key]: undefined })
                          }
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          ล้างกลุ่มนี้
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {group.options.map((opt) => {
                        const checked = selected.includes(opt);
                        return (
                          <label
                            key={opt}
                            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                              checked
                                ? "border-brand/40 bg-brand-soft font-semibold text-brand-ink"
                                : "border-line bg-surface-subtle text-ink-secondary"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleMobileValue(group.key, opt)}
                              className="h-4 w-4 rounded border-line-strong accent-brand"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 border-t border-line bg-surface px-4 py-3">
              <button
                type="button"
                onClick={resetAll}
                disabled={!active}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-4 py-2.5 text-sm font-semibold text-ink-secondary disabled:opacity-45"
              >
                <FilterX className="h-4 w-4" aria-hidden="true" />
                <span>ล้างทั้งหมด</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white dark:bg-[#0d736b]"
              >
                ดูผลลัพธ์
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
