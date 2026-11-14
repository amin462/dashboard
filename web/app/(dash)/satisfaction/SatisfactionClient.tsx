"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  HeartHandshake,
  MessageSquareText,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { freq, satisfaction } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { DashPageHeader } from "@/components/DashPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FreqBar } from "@/components/FreqBar";
import { KpiCard } from "@/components/KpiCard";
import { SatisfactionChart } from "@/components/SatisfactionChart";
import { formatThaiDate } from "@/components/nav-config";
import { useFilteredRows } from "@/components/useFilteredRows";

export function SatisfactionClient({ rows }: { rows: Row[] }) {
  const { filtered, isFiltered } = useFilteredRows(rows);
  const [searchTerm, setSearchTerm] = useState("");

  const sat = useMemo(() => satisfaction(filtered), [filtered]);
  const revisitFreq = useMemo(() => freq(filtered, "sur10"), [filtered]);
  const intentItem = useMemo(
    () => revisitFreq.items.find((i) => i.label === "ตั้งใจจะกลับมาอีก"),
    [revisitFreq]
  );

  const allComments = useMemo(
    () =>
      filtered
        .filter((r) => Boolean(r.sur11 && r.sur11.trim() !== ""))
        .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)),
    [filtered]
  );

  const matchedComments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allComments;
    return allComments.filter((r) =>
      (r.sur11 ?? "").toLowerCase().includes(q)
    );
  }, [allComments, searchTerm]);

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="เสียงสะท้อนจากนักท่องเที่ยว"
        title="ความพึงพอใจ & ข้อเสนอแนะ"
        subtitle="ระดับความพึงพอใจต่อสถานที่ (วัดคูหาภิมุข) แนวโน้มการกลับมาเยือนซ้ำ และข้อเสนอแนะเชิงคุณภาพจากผู้ตอบ"
        filteredCount={filtered.length}
        totalCount={rows.length}
        isFiltered={isFiltered}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="ความพึงพอใจต่อสถานที่เฉลี่ย"
              value={sat.mean !== null ? sat.mean.toFixed(2) : "—"}
              unit="/ 5.00"
              subtext={
                sat.level
                  ? `แปลผล: ระดับ${sat.level}`
                  : "ไม่มีผู้ให้คะแนน 1–5"
              }
              icon={<HeartHandshake className="h-5 w-5" />}
              tone="teal"
              sampleN={sat.n}
            />
            <KpiCard
              label="ส่วนเบี่ยงเบนมาตรฐาน (SD)"
              value={sat.sd !== null ? sat.sd.toFixed(2) : "—"}
              subtext={`คำนวณจากผู้ให้คะแนน 1–5 จำนวน ${sat.n.toLocaleString("th-TH")} คน`}
              icon={<Activity className="h-5 w-5" />}
              tone="stone"
              sampleN={sat.n}
            />
            <KpiCard
              label="ตั้งใจจะกลับมาเยือนอีก"
              value={intentItem ? `${intentItem.pct.toFixed(1)}%` : "0.0%"}
              subtext={`${(intentItem?.count ?? 0).toLocaleString("th-TH")} จาก ${revisitFreq.base.toLocaleString("th-TH")} คนที่ตอบข้อ 10`}
              icon={<RotateCcw className="h-5 w-5" />}
              tone="amber"
              sampleN={revisitFreq.base}
            />
            <KpiCard
              label="ข้อเสนอแนะที่เป็นข้อความ"
              value={allComments.length.toLocaleString("th-TH")}
              unit="รายการ"
              subtext="คำตอบข้อ 11 ที่กรอกข้อความจริง"
              icon={<MessageSquareText className="h-5 w-5" />}
              tone="teal"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SatisfactionChart result={sat} />
            <FreqBar
              result={revisitFreq}
              title="10. ความตั้งใจจะกลับมาเยือนอีกในอนาคต"
              subtitle="บ่งชี้โอกาสเกิดลูกค้าประจำและการบอกต่อ"
            />
          </div>

          {/* SUR-11 รายการข้อเสนอแนะ + ช่องค้นหา */}
          <section
            aria-label="ข้อเสนอแนะเพิ่มเติมจากผู้ตอบแบบสำรวจ"
            className="print-card rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-base font-bold text-ink sm:text-[1.0625rem]">
                  11. ข้อเสนอแนะและเสียงสะท้อนจากนักท่องเที่ยว
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  แสดง {matchedComments.length.toLocaleString("th-TH")} จากทั้งหมด{" "}
                  {allComments.length.toLocaleString("th-TH")} ความคิดเห็น (เรียงจากล่าสุด)
                </p>
              </div>

              <div className="no-print relative w-full sm:w-80">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาคำ เช่น ที่จอดรถ ห้องน้ำ อาหาร..."
                  aria-label="ค้นหาคำในข้อเสนอแนะ"
                  className="w-full rounded-xl border border-line bg-surface-subtle py-2 pr-9 pl-9 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="ล้างคำค้นหา"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {allComments.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-muted">
                  ยังไม่มีผู้ตอบกรอกข้อเสนอแนะเพิ่มเติมในกลุ่มข้อมูลที่เลือก
                </p>
              ) : matchedComments.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm font-medium text-ink-secondary">
                    ไม่พบข้อเสนอแนะที่มีคำว่า “{searchTerm}”
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="mt-3 rounded-xl border border-line bg-surface-subtle px-3.5 py-1.5 text-xs font-semibold text-brand hover:bg-surface-muted"
                  >
                    ล้างคำค้นหา
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {matchedComments.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between rounded-xl border border-line bg-surface-subtle p-4"
                    >
                      <p className="text-sm leading-relaxed text-ink">
                        “{item.sur11}”
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                        <span className="tabular-nums rounded-full bg-surface px-2.5 py-0.5 font-medium border border-line">
                          {formatThaiDate(item.date)} · ช่วง{item.slot}
                        </span>
                        {item.sat !== null && (
                          <span className="tabular-nums rounded-full border border-brand/25 bg-brand-soft px-2.5 py-0.5 font-semibold text-brand-ink">
                            คะแนน {item.sat}/5
                          </span>
                        )}
                        {item.sur02 && (
                          <span className="rounded-full bg-surface px-2.5 py-0.5 border border-line">
                            {item.sur02}
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
