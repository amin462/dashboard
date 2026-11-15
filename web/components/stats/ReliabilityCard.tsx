import { ShieldCheck } from "lucide-react";
import { compareOriginInterest, compareOriginSatisfaction, reliabilitySummary } from "@/lib/survey/stats";
import type { Row } from "@/lib/survey/schema";
import { num } from "../format";
import { interestSummary, satisfactionSummary } from "./stats-text";

/** ความน่าเชื่อถือของตัวเลข: ความคลาดเคลื่อน 95% + ทดสอบความต่างยะลา vs ต่างถิ่น (คำนวณทั้งหมดใน lib/survey/stats.ts) */
export function ReliabilityCard({ rows }: { rows: Row[] }) {
  const rel = reliabilitySummary(rows);
  const interest = compareOriginInterest(rows);
  const sat = compareOriginSatisfaction(rows);
  return (
    <section aria-label="ความน่าเชื่อถือของตัวเลข" className="print-card card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-amber" aria-hidden="true" />
        <h2 className="type-section">ความน่าเชื่อถือของตัวเลข</h2>
        <span className="rounded border border-line px-1.5 text-[11px] leading-[18px] text-ink-3">สถิติสำหรับบทผลวิจัย</span>
      </div>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-2 px-3 py-2.5">
          <dt className="type-meta text-ink-3">ความคลาดเคลื่อนของร้อยละ (ความเชื่อมั่น 95%)</dt>
          <dd className="mt-0.5 text-[15px] leading-6 font-semibold text-ink">
            {rel.marginOfError === null ? "—" : `± ${rel.marginOfError.toFixed(1)} จุดร้อยละ`}
            <span className="ml-1 font-normal text-ink-2">(จากผู้ตอบ {num(rel.n)} คน)</span>
          </dd>
          <dd className="type-meta text-ink-3">
            {rel.reachedTarget
              ? "ถึงเป้าขั้นต่ำแล้ว"
              : `ถ้าเก็บครบเป้าขั้นต่ำ ${num(rel.target)} คน จะเหลือ ± ${rel.marginAtTarget?.toFixed(1)} จุดร้อยละ`}
          </dd>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-2.5">
          <dt className="type-meta text-ink-3">ความพึงพอใจ: คนยะลา vs คนนอกจังหวัด (Welch t-test)</dt>
          <dd className="mt-0.5 text-[14px] leading-5 text-ink">{satisfactionSummary(sat)}</dd>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-2.5 sm:col-span-2">
          <dt className="type-meta text-ink-3">ความสนใจสินค้า/บริการ: คนยะลา vs คนนอกจังหวัด (ไคสแควร์ / Fisher)</dt>
          <dd className="mt-0.5 text-[14px] leading-5 text-ink">{interestSummary(interest)}</dd>
        </div>
      </dl>
      <p className="mt-3 type-meta text-ink-3">
        ใช้ประกอบการอ่านเท่านั้น: ผู้ตอบมาจากการเลือกแบบสะดวก จึงไม่ใช่ตัวแทนของนักท่องเที่ยวทั้งหมด · วิธีคำนวณและเกณฑ์ดูใน docs/STATS_METHODS.md
      </p>
    </section>
  );
}
