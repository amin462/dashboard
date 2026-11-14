import { Info } from "lucide-react";
import { DISCLAIMER } from "@/lib/survey/schema";

export function Disclaimer() {
  return (
    <footer
      aria-label="ขอบเขตและข้อจำกัดข้อมูล"
      className="mt-8 rounded-2xl border border-line bg-surface-subtle px-4 py-3.5 text-sm text-ink-secondary print-card"
    >
      <div className="flex items-start gap-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        <p className="leading-relaxed">
          <span className="font-semibold text-ink">หมายเหตุข้อมูล: </span>
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
