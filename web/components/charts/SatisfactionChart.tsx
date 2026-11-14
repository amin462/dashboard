"use client";

import { useMemo } from "react";
import type { SatResult } from "@/lib/survey/aggregate";
import { ChartCard, type ChartTableData } from "./ChartCard";
import { DivergingBar, HatchSwatch, type DivergingSegment } from "./DivergingBar";

const SCORE_WORD: Record<number, string> = { 1: "น้อยที่สุด", 2: "น้อย", 3: "ปานกลาง", 4: "มาก", 5: "มากที่สุด" };

/** SUR-09: แท่ง 100% แบบ diverging (1→5) + ค่าเฉลี่ยตัวใหญ่ ; ผลทั้งหมดมาจาก satisfaction() */
export function SatisfactionChart({ result }: { result: SatResult }) {
  const segments: DivergingSegment[] = useMemo(
    () =>
      [...result.dist]
        .sort((a, b) => a.score - b.score)
        .map((d) => ({
          label: `${d.score} (${SCORE_WORD[d.score]})`,
          count: d.count,
          pct: d.pct,
          tone: d.score as DivergingSegment["tone"],
        })),
    [result.dist],
  );

  const topScore = useMemo(
    () => result.dist.reduce<(typeof result.dist)[number] | null>((b, d) => (d.count > 0 && (!b || d.count > b.count) ? d : b), null),
    [result],
  );

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ระดับคะแนน", "จำนวน (คน)", "ร้อยละ (%)"],
      rows: [
        ...segments.map((s) => [s.label, s.count.toLocaleString("th-TH"), `${s.pct.toFixed(1)}%`]),
        ["ยังไม่สามารถประเมินได้ (ไม่รวมในค่าเฉลี่ย)", result.cannotRate.toLocaleString("th-TH"), "—"],
      ],
    }),
    [segments, result.cannotRate],
  );

  return (
    <ChartCard
      title="ความพึงพอใจต่อสถานที่"
      code="SUR-09"
      takeaway={topScore ? `ให้คะแนน ${topScore.score} มากที่สุด (${topScore.pct.toFixed(1)}%)` : undefined}
      base={result.n + result.cannotRate}
      skipped={result.skipped}
      notSpecified={result.cannotRate}
      note="ประเมินสถานที่ ไม่ใช่ระบบ"
      tableData={tableData}
    >
      {result.n === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่มีผู้ให้คะแนน 1–5 ในกลุ่มที่เลือก</p>
      ) : (
        <>
          <p className="text-ink">
            <span className="type-kpi">{result.mean?.toFixed(2)}</span>
            <span className="ml-1 text-ink-2">/ 5 · {result.level}</span>
          </p>
          <p className="mb-3 type-meta text-ink-3">
            SD {result.sd !== null ? result.sd.toFixed(2) : "—"} · ผู้ให้คะแนน 1–5 จำนวน {result.n.toLocaleString("th-TH")} คน
          </p>
          <DivergingBar segments={segments} label="การกระจายคะแนนความพึงพอใจ" />
          <p className="mt-3 flex items-center gap-2 type-meta text-ink-3">
            <HatchSwatch />
            ยังไม่สามารถประเมินได้ {result.cannotRate.toLocaleString("th-TH")} คน (แสดงแยก ไม่รวมในค่าเฉลี่ย)
          </p>
          <p className="mt-2 type-meta text-ink-3">
            เกณฑ์แปลผล: 4.21–5.00 มากที่สุด · 3.41–4.20 มาก · 2.61–3.40 ปานกลาง · 1.81–2.60 น้อย · 1.00–1.80 น้อยที่สุด
          </p>
        </>
      )}
    </ChartCard>
  );
}
