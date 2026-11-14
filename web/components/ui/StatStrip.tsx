import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";
import { SmallSampleBadge } from "./SmallSampleBadge";

export type Stat = {
  label: string;
  value: string;
  /** บรรทัดบริบท เช่น "จาก 255 คนที่ตอบข้อ 10" */
  context?: string;
  /** 0-100 : แถบความคืบหน้า 4px ใต้ค่า (เทียบเป้า) */
  progress?: number;
  /** ฐาน n ของตัวเลขนี้ (แสดงป้ายเตือนเมื่อน้อยกว่า 5) */
  sampleN?: number;
  /** ไอคอนเล็กสีอำพันมุมขวาบน */
  icon?: LucideIcon;
};

const COLS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/** ค่าที่เป็นข้อความยาว (เช่น ชื่อช่วงค่าใช้จ่าย) ใช้ขนาดเล็กลงเพื่อไม่ให้ล้นช่อง */
const isLong = (v: string) => v.length > 9;

/** แถว KPI การ์ดลอย: ใบแรกพื้นกรมท่าทึบ (ตัวหนังสือขาว) ใบอื่นขาว ; มือถือ 2 คอลัมน์ */
export function StatStrip({ items, label = "ตัวชี้วัดสำคัญ" }: { items: Stat[]; label?: string }) {
  return (
    <section aria-label={label} className={`grid grid-cols-2 gap-3 sm:gap-4 ${COLS[items.length] ?? "lg:grid-cols-4"}`}>
      {items.map((s, i) => {
        const first = i === 0;
        const pct = typeof s.progress === "number" ? Math.max(0, Math.min(100, s.progress)) : null;
        const oddLast = items.length % 2 === 1 && i === items.length - 1;
        const Icon = s.icon ?? Activity;
        return (
          <div
            key={s.label}
            className={`print-card card flex min-w-0 flex-col p-4 ${first ? "kpi-solid" : ""} ${oddLast ? "col-span-2 lg:col-span-1" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={`type-meta ${first ? "opacity-85" : "text-ink-3"}`}>{s.label}</p>
              <Icon className="h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
            </div>
            <p className={`mt-1 ${first ? "" : "text-ink"} ${isLong(s.value) ? "text-xl leading-7 font-semibold" : "type-kpi"}`}>{s.value}</p>
            {pct !== null && (
              <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={s.label}
                className={`mt-2 h-1 w-full overflow-hidden rounded-full ${first ? "bg-white/25" : "bg-muted-bar"}`}
              >
                <div className="h-full rounded-full bg-amber" style={{ width: `${pct}%` }} />
              </div>
            )}
            {s.context && <p className={`mt-1.5 type-meta ${first ? "opacity-85" : "text-ink-3"}`}>{s.context}</p>}
            {typeof s.sampleN === "number" && <SmallSampleBadge n={s.sampleN} className="mt-1.5 self-start" />}
          </div>
        );
      })}
    </section>
  );
}
