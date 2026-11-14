"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  Clock,
  Compass,
  Gift,
  ShoppingBag,
  Store,
  Utensils,
  Wallet,
} from "lucide-react";
import { bySlot, freq, multiFreq, topItem } from "@/lib/survey/aggregate";
import {
  BUSINESS_TYPES,
  businessInsights,
  type BusinessType,
} from "@/lib/survey/insights";
import { QUESTIONS, SMALL_N, type Row } from "@/lib/survey/schema";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FreqBar } from "@/components/FreqBar";
import { InsightCard } from "@/components/InsightCard";
import { KpiCard } from "@/components/KpiCard";
import { SlotBar } from "@/components/SlotBar";
import { SmallSampleBadge } from "@/components/SmallSampleBadge";
import { useFilteredRows } from "@/components/useFilteredRows";

const BIZ_ICONS: Record<BusinessType, typeof Store> = {
  restaurant: Utensils,
  hotel: BedDouble,
  shop: Gift,
  tour: Compass,
};

export function BusinessClient({ rows }: { rows: Row[] }) {
  const { filtered, isFiltered } = useFilteredRows(rows);
  const [bizType, setBizType] = useState<BusinessType>("restaurant");

  const insights = useMemo(
    () => businessInsights(filtered, bizType),
    [filtered, bizType]
  );

  const interestFreq = useMemo(() => multiFreq(filtered), [filtered]);
  const originFreq = useMemo(() => freq(filtered, "sur02"), [filtered]);
  const compFreq = useMemo(() => freq(filtered, "sur03"), [filtered]);
  const transFreq = useMemo(() => freq(filtered, "sur04"), [filtered]);
  const purposeFreq = useMemo(() => freq(filtered, "sur05"), [filtered]);
  const channelFreq = useMemo(() => freq(filtered, "sur06"), [filtered]);
  const spendFreq = useMemo(() => freq(filtered, "sur07"), [filtered]);
  const slots = useMemo(() => bySlot(filtered), [filtered]);

  const findInterest = (label: string) =>
    interestFreq.items.find((i) => i.label === label);

  const topSpend = useMemo(
    () => topItem(spendFreq, [...(QUESTIONS.sur07.notSpecified ?? [])]),
    [spendFreq]
  );
  const topOrigin = useMemo(
    () => topItem(originFreq, ["ไม่ประสงค์ระบุ"]),
    [originFreq]
  );
  const topComp = useMemo(
    () => topItem(compFreq, ["ไม่ประสงค์ระบุ"]),
    [compFreq]
  );
  const topTrans = useMemo(
    () => topItem(transFreq, ["ไม่ประสงค์ระบุ"]),
    [transFreq]
  );
  const topPurpose = useMemo(() => topItem(purposeFreq), [purposeFreq]);
  const peakSlot = useMemo(() => {
    const valid = slots.filter((s) => s.slot !== "อื่น");
    return [...valid].sort((a, b) => b.count - a.count)[0] ?? null;
  }, [slots]);

  const restaurantInterest = findInterest("อาหารและเครื่องดื่ม");
  const hotelInterest = findInterest("โรงแรม / ที่พัก / โฮมสเตย์");
  const shopInterest = findInterest("ของฝาก / ผลิตภัณฑ์ชุมชน");
  const tourTransportInterest = findInterest("บริการเดินทาง / ขนส่ง");
  const tourGuideInterest = findInterest("กิจกรรมท่องเที่ยว / นำเที่ยว");

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="มุมมองเฉพาะทางสำหรับผู้ประกอบการ"
        title="มุมมองตามประเภทธุรกิจ"
        subtitle="เลือกประเภทธุรกิจของคุณเพื่อดูตัวชี้วัดที่เกี่ยวข้องและข้อเสนอแนะเบื้องต้นจากข้อมูลผู้ตอบแบบสำรวจ"
        filteredCount={filtered.length}
        totalCount={rows.length}
        isFiltered={isFiltered}
      />

      {/* Segmented Control 4 ประเภทธุรกิจ */}
      <div
        role="tablist"
        aria-label="เลือกประเภทธุรกิจ"
        className="grid grid-cols-1 gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[var(--shadow-card)] sm:grid-cols-2 xl:grid-cols-4"
      >
        {BUSINESS_TYPES.map((b) => {
          const Icon = BIZ_ICONS[b.key];
          const selected = bizType === b.key;
          return (
            <button
              key={b.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setBizType(b.key)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all ${
                selected
                  ? "bg-brand text-white shadow-sm dark:bg-[#0d736b]"
                  : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  selected ? "text-white" : "text-brand"
                }`}
                aria-hidden="true"
              />
              <span className="leading-snug">{b.label}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div role="tabpanel" aria-label={BUSINESS_TYPES.find((b) => b.key === bizType)?.label} className="space-y-6">
          {/* KPIs เฉพาะประเภทธุรกิจ */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {bizType === "restaurant" && (
              <>
                <KpiCard
                  label="สนใจอาหารและเครื่องดื่ม"
                  value={`${(restaurantInterest?.pct ?? 0).toFixed(1)}%`}
                  subtext={`${(restaurantInterest?.count ?? 0).toLocaleString("th-TH")} จาก ${interestFreq.base.toLocaleString("th-TH")} คนที่ตอบข้อ 8`}
                  icon={<Utensils className="h-5 w-5" />}
                  tone="teal"
                  sampleN={interestFreq.base}
                />
                <KpiCard
                  label="ช่วงค่าใช้จ่ายที่พบมากสุด"
                  value={topSpend ? topSpend.label : "ไม่มีข้อมูล"}
                  subtext={
                    topSpend
                      ? `${topSpend.count} คน (${topSpend.pct.toFixed(1)}%)`
                      : "ไม่มีข้อมูลค่าใช้จ่าย"
                  }
                  icon={<Wallet className="h-5 w-5" />}
                  tone="amber"
                  sampleN={spendFreq.base}
                />
                <KpiCard
                  label="ช่วงเวลาที่นักท่องเที่ยวมามากสุด"
                  value={peakSlot && peakSlot.count > 0 ? `ช่วง${peakSlot.slot}` : "—"}
                  subtext={
                    peakSlot && peakSlot.count > 0
                      ? `${peakSlot.count.toLocaleString("th-TH")} คน (${peakSlot.pct.toFixed(1)}%)`
                      : "ไม่มีข้อมูลช่วงเวลา"
                  }
                  icon={<Clock className="h-5 w-5" />}
                  tone="stone"
                  sampleN={filtered.length}
                />
              </>
            )}

            {bizType === "hotel" && (
              <>
                <KpiCard
                  label="สนใจโรงแรม / ที่พัก / โฮมสเตย์"
                  value={`${(hotelInterest?.pct ?? 0).toFixed(1)}%`}
                  subtext={`${(hotelInterest?.count ?? 0).toLocaleString("th-TH")} จาก ${interestFreq.base.toLocaleString("th-TH")} คนที่ตอบข้อ 8`}
                  icon={<BedDouble className="h-5 w-5" />}
                  tone="teal"
                  sampleN={interestFreq.base}
                />
                <KpiCard
                  label="พื้นที่พำนักที่พบมากสุด"
                  value={topOrigin ? topOrigin.label : "ไม่ระบุ"}
                  subtext={
                    topOrigin
                      ? `${topOrigin.count} คน (${topOrigin.pct.toFixed(1)}%) ของผู้ตอบข้อ 2`
                      : "ไม่มีข้อมูลพื้นที่พำนัก"
                  }
                  icon={<Store className="h-5 w-5" />}
                  tone="amber"
                  sampleN={originFreq.base}
                />
                <KpiCard
                  label="ช่วงค่าใช้จ่ายที่พบมากสุด"
                  value={topSpend ? topSpend.label : "ไม่มีข้อมูล"}
                  subtext={
                    topSpend
                      ? `${topSpend.count} คน (${topSpend.pct.toFixed(1)}%) ของผู้ตอบข้อ 7`
                      : "ไม่มีข้อมูลค่าใช้จ่าย"
                  }
                  icon={<Wallet className="h-5 w-5" />}
                  tone="stone"
                  sampleN={spendFreq.base}
                />
              </>
            )}

            {bizType === "shop" && (
              <>
                <KpiCard
                  label="สนใจของฝาก / ผลิตภัณฑ์ชุมชน"
                  value={`${(shopInterest?.pct ?? 0).toFixed(1)}%`}
                  subtext={`${(shopInterest?.count ?? 0).toLocaleString("th-TH")} จาก ${interestFreq.base.toLocaleString("th-TH")} คนที่ตอบข้อ 8`}
                  icon={<Gift className="h-5 w-5" />}
                  tone="teal"
                  sampleN={interestFreq.base}
                />
                <KpiCard
                  label="ช่วงค่าใช้จ่ายที่พบมากสุด"
                  value={topSpend ? topSpend.label : "ไม่มีข้อมูล"}
                  subtext={
                    topSpend
                      ? `${topSpend.count} คน (${topSpend.pct.toFixed(1)}%) ของผู้ตอบข้อ 7`
                      : "ไม่มีข้อมูลค่าใช้จ่าย"
                  }
                  icon={<Wallet className="h-5 w-5" />}
                  tone="amber"
                  sampleN={spendFreq.base}
                />
                <KpiCard
                  label="วัตถุประสงค์การมาหลัก"
                  value={topPurpose ? topPurpose.label : "ไม่มีข้อมูล"}
                  subtext={
                    topPurpose
                      ? `${topPurpose.count} คน (${topPurpose.pct.toFixed(1)}%) ของผู้ตอบข้อ 5`
                      : "ไม่มีข้อมูลวัตถุประสงค์"
                  }
                  icon={<ShoppingBag className="h-5 w-5" />}
                  tone="stone"
                  sampleN={purposeFreq.base}
                />
              </>
            )}

            {bizType === "tour" && (
              <>
                <KpiCard
                  label="สนใจบริการเดินทาง / ขนส่ง"
                  value={`${(tourTransportInterest?.pct ?? 0).toFixed(1)}%`}
                  subtext={`${(tourTransportInterest?.count ?? 0).toLocaleString("th-TH")} จาก ${interestFreq.base.toLocaleString("th-TH")} คนที่ตอบข้อ 8`}
                  icon={<Compass className="h-5 w-5" />}
                  tone="teal"
                  sampleN={interestFreq.base}
                />
                <KpiCard
                  label="สนใจกิจกรรมท่องเที่ยว / นำเที่ยว"
                  value={`${(tourGuideInterest?.pct ?? 0).toFixed(1)}%`}
                  subtext={`${(tourGuideInterest?.count ?? 0).toLocaleString("th-TH")} จาก ${interestFreq.base.toLocaleString("th-TH")} คนที่ตอบข้อ 8`}
                  icon={<Store className="h-5 w-5" />}
                  tone="amber"
                  sampleN={interestFreq.base}
                />
                <KpiCard
                  label="พาหนะหลักของผู้มาเยือน"
                  value={topTrans ? topTrans.label : "ไม่ระบุ"}
                  subtext={
                    topTrans
                      ? `${topTrans.count} คน (${topTrans.pct.toFixed(1)}%) · กลุ่มหลัก: ${topComp?.label ?? "—"}`
                      : "ไม่มีข้อมูลพาหนะ"
                  }
                  icon={<Wallet className="h-5 w-5" />}
                  tone="stone"
                  sampleN={transFreq.base}
                />
              </>
            )}
          </div>

          {/* InsightCards จาก businessInsights() */}
          <section aria-label="ข้อเสนอแนะเชิงกฎสำหรับธุรกิจ">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">
                ข้อแนะนำเชิงปฏิบัติจากข้อมูลผู้ตอบ
              </h2>
              <span className="text-xs text-ink-muted">
                คำนวณตามเกณฑ์ในระบบสำหรับธุรกิจที่เลือก (ฐานต้อง ≥ {SMALL_N} คน)
              </span>
            </div>

            {insights.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {insights.map((ins) => (
                  <InsightCard key={`${bizType}-${ins.title}`} insight={ins} />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-border bg-accent-soft px-4 py-3.5 text-sm text-accent-ink">
                <p>
                  ข้อมูลในกลุ่มที่กรองมีน้อยกว่า {SMALL_N} คน (n = {filtered.length}) จึงยังไม่แสดงข้อเสนอเบื้องต้นตามเกณฑ์ความน่าเชื่อถือ
                </p>
                <SmallSampleBadge n={filtered.length} />
              </div>
            )}
          </section>

          {/* กราฟประกอบการตัดสินใจตามประเภทธุรกิจ */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {bizType === "restaurant" && (
              <>
                <SlotBar data={slots} totalRows={filtered.length} />
                <FreqBar
                  result={compFreq}
                  title="3. กลุ่มผู้ร่วมเดินทาง (ขนาดกลุ่มลูกค้า)"
                />
              </>
            )}
            {bizType === "hotel" && (
              <>
                <FreqBar
                  result={originFreq}
                  title="2. พื้นที่พำนักของผู้ตอบแบบสำรวจ"
                />
                <FreqBar
                  result={spendFreq}
                  title="7. ค่าใช้จ่ายโดยประมาณ"
                />
              </>
            )}
            {bizType === "shop" && (
              <>
                <FreqBar
                  result={spendFreq}
                  title="7. ค่าใช้จ่ายโดยประมาณ"
                />
                <FreqBar
                  result={purposeFreq}
                  title="5. วัตถุประสงค์ในการเดินทาง"
                />
              </>
            )}
            {bizType === "tour" && (
              <>
                <FreqBar
                  result={transFreq}
                  title="4. พาหนะที่ใช้เดินทาง"
                />
                <FreqBar
                  result={channelFreq}
                  title="6. ช่องทางที่รู้จักสถานที่ (เพื่อวางแผนโปรโมต)"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
