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
import type { FreqResult } from "@/lib/survey/aggregate";
import { ChartCard, type ChartTableData } from "./ChartCard";
import {
  ChartLoadingBox,
  SurveyTooltip,
  WrappedYAxisTick,
  categoryColor,
  useCompactViewport,
  useIsClient,
} from "./chart-helpers";

type FreqBarProps = {
  result: FreqResult;
  title?: string;
  subtitle?: string;
  extraNote?: string;
};

export function FreqBar({
  result,
  title,
  subtitle,
  extraNote,
}: FreqBarProps) {
  const isClient = useIsClient();
  const isCompact = useCompactViewport();

  const sortedItems = useMemo(
    () => [...result.items].sort((a, b) => b.count - a.count),
    [result.items]
  );

  const chartData = useMemo(
    () =>
      sortedItems.map((it) => ({
        label: it.label,
        count: it.count,
        pct: it.pct,
        displayLabel: `${it.count.toLocaleString("th-TH")} (${it.pct.toFixed(1)}%)`,
        fill: categoryColor(result.code, it.label),
      })),
    [sortedItems, result.code]
  );

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ตัวเลือก", "จำนวน (คน)", "ร้อยละ (%)"],
      rows: sortedItems.map((it) => [
        it.label,
        it.count.toLocaleString("th-TH"),
        `${it.pct.toFixed(1)}%`,
      ]),
      caption: title ?? result.title,
    }),
    [sortedItems, title, result.title]
  );

  const groupedOthers = useMemo(() => {
    if (!result.others.length) return [];
    const map = new Map<string, number>();
    for (const text of result.others) {
      map.set(text, (map.get(text) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);
  }, [result.others]);

  const chartHeight = Math.max(
    220,
    chartData.length * (isCompact ? 56 : 50) + 28
  );
  const yAxisWidth = isCompact ? 138 : 216;
  const maxLabelChars = isCompact ? 20 : 28;

  return (
    <ChartCard
      title={title ?? result.title}
      subtitle={subtitle}
      base={result.base}
      skipped={result.skipped}
      notSpecified={result.notSpecified}
      extraNote={extraNote ?? (result.code === "sur08" ? "ตอบได้หลายข้อ (รวม > 100% ได้)" : undefined)}
      tableData={tableData}
    >
      {result.base === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-xl bg-surface-subtle text-sm text-ink-muted">
          ไม่มีผู้ตอบคำถามข้อนี้ในกลุ่มที่เลือก
        </div>
      ) : (
        <div
          role="img"
          aria-label={`กราฟแท่งแนวนอน ${title ?? result.title} ฐาน ${result.base} คน`}
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
                  margin={{ top: 6, right: isCompact ? 86 : 108, bottom: 6, left: 4 }}
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
                    width={yAxisWidth}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    tick={<WrappedYAxisTick maxChars={maxLabelChars} />}
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
                      <Cell key={entry.label} fill={entry.fill} />
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

      {groupedOthers.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-surface-subtle p-3">
          <p className="text-xs font-bold text-ink-secondary">
            คำตอบที่ระบุเพิ่มเติมในหมวด “อื่น ๆ” ({result.others.length} รายการ)
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {groupedOthers.map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-secondary"
              >
                <span>{item.text}</span>
                {item.count > 1 && (
                  <span className="tabular-nums font-bold text-ink">
                    ×{item.count}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
