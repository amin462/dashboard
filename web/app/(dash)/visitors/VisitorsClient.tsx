"use client";

import { freq, topItem } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { FreqBar } from "@/components/charts/FreqBar";
import { DashPage } from "@/components/page/DashPage";
import { countStat, topStat } from "@/components/page/stat-helpers";
import { StatStrip } from "@/components/ui/StatStrip";

export function VisitorsClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="ช่วงวัยและถิ่นพำนักของผู้มาเยือนวัดคูหาภิมุข ใช้ปรับภาษาสื่อสารและสินค้าให้ตรงกลุ่มเป้าหมาย">
      {({ rows: filtered, total }) => {
        const age = freq(filtered, "sur01");
        const origin = freq(filtered, "sur02");
        return (
          <>
            <StatStrip
              items={[
                countStat(filtered.length, total),
                topStat("ช่วงอายุที่พบมากที่สุด", topItem(age, ["ไม่ประสงค์ระบุ"]), age, 1, "ไม่ระบุ"),
                topStat("พื้นที่พำนักที่พบมากที่สุด", topItem(origin, ["ไม่ประสงค์ระบุ"]), origin, 2, "ไม่ระบุ"),
              ]}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FreqBar result={age} title="ช่วงอายุ" />
              <FreqBar result={origin} title="พื้นที่พำนัก" />
            </div>
          </>
        );
      }}
    </DashPage>
  );
}
