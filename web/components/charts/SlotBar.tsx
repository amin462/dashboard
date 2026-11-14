"use client";

import { useMemo } from "react";
import type { Slot } from "@/lib/survey/schema";
import { BarRows } from "./BarRows";
import { ChartCard, type ChartTableData } from "./ChartCard";

type SlotBarProps = {
  data: { slot: Slot; count: number; pct: number }[];
  totalRows: number;
  title?: string;
};

const SLOT_LABEL: Record<Slot, string> = {
  เช้า: "เช้า (06–11 น.)",
  บ่าย: "บ่าย (12–15 น.)",
  เย็น: "เย็น (16–19 น.)",
  อื่น: "ช่วงเวลาอื่น",
};

export function SlotBar({ data, totalRows, title = "ช่วงเวลาที่มาเยือน" }: SlotBarProps) {
  const rows = useMemo(
    () => data.map((d) => ({ label: SLOT_LABEL[d.slot], count: d.count, pct: d.pct, tail: d.slot === "อื่น", slot: d.slot })),
    [data],
  );
  // อันดับ 1 = ช่วงที่มีผู้ตอบมากสุด (ไม่นับ "อื่น") ; ผลมาจาก bySlot() ไม่คำนวณใหม่
  const top = useMemo(() => {
    const main = rows.filter((r) => !r.tail && r.count > 0);
    return main.reduce<(typeof main)[number] | null>((best, r) => (!best || r.count > best.count ? r : best), null);
  }, [rows]);

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ช่วงเวลา", "จำนวน (คน)", "ร้อยละ (%)"],
      rows: rows.map((r) => [r.label, r.count.toLocaleString("th-TH"), `${r.pct.toFixed(1)}%`]),
    }),
    [rows],
  );

  return (
    <ChartCard
      title={title}
      code="TIME"
      takeaway={top ? `มามากที่สุด: ${top.label} (${top.pct.toFixed(1)}%)` : undefined}
      base={totalRows}
      note="นับจากเวลาส่งแบบสำรวจ"
      tableData={tableData}
    >
      <BarRows label={`${title} ฐาน ${totalRows} คน`} highlight={top?.label ?? null} rows={rows} />
    </ChartCard>
  );
}
