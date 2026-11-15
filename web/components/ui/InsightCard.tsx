import { Lightbulb, Target } from "lucide-react";
import { INSIGHT_DISCLAIMER, type Insight } from "@/lib/survey/insights";
import { SmallSampleBadge } from "./SmallSampleBadge";

/**
 * การ์ดข้อเสนอเบื้องต้น: ลำดับเลข → ข้อค้นพบ (หัวข้อ) → "ควรทำ" / "วิธีใช้ข้อมูล" → หลักฐานเป็นชิป n / %
 * ข้อความจาก lib ที่ขึ้นต้นด้วย INSIGHT_DISCLAIMER คือข้อเสนอให้ลงมือทำ ; ที่เหลือคือคำอธิบายวิธีใช้ตัวเลข
 * (ข้อความเตือน "ข้อเสนอเบื้องต้น…" แสดงครั้งเดียวที่หัวส่วน ไม่ซ้ำทุกใบ)
 */
export function InsightCard({ insight, index }: { insight: Insight; index?: number }) {
  const prefix = `${INSIGHT_DISCLAIMER}:`;
  const isAction = insight.detail.startsWith(prefix);
  const body = isAction ? insight.detail.slice(prefix.length).trim() : insight.detail;
  return (
    <article className="print-card flex h-full flex-col rounded-xl bg-amber-soft p-4">
      <div className="flex items-start gap-2.5">
        {typeof index === "number" && (
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber text-[13px] font-semibold text-amber-fg"
          >
            {index + 1}
          </span>
        )}
        <h3 className="type-section text-ink">{insight.title}</h3>
      </div>
      <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-surface/70 px-3 py-2">
        {isAction ? (
          <Target className="mt-1 h-4 w-4 shrink-0 text-amber-ink" aria-hidden="true" />
        ) : (
          <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
        )}
        <p className="text-ink">
          <span className="font-semibold text-amber-ink">{isAction ? "ลองทำ: " : "วิธีใช้ข้อมูล: "}</span>
          {body}
        </p>
      </div>
      <ul aria-label="หลักฐานจากข้อมูล" className="mt-auto flex flex-wrap gap-1.5 pt-3">
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
