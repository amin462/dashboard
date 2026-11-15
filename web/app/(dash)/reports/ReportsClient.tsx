"use client";

import { Download, Printer } from "lucide-react";
import { freq, multiFreq, overview, satisfaction, type FreqResult } from "@/lib/survey/aggregate";
import { filtersToQuery, type Filters } from "@/lib/survey/filters";
import { wilsonCI } from "@/lib/survey/stats";
import { CODES, QUESTIONS, type Code, type Row } from "@/lib/survey/schema";
import { ChartCard } from "@/components/charts/ChartCard";
import { DataTable } from "@/components/charts/DataTable";
import { codeLabel, freqTakeaway, stripNumber } from "@/components/charts/chart-utils";
import { formatThaiDate, formatThaiDateTime, num } from "@/components/format";
import { DashPage, type PageData } from "@/components/page/DashPage";
import { ReliabilityCard } from "@/components/stats/ReliabilityCard";
import { StatStrip } from "@/components/ui/StatStrip";
import { buildReportCsv, downloadCsv } from "./report-csv";

const REPORT_CODES: Code[] = CODES.filter((c) => c.startsWith("sur") && c !== "sur11");

function summarize(f: Filters): string {
  const parts: string[] = [];
  if (f.from) parts.push(`ตั้งแต่ ${formatThaiDate(f.from)}`);
  if (f.to) parts.push(`ถึง ${formatThaiDate(f.to)}`);
  if (f.age?.length) parts.push(`อายุ: ${f.age.join(", ")}`);
  if (f.origin?.length) parts.push(`พื้นที่: ${f.origin.join(", ")}`);
  if (f.companion?.length) parts.push(`มากับ: ${f.companion.join(", ")}`);
  if (f.transport?.length) parts.push(`พาหนะ: ${f.transport.join(", ")}`);
  return parts.join(" | ");
}

const calc = (rows: Row[]) => ({
  results: REPORT_CODES.map<FreqResult>((c) => (c === "sur08" ? multiFreq(rows) : freq(rows, c))),
  sat: satisfaction(rows),
  ov: overview(rows),
  comments: rows.filter((r) => r.sur11 && r.sur11.trim() !== "").sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)),
});

function ReportActions({ data }: { data: PageData }) {
  const disabled = data.rows.length === 0;
  const exportCsv = () => {
    const { results, sat, comments } = calc(data.rows);
    downloadCsv(buildReportCsv(results, sat, comments, data.rows.length, summarize(data.filters), data.rows), `yala-insight-report-${filtersToQuery(data.filters) ? "filtered" : "all"}.csv`);
  };
  return (
    <>
      <button type="button" onClick={exportCsv} disabled={disabled} className="btn btn-primary">
        <Download className="h-4 w-4" aria-hidden="true" />
        ส่งออก CSV
      </button>
      <button type="button" onClick={() => window.print()} disabled={disabled} className="btn btn-secondary">
        <Printer className="h-4 w-4" aria-hidden="true" />
        พิมพ์ / บันทึก PDF
      </button>
    </>
  );
}

type ReportsClientProps = { rows: Row[]; source: "supabase" | "mock" | "error"; updatedAt: string | null; seedCount?: number };

export function ReportsClient({ rows, source, updatedAt, seedCount = 0 }: ReportsClientProps) {
  return (
    <DashPage
      rows={rows}
      description="ตารางความถี่และร้อยละครบทุกข้อคำถาม ส่งออกเป็น CSV (เปิดใน Excel ได้) หรือพิมพ์เป็น A4"
      actions={(data) => <ReportActions data={data} />}
    >
      {(data) => {
        const { results, sat, ov, comments } = calc(data.rows);
        const filterText = summarize(data.filters);
        return (
          <>
            {/* หัวรายงานเฉพาะตอนพิมพ์: ตัวกรอง + แหล่งข้อมูล + วันที่ */}
            <div className="print-only space-y-0.5 border-b border-line pb-3">
              <p className="text-lg font-semibold">รายงานสรุปผลแบบสำรวจนักท่องเที่ยว ณ วัดคูหาภิมุข</p>
              <p>ตัวกรอง: {filterText || "ไม่มี (ทั้งหมด)"}</p>
              <p>
                แหล่งข้อมูล:{" "}
                {source === "error"
                  ? "เชื่อมต่อฐานข้อมูลไม่สำเร็จ (ไม่มีข้อมูล)"
                  : source !== "supabase"
                    ? "ข้อมูลตัวอย่าง (ไม่ใช่ผลสำรวจจริง)"
                    : seedCount > 0
                      ? `ฐานข้อมูล Supabase — มีข้อมูลทดสอบปนอยู่ ${num(seedCount)} แถว (ไม่ใช่ผลสำรวจจริงทั้งหมด)`
                      : "ข้อมูลจริง (Supabase)"}{" "}
                · ข้อมูลล่าสุด {formatThaiDateTime(updatedAt)} · ผู้ตอบสมบูรณ์ {num(data.rows.length)} คน
              </p>
            </div>

            <StatStrip
              label="สรุปรายงาน"
              items={[
                { label: "ผู้ตอบสมบูรณ์", value: `${num(ov.n)} คน`, context: `${ov.target.pctOfMin.toFixed(1)}% ของเป้าขั้นต่ำ ${ov.target.min} คน`, sampleN: ov.n },
                { label: "ความพึงพอใจเฉลี่ย", value: sat.mean !== null ? sat.mean.toFixed(2) : "—", context: `SD ${sat.sd !== null ? sat.sd.toFixed(2) : "—"} · n = ${num(sat.n)}`, sampleN: sat.n },
                { label: "ระดับความพึงพอใจ", value: sat.level ?? "—", context: "เกณฑ์ 5 ระดับ (DATA_CONTRACT §3)" },
              ]}
            />

            <ReliabilityCard rows={data.rows} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:grid-cols-2 print:gap-3">
              {results.map((res) => (
                <ChartCard
                  key={res.code}
                  title={stripNumber(QUESTIONS[res.code].title)}
                  code={codeLabel(res.code)}
                  takeaway={freqTakeaway(res)}
                  base={res.base}
                  skipped={res.skipped}
                  notSpecified={res.notSpecified}
                  note={QUESTIONS[res.code].type === "multi" ? "ตอบได้หลายข้อ (รวม > 100% ได้)" : undefined}
                >
                  <DataTable
                    caption={res.title}
                    data={{
                      headers: ["ตัวเลือก", "จำนวน (คน)", "ร้อยละ (%)", "ช่วงเชื่อมั่น 95%"],
                      rows: [...res.items]
                        .sort((a, b) => b.count - a.count)
                        .map((i) => {
                          const ci = wilsonCI(i.count, res.base);
                          return [i.label, num(i.count), `${i.pct.toFixed(1)}%`, ci ? `${ci.low.toFixed(1)}–${ci.high.toFixed(1)}%` : "—"];
                        }),
                    }}
                  />
                </ChartCard>
              ))}
            </div>

            <section className="print-card card p-5">
              <div className="flex items-center gap-2">
                <h2 className="type-section">ข้อเสนอแนะเพิ่มเติม ({num(comments.length)} รายการ)</h2>
                <span className="rounded border border-line px-1.5 text-[11px] leading-[18px] text-ink-3">SUR-11</span>
              </div>
              {comments.length === 0 ? (
                <p className="mt-2 text-ink-3">ไม่มีข้อเสนอแนะในกลุ่มที่เลือก</p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {comments.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
                      <span className="text-ink">{c.sur11}</span>
                      <span className="type-meta text-ink-3">
                        {formatThaiDate(c.date)}
                        {c.sat !== null ? ` · ${c.sat}/5` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        );
      }}
    </DashPage>
  );
}
