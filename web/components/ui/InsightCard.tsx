import { Lightbulb } from "lucide-react";
import { INSIGHT_DISCLAIMER, type Insight } from "@/lib/survey/insights";
import { SmallSampleBadge } from "./SmallSampleBadge";

/** การ์ดข้อเสนอเบื้องต้น: พื้นอำพันอ่อน + ไอคอนอำพัน ; หลักฐานเป็นชิป n / % */
export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="print-card flex h-full flex-col rounded-xl bg-amber-soft p-4">
      <p className="flex items-center gap-1.5 type-meta font-medium text-amber-ink">
        <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {INSIGHT_DISCLAIMER}
      </p>
      <h3 className="mt-1 type-section text-ink">{insight.title}</h3>
      <p className="mt-1 text-ink-2">{insight.detail}</p>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {insight.evidence.map((ev) => (
          <li key={ev.label} className="rounded-md bg-surface px-2 py-0.5 type-meta text-ink-2">
            <span>{ev.label}</span> <strong className="font-semibold text-ink">{ev.value}</strong>
          </li>
        ))}
      </ul>
      <SmallSampleBadge n={insight.n} className="mt-2 self-start" />
    </article>
  );
}
