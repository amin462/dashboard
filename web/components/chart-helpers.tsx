"use client";

import { useSyncExternalStore } from "react";
import {
  OTHERS_LABEL,
  QUESTIONS,
  SUR08_NONE,
  type Code,
} from "@/lib/survey/schema";
import { CHART_COLORS } from "./nav-config";

const noopSubscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

function subscribeCompact(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(max-width: 639px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getCompactSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 639px)").matches;
}

export function useCompactViewport(): boolean {
  return useSyncExternalStore(subscribeCompact, getCompactSnapshot, () => false);
}

/** สีคงที่ต่อหมวดหมู่ทุกหน้า และให้หมวดไม่ระบุ/อื่น ๆ เป็นสีเทา stone */
export function categoryColor(code: Code, label: string): string {
  const q = QUESTIONS[code];
  if (
    label === OTHERS_LABEL ||
    label === SUR08_NONE ||
    q.notSpecified?.includes(label)
  ) {
    return "var(--chart-muted)";
  }
  const idx = q.choices.indexOf(label);
  const safeIdx = idx >= 0 ? idx : 0;
  return CHART_COLORS[safeIdx % 5];
}

/** ตัดแบ่งข้อความภาษาไทยยาว ๆ เป็นสูงสุด 2 บรรทัดสำหรับแกน Y ของ Recharts */
export function splitLabelLines(text: string, maxPerLine: number): string[] {
  if (text.length <= maxPerLine) return [text];

  const breakChars = [" / ", " (", " ", "/"];
  for (const sep of breakChars) {
    const idx = text.indexOf(sep);
    if (idx > 2 && idx <= maxPerLine + 2) {
      const first = text.slice(0, idx).trim();
      const rest = text.slice(idx).trim();
      const line2 =
        rest.length > maxPerLine ? `${rest.slice(0, maxPerLine - 1)}…` : rest;
      return [first, line2];
    }
  }

  const first = text.slice(0, maxPerLine).trim();
  const rest = text.slice(maxPerLine).trim();
  const line2 =
    rest.length > maxPerLine ? `${rest.slice(0, maxPerLine - 1)}…` : rest;
  return [first, line2];
}

type YTickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string };
  maxChars?: number;
};

export function WrappedYAxisTick({
  x = 0,
  y = 0,
  payload,
  maxChars = 22,
}: YTickProps) {
  const text = String(payload?.value ?? "");
  const lines = splitLabelLines(text, maxChars);

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{text}</title>
      <text
        x={-6}
        y={0}
        textAnchor="end"
        fill="var(--ink-secondary)"
        fontSize={12}
        fontWeight={500}
      >
        {lines.length === 1 ? (
          <tspan x={-6} dy={4}>
            {lines[0]}
          </tspan>
        ) : (
          <>
            <tspan x={-6} dy={-3}>
              {lines[0]}
            </tspan>
            <tspan x={-6} dy={15}>
              {lines[1]}
            </tspan>
          </>
        )}
      </text>
    </g>
  );
}

type TooltipPayloadRow = {
  name?: string;
  value?: number;
  payload?: {
    label?: string;
    dateLabel?: string;
    slot?: string;
    count?: number;
    pct?: number;
  };
};

export function SurveyTooltip({
  active,
  payload,
  unit = "คน",
}: {
  active?: boolean;
  payload?: TooltipPayloadRow[];
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const p = item.payload;
  const title = p?.label ?? p?.dateLabel ?? p?.slot ?? item.name ?? "";
  const count = p?.count ?? item.value ?? 0;

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 tabular-nums text-ink-secondary">
        จำนวน <strong className="font-bold text-ink">{count.toLocaleString("th-TH")}</strong> {unit}
        {typeof p?.pct === "number" ? ` (${p.pct.toFixed(1)}%)` : ""}
      </p>
    </div>
  );
}

export function ChartLoadingBox({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-xl bg-surface-muted/60"
      style={{ height }}
      aria-hidden="true"
    />
  );
}
