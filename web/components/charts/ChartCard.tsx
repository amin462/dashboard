"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { SmallSampleBadge } from "../ui/SmallSampleBadge";
import { CtaLink } from "../ui/CtaLink";
import { DataTable, type ChartTableData } from "./DataTable";
import { LegendDots, type LegendItem } from "./LegendDots";

export type { ChartTableData };

type ChartCardProps = {
  title: string;
  /** รหัสข้อ เช่น SUR-07 */
  code?: string;
  /** ประโยคสรุปใต้ชื่อ เช่น "พบมากที่สุด: 301–600 บาท (37.5%)" */
  takeaway?: string;
  /** ฐาน n (ตัวหาร) */
  base: number;
  skipped?: number;
  notSpecified?: number;
  unit?: string;
  /** หมายเหตุท้ายการ์ด เช่น "ตอบได้หลายข้อ" */
  note?: string;
  /** ถ้ามี จะแสดงปุ่มสลับกราฟ/ตาราง */
  tableData?: ChartTableData;
  /** legend จุดกลมชิดบนขวา */
  legend?: LegendItem[];
  /** แทนข้อความ "ฐาน n = …" (เช่น แยก n ต่อกลุ่ม) ; badge กลุ่มเล็กยังอิง base */
  baseText?: string;
  /** ปุ่ม CTA อำพันท้ายการ์ด */
  cta?: { href: string; label: string };
  children: ReactNode;
};

export function ChartCard({
  title,
  code,
  takeaway,
  base,
  skipped,
  notSpecified,
  unit = "คน",
  note,
  tableData,
  legend,
  baseText,
  cta,
  children,
}: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  const fmt = (n: number) => n.toLocaleString("th-TH");

  return (
    <section className="print-card card flex min-w-0 flex-col p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="type-section text-ink">{title}</h2>
            {code && (
              <span className="rounded border border-line px-1.5 text-[11px] leading-[18px] text-ink-3">{code}</span>
            )}
          </div>
          {takeaway && <p className="mt-0.5 text-ink-2">{takeaway}</p>}
        </div>
        <div className="flex shrink-0 items-start gap-3">
          {legend && (
            <div className="hidden pt-1 sm:block">
              <LegendDots items={legend} />
            </div>
          )}
          {tableData && (
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              aria-pressed={showTable}
              aria-label={showTable ? "ดูเป็นกราฟ" : "ดูเป็นตาราง"}
              title={showTable ? "ดูเป็นกราฟ" : "ดูเป็นตาราง"}
              className="no-print btn btn-secondary w-8 px-0"
            >
              {showTable ? <BarChart3 className="h-4 w-4" aria-hidden="true" /> : <Table2 className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
        </div>
      </header>
      {legend && (
        <div className="mt-2 sm:hidden">
          <LegendDots items={legend} />
        </div>
      )}

      <div className="mt-4 flex-1">
        {showTable && tableData ? <DataTable data={tableData} caption={title} /> : children}
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 type-meta text-ink-3">
        <span>
          {baseText ?? `ฐาน n = ${fmt(base)} ${unit}`}
          {typeof skipped === "number" && ` · ไม่ตอบ ${fmt(skipped)}`}
          {typeof notSpecified === "number" && ` · ไม่ประสงค์ระบุ ${fmt(notSpecified)}`}
          {note && ` · ${note}`}
        </span>
        {base > 0 && <SmallSampleBadge n={base} />}
        {cta && (
          <span className="ml-auto">
            <CtaLink href={cta.href}>{cta.label}</CtaLink>
          </span>
        )}
      </footer>
    </section>
  );
}
