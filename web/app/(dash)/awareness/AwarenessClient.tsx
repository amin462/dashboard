"use client";

import { freq, topItem } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { FreqBar } from "@/components/charts/FreqBar";
import { DashPage } from "@/components/page/DashPage";
import { countStat, topStat } from "@/components/page/stat-helpers";
import { StatStrip } from "@/components/ui/StatStrip";

export function AwarenessClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="เหตุผลที่คนมาวัดคูหาภิมุขและช่องทางที่รู้จักสถานที่ ใช้เลือกช่องทางประชาสัมพันธ์ของร้าน">
      {({ rows: filtered, total }) => {
        const purpose = freq(filtered, "sur05");
        const channel = freq(filtered, "sur06");
        return (
          <>
            <StatStrip
              items={[
                countStat(filtered.length, total),
                topStat("วัตถุประสงค์หลักที่มาเยือน", topItem(purpose), purpose, 5),
                topStat("ช่องทางรับรู้อันดับ 1", topItem(channel), channel, 6),
              ]}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FreqBar result={purpose} title="วัตถุประสงค์ในการมาเยือน" />
              <FreqBar result={channel} title="รู้จักสถานที่นี้จากช่องทางใด" />
            </div>
          </>
        );
      }}
    </DashPage>
  );
}
