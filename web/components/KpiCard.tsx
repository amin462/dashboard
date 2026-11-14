import type { ReactNode } from "react";
import { SmallSampleBadge } from "./SmallSampleBadge";

type KpiCardProps = {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  icon?: ReactNode;
  tone?: "teal" | "amber" | "stone";
  progressPct?: number;
  progressLabel?: string;
  sampleN?: number;
};

const toneStyles = {
  teal: "bg-brand-soft text-brand-ink",
  amber: "bg-accent-soft text-accent-ink",
  stone: "bg-surface-muted text-ink-secondary",
} as const;

export function KpiCard({
  label,
  value,
  unit,
  subtext,
  icon,
  tone = "teal",
  progressPct,
  progressLabel,
  sampleN,
}: KpiCardProps) {
  const clampedPct =
    typeof progressPct === "number"
      ? Math.max(0, Math.min(100, progressPct))
      : null;

  return (
    <article className="print-card flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-ink-secondary">
          {label}
        </h3>
        {icon && (
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
        <span className="tabular-nums text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-ink-muted">{unit}</span>
        )}
      </div>

      {clampedPct !== null && (
        <div className="mt-3">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
            role="progressbar"
            aria-valuenow={Math.round(clampedPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progressLabel ?? label}
          >
            <div
              className={`h-full rounded-full transition-all ${
                tone === "amber" ? "bg-accent" : "bg-brand"
              }`}
              style={{ width: `${clampedPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {subtext ? (
          <p className="tabular-nums text-xs leading-relaxed text-ink-muted">
            {subtext}
          </p>
        ) : (
          <span />
        )}
        {typeof sampleN === "number" && <SmallSampleBadge n={sampleN} />}
      </div>
    </article>
  );
}
