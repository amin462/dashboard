import { INSIGHT_DISCLAIMER, type Insight } from "@/lib/survey/insights";
import { SmallSampleBadge } from "./SmallSampleBadge";

/** การ์ดข้อเสนอเบื้องต้น: พื้นทองอ่อน + เส้นทอง 3px ด้านซ้าย (ทองใช้ 1 จุดต่อการ์ด) */
export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="print-card flex flex-col rounded-xl border-l-[3px] border-gold bg-gold-soft p-4">
      <p className="type-meta font-medium text-gold-ink">{INSIGHT_DISCLAIMER}</p>
      <h3 className="mt-1 type-section text-ink">{insight.title}</h3>
      <p className="mt-1 text-ink-2">{insight.detail}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {insight.evidence.map((ev) => (
          <li key={ev.label} className="rounded-md border border-line bg-surface px-2 py-0.5 type-meta text-ink-2">
            <span>{ev.label}</span> <strong className="font-semibold text-ink">{ev.value}</strong>
          </li>
        ))}
      </ul>
      <SmallSampleBadge n={insight.n} className="mt-2 self-start" />
    </article>
  );
}
