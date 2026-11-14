"use client";

import { useSyncExternalStore } from "react";
import { topItem, type FreqResult } from "@/lib/survey/aggregate";
import { OTHERS_LABEL, QUESTIONS, SUR08_NONE, type Code } from "@/lib/survey/schema";

const noopSubscribe = () => () => {};

/** true เมื่อรันบน client แล้ว (ไว้เลี่ยงวาด Recharts ตอน SSR) */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** sur07 -> SUR-07 */
export function codeLabel(code: Code): string {
  return code.replace(/^([a-z]+)(\d+)$/, (_, a: string, n: string) => `${a.toUpperCase()}-${n}`);
}

/** "7. ค่าใช้จ่าย" -> "ค่าใช้จ่าย" (เลขข้ออยู่ในชิปรหัสแล้ว) */
export function stripNumber(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
}

/** ตัวเลือกที่ไม่นับเป็น "คำตอบเด่น" (อื่น ๆ / ไม่ประสงค์ระบุ / ไม่มีความสนใจ) */
export function nonAnswerLabels(code: Code): string[] {
  return [...(QUESTIONS[code].notSpecified ?? []), OTHERS_LABEL, SUR08_NONE];
}

/** ประโยคสรุปอัตโนมัติ: หยิบอันดับ 1 จากผล freq() (ไม่คำนวณสถิติเอง) */
export function freqTakeaway(res: FreqResult): string | undefined {
  const top = topItem(res, nonAnswerLabels(res.code));
  return top ? `พบมากที่สุด: ${top.label} (${top.pct.toFixed(1)}%)` : undefined;
}

export function ChartLoadingBox({ height }: { height: number }) {
  return <div className="w-full animate-pulse rounded-lg bg-data-muted/50" style={{ height }} aria-hidden="true" />;
}

type TooltipProps = {
  active?: boolean;
  payload?: { payload?: { dateLabel?: string; count?: number } }[];
};

export function CountTooltip({ active, payload }: TooltipProps) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 type-meta shadow-[0_1px_2px_rgb(0_0_0/.04)]">
      <p className="font-medium text-ink">{p.dateLabel}</p>
      <p className="text-ink-2">
        ผู้ตอบ <strong className="text-ink">{(p.count ?? 0).toLocaleString("th-TH")}</strong> คน
      </p>
    </div>
  );
}
