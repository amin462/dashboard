"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { SmallSampleBadge } from "./SmallSampleBadge";

export type ChartTableData = {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
};

type ChartCardProps = {
  title: string;
  subtitle?: string;
  base: number;
  skipped?: number;
  notSpecified?: number;
  unit?: string;
  extraNote?: string;
  tableData?: ChartTableData;
  headerAction?: ReactNode;
  children: ReactNode;
};

export function ChartCard({
  title,
  subtitle,
  base,
  skipped = 0,
  notSpecified = 0,
  unit = "คน",
  extraNote,
  tableData,
  headerAction,
  children,
}: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section className="print-card flex flex-col rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/70 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold leading-snug text-ink sm:text-[1.0625rem]">
              {title}
            </h2>
            {base > 0 && <SmallSampleBadge n={base} />}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
          )}
        </div>

        <div className="no-print flex shrink-0 items-center gap-2">
          {headerAction}
          {tableData && (
            <button
              type="button"
              onClick={() => setShowTable((prev) => !prev)}
              aria-pressed={showTable}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
            >
              {showTable ? (
                <>
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>ดูกราฟ</span>
                </>
              ) : (
                <>
                  <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>ดูเป็นตาราง</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5">
        {showTable && tableData ? (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">{tableData.caption ?? title}</caption>
              <thead>
                <tr className="border-b border-line bg-surface-subtle text-xs font-semibold text-ink-secondary">
                  {tableData.headers.map((header, idx) => (
                    <th
                      key={header}
                      scope="col"
                      className={`px-3.5 py-2.5 ${idx > 0 ? "text-right" : ""}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {tableData.rows.map((row, rIdx) => (
                  <tr
                    key={`${rIdx}-${String(row[0])}`}
                    className="hover:bg-surface-subtle/60"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-3.5 py-2.5 ${
                          cIdx > 0
                            ? "tabular-nums text-right font-medium text-ink"
                            : "text-ink"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 bg-surface-subtle/60 px-4 py-2.5 text-xs text-ink-muted sm:px-5">
        <p className="tabular-nums">
          ฐาน <strong className="font-semibold text-ink-secondary">n = {base.toLocaleString("th-TH")} {unit}</strong>
          {" · "}ไม่ตอบ {skipped.toLocaleString("th-TH")} {unit}
          {" · "}ไม่ประสงค์ระบุ {notSpecified.toLocaleString("th-TH")} {unit}
        </p>
        {extraNote && (
          <span className="font-medium text-ink-secondary">{extraNote}</span>
        )}
      </div>
    </section>
  );
}
