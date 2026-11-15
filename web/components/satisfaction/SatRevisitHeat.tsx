"use client";

import { round1, type CrosstabResult } from "@/lib/survey/aggregate";
import { ChartCard } from "../charts/ChartCard";
import { num } from "../format";

/** ความเข้มสูงสุดของ heatmap (ตัวอักษรอ่านได้ ≥ 4.5:1 ทั้งสว่าง/มืด) */
const MAX_ALPHA = 38;

const COL_SHORT: Record<string, string> = {
  "ตั้งใจจะกลับมาอีก": "ตั้งใจ",
  "อาจจะกลับมาอีก": "อาจจะ",
  "ยังไม่แน่ใจ": "ไม่แน่ใจ",
  "ไม่น่าจะกลับมาอีก": "ไม่น่า",
};

/** heatmap ความพึงพอใจ (SUR-09) × ความตั้งใจกลับมา (SUR-10) จาก crosstab() ; สีเข้ม = สัดส่วนสูงในแถวเดียวกัน */
export function SatRevisitHeat({ result }: { result: CrosstabResult }) {
  return (
    <ChartCard
      title="ความพึงพอใจ × ความตั้งใจกลับมา"
      code="SUR-09 × 10"
      takeaway="สีเข้ม = สัดส่วนสูงในแถวเดียวกัน (% ภายในแถวคะแนน)"
      base={result.n}
      baseText={`ฐาน: ผู้ตอบทั้งข้อ 9 และข้อ 10 จำนวน ${num(result.n)} คน`}
    >
      {result.n === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่มีผู้ตอบครบทั้งสองข้อในกลุ่มที่เลือก</p>
      ) : (
        <div className="-mx-1 flex-1 overflow-x-auto px-1">
          <table className="h-full w-full min-w-[360px] border-collapse">
            <caption className="sr-only">ความพึงพอใจ × ความตั้งใจกลับมา</caption>
            <thead>
              <tr className="type-meta text-ink-3">
                <th scope="col" className="px-2 py-1.5 text-left font-medium">
                  คะแนน \ กลับมา
                </th>
                {result.colLabels.map((c) => (
                  <th key={c} scope="col" title={c} className="px-1 py-1.5 text-right font-medium">
                    {COL_SHORT[c] ?? c}
                  </th>
                ))}
                <th scope="col" className="border-l border-line px-2 py-1.5 text-right font-medium text-ink-2">
                  รวม
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rowLabels.map((rowLabel, i) => {
                const rowSum = result.rowTotals[i] ?? 0;
                return (
                  <tr key={rowLabel} className="border-t border-line">
                    <th scope="row" className="px-2 py-1.5 text-left font-normal text-ink">
                      {rowLabel.replace(" (", " · ").replace(")", "")}
                    </th>
                    {result.colLabels.map((colLabel, j) => {
                      const val = result.cells[i]?.[j] ?? 0;
                      const share = rowSum > 0 ? val / rowSum : 0;
                      return (
                        <td
                          key={colLabel}
                          title={`${rowLabel} × ${colLabel}: ${val} คน`}
                          className="px-1 py-1.5 text-right text-ink"
                          style={
                            val > 0
                              ? {
                                  backgroundColor: `color-mix(in srgb, var(--navy) ${Math.round(8 + share * (MAX_ALPHA - 8))}%, transparent)`,
                                }
                              : undefined
                          }
                        >
                          {num(val)}
                          {val > 0 && <span className="ml-1 type-meta text-ink">({round1(share * 100).toFixed(0)}%)</span>}
                        </td>
                      );
                    })}
                    <td className="border-l border-line px-2 py-1.5 text-right font-medium text-ink">{num(rowSum)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
