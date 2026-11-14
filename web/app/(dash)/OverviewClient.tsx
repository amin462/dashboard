"use client";

import { freq, overview } from "@/lib/survey/aggregate";
import { overviewInsights } from "@/lib/survey/insights";
import type { Row } from "@/lib/survey/schema";
import { FreqBar } from "@/components/charts/FreqBar";
import { SlotBar } from "@/components/charts/SlotBar";
import { DailyCard } from "@/components/overview/DailyCard";
import { OriginCompareCard } from "@/components/overview/OriginCompareCard";
import { RevisitDonutCard } from "@/components/overview/RevisitDonutCard";
import { dailyBoth, splitByOrigin } from "@/components/overview/overview-data";
import { overviewStats } from "@/components/overview/overview-kpis";
import { DashPage } from "@/components/page/DashPage";
import { InsightsSection } from "@/components/page/InsightsSection";
import { Cell } from "@/components/ui/Cell";
import { StatStrip } from "@/components/ui/StatStrip";

/** หน้าภาพรวม: grid 12 คอลัมน์ (มือถือ = คอลัมน์เดียว, KPI 2×2) ; ตัวเลขทุกค่ามาจาก lib/survey */
export function OverviewClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="ลูกค้าคือใคร สนใจอะไร มาวันไหนช่วงไหน และรู้จักจากช่องทางใด — อ่านจบใน 30 วินาที">
      {({ rows: filtered }) => {
        const ov = overview(filtered);
        const { outside } = splitByOrigin(filtered);
        const channel = freq(filtered, "sur06");
        return (
          <div className="space-y-4">
            <StatStrip items={overviewStats(ov)} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Cell span="lg:col-span-8">
                <OriginCompareCard rows={filtered} />
              </Cell>
              <Cell span="lg:col-span-4">
                <RevisitDonutCard result={freq(filtered, "sur10")} intent={ov.returnIntent} />
              </Cell>
              <Cell span="lg:col-span-12">
                <DailyCard data={dailyBoth(filtered, outside)} total={ov.n} outsideTotal={outside.length} />
              </Cell>
              <Cell span="lg:col-span-4">
                <SlotBar data={ov.slots} totalRows={ov.n} title="ช่วงเวลาที่มา" />
              </Cell>
              <Cell span="lg:col-span-8">
                <FreqBar result={channel} hideOthers title="ช่องทางที่รู้จัก" cta={{ href: "/awareness", label: "ดูรายละเอียด" }} />
              </Cell>
              <Cell span="lg:col-span-6">
                <FreqBar result={freq(filtered, "sur03")} title="มากับใคร" hideOthers />
              </Cell>
              <Cell span="lg:col-span-6">
                <FreqBar result={freq(filtered, "sur04")} title="พาหนะที่ใช้เดินทางมา" hideOthers cta={{ href: "/travel", label: "ดูการเดินทาง" }} />
              </Cell>
              <Cell span="lg:col-span-12">
                <InsightsSection
                  variant="panel"
                  title="ข้อเสนอสำหรับธุรกิจ"
                  insights={overviewInsights(filtered)}
                  n={ov.n}
                  cta={{ href: "/business", label: "ดูตามประเภทธุรกิจ" }}
                />
              </Cell>
            </div>
          </div>
        );
      }}
    </DashPage>
  );
}
