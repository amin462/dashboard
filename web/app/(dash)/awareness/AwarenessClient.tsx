"use client";

import { useMemo } from "react";
import { Compass, Megaphone, Users } from "lucide-react";
import { freq, topItem } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FreqBar } from "@/components/FreqBar";
import { KpiCard } from "@/components/KpiCard";
import { useFilteredRows } from "@/components/useFilteredRows";

export function AwarenessClient({ rows }: { rows: Row[] }) {
  const { filtered, isFiltered } = useFilteredRows(rows);

  const purposeFreq = useMemo(() => freq(filtered, "sur05"), [filtered]);
  const channelFreq = useMemo(() => freq(filtered, "sur06"), [filtered]);

  const topPurpose = useMemo(() => topItem(purposeFreq), [purposeFreq]);
  const topChannel = useMemo(() => topItem(channelFreq), [channelFreq]);

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="แรงจูงใจและการรับรู้"
        title="วัตถุประสงค์ & ช่องทางรับรู้"
        subtitle="เข้าใจเหตุผลที่นักท่องเที่ยวเดินทางมาและช่องทางที่รู้จักสถานที่ เพื่อใช้วางแผนประชาสัมพันธ์ร้านค้าและบริการ"
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
              label="ผู้ตอบในกลุ่มที่แสดง"
              value={filtered.length.toLocaleString("th-TH")}
              unit="คน"
              subtext={`ตอบข้อวัตถุประสงค์ ${purposeFreq.base} คน · ช่องทาง ${channelFreq.base} คน`}
              icon={<Users className="h-5 w-5" />}
              tone="teal"
              sampleN={filtered.length}
            />
            <KpiCard
              label="วัตถุประสงค์หลักที่มาเยือน"
              value={topPurpose ? topPurpose.label : "ไม่มีข้อมูล"}
              subtext={
                topPurpose
                  ? `${topPurpose.count.toLocaleString("th-TH")} คน (${topPurpose.pct.toFixed(1)}%) จากผู้ตอบข้อ 5`
                  : "ไม่มีผู้ตอบข้อวัตถุประสงค์"
              }
              icon={<Compass className="h-5 w-5" />}
              tone="stone"
              sampleN={purposeFreq.base}
            />
            <KpiCard
              label="ช่องทางรับรู้ที่ทรงพลังที่สุด"
              value={topChannel ? topChannel.label : "ไม่มีข้อมูล"}
              subtext={
                topChannel
                  ? `${topChannel.count.toLocaleString("th-TH")} คน (${topChannel.pct.toFixed(1)}%) — แนะนำใช้วางแผนประชาสัมพันธ์`
                  : "ไม่มีผู้ตอบข้อช่องทางรับรู้"
              }
              icon={<Megaphone className="h-5 w-5" />}
              tone="amber"
              sampleN={channelFreq.base}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <FreqBar
              result={purposeFreq}
              title="5. วัตถุประสงค์ในการเดินทางมาวัดคูหาภิมุข"
              subtitle="ช่วยออกแบบเรื่องราว (Storytelling) และบริการให้สอดคล้องกับความตั้งใจของผู้มาเยือน"
            />
            <FreqBar
              result={channelFreq}
              title="6. ช่องทางที่รู้จักสถานที่แห่งนี้"
              subtitle="ใช้วางแผนเลือกช่องทางประชาสัมพันธ์และโฆษณาของธุรกิจในพื้นที่"
            />
          </div>
        </>
      )}
    </div>
  );
}
