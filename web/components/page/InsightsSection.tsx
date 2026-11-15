import type { Insight } from "@/lib/survey/insights";
import { INSIGHT_DISCLAIMER } from "@/lib/survey/insights";
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
  /** grid = 3 ใบเท่ากันบนพื้นหลังหน้า ; panel = อยู่ในการ์ดขาวใบเดียวเต็มแถว (หน้าภาพรวม) หัวข้อซ้าย CTA ขวา */
  variant?: "grid" | "panel";
  cta?: { href: string; label: string };
};

/** หัวข้อ + การ์ดข้อเสนอเบื้องต้น (ผลจาก lib/survey/insights) ; กลุ่มเล็กกว่า SMALL_N = แจ้งเหตุผลแทน */
export function InsightsSection({ title, insights, n, max = 3, variant = "grid", cta }: InsightsSectionProps) {
  const shown = insights.slice(0, max);
  const panel = variant === "panel";
  return (
    <section aria-label={title} className={panel ? "print-card card flex min-w-0 flex-col gap-3 p-5" : "space-y-3"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="type-section">{title}</h2>
          {shown.length > 0 && <p className="type-meta text-ink-3">{INSIGHT_DISCLAIMER} · ไม่ใช่คำแนะนำที่แน่นอน ตัดสินใจร่วมกับประสบการณ์หน้างาน</p>}
        </div>
        {cta && <CtaLink href={cta.href}>{cta.label}</CtaLink>}
      </div>
      {shown.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 print:grid-cols-3 print:gap-3">
          {shown.map((ins, i) => (
            <InsightCard key={ins.title} insight={ins} index={i} />
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
    </section>
  );
}
