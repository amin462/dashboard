export type LegendItem = { label: string; color: string };

/** legend จุดกลม 8px ชิดบนขวาของการ์ด */
export function LegendDots({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 type-meta text-ink-2" aria-label="คำอธิบายสี">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: i.color }} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
