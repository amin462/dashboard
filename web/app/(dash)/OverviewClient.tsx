"use client";

import { overview } from "@/lib/survey/aggregate";
import { overviewInsights } from "@/lib/survey/insights";
import type { Row } from "@/lib/survey/schema";
import { DailyLine } from "@/components/charts/DailyLine";
import { SlotBar } from "@/components/charts/SlotBar";
import { num } from "@/components/format";
import { DashPage } from "@/components/page/DashPage";
import { InsightsSection } from "@/components/page/InsightsSection";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";

function overviewStats(ov: ReturnType<typeof overview>): Stat[] {
  const { satisfaction: sat, returnIntent: ret, topSpend, topInterest, target } = ov;
  return [
    {
      label: "ผู้ตอบสมบูรณ์",
      value: `${num(ov.n)} / ${target.full}`,
      context: `${target.pctOfMin.toFixed(1)}% ของเป้าขั้นต่ำ ${target.min} คน`,
      progress: target.pctOfMin,
      sampleN: ov.n,
    },
    {
      label: "ความพึงพอใจต่อสถานที่",
      value: sat.mean !== null ? sat.mean.toFixed(2) : "—",
      context: sat.level
        ? `ระดับ${sat.level} · SD ${sat.sd !== null ? sat.sd.toFixed(2) : "—"} · n = ${num(sat.n)}`
        : "ไม่มีคะแนน 1–5 ในกลุ่มนี้",
      sampleN: sat.n,
    },
    {
      label: "ตั้งใจจะกลับมาอีก",
      value: `${ret.pct.toFixed(1)}%`,
      context: `${num(ret.count)} จาก ${num(ret.base)} คนที่ตอบข้อ 10`,
      sampleN: ret.base,
    },
    {
      label: "ช่วงค่าใช้จ่ายที่พบมาก",
      value: topSpend ? topSpend.label : "ไม่มีข้อมูล",
      context: topSpend ? `${num(topSpend.count)} คน (${topSpend.pct.toFixed(1)}%) จาก ${num(topSpend.base)} คนที่ตอบข้อ 7` : undefined,
      sampleN: topSpend?.base,
    },
    {
      label: "สนใจสินค้า/บริการอันดับ 1",
      value: topInterest ? topInterest.label : "ไม่มีข้อมูล",
      context: topInterest ? `${num(topInterest.count)} คน (${topInterest.pct.toFixed(1)}%) จาก ${num(topInterest.base)} คนที่ตอบข้อ 8` : undefined,
      sampleN: topInterest?.base,
    },
  ];
}

export function OverviewClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="ตัวเลขสำคัญ ผู้ตอบรายวัน ช่วงเวลาที่มาเยือน และข้อค้นพบเบื้องต้น อ่านจบใน 30 วินาที">
      {({ rows: filtered }) => {
        const ov = overview(filtered);
        return (
          <>
            <StatStrip items={overviewStats(ov)} />
            <InsightsSection title="ข้อค้นพบสำหรับผู้ประกอบการ" insights={overviewInsights(filtered)} n={ov.n} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DailyLine data={ov.daily} totalRows={ov.n} />
              <SlotBar data={ov.slots} totalRows={ov.n} />
            </div>
          </>
        );
      }}
    </DashPage>
  );
}
