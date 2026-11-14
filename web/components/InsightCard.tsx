import { Lightbulb } from "lucide-react";
import { INSIGHT_DISCLAIMER, type Insight } from "@/lib/survey/insights";
import { SmallSampleBadge } from "./SmallSampleBadge";

type InsightCardProps = {
  insight: Insight;
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article className="print-card flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
            <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{INSIGHT_DISCLAIMER}</span>
          </span>
          <SmallSampleBadge n={insight.n} />
        </div>

        <h3 className="mt-3 text-base font-bold leading-snug text-ink">
          {insight.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
          {insight.detail}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-line/80 bg-surface-subtle p-3 sm:grid-cols-2">
        {insight.evidence.map((ev) => (
          <div key={ev.label} className="min-w-0">
            <dt className="truncate text-xs text-ink-muted">{ev.label}</dt>
            <dd className="tabular-nums text-sm font-bold text-ink">
              {ev.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
