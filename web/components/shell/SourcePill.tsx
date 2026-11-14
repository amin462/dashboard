/** ● ข้อมูลจริง / ● ข้อมูลตัวอย่าง (ขวาของ top bar) */
export function SourcePill({ source }: { source: "supabase" | "mock" }) {
  const real = source === "supabase";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 type-meta text-ink-2">
      <span className={`h-2 w-2 rounded-full ${real ? "bg-ok" : "bg-warn"}`} aria-hidden="true" />
      {real ? "ข้อมูลจริง" : "ข้อมูลตัวอย่าง"}
    </span>
  );
}
