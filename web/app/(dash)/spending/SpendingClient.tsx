"use client";

import { useMemo } from "react";
import { ShoppingBag, Users, Wallet } from "lucide-react";
import { crosstab, freq, multiFreq, topItem } from "@/lib/survey/aggregate";
import { QUESTIONS, SUR08_NONE, type Row } from "@/lib/survey/schema";
import { CrosstabTable } from "@/components/CrosstabTable";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FreqBar } from "@/components/FreqBar";
import { KpiCard } from "@/components/KpiCard";
import { useFilteredRows } from "@/components/useFilteredRows";

export function SpendingClient({ rows }: { rows: Row[] }) {
  const { filtered, isFiltered } = useFilteredRows(rows);

  const spendFreq = useMemo(() => freq(filtered, "sur07"), [filtered]);
  const interestFreq = useMemo(() => multiFreq(filtered), [filtered]);
  const cross = useMemo(
    () => crosstab(filtered, "sur07", "sur08"),
    [filtered]
  );

  const topSpend = useMemo(
    () => topItem(spendFreq, [...(QUESTIONS.sur07.notSpecified ?? [])]),
    [spendFreq]
  );
  const topInterest = useMemo(
    () => topItem(interestFreq, [SUR08_NONE]),
    [interestFreq]
  );

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="กำลังซื้อและความต้องการสินค้า"
        title="ค่าใช้จ่าย & ความสนใจสินค้าและบริการ"
        subtitle="ช่วยผู้ประกอบการตั้งระดับราคาสินค้าและจัดชุดสินค้าหรือบริการให้ตรงกับงบประมาณของผู้มาเยือน"
        filteredCount={filtered.length}
        totalCount={rows.length}
        isFiltered={isFiltered}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <KpiCard
              label="ผู้ตอบข้อค่าใช้จ่าย (ข้อ 7)"
              value={spendFreq.base.toLocaleString("th-TH")}
              unit="คน"
              subtext={`ไม่ตอบ ${spendFreq.skipped} คน · ไม่ระบุ/ประเมินไม่ได้ ${spendFreq.notSpecified} คน`}
              icon={<Users className="h-5 w-5" />}
              tone="stone"
              sampleN={spendFreq.base}
            />
            <KpiCard
              label="ช่วงค่าใช้จ่ายที่พบมากที่สุด"
              value={topSpend ? topSpend.label : "ไม่มีข้อมูล"}
              subtext={
                topSpend
                  ? `${topSpend.count.toLocaleString("th-TH")} คน (${topSpend.pct.toFixed(1)}%) ของผู้ตอบข้อ 7`
                  : "ไม่มีข้อมูลช่วงค่าใช้จ่าย"
              }
              icon={<Wallet className="h-5 w-5" />}
              tone="teal"
              sampleN={spendFreq.base}
            />
            <KpiCard
              label="สินค้า / บริการที่สนใจอันดับ 1"
              value={topInterest ? topInterest.label : "ไม่มีข้อมูล"}
              subtext={
                topInterest
                  ? `${topInterest.count.toLocaleString("th-TH")} คน (${topInterest.pct.toFixed(1)}%) ของผู้ตอบข้อ 8`
                  : "ไม่มีผู้ระบุความสนใจ"
              }
              icon={<ShoppingBag className="h-5 w-5" />}
              tone="amber"
              sampleN={interestFreq.base}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <FreqBar
              result={spendFreq}
              title="7. ค่าใช้จ่ายโดยประมาณระหว่างมาเยือน"
              subtitle="ใช้ประเมินช่วงราคาสินค้าและบริการที่เหมาะสมกับกำลังซื้อส่วนใหญ่"
            />
            <FreqBar
              result={interestFreq}
              title="8. สินค้าและบริการที่สนใจในพื้นที่"
              subtitle="ผู้ตอบเลือกได้มากกว่า 1 ข้อ — ร้อยละเทียบกับจำนวนผู้ตอบข้อ 8"
              extraNote="ตอบได้หลายข้อ (รวม > 100% ได้)"
            />
          </div>

          <CrosstabTable
            result={cross}
            title="ตารางไขว้: ช่วงค่าใช้จ่าย × สินค้าและบริการที่สนใจ"
            subtitle="ดูความเชื่อมโยงระหว่างระดับงบประมาณกับประเภทสินค้าหรือบริการที่ผู้ตอบสนใจ"
          />
        </>
      )}
    </div>
  );
}
