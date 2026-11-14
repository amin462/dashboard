import { round1, type CrosstabResult } from "@/lib/survey/aggregate";
import { QUESTIONS } from "@/lib/survey/schema";
import { SmallSampleBadge } from "./SmallSampleBadge";

type CrosstabTableProps = {
  result: CrosstabResult;
  title: string;
  subtitle?: string;
};

export function CrosstabTable({
  result,
  title,
  subtitle,
}: CrosstabTableProps) {
  const maxCell = Math.max(1, ...result.cells.flat());
  const isMultiCol = QUESTIONS[result.b].type === "multi";

  return (
    <section className="print-card flex flex-col rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line/70 px-4 py-4 sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-ink sm:text-[1.0625rem]">
              {title}
            </h2>
            {result.n > 0 && <SmallSampleBadge n={result.n} />}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
          )}
        </div>
        <span className="rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-secondary">
          Heatmap ความถี่ (คน)
        </span>
      </div>

      {result.n === 0 ? (
        <div className="p-6 text-center text-sm text-ink-muted">
          ไม่มีข้อมูลที่ตอบครบทั้งสองข้อในกลุ่มที่เลือก
        </div>
      ) : (
        <div className="overflow-x-auto p-4 sm:p-5">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-line bg-surface-subtle text-xs font-semibold text-ink-secondary">
                <th scope="col" className="px-3 py-2.5 text-left">
                  {QUESTIONS[result.a].short} \ {QUESTIONS[result.b].short}
                </th>
                {result.colLabels.map((col) => (
                  <th key={col} scope="col" className="px-3 py-2.5 text-right">
                    {col}
                  </th>
                ))}
                <th
                  scope="col"
                  className="border-l border-line px-3 py-2.5 text-right font-bold text-ink"
                >
                  {isMultiCol ? "รวมครั้ง" : "รวม (คน)"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {result.rowLabels.map((rowLabel, i) => {
                const rowSum = result.rowTotals[i] ?? 0;
                return (
                  <tr key={rowLabel} className="hover:bg-surface-subtle/50">
                    <th
                      scope="row"
                      className="px-3 py-2.5 text-left font-medium text-ink"
                    >
                      {rowLabel}
                    </th>
                    {result.colLabels.map((colLabel, j) => {
                      const val = result.cells[i]?.[j] ?? 0;
                      const intensity = val > 0 ? Math.max(0.08, (val / maxCell) * 0.32) : 0;
                      const rowPct = rowSum > 0 ? round1((val / rowSum) * 100) : 0;
                      return (
                        <td
                          key={`${rowLabel}-${colLabel}`}
                          className="tabular-nums px-3 py-2.5 text-right text-ink"
                          style={
                            intensity > 0
                              ? {
                                  backgroundColor: `color-mix(in srgb, var(--brand) ${Math.round(
                                    intensity * 100
                                  )}%, transparent)`,
                                }
                              : undefined
                          }
                          title={`${rowLabel} × ${colLabel}: ${val} คน`}
                        >
                          <span className="font-semibold">
                            {val.toLocaleString("th-TH")}
                          </span>
                          {val > 0 && !isMultiCol && (
                            <span className="ml-1 text-xs text-ink-muted">
                              ({rowPct.toFixed(0)}%)
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="tabular-nums border-l border-line bg-surface-subtle/60 px-3 py-2.5 text-right font-bold text-ink">
                      {rowSum.toLocaleString("th-TH")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-surface-subtle font-bold text-ink">
                <th scope="row" className="px-3 py-2.5 text-left">
                  รวมทั้งหมด
                </th>
                {result.colTotals.map((total, j) => (
                  <td
                    key={result.colLabels[j]}
                    className="tabular-nums px-3 py-2.5 text-right"
                  >
                    {total.toLocaleString("th-TH")}
                  </td>
                ))}
                <td className="tabular-nums border-l border-line px-3 py-2.5 text-right">
                  {result.colTotals.reduce((a, b) => a + b, 0).toLocaleString("th-TH")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 bg-surface-subtle/60 px-4 py-2.5 text-xs text-ink-muted sm:px-5">
        <p className="tabular-nums">
          ฐานผู้ตอบครบทั้งสองข้อ{" "}
          <strong className="font-semibold text-ink-secondary">
            n = {result.n.toLocaleString("th-TH")} คน
          </strong>
        </p>
        {isMultiCol && (
          <span>
            ข้อ 8 ตอบได้หลายตัวเลือก ผลรวมแนวตั้ง/แนวนอนอาจมากกว่า n = {result.n} คน
          </span>
        )}
      </div>
    </section>
  );
}
