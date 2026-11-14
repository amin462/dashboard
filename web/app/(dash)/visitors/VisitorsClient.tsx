"use client";

import { useMemo } from "react";
import { MapPin, UserCheck, Users } from "lucide-react";
import { freq, topItem } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FreqBar } from "@/components/FreqBar";
import { KpiCard } from "@/components/KpiCard";
import { useFilteredRows } from "@/components/useFilteredRows";

export function VisitorsClient({ rows }: { rows: Row[] }) {
  const { filtered, isFiltered } = useFilteredRows(rows);

  const ageFreq = useMemo(() => freq(filtered, "sur01"), [filtered]);
  const originFreq = useMemo(() => freq(filtered, "sur02"), [filtered]);

  const topAge = useMemo(
    () => topItem(ageFreq, ["ไม่ประสงค์ระบุ"]),
    [ageFreq]
  );
  const topOrigin = useMemo(
    () => topItem(originFreq, ["ไม่ประสงค์ระบุ"]),
    [originFreq]
  );

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="ข้อมูลประชากรศาสตร์"
        title="ผู้ตอบแบบสำรวจ (ช่วงอายุและพื้นที่พำนัก)"
        subtitle="ทำความเข้าใจช่วงวัยและถิ่นพำนักของผู้ที่มาเยือนวัดคูหาภิมุข เพื่อปรับภาษาสื่อสารและสินค้าให้ตรงกลุ่มเป้าหมาย"
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
              label="จำนวนผู้ตอบในกลุ่มที่แสดง"
              value={filtered.length.toLocaleString("th-TH")}
              unit="คน"
              subtext={`จากผู้ตอบสมบูรณ์ทั้งหมด ${rows.length.toLocaleString("th-TH")} คน`}
              icon={<Users className="h-5 w-5" />}
              tone="teal"
              sampleN={filtered.length}
            />
            <KpiCard
              label="ช่วงอายุที่พบมากที่สุด"
              value={topAge ? topAge.label : "ไม่ระบุ"}
              subtext={
                topAge
                  ? `${topAge.count.toLocaleString("th-TH")} คน (${topAge.pct.toFixed(1)}%) ของผู้ตอบข้อ 1`
                  : "ไม่มีข้อมูลช่วงอายุที่ระบุ"
              }
              icon={<UserCheck className="h-5 w-5" />}
              tone="amber"
              sampleN={ageFreq.base}
            />
            <KpiCard
              label="พื้นที่พำนักที่พบมากที่สุด"
              value={topOrigin ? topOrigin.label : "ไม่ระบุ"}
              subtext={
                topOrigin
                  ? `${topOrigin.count.toLocaleString("th-TH")} คน (${topOrigin.pct.toFixed(1)}%) ของผู้ตอบข้อ 2`
                  : "ไม่มีข้อมูลพื้นที่พำนักที่ระบุ"
              }
              icon={<MapPin className="h-5 w-5" />}
              tone="stone"
              sampleN={originFreq.base}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <FreqBar
              result={ageFreq}
              title="1. ช่วงอายุของผู้ตอบแบบสำรวจ"
              subtitle="เรียงจากกลุ่มที่มีสัดส่วนมากที่สุดไปน้อยที่สุด"
            />
            <FreqBar
              result={originFreq}
              title="2. พื้นที่พำนัก (จังหวัด / ประเทศ)"
              subtitle="ช่วยแยกกลุ่มลูกค้าคนในจังหวัดยะลากับนักท่องเที่ยวต่างพื้นที่"
            />
          </div>
        </>
      )}
    </div>
  );
}
