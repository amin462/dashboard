"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatThaiDate, num } from "../format";
import { ChartCard, type ChartTableData } from "../charts/ChartCard";
import { ChartTooltip } from "../charts/ChartTooltip";
import { ChartLoadingBox, useIsClient } from "../charts/chart-utils";
import { AXIS_LINE, AXIS_TICK, C, CHART_MARGIN, GRID, SERIES } from "../charts/theme";
import { MonthHeat } from "./MonthHeat";
import type { DailyPoint } from "./overview-data";

type TickProps = { x?: number; y?: number; payload?: { value?: string } };

/** ป้ายวันที่ dd/mm ; เสาร์-อาทิตย์สีจาง */
function DateTick({ x = 0, y = 0, payload }: TickProps) {
  const ymd = String(payload?.value ?? "");
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay();
  const weekend = dow === 0 || dow === 6;
  return (
    <text x={x} y={y} dy={14} textAnchor="middle" fontSize={12} fontWeight={weekend ? 400 : 500} fill={weekend ? C.ink3 : C.ink2}>
      {ymd.slice(8, 10)}/{ymd.slice(5, 7)}
    </text>
  );
}

/** gradient ไล่จากสีเส้น → โปร่งใส (ใช้เฉพาะ fill ของ area) */
function Fade({ id, color, top }: { id: string; color: string; top: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" style={{ stopColor: color, stopOpacity: top }} />
      <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
    </linearGradient>
  );
}

type Props = { data: DailyPoint[]; total: number; outsideTotal: number };

/** area 2 ชั้น (กรมท่า = ทั้งหมด, อำพัน = ผู้มาจากนอกจังหวัด) + ปฏิทินเดือนเล็กในการ์ดเดียว */
export function DailyCard({ data, total, outsideTotal }: Props) {
  const isClient = useIsClient();
  const height = 250;
  const chartData = useMemo(() => data.map((d) => ({ ...d, tipTitle: formatThaiDate(d.date) })), [data]);
  const peak = useMemo(
    () => chartData.reduce<(typeof chartData)[number] | null>((b, d) => (d.all > 0 && (!b || d.all > b.all) ? d : b), null),
    [chartData],
  );
  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["วันที่", "ทั้งหมด (คน)", "นอกจังหวัด (คน)"],
      rows: chartData.map((d) => [d.tipTitle, num(d.all), num(d.outsiders)]),
    }),
    [chartData],
  );

  return (
    <ChartCard
      title="จำนวนผู้ตอบรายวัน"
      code="DAILY"
      takeaway={peak ? `วันที่คนมามากที่สุด: ${peak.tipTitle} (${num(peak.all)} คน)` : undefined}
      base={total}
      baseText={`ฐาน n = ${num(total)} คน (นอกจังหวัด ${num(outsideTotal)} คน)`}
      note="เวลาประเทศไทย (UTC+7)"
      legend={[
        { label: "ทั้งหมด", color: SERIES.primary },
        { label: "ผู้มาจากนอกจังหวัด", color: SERIES.secondary },
      ]}
      tableData={tableData}
    >
      {chartData.length === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่มีข้อมูลวันที่ในช่วงที่เลือก</p>
      ) : (
        <div className="flex flex-1 flex-col gap-5 lg:flex-row">
          <div
            className="relative min-w-0 flex-1"
            style={{ minHeight: height }}
            role="img"
            aria-label={`กราฟพื้นที่จำนวนผู้ตอบรายวัน รวม ${total} คน นอกจังหวัด ${outsideTotal} คน`}
          >
            {!isClient ? (
              <ChartLoadingBox height={height} />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 480, height }} className="chart-reveal absolute inset-0">
                <AreaChart data={chartData} margin={CHART_MARGIN}>
                  <defs>
                    <Fade id="fade-all" color={SERIES.primary} top={0.35} />
                    <Fade id="fade-out" color={SERIES.secondary} top={0.55} />
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="date" tick={<DateTick />} axisLine={AXIS_LINE} tickLine={false} minTickGap={14} />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: C.ink3, strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="all" name="ทั้งหมด" stroke={SERIES.primary} strokeWidth={2} fill="url(#fade-all)" dot={false} isAnimationActive={false} />
                  <Area type="monotone" dataKey="outsiders" name="นอกจังหวัด" stroke={SERIES.secondary} strokeWidth={2} fill="url(#fade-out)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <MonthHeat data={data} />
        </div>
      )}
    </ChartCard>
  );
}
