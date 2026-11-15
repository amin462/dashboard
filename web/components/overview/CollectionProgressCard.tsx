"use client";

import { ClipboardList } from "lucide-react";
import { collectionProgress, type CollectionProgress } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { formatThaiDateTimeShort, num } from "../format";
import { CtaLink } from "../ui/CtaLink";
import { useBangkokToday } from "./useBangkokToday";

const STATUS: Record<CollectionProgress["status"], { label: string; chip: string }> = {
  none: { label: "ยังไม่เริ่มเก็บข้อมูล", chip: "bg-surface-2 text-ink-2" },
  collecting: { label: "กำลังเก็บข้อมูล", chip: "bg-amber-soft text-amber-ink" },
  reached_min: { label: "ถึงเป้าขั้นต่ำแล้ว", chip: "bg-ok-soft text-ok" },
  reached_full: { label: "ครบเป้าเต็มแล้ว", chip: "bg-ok-soft text-ok" },
};

function headline(p: CollectionProgress): string {
  switch (p.status) {
    case "none":
      return "ยังไม่มีผู้ตอบ — แชร์ QR/ลิงก์แบบสำรวจเพื่อเริ่มเก็บข้อมูล";
    case "collecting":
      return `ขาดอีก ${num(p.remainingToMin)} ชุดถึงเป้าขั้นต่ำ ${num(p.min)} ชุด`;
    case "reached_min":
      return `ถึงเป้าขั้นต่ำแล้ว · อีก ${num(p.remainingToFull)} ชุดถึงเป้าเต็ม ${num(p.full)} ชุด`;
    default:
      return p.surplus > 0
        ? `ข้อมูลสะสม ${num(p.n)} ชุด (เกินเป้าเต็ม +${num(p.surplus)} ชุด)`
        : `ครบเป้าเต็ม ${num(p.full)} ชุดแล้ว`;
  }
}

/**
 * ความคืบหน้าการเก็บข้อมูล (นับผู้ตอบสมบูรณ์ทั้งหมด ไม่ขึ้นกับตัวกรอง)
 * แถบยาวแทน 0–เป้าเต็ม ; เส้นอำพัน = เป้าขั้นต่ำ ; ตัวเลขทุกค่ามาจาก collectionProgress() ของ lib (7 วันล่าสุดนับย้อนจากวันนี้)
 */
export function CollectionProgressCard({ rows, totalSubmitted }: { rows: Row[]; totalSubmitted?: number }) {
  const today = useBangkokToday();
  const p = collectionProgress(rows, today);
  const excluded = typeof totalSubmitted === "number" ? Math.max(0, totalSubmitted - p.n) : 0;
  const fillPct = Math.min(100, (p.n / p.full) * 100);
  const minPct = (p.min / p.full) * 100;
  const st = STATUS[p.status];

  return (
    <section aria-label="ความคืบหน้าการเก็บข้อมูล" className="print-card card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ClipboardList className="h-4 w-4 text-amber" aria-hidden="true" />
        <h2 className="type-section">ความคืบหน้าการเก็บข้อมูล</h2>
        <span className={`rounded-full px-2.5 py-0.5 type-meta font-medium ${st.chip}`}>{st.label}</span>
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="type-kpi">{num(p.n)}</span>
            <span className="text-ink-2">
              / {num(p.min)} ชุด (เป้าขั้นต่ำ) · {p.pctOfMin.toFixed(1)}%
            </span>
          </p>

          <div className="relative mt-6">
            <span
              className="absolute -top-5 type-meta font-medium whitespace-nowrap text-amber-ink"
              style={{ right: `${100 - minPct}%` }}
            >
              เป้าขั้นต่ำ {num(p.min)}
            </span>
            <div
              role="progressbar"
              aria-label="ความคืบหน้าเทียบเป้าเต็ม"
              aria-valuemin={0}
              aria-valuemax={p.full}
              aria-valuenow={p.n}
              aria-valuetext={`${num(p.n)} จาก ${num(p.full)} ชุด`}
              className="relative h-3 overflow-hidden rounded-full bg-muted-bar/60"
            >
              <div className="h-full rounded-full bg-navy-solid" style={{ width: `${fillPct}%`, minWidth: p.n > 0 ? "6px" : 0 }} />
            </div>
            <span aria-hidden="true" className="absolute -top-1 bottom-0 w-0.5 rounded bg-amber" style={{ left: `${minPct}%` }} />
            <div className="mt-1.5 flex justify-between type-meta text-ink-3">
              <span>0</span>
              <span>เป้าเต็ม {num(p.full)}</span>
            </div>
          </div>

          <p className="mt-2 font-medium">{headline(p)}</p>
          {excluded > 0 && (
            <p className="mt-1 type-meta text-ink-3">
              ส่งแบบสำรวจเข้ามาทั้งหมด {num(totalSubmitted ?? 0)} ชุด · ไม่นับ {num(excluded)} ชุด (ไม่ผ่านคัดกรอง ไม่ยินยอม หรือตอบข้อบังคับไม่ครบ)
            </p>
          )}
        </div>

        <dl className="grid grid-cols-3 gap-3 lg:col-span-5">
          <Mini label="ตอบล่าสุด" value={p.lastSubmittedAt ? formatThaiDateTimeShort(p.lastSubmittedAt) : "—"} />
          <Mini label="7 วันล่าสุด" value={p.n ? `${num(p.last7)} ชุด` : "—"} />
          <Mini label="เฉลี่ยต่อวัน" value={p.n ? `${p.perActiveDay.toLocaleString("th-TH", { maximumFractionDigits: 1 })} ชุด` : "—"} />
        </dl>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="type-meta text-ink-3">
          นับเฉพาะผู้ตอบที่สมบูรณ์ (ผ่านคัดกรอง ยินยอม และตอบข้อ 1–4 ครบ) ไม่ขึ้นกับตัวกรอง · “เฉลี่ยต่อวัน” คิดเฉพาะวันที่มีผู้ตอบ
        </p>
        {p.status !== "reached_full" && <CtaLink href="/survey-poster">โปสเตอร์ QR แบบสำรวจ</CtaLink>}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2">
      <dt className="type-meta text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-[15px] leading-5 font-semibold text-ink">{value}</dd>
    </div>
  );
}
