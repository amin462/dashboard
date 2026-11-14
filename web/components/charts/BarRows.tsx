export type BarRow = {
  label: string;
  count: number;
  pct: number;
  /** แถวท้ายตาราง ("อื่น ๆ"/"ไม่ประสงค์ระบุ") สีจางเสมอ */
  tail?: boolean;
};

/**
 * แท่งแนวนอนด้วย div ล้วน (คมชัด อ่านด้วย screen reader ได้ พิมพ์ได้)
 * แถว = ป้าย 40% | ราง (ความยาว 100% = ค่าสูงสุด) | "96 · 37.5%"
 * แท่งอันดับ 1 = brand, ที่เหลือ = data-muted
 */
export function BarRows({ rows, highlight, label }: { rows: BarRow[]; highlight: string | null; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul aria-label={label} className="space-y-1">
      {rows.map((r) => {
        const top = r.label === highlight && !r.tail;
        const width = r.count > 0 ? Math.max(0.5, (r.count / max) * 100) : 0;
        return (
          <li key={r.label} className="grid min-h-8 grid-cols-[40%_minmax(0,1fr)_5.75rem] items-center gap-3">
            <span title={r.label} className={`line-clamp-2 leading-5 ${r.tail ? "text-ink-3" : "text-ink"} ${top ? "font-medium" : ""}`}>{r.label}</span>
            <span className="h-3 rounded-sm bg-surface-2" aria-hidden="true">
              <span
                className={`block h-full rounded-sm ${top ? "bg-brand" : "bg-data-muted"}`}
                style={{ width: `${width}%` }}
              />
            </span>
            <span className={`text-right whitespace-nowrap ${top ? "font-semibold text-ink" : "text-ink-2"}`}>
              {r.count.toLocaleString("th-TH")} · {r.pct.toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
