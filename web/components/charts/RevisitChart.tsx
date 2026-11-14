"use client";

import { useMemo } from "react";
import { topItem, type FreqResult } from "@/lib/survey/aggregate";
import { ChartCard, type ChartTableData } from "./ChartCard";
import { DivergingBar, type DivergingSegment } from "./DivergingBar";
import { codeLabel } from "./chart-utils";

/** ลำดับต่ำ→สูง และตำแหน่งสีในสเกล diverging */
const ORDER: { label: string; tone: DivergingSegment["tone"] }[] = [
  { label: "ไม่น่าจะกลับมาอีก", tone: 1 },
  { label: "ยังไม่แน่ใจ", tone: 3 },
  { label: "อาจจะกลับมาอีก", tone: 4 },
  { label: "ตั้งใจจะกลับมาอีก", tone: 5 },
];

/** SUR-10: ความตั้งใจกลับมา แสดงเป็นแท่ง diverging เดียวกับความพึงพอใจ ; ผลมาจาก freq(rows,'sur10') */
export function RevisitChart({ result }: { result: FreqResult }) {
  const segments: DivergingSegment[] = useMemo(
    () =>
      ORDER.map((o) => {
        const it = result.items.find((i) => i.label === o.label);
        return { label: o.label, count: it?.count ?? 0, pct: it?.pct ?? 0, tone: o.tone };
      }),
    [result.items],
  );
  const top = topItem(result);

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ตัวเลือก", "จำนวน (คน)", "ร้อยละ (%)"],
      rows: [...segments].reverse().map((s) => [s.label, s.count.toLocaleString("th-TH"), `${s.pct.toFixed(1)}%`]),
    }),
    [segments],
  );

  return (
    <ChartCard
      title="ความตั้งใจกลับมาเยือนอีก"
      code={codeLabel(result.code)}
      takeaway={top ? `พบมากที่สุด: ${top.label} (${top.pct.toFixed(1)}%)` : undefined}
      base={result.base}
      skipped={result.skipped}
      notSpecified={result.notSpecified}
      tableData={tableData}
    >
      {result.base === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่มีผู้ตอบข้อนี้ในกลุ่มที่เลือก</p>
      ) : (
        <DivergingBar segments={segments} label="ความตั้งใจกลับมาเยือน" />
      )}
    </ChartCard>
  );
}
