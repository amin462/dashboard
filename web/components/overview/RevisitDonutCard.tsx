"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { FreqResult } from "@/lib/survey/aggregate";
import { num } from "../format";
import { ChartCard, type ChartTableData } from "../charts/ChartCard";
import { ChartLoadingBox, useIsClient } from "../charts/chart-utils";
import { C, divColor, type Tone } from "../charts/theme";

/** ลำดับแสดง (บวก→ลบ) + สีจากสเกล diverging เดียวกับหน้าความพึงพอใจ */
const LEVELS: { label: string; tone: Tone }[] = [
  { label: "ตั้งใจจะกลับมาอีก", tone: 5 },
  { label: "อาจจะกลับมาอีก", tone: 4 },
  { label: "ยังไม่แน่ใจ", tone: 3 },
  { label: "ไม่น่าจะกลับมาอีก", tone: 1 },
];

type Props = {
  /** freq(rows, 'sur10') */
  result: FreqResult;
  /** overview().returnIntent */
  intent: { count: number; base: number; pct: number };
};

/** donut ค่าเดียว (สัดส่วนตั้งใจกลับมา) + รายการ SUR-10 ครบ 4 ระดับ + CTA → /satisfaction */
export function RevisitDonutCard({ result, intent }: Props) {
  const isClient = useIsClient();
  const size = 168;
  const rows = useMemo(
    () => LEVELS.map((l) => ({ ...l, item: result.items.find((i) => i.label === l.label) })),
    [result.items],
  );
  // ส่วนที่เหลือของวง = ฐาน − ผู้ตั้งใจกลับมา (ไม่ใช่ตัวเลขที่รายงาน ใช้วาดวงเท่านั้น)
  const ring = [
    { name: "ตั้งใจจะกลับมาอีก", value: intent.count, fill: C.navy },
    { name: "อื่น ๆ", value: Math.max(0, intent.base - intent.count), fill: C.muted },
  ];
  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ตัวเลือก", "จำนวน (คน)", "ร้อยละ (%)"],
      rows: rows.map((r) => [r.label, num(r.item?.count ?? 0), `${(r.item?.pct ?? 0).toFixed(1)}%`]),
    }),
    [rows],
  );

  return (
    <ChartCard
      title="โอกาสที่ลูกค้ากลับมาซ้ำ"
      code="SUR-10"
      takeaway={intent.base > 0 ? `ตั้งใจจะกลับมาอีก ${intent.pct.toFixed(1)}% ของผู้ตอบข้อนี้` : undefined}
      base={result.base}
      skipped={result.skipped}
      tableData={tableData}
      cta={{ href: "/satisfaction", label: "ดูความพึงพอใจ" }}
    >
      {result.base === 0 ? (
        <p className="py-10 text-center text-ink-3">ไม่มีผู้ตอบข้อนี้ในกลุ่มที่เลือก</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div
            role="img"
            aria-label={`ตั้งใจจะกลับมาอีก ${intent.pct.toFixed(1)}% (${intent.count} จาก ${intent.base} คน)`}
            className="relative mx-auto"
            style={{ width: size, height: size }}
          >
            {!isClient ? (
              <ChartLoadingBox height={size} />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: size, height: size }}>
                <PieChart>
                  <Pie data={ring} dataKey="value" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" cornerRadius={6} paddingAngle={0} isAnimationActive={false}>
                    {ring.map((r) => (
                      <Cell key={r.name} fill={r.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="type-kpi text-ink">{intent.pct.toFixed(0)}%</span>
              <span className="type-meta text-ink-3">ตั้งใจกลับมาอีก</span>
            </div>
          </div>

          <ul aria-label="ความตั้งใจกลับมาเยือน 4 ระดับ" className="space-y-1.5">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: divColor(r.tone) }} aria-hidden="true" />
                <span className="min-w-0 flex-1 text-ink-2">{r.label}</span>
                <span className="whitespace-nowrap text-ink">
                  {num(r.item?.count ?? 0)} คน · {(r.item?.pct ?? 0).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
