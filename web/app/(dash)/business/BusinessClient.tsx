"use client";

import { useState } from "react";
import { BedDouble, Bus, Gift, Utensils, type LucideIcon } from "lucide-react";
import { BUSINESS_TYPES, businessInsights, type BusinessType } from "@/lib/survey/insights";
import type { Row } from "@/lib/survey/schema";
import { DashPage } from "@/components/page/DashPage";
import { InsightsSection } from "@/components/page/InsightsSection";
import { StatStrip } from "@/components/ui/StatStrip";
import { BIZ_VIEWS, bizData } from "./biz-views";

const ICONS: Record<BusinessType, LucideIcon> = { restaurant: Utensils, hotel: BedDouble, shop: Gift, tour: Bus };

export function BusinessClient({ rows }: { rows: Row[] }) {
  const [type, setType] = useState<BusinessType>("restaurant");
  const view = BIZ_VIEWS[type];

  return (
    <DashPage rows={rows} description="เลือกประเภทธุรกิจของคุณ แล้วดูว่าลูกค้าของคุณเป็นใคร มาช่วงไหน ใช้จ่ายเท่าไร พร้อมข้อเสนอเบื้องต้น">
      {({ rows: filtered }) => {
        const d = bizData(filtered);
        return (
          <>
            <div role="tablist" aria-label="ประเภทธุรกิจ" className="no-print grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 sm:inline-grid sm:grid-cols-4">
              {BUSINESS_TYPES.map((b) => {
                const Icon = ICONS[b.key];
                const selected = b.key === type;
                return (
                  <button
                    key={b.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setType(b.key)}
                    className={`flex h-9 items-center justify-center gap-2 rounded-lg px-3 whitespace-nowrap transition-colors duration-150 ${
                      selected ? "bg-brand font-medium text-brand-fg" : "text-ink-2 hover:bg-surface-2"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {b.label}
                  </button>
                );
              })}
            </div>
            <div role="tabpanel" aria-label={BUSINESS_TYPES.find((b) => b.key === type)?.label} className="space-y-4">
              <StatStrip items={view.stats(d)} />
              <InsightsSection title="ข้อเสนอสำหรับธุรกิจของคุณ" insights={businessInsights(filtered, type)} n={d.n} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{view.charts(d)}</div>
            </div>
          </>
        );
      }}
    </DashPage>
  );
}
