"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatThaiDate } from "../format";
import { ChartCard, type ChartTableData } from "./ChartCard";
import { ChartLoadingBox, CountTooltip, useIsClient } from "./chart-utils";

type DailyLineProps = {
  data: { date: string; count: number }[];
  totalRows: number;
  title?: string;
};

type TickProps = { x?: number; y?: number; payload?: { value?: string } };

/** ป้ายวันที่ dd/mm ; เสาร์-อาทิตย์สีจาง */
function DateTick({ x = 0, y = 0, payload }: TickProps) {
  const ymd = String(payload?.value ?? "");
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay();
  const weekend = dow === 0 || dow === 6;
  return (
    <text
      x={x}
      y={y}
      dy={14}
      textAnchor="middle"
      fontSize={12}
      fontWeight={weekend ? 400 : 500}
      fill={weekend ? "var(--ink-3)" : "var(--ink-2)"}
    >
      {ymd.slice(8, 10)}/{ymd.slice(5, 7)}
    </text>
  );
}

export function DailyLine({ data, totalRows, title = "จำนวนผู้ตอบรายวัน" }: DailyLineProps) {
  const isClient = useIsClient();
  const height = 240;

  const chartData = useMemo(() => data.map((d) => ({ ...d, dateLabel: formatThaiDate(d.date) })), [data]);
  const peak = useMemo(
    () => chartData.reduce<(typeof chartData)[number] | null>((b, d) => (d.count > 0 && (!b || d.count > b.count) ? d : b), null),
    [chartData],
  );

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["วันที่", "จำนวนผู้ตอบ (คน)"],
      rows: chartData.map((d) => [d.dateLabel, d.count.toLocaleString("th-TH")]),
    }),
    [chartData],
  );

  return (
    <ChartCard
      title={title}
      code="DAILY"
      takeaway={peak ? `วันที่ผู้ตอบมากที่สุด: ${peak.dateLabel} (${peak.count.toLocaleString("th-TH")} คน)` : undefined}
      base={totalRows}
      note="เวลาประเทศไทย (UTC+7)"
      tableData={tableData}
    >
      {chartData.length === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่มีข้อมูลวันที่ในช่วงที่เลือก</p>
      ) : (
        <div role="img" aria-label={`กราฟพื้นที่จำนวนผู้ตอบรายวัน รวม ${totalRows} คน`}>
          {!isClient ? (
            <ChartLoadingBox height={height} />
          ) : (
            <ResponsiveContainer width="100%" height={height} minWidth={0} initialDimension={{ width: 640, height }}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="date" tick={<DateTick />} axisLine={{ stroke: "var(--line)" }} tickLine={false} minTickGap={12} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--ink-3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CountTooltip />} cursor={{ stroke: "var(--ink-3)", strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  fill="var(--brand)"
                  fillOpacity={0.08}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--brand)", stroke: "var(--surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </ChartCard>
  );
}
