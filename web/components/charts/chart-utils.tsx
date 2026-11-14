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

/** true เมื่อ media query ตรงเงื่อนไข (SSR = false) เช่น "(min-width: 640px)" */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
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
  return <div className="w-full animate-pulse rounded-lg bg-muted-bar/50" style={{ height }} aria-hidden="true" />;
}
