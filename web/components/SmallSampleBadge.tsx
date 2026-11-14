import { AlertTriangle } from "lucide-react";
import { SMALL_N, SMALL_N_WARNING } from "@/lib/survey/schema";

type SmallSampleBadgeProps = {
  n: number;
  className?: string;
};

export function SmallSampleBadge({ n, className = "" }: SmallSampleBadgeProps) {
  if (n >= SMALL_N) return null;

  return (
    <span
      role="note"
      className={`inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink ${className}`}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">n = {n} · {SMALL_N_WARNING}</span>
    </span>
  );
}
