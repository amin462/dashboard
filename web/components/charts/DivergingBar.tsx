export type DivergingSegment = {
  label: string;
  count: number;
  pct: number;
  /** 1..5 : ตำแหน่งในสเกล diverging (--div-1 ... --div-5) */
  tone: 1 | 2 | 3 | 4 | 5;
};

/** สีตัวอักษรบนแต่ละช่วง (เลือกให้ contrast ≥ 4.5:1) */
const FG: Record<DivergingSegment["tone"], string> = {
  1: "text-white",
  2: "text-[#141b2d]",
  3: "text-ink",
  4: "text-[#141b2d]",
  5: "text-white",
};

/** แท่งเดียว 100% แบ่งสีตามสเกล ไม่พอใจ→พอใจ + คำอธิบายสีด้านล่าง (segments เรียงจากต่ำไปสูง) */
export function DivergingBar({ segments, label }: { segments: DivergingSegment[]; label: string }) {
  const shown = segments.filter((s) => s.count > 0);
  return (
    <div>
      <div
        role="img"
        aria-label={`${label}: ${segments.map((s) => `${s.label} ${s.pct.toFixed(1)}%`).join(", ")}`}
        className="flex h-8 w-full gap-px overflow-hidden rounded-md bg-surface"
      >
        {shown.map((s) => (
          <div
            key={s.label}
            className={`flex min-w-0 items-center justify-center type-meta font-medium ${FG[s.tone]}`}
            style={{ flexGrow: s.count, flexBasis: 0, backgroundColor: `var(--div-${s.tone})` }}
          >
            {s.pct >= 8 ? `${s.pct.toFixed(0)}%` : ""}
          </div>
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-start gap-2 type-meta text-ink-2">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: `var(--div-${s.tone})` }}
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
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm border border-line"
      style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--data-muted) 0 2px, transparent 2px 4px)" }}
      aria-hidden="true"
    />
  );
}
