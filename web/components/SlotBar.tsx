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
import type { Slot } from "@/lib/survey/schema";
import { ChartCard, type ChartTableData } from "./ChartCard";
import {
  ChartLoadingBox,
  SurveyTooltip,
  useCompactViewport,
  useIsClient,
} from "./chart-helpers";

type SlotBarProps = {
  data: { slot: Slot; count: number; pct: number }[];
  totalRows: number;
  title?: string;
  subtitle?: string;
};

const SLOT_META: Record<Slot, { label: string; color: string }> = {
  เช้า: { label: "เช้า (06–11 น.)", color: "var(--chart-1)" },
  บ่าย: { label: "บ่าย (12–15 น.)", color: "var(--chart-2)" },
  เย็น: { label: "เย็น (16–19 น.)", color: "var(--chart-4)" },
  อื่น: { label: "ช่วงเวลาอื่น", color: "var(--chart-muted)" },
};

export function SlotBar({
  data,
  totalRows,
  title = "ช่วงเวลาที่มาเยือน",
  subtitle = "จำแนกตามเวลาที่ส่งแบบสำรวจ เพื่อช่วยวางแผนเวลาเปิดร้านและบริการ",
}: SlotBarProps) {
  const isClient = useIsClient();
  const isCompact = useCompactViewport();

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        slot: d.slot,
        label: SLOT_META[d.slot]?.label ?? d.slot,
        count: d.count,
        pct: d.pct,
        displayLabel: `${d.count.toLocaleString("th-TH")} (${d.pct.toFixed(1)}%)`,
        fill: SLOT_META[d.slot]?.color ?? "var(--chart-1)",
      })),
    [data]
  );

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ช่วงเวลา", "จำนวน (คน)", "ร้อยละ (%)"],
      rows: chartData.map((d) => [
        d.label,
        d.count.toLocaleString("th-TH"),
        `${d.pct.toFixed(1)}%`,
      ]),
      caption: title,
    }),
    [chartData, title]
  );

  const chartHeight = 230;

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      base={totalRows}
      skipped={0}
      notSpecified={0}
      tableData={tableData}
    >
      <div
        role="img"
        aria-label={`กราฟช่วงเวลาที่นักท่องเที่ยวส่งแบบสำรวจ ฐาน ${totalRows} คน`}
      >
        {!isClient ? (
          <ChartLoadingBox height={chartHeight} />
        ) : (
          <div style={{ width: "100%", height: chartHeight }}>
            <ResponsiveContainer
              width="100%"
              height={chartHeight}
              minWidth={0}
              initialDimension={{ width: 420, height: chartHeight }}
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
                  width={isCompact ? 110 : 124}
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
                    <Cell key={entry.slot} fill={entry.fill} />
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
    </ChartCard>
  );
}
