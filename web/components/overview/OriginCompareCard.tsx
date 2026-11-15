"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SMALL_N, type Row } from "@/lib/survey/schema";
import { num } from "../format";
import { ChartCard, type ChartTableData } from "../charts/ChartCard";
import { ChartTooltip } from "../charts/ChartTooltip";
import { ChartLoadingBox, useIsClient, useMediaQuery } from "../charts/chart-utils";
import { AXIS_LINE, AXIS_TICK, BAR_RADIUS, BAR_SIZE, C, CHART_MARGIN, GRID, SERIES, SHORT_INTEREST } from "../charts/theme";
import { compareOriginInterest } from "@/lib/survey/stats";
import { fmtP, interestSummary } from "../stats/stats-text";
import { originCompare, originTakeaway } from "./overview-data";

type TickProps = { x?: number; y?: number; payload?: { value?: string } };

/** ป้ายแกน X สูงสุด 2 บรรทัด (ตัดที่ "|") */
function WrapTick({ x = 0, y = 0, payload }: TickProps) {
  const lines = String(payload?.value ?? "").split("|");
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={11.5} fill={C.ink2}>
      {lines.map((l) => (
        <tspan key={l} x={x} dy={14}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

const pctLabel = (v: unknown) => `${Math.round(Number(v))}%`;

/** แท่งคู่ SUR-08: กรมท่า = ยะลา, อำพัน = นอกจังหวัด ; ค่า = % ภายในกลุ่มของตัวเอง (multiFreq ต่อกลุ่ม) */
export function OriginCompareCard({ rows }: { rows: Row[] }) {
  const isClient = useIsClient();
  // ป้ายค่าบนแท่งเฉพาะจอ ≥ 640px (จอเล็กใช้ทูลทิป/ตาราง กันตัวเลขทับกัน)
  const showLabels = useMediaQuery("(min-width: 640px)");
  const oc = useMemo(() => originCompare(rows), [rows]);
  const { yala, outside } = oc;
  const stat = useMemo(() => compareOriginInterest(rows), [rows]);
  const ready = yala.base > 0 && outside.base > 0;
  const height = 270;

  const data = useMemo(
    () =>
      oc.cats.map((c) => ({
        key: c.label,
        tick: SHORT_INTEREST[c.label] ?? c.label,
        yala: c.yala.pct,
        outside: c.outside.pct,
        tipTitle: c.label,
      })),
    [oc.cats],
  );
  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["หมวดที่สนใจ", `คนยะลา (n = ${num(yala.base)})`, `คนต่างถิ่น (n = ${num(outside.base)})`, "p-value"],
      rows: oc.cats.map((c) => {
        const t = stat.ok ? stat.categories.find((x) => x.label === c.label) : undefined;
        return [
          c.label,
          `${num(c.yala.count)} คน · ${c.yala.pct.toFixed(1)}%`,
          `${num(c.outside.count)} คน · ${c.outside.pct.toFixed(1)}%`,
          t ? `${fmtP(t.test.p)}${t.significant ? " *" : ""}` : "—",
        ];
      }),
    }),
    [oc.cats, yala.base, outside.base, stat],
  );

  return (
    <ChartCard
      title="ลูกค้าสนใจอะไร — คนยะลา vs คนต่างถิ่น"
      code="SUR-08"
      takeaway={originTakeaway(oc)}
      base={Math.min(yala.base, outside.base)}
      baseText={`ฐาน n: คนยะลา ${num(yala.base)} · คนต่างถิ่น ${num(outside.base)} คน (% ภายในแต่ละกลุ่ม)`}
      note={`ตอบได้หลายข้อ · ไม่นับผู้ไม่ประสงค์ระบุพื้นที่ · ไม่แสดง “ไม่มีความสนใจเป็นพิเศษ”${ready ? ` · ทดสอบความต่าง: ${interestSummary(stat)}` : ""}`}
      legend={[
        { label: `ในจังหวัดยะลา (n=${num(yala.base)})`, color: SERIES.primary },
        { label: `นอกจังหวัด (n=${num(outside.base)})`, color: SERIES.secondary },
      ]}
      tableData={ready ? tableData : undefined}
      cta={{ href: "/spending", label: "ดูรายละเอียด" }}
    >
      {!ready ? (
        <div className="space-y-1.5 py-8 text-center text-ink-3">
          <p className="font-medium text-ink-2">ยังเปรียบเทียบไม่ได้ — ต้องมีผู้ตอบทั้งสองกลุ่ม</p>
          <p>
            ตอนนี้: คนยะลา {num(yala.base)} คน · คนต่างถิ่น {num(outside.base)} คน (นับเฉพาะผู้ที่ตอบข้อ 8)
          </p>
          <p>
            ควรมีอย่างน้อยกลุ่มละ {num(SMALL_N)} คน
            {oc.need.yala > 0 ? ` · ขาดคนยะลาอีก ${num(oc.need.yala)} คน` : ""}
            {oc.need.outside > 0 ? ` · ขาดคนต่างถิ่นอีก ${num(oc.need.outside)} คน` : ""}
          </p>
          <p className="type-meta">แชร์ QR/ลิงก์แบบสำรวจให้คนในพื้นที่ แล้วเลือกข้อ 2 (ที่พักอาศัย) เป็น “จังหวัดยะลา”</p>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`แท่งคู่เปรียบเทียบสินค้า/บริการที่สนใจ คนยะลา ${yala.base} คน กับคนต่างถิ่น ${outside.base} คน`}
          className="relative flex-1"
          style={{ minHeight: height }}
        >
          {!isClient ? (
            <ChartLoadingBox height={height} />
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 640, height }} className="absolute inset-0">
              <BarChart data={data} margin={{ ...CHART_MARGIN, left: 0, top: 20 }} barGap={4} barCategoryGap="22%">
                <CartesianGrid {...GRID} />
                <XAxis dataKey="tick" tick={<WrapTick />} axisLine={AXIS_LINE} tickLine={false} interval={0} height={44} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} width={44} />
                <Tooltip content={<ChartTooltip unit="%" />} cursor={{ fill: C.grid, opacity: 0.6 }} />
                <Bar dataKey="yala" name="คนยะลา" fill={SERIES.primary} radius={BAR_RADIUS} maxBarSize={BAR_SIZE} isAnimationActive={false}>
                  {showLabels && <LabelList dataKey="yala" position="top" formatter={pctLabel} fontSize={10.5} fill={C.ink2} />}
                </Bar>
                <Bar dataKey="outside" name="คนต่างถิ่น" fill={SERIES.secondary} radius={BAR_RADIUS} maxBarSize={BAR_SIZE} isAnimationActive={false}>
                  {showLabels && <LabelList dataKey="outside" position="top" formatter={pctLabel} fontSize={10.5} fill={C.ink2} />}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </ChartCard>
  );
}
