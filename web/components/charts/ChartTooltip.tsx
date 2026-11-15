type Entry = { name?: string | number; value?: number | string; color?: string; payload?: Record<string, unknown> };

type Props = {
  active?: boolean;
  payload?: Entry[];
  /** หัวทูลทิป ; ค่าเริ่มต้น = payload[0].payload.tipTitle */
  title?: (p: Record<string, unknown>) => string;
  /** หน่วยท้ายค่า เช่น "คน" หรือ "%" */
  unit?: string;
};

/** ทูลทิปการ์ดขาวเงานุ่ม (ธีมเดียวทุกกราฟ Recharts) */
export function ChartTooltip({ active, payload, title, unit = "คน" }: Props) {
  const first = payload?.[0]?.payload;
  if (!active || !first) return null;
  const heading = title ? title(first) : String(first.tipTitle ?? "");
  return (
    <div className="rounded-[10px] bg-surface px-3 py-2 type-meta shadow-[0_4px_16px_rgb(80_50_20/.14)]">
      {heading && <p className="font-medium text-ink">{heading}</p>}
      <ul className="mt-0.5 space-y-0.5">
        {payload?.map((e) => (
          <li key={String(e.name)} className="flex items-center gap-2 text-ink-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} aria-hidden="true" />
            <span>{e.name}</span>
            <strong className="ml-auto pl-3 font-semibold text-ink">
              {typeof e.value === "number" ? e.value.toLocaleString("th-TH") : e.value}
              {unit === "%" ? "%" : ` ${unit}`}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
