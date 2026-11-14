"use client";

import { useMemo } from "react";
import {
  HeartHandshake,
  RotateCcw,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { overview } from "@/lib/survey/aggregate";
import { overviewInsights } from "@/lib/survey/insights";
import { SMALL_N, type Row } from "@/lib/survey/schema";
import { DailyLine } from "@/components/DailyLine";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { InsightCard } from "@/components/InsightCard";
import { KpiCard } from "@/components/KpiCard";
import { SlotBar } from "@/components/SlotBar";
import { SmallSampleBadge } from "@/components/SmallSampleBadge";
import { useFilteredRows } from "@/components/useFilteredRows";

export function OverviewClient({ rows }: { rows: Row[] }) {
  const { filtered, isFiltered } = useFilteredRows(rows);

  const ov = useMemo(() => overview(filtered), [filtered]);
  const insights = useMemo(() => overviewInsights(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="ภาพรวมสำหรับผู้ประกอบการ"
        title="ภาพรวมผลสำรวจนักท่องเที่ยว ณ วัดคูหาภิมุข"
        subtitle="สรุปตัวเลขสำคัญรายวัน ช่วงเวลาที่มาเยือน และข้อค้นพบเบื้องต้น เพื่อประกอบการตัดสินใจภายใน 30 วินาที"
        filteredCount={filtered.length}
        totalCount={rows.length}
        isFiltered={isFiltered}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* KPIs 5 ตัวตาม DATA_CONTRACT ข้อ 4 */}
          <section aria-label="ตัวชี้วัดสำคัญภาพรวม">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <KpiCard
                  label="ผู้ตอบสมบูรณ์"
                  value={ov.n.toLocaleString("th-TH")}
                  unit="คน"
                  subtext={`เทียบเป้าขั้นต่ำ ${ov.target.min} / เป้าเต็ม ${ov.target.full} คน (${ov.target.pctOfMin.toFixed(1)}%)`}
                  progressPct={ov.target.pctOfMin}
                  progressLabel={`ความคืบหน้าเทียบเป้าหมาย ${ov.target.min} คน`}
                  icon={<Users className="h-5 w-5" />}
                  tone="teal"
                  sampleN={ov.n}
                />
              </div>

              <div className="lg:col-span-2">
                <KpiCard
                  label="ความพึงพอใจต่อสถานที่เฉลี่ย"
                  value={
                    ov.satisfaction.mean !== null
                      ? ov.satisfaction.mean.toFixed(2)
                      : "—"
                  }
                  unit="/ 5.00"
                  subtext={
                    ov.satisfaction.level
                      ? `ระดับ: ${ov.satisfaction.level} · SD ${
                          ov.satisfaction.sd !== null
                            ? ov.satisfaction.sd.toFixed(2)
                            : "—"
                        } (n = ${ov.satisfaction.n})`
                      : "ไม่มีคะแนนประเมิน 1–5 ในกลุ่มนี้"
                  }
                  icon={<HeartHandshake className="h-5 w-5" />}
                  tone="amber"
                  sampleN={ov.satisfaction.n}
                />
              </div>

              <div className="lg:col-span-2">
                <KpiCard
                  label="ตั้งใจจะกลับมาเยือนอีก"
                  value={`${ov.returnIntent.pct.toFixed(1)}%`}
                  subtext={`${ov.returnIntent.count.toLocaleString("th-TH")} จาก ${ov.returnIntent.base.toLocaleString("th-TH")} คนที่ตอบข้อ 10`}
                  icon={<RotateCcw className="h-5 w-5" />}
                  tone="teal"
                  sampleN={ov.returnIntent.base}
                />
              </div>

              <div className="lg:col-span-3">
                <KpiCard
                  label="ช่วงค่าใช้จ่ายที่พบมากที่สุด"
                  value={ov.topSpend ? ov.topSpend.label : "ไม่มีข้อมูล"}
                  subtext={
                    ov.topSpend
                      ? `${ov.topSpend.count.toLocaleString("th-TH")} คน (${ov.topSpend.pct.toFixed(1)}%) จากผู้ตอบข้อ 7 จำนวน ${ov.topSpend.base.toLocaleString("th-TH")} คน`
                      : "ผู้ตอบไม่ได้ระบุช่วงค่าใช้จ่าย"
                  }
                  icon={<Wallet className="h-5 w-5" />}
                  tone="stone"
                  sampleN={ov.topSpend?.base}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <KpiCard
                  label="สินค้า / บริการที่สนใจอันดับ 1"
                  value={ov.topInterest ? ov.topInterest.label : "ไม่มีข้อมูล"}
                  subtext={
                    ov.topInterest
                      ? `${ov.topInterest.count.toLocaleString("th-TH")} คน (${ov.topInterest.pct.toFixed(1)}%) จากผู้ตอบข้อ 8 จำนวน ${ov.topInterest.base.toLocaleString("th-TH")} คน`
                      : "ไม่มีผู้ระบุสินค้าหรือบริการที่สนใจ"
                  }
                  icon={<ShoppingBag className="h-5 w-5" />}
                  tone="amber"
                  sampleN={ov.topInterest?.base}
                />
              </div>
            </div>
          </section>

          {/* กราฟรายวัน + ช่วงเวลา */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <DailyLine data={ov.daily} totalRows={ov.n} />
            </div>
            <div className="xl:col-span-5">
              <SlotBar data={ov.slots} totalRows={ov.n} />
            </div>
          </div>

          {/* ข้อค้นพบ 3 ข้อ */}
          <section aria-label="ข้อค้นพบสำคัญ">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">
                ข้อค้นพบสำคัญสำหรับผู้ประกอบการ
              </h2>
              <span className="text-xs text-ink-muted">
                สรุปอัตโนมัติตามเกณฑ์ที่กำหนด (แสดงเมื่อฐานข้อนั้น ≥ {SMALL_N} คน)
              </span>
            </div>

            {insights.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {insights.map((ins) => (
                  <InsightCard key={ins.title} insight={ins} />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-border bg-accent-soft px-4 py-3 text-sm text-accent-ink">
                <p>
                  กลุ่มข้อมูลที่กรองมีจำนวนผู้ตอบน้อยกว่า {SMALL_N} คน จึงระงับการสรุปข้อค้นพบเพื่อป้องกันการตีความคลาดเคลื่อน
                </p>
                <SmallSampleBadge n={filtered.length} />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
