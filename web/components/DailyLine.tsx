"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, type ChartTableData } from "./ChartCard";
import {
  ChartLoadingBox,
  SurveyTooltip,
  useIsClient,
} from "./chart-helpers";
import { formatThaiDate } from "./nav-config";

type DailyLineProps = {
  data: { date: string; count: number }[];
  totalRows: number;
  title?: string;
  subtitle?: string;
};

export function DailyLine({
  data,
  totalRows,
  title = "จำนวนผู้ตอบแบบสำรวจรายวัน",
  subtitle = "นับจากเวลาส่งแบบสำรวจ (เขตเวลาประเทศไทย UTC+7)",
}: DailyLineProps) {
  const isClient = useIsClient();

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: d.date,
        shortDate: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
        dateLabel: formatThaiDate(d.date),
        count: d.count,
      })),
    [data]
  );

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["วันที่", "จำนวนผู้ตอบ (คน)"],
      rows: chartData.map((d) => [
        d.dateLabel,
        d.count.toLocaleString("th-TH"),
      ]),
      caption: title,
    }),
    [chartData, title]
  );

  const chartHeight = 250;

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      base={totalRows}
      skipped={0}
      notSpecified={0}
      tableData={tableData}
    >
      {chartData.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-xl bg-surface-subtle text-sm text-ink-muted">
          ไม่มีข้อมูลวันที่ในช่วงที่เลือก
        </div>
      ) : (
        <div
          role="img"
          aria-label={`กราฟเส้นจำนวนผู้ตอบรายวัน รวม ${totalRows} คน`}
        >
          {!isClient ? (
            <ChartLoadingBox height={chartHeight} />
          ) : (
            <div style={{ width: "100%", height: chartHeight }}>
              <ResponsiveContainer
                width="100%"
                height={chartHeight}
                minWidth={0}
                initialDimension={{ width: 640, height: chartHeight }}
              >
                <AreaChart
                  data={chartData}
                  margin={{ top: 12, right: 16, bottom: 4, left: -12 }}
                >
                  <defs>
                    <linearGradient id="dailyTealFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--border-line)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border-line)" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<SurveyTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fill="url(#dailyTealFill)"
                    dot={{ r: 3.5, fill: "var(--surface)", stroke: "var(--chart-1)", strokeWidth: 2 }}
                    activeDot={{ r: 5.5, fill: "var(--chart-1)" }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}
