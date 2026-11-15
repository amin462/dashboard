"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { applyFilters, filtersFromSearchParams, hasFilters, type Filters } from "@/lib/survey/filters";
import { SMALL_PAGE_N, type Row } from "@/lib/survey/schema";
import { setResultCount } from "../filters/result-count";
import { EmptyState } from "../ui/EmptyState";
import { SmallPageNotice } from "../ui/SmallPageNotice";

export type PageData = {
  /** แถวหลังกรองแล้ว (ใช้เป็นอินพุตของ lib/survey ทุกฟังก์ชัน) */
  rows: Row[];
  /** จำนวนผู้ตอบสมบูรณ์ทั้งหมด (ก่อนกรอง) */
  total: number;
  filters: Filters;
  isFiltered: boolean;
};

type DashPageProps = {
  /** แถวผู้ตอบสมบูรณ์ทั้งหมดจาก server */
  rows: Row[];
  /** คำอธิบายหน้า 1 บรรทัด (ชื่อหน้าอยู่ใน top bar แล้ว) */
  description: string;
  /** ซ่อนคำอธิบายหน้าตอนพิมพ์ (หน้าที่มีหัวรายงานของตัวเอง) */
  hideDescriptionOnPrint?: boolean;
  /** ปุ่มมุมขวาของหัวหน้า (เช่น ส่งออก/พิมพ์) */
  actions?: (data: PageData) => ReactNode;
  children: (data: PageData) => ReactNode;
};

/**
 * เทมเพลตหน้าวิเคราะห์ทุกหน้า: อ่านตัวกรองจาก URL → กรองแถว → รายงานจำนวนให้แถวตัวกรอง
 * → คำอธิบาย 1 บรรทัด → (ไม่มีข้อมูล = EmptyState | เนื้อหา)
 */
export function DashPage({ rows, description, hideDescriptionOnPrint = false, actions, children }: DashPageProps) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const isFiltered = hasFilters(filters);
  const total = rows.length;
  const count = filtered.length;
  const data: PageData = { rows: filtered, total, filters, isFiltered };

  useEffect(() => {
    setResultCount({ filtered: count, total });
    return () => setResultCount(null);
  }, [count, total]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className={`max-w-3xl text-ink-2 ${hideDescriptionOnPrint ? "print:hidden" : ""}`}>{description}</p>
        {actions && <div className="no-print flex max-w-full min-w-0 flex-wrap gap-2">{actions(data)}</div>}
      </div>
      {count > 0 && count < SMALL_PAGE_N && <SmallPageNotice n={count} total={total} isFiltered={isFiltered} />}
      {count === 0 ? <EmptyState /> : children(data)}
    </div>
  );
}
