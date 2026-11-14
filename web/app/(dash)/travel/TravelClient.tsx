"use client";

import { crosstab, freq, topItem } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { CrosstabTable } from "@/components/charts/CrosstabTable";
import { FreqBar } from "@/components/charts/FreqBar";
import { DashPage } from "@/components/page/DashPage";
import { countStat, topStat } from "@/components/page/stat-helpers";
import { StatStrip } from "@/components/ui/StatStrip";

export function TravelClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="ขนาดกลุ่มที่มาด้วยกันและพาหนะที่ใช้ ช่วยวางแผนโต๊ะอาหาร ห้องพัก ที่จอดรถ และบริการรับ-ส่ง">
      {({ rows: filtered, total }) => {
        const comp = freq(filtered, "sur03");
        const trans = freq(filtered, "sur04");
        return (
          <>
            <StatStrip
              items={[
                countStat(filtered.length, total),
                topStat("มากับใครมากที่สุด", topItem(comp, ["ไม่ประสงค์ระบุ"]), comp, 3, "ไม่ระบุ"),
                topStat("พาหนะที่ใช้มากที่สุด", topItem(trans, ["ไม่ประสงค์ระบุ"]), trans, 4, "ไม่ระบุ"),
              ]}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FreqBar result={comp} title="ผู้ร่วมเดินทาง (มากับใคร)" />
              <FreqBar result={trans} title="พาหนะหลักที่ใช้เดินทางมา" />
            </div>
            <CrosstabTable result={crosstab(filtered, "sur03", "sur04")} title="ผู้ร่วมเดินทาง × พาหนะ" code="SUR-03 × 04" />
          </>
        );
      }}
    </DashPage>
  );
}
