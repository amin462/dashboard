import { round1, type CrosstabResult } from "@/lib/survey/aggregate";
import { QUESTIONS } from "@/lib/survey/schema";
import { ChartCard } from "./ChartCard";

/** ความเข้มสูงสุดของ heatmap (คงให้ตัวอักษรอ่านได้ ≥ 4.5:1 ทั้งโหมดสว่าง/มืด) */
const MAX_ALPHA = 38;

/** ตารางไขว้ heatmap: สี navy ตามสัดส่วนในแถว, ตัวเลขอยู่ในช่อง, คอลัมน์แรก sticky */
export function CrosstabTable({ result, title, code }: { result: CrosstabResult; title: string; code: string }) {
  const isMultiCol = QUESTIONS[result.b].type === "multi";

  return (
    <ChartCard
      title={title}
      code={code}
      takeaway="สีเข้ม = สัดส่วนสูงในแถวเดียวกัน"
      base={result.n}
      note={isMultiCol ? "ข้อ 8 ตอบได้หลายข้อ ผลรวมอาจมากกว่า n" : undefined}
    >
      {result.n === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่มีผู้ตอบครบทั้งสองข้อในกลุ่มที่เลือก</p>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[640px] border-collapse">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="type-meta text-ink-3">
                <th scope="col" className="sticky left-0 z-10 bg-surface px-2 py-2 text-left font-medium">
                  {QUESTIONS[result.a].short} \ {QUESTIONS[result.b].short}
                </th>
                {result.colLabels.map((c) => (
                  <th key={c} scope="col" className="px-2 py-2 text-right font-medium">
                    {c}
                  </th>
                ))}
                <th scope="col" className="border-l border-line px-2 py-2 text-right font-medium text-ink-2">
                  {isMultiCol ? "รวมครั้ง" : "รวม"}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rowLabels.map((rowLabel, i) => {
                const rowSum = result.rowTotals[i] ?? 0;
                return (
                  <tr key={rowLabel} className="border-t border-line">
                    <th scope="row" className="sticky left-0 z-10 bg-surface px-2 py-2 text-left font-normal text-ink">
                      {rowLabel}
                    </th>
                    {result.colLabels.map((colLabel, j) => {
                      const val = result.cells[i]?.[j] ?? 0;
                      const share = rowSum > 0 ? val / rowSum : 0;
                      return (
                        <td
                          key={colLabel}
                          title={`${rowLabel} × ${colLabel}: ${val} คน`}
                          className="px-2 py-2 text-right text-ink"
                          style={
                            val > 0
                              ? { backgroundColor: `color-mix(in srgb, var(--navy) ${Math.round(8 + share * (MAX_ALPHA - 8))}%, transparent)` }
                              : undefined
                          }
                        >
                          {val.toLocaleString("th-TH")}
                          {val > 0 && !isMultiCol && (
                            <span className="ml-1 type-meta text-ink">({round1(share * 100).toFixed(0)}%)</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="border-l border-line px-2 py-2 text-right font-medium text-ink">{rowSum.toLocaleString("th-TH")}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-line font-medium text-ink">
                <th scope="row" className="sticky left-0 z-10 bg-surface px-2 py-2 text-left font-medium">
                  รวมทั้งหมด
                </th>
                {result.colTotals.map((t, j) => (
                  <td key={result.colLabels[j]} className="px-2 py-2 text-right">
                    {t.toLocaleString("th-TH")}
                  </td>
                ))}
                <td className="border-l border-line px-2 py-2 text-right">{result.n.toLocaleString("th-TH")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
