import { divColor, divFg, type Tone } from "./theme";

export type DivergingSegment = {
  label: string;
  count: number;
  pct: number;
  /** 1..5 : ตำแหน่งในสเกล diverging (--div-1 ... --div-5) */
  tone: Tone;
};

/** แท่งเดียว 100% แบ่งสีตามสเกล ไม่พอใจ→พอใจ + คำอธิบายสีด้านล่าง (segments เรียงจากต่ำไปสูง) */
export function DivergingBar({ segments, label }: { segments: DivergingSegment[]; label: string }) {
  const shown = segments.filter((s) => s.count > 0);
  return (
    <div>
      <div
        role="img"
        aria-label={`${label}: ${segments.map((s) => `${s.label} ${s.pct.toFixed(1)}%`).join(", ")}`}
        className="flex h-9 w-full gap-0.5 overflow-hidden rounded-lg bg-surface"
      >
        {shown.map((s) => (
          <div
            key={s.label}
            className="flex min-w-0 items-center justify-center type-meta font-medium"
            style={{ flexGrow: s.count, flexBasis: 0, backgroundColor: divColor(s.tone), color: divFg(s.tone) }}
          >
            {s.pct >= 8 ? `${s.pct.toFixed(0)}%` : ""}
          </div>
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-start gap-2 type-meta text-ink-2">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: divColor(s.tone) }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">{s.label}</span>
            <span className="whitespace-nowrap text-ink">
              {s.count.toLocaleString("th-TH")} · {s.pct.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** ลายทแยงสำหรับ "ยังไม่สามารถประเมินได้" / ไม่ตอบ (แสดงแยก ไม่อยู่ในสเกล) */
export function HatchSwatch() {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full border border-line"
      style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--muted-bar) 0 1px, transparent 1px 2px)" }}
      aria-hidden="true"
    />
  );
}
