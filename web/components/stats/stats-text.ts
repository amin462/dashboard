import type { OriginInterestComparison, OriginSatisfactionComparison } from "@/lib/survey/stats";

/** รูปแบบ p-value สำหรับแสดงผล (ตัวเลขทุกค่ามาจาก lib/survey/stats) */
export function fmtP(p: number): string {
  return p < 0.001 ? "< 0.001" : p.toFixed(3);
}

/** สรุปหนึ่งบรรทัดของการเทียบความสนใจ ยะลา vs ต่างถิ่น */
export function interestSummary(c: OriginInterestComparison): string {
  if (!c.ok) return c.reason;
  const sig = c.categories.filter((x) => x.significant);
  if (sig.length === 0) return `ไม่พบหมวดที่ต่างกันอย่างมีนัยสำคัญ (p < 0.05) จาก ${c.categories.length} หมวด — กลุ่มตัวอย่างยังเล็ก ผลอาจเปลี่ยนเมื่อมีข้อมูลเพิ่ม`;
  return `ต่างกันอย่างมีนัยสำคัญ (p < 0.05) ${sig.length} หมวด: ${sig.map((x) => `${x.label} (p ${fmtP(x.test.p)})`).join(", ")}`;
}

/** สรุปหนึ่งบรรทัดของการเทียบความพึงพอใจ */
export function satisfactionSummary(c: OriginSatisfactionComparison): string {
  if (!c.ok) return c.reason;
  const dir = c.diff === 0 ? "เท่ากัน" : c.diff > 0 ? "คนนอกจังหวัดให้คะแนนสูงกว่า" : "คนยะลาให้คะแนนสูงกว่า";
  return `ยะลา ${c.yala.mean.toFixed(2)} (SD ${c.yala.sd.toFixed(2)}, n=${c.yala.n}) · นอกจังหวัด ${c.outside.mean.toFixed(2)} (SD ${c.outside.sd.toFixed(2)}, n=${c.outside.n}) · ${dir} ${Math.abs(c.diff).toFixed(2)} คะแนน · t=${c.t.toFixed(2)}, df=${c.df.toFixed(1)}, p ${fmtP(c.p)} → ${c.significant ? "ต่างกันอย่างมีนัยสำคัญ" : "ยังไม่พบความต่างอย่างมีนัยสำคัญ"}`;
}
