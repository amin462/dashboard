/** ● ข้อมูลจริง / ● ข้อมูลทดสอบปนอยู่ / ● ข้อมูลตัวอย่าง (ขวาของ top bar) */
export function SourcePill({ source, seedCount = 0 }: { source: "supabase" | "mock"; seedCount?: number }) {
  const real = source === "supabase" && seedCount === 0;
  const label = real ? "ข้อมูลจริง" : source === "supabase" ? "ข้อมูลทดสอบปนอยู่" : "ข้อมูลตัวอย่าง";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-0.5 type-meta text-ink-2 shadow-[0_1px_2px_rgb(20_40_80/.08)]">
      <span className={`h-2 w-2 rounded-full ${real ? "bg-ok" : "bg-warn"}`} aria-hidden="true" />
      {label}
    </span>
  );
}
