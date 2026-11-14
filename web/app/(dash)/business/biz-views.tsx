import type { ReactNode } from "react";
import { bySlot, freq, multiFreq, topItem } from "@/lib/survey/aggregate";
import type { BusinessType } from "@/lib/survey/insights";
import { QUESTIONS, type Row } from "@/lib/survey/schema";
import { FreqBar } from "@/components/charts/FreqBar";
import { SlotBar } from "@/components/charts/SlotBar";
import { num } from "@/components/format";
import { shareStat, topStat } from "@/components/page/stat-helpers";
import type { Stat } from "@/components/ui/StatStrip";

/** ผลสรุปจาก lib/survey ที่ทุกมุมมองธุรกิจใช้ร่วมกัน (คำนวณครั้งเดียวต่อการกรอง) */
export function bizData(rows: Row[]) {
  return {
    n: rows.length,
    age: freq(rows, "sur01"),
    interest: multiFreq(rows),
    origin: freq(rows, "sur02"),
    comp: freq(rows, "sur03"),
    trans: freq(rows, "sur04"),
    purpose: freq(rows, "sur05"),
    channel: freq(rows, "sur06"),
    spend: freq(rows, "sur07"),
    slots: bySlot(rows),
  };
}
export type BizData = ReturnType<typeof bizData>;

const interestOf = (d: BizData, label: string) => d.interest.items.find((i) => i.label === label);
const spendTop = (d: BizData) => topItem(d.spend, [...(QUESTIONS.sur07.notSpecified ?? [])]);

function peakSlotStat(d: BizData): Stat {
  const peak = d.slots.filter((s) => s.slot !== "อื่น" && s.count > 0).reduce<(typeof d.slots)[number] | null>(
    (b, s) => (!b || s.count > b.count ? s : b),
    null,
  );
  return {
    label: "ช่วงเวลาที่ลูกค้ามามากที่สุด",
    value: peak ? `ช่วง${peak.slot}` : "—",
    context: peak ? `${num(peak.count)} คน (${peak.pct.toFixed(1)}%) ของผู้ตอบทั้งหมด` : "ไม่มีข้อมูลช่วงเวลา",
    sampleN: d.n,
  };
}

export const BIZ_VIEWS: Record<
  BusinessType,
  {
    /** สิ่งที่ธุรกิจประเภทนี้ควรดูในหน้านี้ (ข้อความกำกับการ์ดโปรไฟล์) */
    focus: string;
    stats: (d: BizData) => Stat[];
    charts: (d: BizData) => ReactNode;
  }
> = {
  restaurant: {
    focus: "ความสนใจอาหาร ช่วงเวลาที่ลูกค้ามา และงบต่อคน",
    stats: (d) => [
      shareStat("ลูกค้าของคุณสนใจอาหารและเครื่องดื่ม", interestOf(d, "อาหารและเครื่องดื่ม"), d.interest, 8),
      topStat("ช่วงที่ลูกค้าใช้จ่ายมากที่สุด", spendTop(d), d.spend, 7),
      peakSlotStat(d),
    ],
    charts: (d) => (
      <>
        <SlotBar data={d.slots} totalRows={d.n} title="ลูกค้าของคุณมาช่วงไหน" />
        <FreqBar result={d.comp} title="ลูกค้ามากับใคร (ขนาดกลุ่ม)" />
      </>
    ),
  },
  hotel: {
    focus: "ความสนใจที่พัก ถิ่นพำนักของลูกค้า และงบต่อคน",
    stats: (d) => [
      shareStat("ลูกค้าของคุณสนใจที่พัก / โฮมสเตย์", interestOf(d, "โรงแรม / ที่พัก / โฮมสเตย์"), d.interest, 8),
      topStat("ลูกค้าส่วนใหญ่พำนักที่", topItem(d.origin, ["ไม่ประสงค์ระบุ"]), d.origin, 2, "ไม่ระบุ"),
      topStat("ช่วงที่ลูกค้าใช้จ่ายมากที่สุด", spendTop(d), d.spend, 7),
    ],
    charts: (d) => (
      <>
        <FreqBar result={d.origin} title="ลูกค้ามาจากพื้นที่ไหน" />
        <FreqBar result={d.spend} title="ลูกค้าใช้จ่ายเท่าไร" />
      </>
    ),
  },
  shop: {
    focus: "ความสนใจของฝาก ช่วงราคาที่ใช้จ่าย และเหตุผลที่มา",
    stats: (d) => [
      shareStat("ลูกค้าของคุณสนใจของฝาก / ผลิตภัณฑ์ชุมชน", interestOf(d, "ของฝาก / ผลิตภัณฑ์ชุมชน"), d.interest, 8),
      topStat("ช่วงที่ลูกค้าใช้จ่ายมากที่สุด", spendTop(d), d.spend, 7),
      topStat("ลูกค้ามาด้วยเหตุผลหลักคือ", topItem(d.purpose), d.purpose, 5),
    ],
    charts: (d) => (
      <>
        <FreqBar result={d.spend} title="ลูกค้าใช้จ่ายเท่าไร" />
        <FreqBar result={d.purpose} title="ลูกค้ามาเพราะอะไร" />
      </>
    ),
  },
  tour: {
    focus: "ความสนใจนำเที่ยว/ขนส่ง พาหนะ และช่องทางที่ลูกค้ารู้จัก",
    stats: (d) => [
      shareStat("ลูกค้าของคุณสนใจบริการเดินทาง / ขนส่ง", interestOf(d, "บริการเดินทาง / ขนส่ง"), d.interest, 8),
      shareStat("ลูกค้าของคุณสนใจกิจกรรม / นำเที่ยว", interestOf(d, "กิจกรรมท่องเที่ยว / นำเที่ยว"), d.interest, 8),
      topStat("ลูกค้าเดินทางมาด้วย", topItem(d.trans, ["ไม่ประสงค์ระบุ"]), d.trans, 4, "ไม่ระบุ"),
    ],
    charts: (d) => (
      <>
        <FreqBar result={d.trans} title="ลูกค้าเดินทางมาด้วยอะไร" />
        <FreqBar result={d.channel} title="ลูกค้ารู้จักสถานที่จากช่องทางไหน" />
      </>
    ),
  },
};
