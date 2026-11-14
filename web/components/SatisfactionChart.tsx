"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SatResult } from "@/lib/survey/aggregate";
import { ChartCard, type ChartTableData } from "./ChartCard";
import {
  ChartLoadingBox,
  SurveyTooltip,
  useCompactViewport,
  useIsClient,
} from "./chart-helpers";

type SatisfactionChartProps = {
  result: SatResult;
  title?: string;
  subtitle?: string;
};

const SCORE_META: Record<number, { label: string; color: string }> = {
  5: { label: "5 (มากที่สุด)", color: "var(--chart-1)" },
  4: { label: "4 (มาก)", color: "var(--chart-4)" },
  3: { label: "3 (ปานกลาง)", color: "var(--chart-2)" },
  2: { label: "2 (น้อย)", color: "var(--chart-5)" },
  1: { label: "1 (น้อยที่สุด)", color: "var(--danger)" },
};

export function SatisfactionChart({
  result,
  title = "9. ความพึงพอใจต่อสถานที่ (วัดคูหาภิมุข)",
  subtitle = "ประเมินความพึงพอใจต่อสถานที่ ไม่ใช่ผลประเมินระบบ · เกณฑ์แปลผล 5 ระดับ",
}: SatisfactionChartProps) {
  const isClient = useIsClient();
  const isCompact = useCompactViewport();

  const chartData = useMemo(
    () =>
      result.dist.map((d) => ({
        score: d.score,
        label: SCORE_META[d.score]?.label ?? `${d.score}`,
        count: d.count,
        pct: d.pct,
        displayLabel: `${d.count.toLocaleString("th-TH")} (${d.pct.toFixed(1)}%)`,
        fill: SCORE_META[d.score]?.color ?? "var(--chart-1)",
      })),
    [result.dist]
  );

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ระดับคะแนน", "จำนวน (คน)", "ร้อยละ (จากผู้ให้คะแนน 1–5)"],
      rows: [
        ...chartData.map((d) => [
          d.label,
          d.count.toLocaleString("th-TH"),
          `${d.pct.toFixed(1)}%`,
        ]),
        [
          "ยังไม่สามารถประเมินได้ (ไม่รวมในค่าเฉลี่ย)",
          result.cannotRate.toLocaleString("th-TH"),
          "—",
        ],
      ],
      caption: title,
    }),
    [chartData, result.cannotRate, title]
  );

  const totalAnswered = result.n + result.cannotRate;
  const chartHeight = 250;

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      base={totalAnswered}
      skipped={result.skipped}
      notSpecified={result.cannotRate}
      extraNote={`ผู้ให้คะแนน 1–5: n = ${result.n.toLocaleString("th-TH")} คน`}
      tableData={tableData}
    >
      {/* แถบสรุป Mean / SD / แปลผล */}
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-line bg-surface-subtle p-3 sm:gap-4 sm:p-4">
        <div>
          <p className="text-xs text-ink-muted">ค่าเฉลี่ย (Mean)</p>
          <p className="tabular-nums text-xl font-bold text-ink sm:text-2xl">
            {result.mean !== null ? result.mean.toFixed(2) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">ส่วนเบี่ยงเบน (SD)</p>
          <p className="tabular-nums text-xl font-bold text-ink sm:text-2xl">
            {result.sd !== null ? result.sd.toFixed(2) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">ระดับความพึงพอใจ</p>
          <p className="text-base font-bold text-brand sm:text-xl">
            {result.level ?? "—"}
          </p>
        </div>
      </div>

      {result.n === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl bg-surface-subtle text-sm text-ink-muted">
          ไม่มีผู้ให้คะแนนความพึงพอใจ 1–5 ในกลุ่มที่เลือก
        </div>
      ) : (
        <div
          role="img"
          aria-label={`กราฟการกระจายคะแนนความพึงพอใจ 1 ถึง 5 ค่าเฉลี่ย ${
            result.mean !== null ? result.mean.toFixed(2) : "ไม่มี"
          }`}
        >
          {!isClient ? (
            <ChartLoadingBox height={chartHeight} />
          ) : (
            <div style={{ width: "100%", height: chartHeight }}>
              <ResponsiveContainer
                width="100%"
                height={chartHeight}
                minWidth={0}
                initialDimension={{ width: 600, height: chartHeight }}
              >
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 6, right: isCompact ? 94 : 108, bottom: 6, left: 4 }}
                >
                  <CartesianGrid
                    stroke="var(--border-line)"
                    strokeDasharray="3 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border-line)" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={isCompact ? 105 : 132}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--ink-secondary)",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--surface-muted)", opacity: 0.45 }}
                    content={<SurveyTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 8, 8, 0]}
                    barSize={24}
                    isAnimationActive={false}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.score} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="displayLabel"
                      position="right"
                      fill="var(--ink)"
                      fontSize={12}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-ink-muted">
        เกณฑ์แปลผล: 4.21–5.00 มากที่สุด · 3.41–4.20 มาก · 2.61–3.40 ปานกลาง · 1.81–2.60 น้อย · 1.00–1.80 น้อยที่สุด
      </p>
    </ChartCard>
  );
}
