"use client";

import { useMemo } from "react";
import { Download, Printer } from "lucide-react";
import {
  freq,
  multiFreq,
  overview,
  satisfaction,
  type FreqResult,
} from "@/lib/survey/aggregate";
import { filtersToQuery } from "@/lib/survey/filters";
import {
  CODES,
  DISCLAIMER,
  QUESTIONS,
  type Code,
  type Row,
} from "@/lib/survey/schema";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { SmallSampleBadge } from "@/components/SmallSampleBadge";
import { formatThaiDate } from "@/components/nav-config";
import { useFilteredRows } from "@/components/useFilteredRows";

const REPORT_CODES: Code[] = CODES.filter(
  (c) => c.startsWith("sur") && c !== "sur11"
);

function escapeCsvCell(value: string | number, sanitizeFormula = false): string {
  let str = String(value);
  if (sanitizeFormula && /^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildReportCsv(
  results: FreqResult[],
  sat: ReturnType<typeof satisfaction>,
  comments: Row[],
  totalFiltered: number,
  filterSummary: string
): string {
  const lines: string[][] = [
    ["รายงานสรุปผลแบบสำรวจนักท่องเที่ยว ณ วัดคูหาภิมุข (อำเภอเมืองยะลา)"],
    ["จำนวนผู้ตอบสมบูรณ์ตามตัวกรอง (คน)", String(totalFiltered)],
    ["ตัวกรองที่ใช้", filterSummary || "ไม่มี (แสดงทั้งหมด)"],
    [
      "ความพึงพอใจเฉลี่ย (1-5)",
      sat.mean !== null ? sat.mean.toFixed(2) : "-",
      "SD",
      sat.sd !== null ? sat.sd.toFixed(2) : "-",
      "ระดับ",
      sat.level ?? "-",
      "ผู้ให้คะแนน 1-5 (คน)",
      String(sat.n),
    ],
    ["จำนวนข้อเสนอแนะที่เป็นข้อความ (ข้อ 11)", String(comments.length)],
    ["หมายเหตุ", DISCLAIMER],
    [],
    [
      "รหัสข้อ",
      "หัวข้อคำถาม",
      "ตัวเลือก",
      "จำนวน (คน)",
      "ร้อยละ (%)",
      "ฐานผู้ตอบข้อนี้ (คน)",
      "ไม่ตอบ (คน)",
      "ไม่ประสงค์ระบุ (คน)",
    ],
  ];

  for (const r of results) {
    for (const item of r.items) {
      lines.push([
        r.code.toUpperCase(),
        r.title,
        item.label,
        String(item.count),
        item.pct.toFixed(1),
        String(r.base),
        String(r.skipped),
        String(r.notSpecified),
      ]);
    }
  }

  if (comments.length > 0) {
    lines.push([]);
    lines.push(["ข้อเสนอแนะเพิ่มเติม (SUR-11)", "วันที่", "ช่วงเวลา", "คะแนนความพึงพอใจ"]);
    for (const c of comments) {
      lines.push([
        c.sur11 ?? "",
        c.date,
        c.slot,
        c.sat !== null ? String(c.sat) : "-",
      ]);
    }
  }

  return lines
    .map((row, rowIdx) =>
      row
        .map((cell, colIdx) =>
          escapeCsvCell(cell, rowIdx > 7 && colIdx === 0)
        )
        .join(",")
    )
    .join("\r\n");
}

export function ReportsClient({ rows }: { rows: Row[] }) {
  const { filtered, filters, isFiltered } = useFilteredRows(rows);

  const results = useMemo<FreqResult[]>(
    () =>
      REPORT_CODES.map((code) =>
        code === "sur08" ? multiFreq(filtered) : freq(filtered, code)
      ),
    [filtered]
  );

  const sat = useMemo(() => satisfaction(filtered), [filtered]);
  const ov = useMemo(() => overview(filtered), [filtered]);
  const comments = useMemo(
    () =>
      filtered
        .filter((r) => Boolean(r.sur11 && r.sur11.trim() !== ""))
        .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)),
    [filtered]
  );

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.from) parts.push(`ตั้งแต่ ${formatThaiDate(filters.from)}`);
    if (filters.to) parts.push(`ถึง ${formatThaiDate(filters.to)}`);
    if (filters.age?.length) parts.push(`อายุ: ${filters.age.join(", ")}`);
    if (filters.origin?.length)
      parts.push(`พื้นที่: ${filters.origin.join(", ")}`);
    if (filters.companion?.length)
      parts.push(`มากับ: ${filters.companion.join(", ")}`);
    if (filters.transport?.length)
      parts.push(`พาหนะ: ${filters.transport.join(", ")}`);
    return parts.join(" | ");
  }, [filters]);

  const handleExportCsv = () => {
    const csv = buildReportCsv(
      results,
      sat,
      comments,
      filtered.length,
      filterSummary
    );
    // ใส่ UTF-8 BOM (\uFEFF) เพื่อให้ Microsoft Excel เปิดภาษาไทยได้ถูกต้อง
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const suffix = filtersToQuery(filters) ? "filtered" : "all";
    a.href = url;
    a.download = `yala-insight-report-${suffix}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="รายงานสรุปผลทางสถิติ"
        title="รายงาน & ส่งออกข้อมูล"
        subtitle="ตารางแจกแจงความถี่และร้อยละครบทุกข้อคำถาม พร้อมส่งออกเป็นไฟล์ CSV (เปิดใน Excel ได้ทันที) หรือพิมพ์เอกสาร A4"
        filteredCount={filtered.length}
        totalCount={rows.length}
        isFiltered={isFiltered}
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0d736b] dark:hover:bg-[#0f857b]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>ส่งออก CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* สรุปภาพรวมรายงาน */}
          <section className="print-card rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h2 className="text-base font-bold text-ink">
              สรุปขอบเขตข้อมูลในรายงานฉบับนี้
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-xl bg-surface-subtle p-3">
                <dt className="text-xs text-ink-muted">ผู้ตอบสมบูรณ์</dt>
                <dd className="tabular-nums mt-0.5 text-lg font-bold text-ink">
                  {ov.n.toLocaleString("th-TH")} คน
                </dd>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3">
                <dt className="text-xs text-ink-muted">เทียบเป้าหมายขั้นต่ำ</dt>
                <dd className="tabular-nums mt-0.5 text-lg font-bold text-ink">
                  {ov.target.pctOfMin.toFixed(1)}% ({ov.target.min} คน)
                </dd>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3">
                <dt className="text-xs text-ink-muted">ความพึงพอใจเฉลี่ย (SD)</dt>
                <dd className="tabular-nums mt-0.5 text-lg font-bold text-ink">
                  {sat.mean !== null ? sat.mean.toFixed(2) : "—"} (
                  {sat.sd !== null ? sat.sd.toFixed(2) : "—"})
                </dd>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3">
                <dt className="text-xs text-ink-muted">ระดับความพึงพอใจ</dt>
                <dd className="mt-0.5 text-lg font-bold text-brand">
                  {sat.level ?? "—"}
                </dd>
              </div>
            </dl>
            {filterSummary && (
              <p className="mt-3 text-xs text-ink-secondary">
                <strong>เงื่อนไขตัวกรอง:</strong> {filterSummary}
              </p>
            )}
          </section>

          {/* ตารางสรุปทุกข้อ (SUR-01 ถึง SUR-10) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 print:grid-cols-2 print:gap-3">
            {results.map((res) => {
              const isMulti = QUESTIONS[res.code].type === "multi";
              const sorted = [...res.items].sort((a, b) => b.count - a.count);
              return (
                <section
                  key={res.code}
                  className="print-card flex flex-col rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-4 py-3.5">
                    <h2 className="text-base font-bold text-ink">{res.title}</h2>
                    {res.base > 0 && <SmallSampleBadge n={res.base} />}
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <caption className="sr-only">{res.title}</caption>
                      <thead>
                        <tr className="border-b border-line bg-surface-subtle text-xs font-semibold text-ink-secondary">
                          <th scope="col" className="px-4 py-2.5 text-left">
                            ตัวเลือก
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-right">
                            จำนวน (คน)
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-right">
                            ร้อยละ (%)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/70">
                        {sorted.map((item) => (
                          <tr key={item.label} className="hover:bg-surface-subtle/50">
                            <td className="px-4 py-2 text-ink">{item.label}</td>
                            <td className="tabular-nums px-4 py-2 text-right font-medium text-ink">
                              {item.count.toLocaleString("th-TH")}
                            </td>
                            <td className="tabular-nums px-4 py-2 text-right text-ink-secondary">
                              {item.pct.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 bg-surface-subtle/60 px-4 py-2.5 text-xs text-ink-muted">
                    <span className="tabular-nums">
                      ฐาน n = {res.base.toLocaleString("th-TH")} คน · ไม่ตอบ{" "}
                      {res.skipped.toLocaleString("th-TH")} คน · ไม่ประสงค์ระบุ{" "}
                      {res.notSpecified.toLocaleString("th-TH")} คน
                    </span>
                    {isMulti && <span>ตอบได้หลายข้อ (รวม &gt; 100% ได้)</span>}
                  </div>
                </section>
              );
            })}
          </div>

          {/* สรุปข้อเสนอแนะ SUR-11 */}
          <section className="print-card rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h2 className="text-base font-bold text-ink">
              11. ข้อเสนอแนะเพิ่มเติม ({comments.length.toLocaleString("th-TH")} รายการ)
            </h2>
            {comments.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                ไม่มีข้อเสนอแนะเพิ่มเติมในกลุ่มข้อมูลที่เลือก
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/60 pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="text-ink">• {c.sur11}</span>
                    <span className="tabular-nums text-xs text-ink-muted">
                      {formatThaiDate(c.date)}
                      {c.sat !== null ? ` · ${c.sat}/5` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
