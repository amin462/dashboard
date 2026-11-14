import type { Insight } from "@/lib/survey/insights";
import { SMALL_N } from "@/lib/survey/schema";
import { CtaLink } from "../ui/CtaLink";
import { InsightCard } from "../ui/InsightCard";
import { SmallSampleBadge } from "../ui/SmallSampleBadge";

type InsightsSectionProps = {
  title: string;
  insights: Insight[];
  /** จำนวนผู้ตอบหลังกรอง (ใช้อธิบายเมื่อกลุ่มเล็กเกินไป) */
  n: number;
  /** จำกัดจำนวนการ์ด (ค่าเริ่มต้น 3) */
  max?: number;
  /** grid = 3 ใบเรียงข้างกัน ; panel = ซ้อนในการ์ดขาวเดียว (หน้าภาพรวม) */
  variant?: "grid" | "panel";
  cta?: { href: string; label: string };
};

/** หัวข้อ + การ์ดข้อเสนอเบื้องต้น (ผลจาก lib/survey/insights) ; กลุ่มเล็กกว่า SMALL_N = แจ้งเหตุผลแทน */
export function InsightsSection({ title, insights, n, max = 3, variant = "grid", cta }: InsightsSectionProps) {
  const shown = insights.slice(0, max);
  const panel = variant === "panel";
  return (
    <section aria-label={title} className={panel ? "card flex h-full min-w-0 flex-col gap-3 p-5" : "space-y-3"}>
      <h2 className="type-section">{title}</h2>
      {shown.length > 0 ? (
        <div className={panel ? "flex flex-col gap-3" : "grid grid-cols-1 gap-4 md:grid-cols-3"}>
          {shown.map((ins) => (
            <InsightCard key={ins.title} insight={ins} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-warn-soft px-4 py-3 text-warn">
          <p>
            ผู้ตอบในกลุ่มที่กรองมีน้อยกว่า {SMALL_N} คนในข้อที่เกี่ยวข้อง จึงยังไม่สรุปข้อเสนอเพื่อกันการตีความคลาดเคลื่อน
          </p>
          <SmallSampleBadge n={n} />
        </div>
      )}
      {cta && (
        <div className={panel ? "mt-auto pt-1" : ""}>
          <CtaLink href={cta.href}>{cta.label}</CtaLink>
        </div>
      )}
    </section>
  );
}
