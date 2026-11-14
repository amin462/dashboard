"use client";

import { crosstab, freq, multiFreq, topItem } from "@/lib/survey/aggregate";
import { QUESTIONS, SUR08_NONE, type Row } from "@/lib/survey/schema";
import { CrosstabTable } from "@/components/charts/CrosstabTable";
import { FreqBar } from "@/components/charts/FreqBar";
import { DashPage } from "@/components/page/DashPage";
import { countStat, topStat } from "@/components/page/stat-helpers";
import { StatStrip } from "@/components/ui/StatStrip";

export function SpendingClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="งบประมาณและสินค้า/บริการที่ผู้มาเยือนสนใจ ช่วยตั้งช่วงราคาและจัดชุดสินค้าให้ตรงกำลังซื้อ">
      {({ rows: filtered, total }) => {
        const spend = freq(filtered, "sur07");
        const interest = multiFreq(filtered);
        return (
          <>
            <StatStrip
              items={[
                countStat(filtered.length, total),
                topStat("ช่วงค่าใช้จ่ายที่พบมากที่สุด", topItem(spend, [...(QUESTIONS.sur07.notSpecified ?? [])]), spend, 7),
                topStat("สินค้า/บริการที่สนใจอันดับ 1", topItem(interest, [SUR08_NONE]), interest, 8),
              ]}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FreqBar result={spend} title="ค่าใช้จ่ายโดยประมาณระหว่างมาเยือน" />
              <FreqBar result={interest} title="สินค้าและบริการที่สนใจ" />
            </div>
            <CrosstabTable result={crosstab(filtered, "sur07", "sur08")} title="ค่าใช้จ่าย × สินค้า/บริการที่สนใจ" code="SUR-07 × 08" />
          </>
        );
      }}
    </DashPage>
  );
}
