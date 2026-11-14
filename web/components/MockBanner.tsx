import { Database, FlaskConical } from "lucide-react";

type MockBannerProps = {
  source: "supabase" | "mock";
  error?: string;
};

export function DataSourceBadge({ source }: { source: "supabase" | "mock" }) {
  if (source === "supabase") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-ink">
        <Database className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>ข้อมูลจริง (Supabase)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink">
      <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>ข้อมูลตัวอย่าง</span>
    </span>
  );
}

export function MockBanner({ source, error }: MockBannerProps) {
  if (source === "supabase") return null;

  return (
    <div
      role="status"
      className="no-print mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-accent-border bg-accent-soft px-4 py-2.5 text-sm text-accent-ink"
    >
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-bold">ข้อมูลตัวอย่าง (Demo 300 ชุด): </strong>
          แสดงผลด้วยข้อมูลจำลองอัตโนมัติเนื่องจากยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase จริง
          {error ? " (ไม่สามารถอ่านข้อมูลจากฐานข้อมูลได้ในขณะนี้)" : ""}
        </p>
      </div>
    </div>
  );
}
