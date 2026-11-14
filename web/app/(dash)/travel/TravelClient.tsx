"use client";

import { useMemo } from "react";
import { Car, Compass, Users } from "lucide-react";
import { crosstab, freq, topItem } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { CrosstabTable } from "@/components/CrosstabTable";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FreqBar } from "@/components/FreqBar";
import { KpiCard } from "@/components/KpiCard";
import { useFilteredRows } from "@/components/useFilteredRows";

export function TravelClient({ rows }: { rows: Row[] }) {
  const { filtered, isFiltered } = useFilteredRows(rows);

  const compFreq = useMemo(() => freq(filtered, "sur03"), [filtered]);
  const transFreq = useMemo(() => freq(filtered, "sur04"), [filtered]);
  const cross = useMemo(
    () => crosstab(filtered, "sur03", "sur04"),
    [filtered]
  );

  const topComp = useMemo(
    () => topItem(compFreq, ["ไม่ประสงค์ระบุ"]),
    [compFreq]
  );
  const topTrans = useMemo(
    () => topItem(transFreq, ["ไม่ประสงค์ระบุ"]),
    [transFreq]
  );

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="พฤติกรรมการเดินทาง"
        title="การเดินทาง (ผู้ร่วมเดินทางและพาหนะที่ใช้)"
        subtitle="ช่วยวางแผนการจัดโต๊ะอาหาร ขนาดห้องพัก ที่จอดรถ และโอกาสให้บริการรถรับ-ส่ง"
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
              subtext="ใช้ข้อมูลจากผู้ตอบแบบสำรวจที่สมบูรณ์"
              icon={<Compass className="h-5 w-5" />}
              tone="teal"
              sampleN={filtered.length}
            />
            <KpiCard
              label="กลุ่มผู้ร่วมเดินทางหลัก"
              value={topComp ? topComp.label : "ไม่ระบุ"}
              subtext={
                topComp
                  ? `${topComp.count.toLocaleString("th-TH")} คน (${topComp.pct.toFixed(1)}%) ของผู้ตอบข้อ 3`
                  : "ไม่มีข้อมูลผู้ร่วมเดินทางที่ระบุ"
              }
              icon={<Users className="h-5 w-5" />}
              tone="amber"
              sampleN={compFreq.base}
            />
            <KpiCard
              label="พาหนะที่ใช้เดินทางมากที่สุด"
              value={topTrans ? topTrans.label : "ไม่ระบุ"}
              subtext={
                topTrans
                  ? `${topTrans.count.toLocaleString("th-TH")} คน (${topTrans.pct.toFixed(1)}%) ของผู้ตอบข้อ 4`
                  : "ไม่มีข้อมูลพาหนะที่ระบุ"
              }
              icon={<Car className="h-5 w-5" />}
              tone="stone"
              sampleN={transFreq.base}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <FreqBar
              result={compFreq}
              title="3. ผู้ร่วมเดินทาง (มากับใคร)"
              subtitle="บ่งชี้ขนาดกลุ่มลูกค้าที่มาใช้บริการพร้อมกัน"
            />
            <FreqBar
              result={transFreq}
              title="4. พาหนะหลักที่ใช้เดินทางมาวัดคูหาภิมุข"
              subtitle="สะท้อนความต้องการที่จอดรถและกลุ่มผู้ใช้รถสาธารณะ"
            />
          </div>

          <CrosstabTable
            result={cross}
            title="ตารางไขว้: ผู้ร่วมเดินทาง × พาหนะที่ใช้"
            subtitle="เปรียบเทียบลักษณะกลุ่มที่เดินทางร่วมกันกับพาหนะที่ใช้จริง"
          />
        </>
      )}
    </div>
  );
}
