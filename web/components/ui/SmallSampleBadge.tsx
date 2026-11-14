import { AlertTriangle } from "lucide-react";
import { SMALL_N, SMALL_N_WARNING } from "@/lib/survey/schema";

/** ป้ายเตือนเมื่อฐาน n < SMALL_N (DATA_CONTRACT §3) */
export function SmallSampleBadge({ n, className = "" }: { n: number; className?: string }) {
  if (n >= SMALL_N) return null;
  return (
    <span
      role="note"
      className={`inline-flex items-center gap-1 rounded-md bg-warn-soft px-2 py-0.5 type-meta font-medium text-warn ${className}`}
    >
      <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>
        n = {n} · {SMALL_N_WARNING}
      </span>
    </span>
  );
}
