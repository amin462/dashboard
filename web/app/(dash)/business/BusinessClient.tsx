"use client";

import { useState } from "react";
import { BedDouble, Bus, Gift, Printer, Utensils, type LucideIcon } from "lucide-react";
import { topItem } from "@/lib/survey/aggregate";
import { BUSINESS_TYPES, businessInsights, type BusinessType } from "@/lib/survey/insights";
import type { Row } from "@/lib/survey/schema";
import { num } from "@/components/format";
import { DashPage, type PageData } from "@/components/page/DashPage";
import { InsightsSection } from "@/components/page/InsightsSection";
import { Cell } from "@/components/ui/Cell";
import { SmallSampleBadge } from "@/components/ui/SmallSampleBadge";
import { StatStrip } from "@/components/ui/StatStrip";
import { BIZ_VIEWS, bizData, type BizData } from "./biz-views";
import { BusinessPrintHeader } from "./BusinessPrintHeader";

const ICONS: Record<BusinessType, LucideIcon> = { restaurant: Utensils, hotel: BedDouble, shop: Gift, tour: Bus };

/** "ลูกค้าส่วนใหญ่คือใคร" 1 บรรทัดจากอันดับ 1 ของ freq() ข้อ 1 / 2 / 3 (ไม่นับ "ไม่ประสงค์ระบุ") */
function customerLine(d: BizData): string {
  const skip = ["ไม่ประสงค์ระบุ"];
  const age = topItem(d.age, skip);
  const origin = topItem(d.origin, skip);
  const comp = topItem(d.comp, skip);
  const parts = [
    age && `อายุ ${age.label} (${age.pct.toFixed(1)}%)`,
    origin && `พำนักที่${origin.label.replace(/^จังหวัด/, "")} (${origin.pct.toFixed(1)}%)`,
    comp && `มากับ${comp.label} (${comp.pct.toFixed(1)}%)`,
  ].filter(Boolean);
  return parts.length > 0 ? `กลุ่มลูกค้าที่พบมากที่สุด ${parts.join(" · ")}` : "ยังไม่มีข้อมูลเพียงพอสรุปว่าลูกค้าส่วนใหญ่เป็นใคร";
}

export function BusinessClient({ rows }: { rows: Row[] }) {
  const [type, setType] = useState<BusinessType>("restaurant");
  const view = BIZ_VIEWS[type];
  const typeLabel = BUSINESS_TYPES.find((b) => b.key === type)?.label ?? "";
  const TypeIcon = ICONS[type];

  return (
    <DashPage
      rows={rows}
      description="เลือกประเภทธุรกิจของคุณ แล้วดูว่าลูกค้าของคุณเป็นใคร มาช่วงไหน ใช้จ่ายเท่าไร พร้อมข้อเสนอเบื้องต้น"
      hideDescriptionOnPrint
      actions={(data: PageData) => (
        <button type="button" onClick={() => window.print()} disabled={data.rows.length === 0} className="btn btn-secondary">
          <Printer className="h-4 w-4" aria-hidden="true" />
          พิมพ์รายงานธุรกิจนี้
        </button>
      )}
    >
      {({ rows: filtered, filters }) => {
        const d = bizData(filtered);
        return (
          <div className="biz-print space-y-4">
            <BusinessPrintHeader typeLabel={typeLabel} filters={filters} n={d.n} />
            <div
              role="tablist"
              aria-label="ประเภทธุรกิจ"
              className="no-print card grid grid-cols-2 gap-1.5 p-1.5 lg:grid-cols-4"
            >
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
                    className={`flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-3 py-2 text-center font-medium transition-colors duration-150 ${
                      selected ? "bg-navy-solid text-navy-fg" : "text-ink-2 hover:bg-surface-2"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${selected ? "text-amber" : "text-ink-3"}`} aria-hidden="true" />
                    <span className="min-w-0 leading-5">{b.label}</span>
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" aria-label={typeLabel} className="space-y-4 print:space-y-3">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 print:gap-3">
                <Cell span="lg:col-span-5">
                  <section aria-label={`โปรไฟล์ลูกค้า ${typeLabel}`} className="print-card card kpi-solid flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber text-amber-fg">
                        <TypeIcon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="type-meta opacity-85">ธุรกิจของคุณ</p>
                        <h2 className="text-xl leading-7 font-semibold">{typeLabel}</h2>
                      </div>
                    </div>
                    <p className="text-[15px] leading-6">{customerLine(d)}</p>
                    <p className="mt-auto type-meta opacity-85">
                      ควรดู: {view.focus} · ฐานผู้ตอบ {num(d.n)} คน
                    </p>
                    <SmallSampleBadge n={d.n} className="self-start" />
                  </section>
                </Cell>
                <Cell span="lg:col-span-7">
                  <StatStrip items={view.stats(d)} solidFirst={false} label={`ตัวชี้วัดสำคัญของ${typeLabel}`} />
                </Cell>
              </div>
              <InsightsSection title="ข้อเสนอสำหรับธุรกิจของคุณ" insights={businessInsights(filtered, type)} n={d.n} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:grid-cols-2 print:gap-3">{view.charts(d)}</div>
            </div>
            <p className="print-only type-meta text-ink-3">
              ฐานผู้ตอบ {num(d.n)} คน ตัวเลขทั้งหมดคำนวณจากผู้ตอบในตัวกรองที่ระบุข้างต้น <SmallSampleBadge n={d.n} className="ml-1" />
            </p>
          </div>
        );
      }}
    </DashPage>
  );
}
