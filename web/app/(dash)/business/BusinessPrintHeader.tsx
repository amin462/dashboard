"use client";

import { useSyncExternalStore } from "react";
import type { Filters } from "@/lib/survey/filters";
import { bangkokDate, formatThaiDate, num } from "@/components/format";

/** สรุปตัวกรองที่ใช้อยู่เป็นข้อความ (เฉพาะแสดงผล ไม่ใช่การคำนวณสถิติ) */
function summarizeFilters(f: Filters): string {
  const parts: string[] = [];
  if (f.from) parts.push(`ตั้งแต่ ${formatThaiDate(f.from)}`);
  if (f.to) parts.push(`ถึง ${formatThaiDate(f.to)}`);
  if (f.age?.length) parts.push(`อายุ: ${f.age.join(", ")}`);
  if (f.origin?.length) parts.push(`พื้นที่: ${f.origin.join(", ")}`);
  if (f.companion?.length) parts.push(`มากับ: ${f.companion.join(", ")}`);
  if (f.transport?.length) parts.push(`พาหนะ: ${f.transport.join(", ")}`);
  return parts.join(" | ");
}

/** วันที่พิมพ์ (เขตเวลาไทย) : ฝั่งเซิร์ฟเวอร์ = "" กัน hydration ไม่ตรง ; อัปเดตอีกครั้งเมื่อเริ่มพิมพ์ (Ctrl+P) */
function subscribeBeforePrint(onChange: () => void) {
  window.addEventListener("beforeprint", onChange);
  return () => window.removeEventListener("beforeprint", onChange);
}
const todayThai = () => {
  const ymd = bangkokDate(new Date().toISOString());
  return ymd ? formatThaiDate(ymd) : "";
};

/** หัวรายงานเฉพาะตอนพิมพ์ : ประเภทธุรกิจ + วันที่พิมพ์ + ตัวกรอง + ฐานผู้ตอบ */
export function BusinessPrintHeader({ typeLabel, filters, n }: { typeLabel: string; filters: Filters; n: number }) {
  const printedAt = useSyncExternalStore(subscribeBeforePrint, todayThai, () => "");
  const filterText = summarizeFilters(filters);
  return (
    <header className="print-only space-y-0.5 border-b border-line pb-2">
      <h1 className="text-lg leading-7 font-semibold">รายงานสำหรับ {typeLabel} — วัดคูหาภิมุข</h1>
      <p className="type-meta text-ink-2">
        {printedAt && <>พิมพ์เมื่อ {printedAt} · </>}
        ตัวกรอง: {filterText || "ไม่มี (ผู้ตอบทั้งหมด)"} · ฐานผู้ตอบ {num(n)} คน
      </p>
    </header>
  );
}
