import { HeartHandshake, Repeat2, Users, Wallet } from "lucide-react";
import type { Overview } from "@/lib/survey/aggregate";
import { num } from "../format";
import type { Stat } from "../ui/StatStrip";

/** KPI 4 ใบหน้าภาพรวม ; ค่าทั้งหมดมาจาก overview() ของ lib */
export function overviewStats(ov: Overview): Stat[] {
  const { satisfaction: sat, returnIntent: ret, topSpend, target } = ov;
  return [
    {
      label: "ผู้ตอบสมบูรณ์",
      value: `${num(ov.n)} คน`,
      context: `เป้าหมาย ${num(target.full)} คน · ${target.pctOfMin.toFixed(1)}% ของเป้าขั้นต่ำ ${num(target.min)}`,
      // ความยาวแถบเทียบเป้า 300 (เรขาคณิตของแถบ ไม่ใช่ตัวเลขที่รายงาน)
      progress: (ov.n / target.full) * 100,
      sampleN: ov.n,
      icon: Users,
    },
    {
      label: "ความพึงพอใจเฉลี่ย",
      value: sat.mean !== null ? `${sat.mean.toFixed(2)} / 5` : "—",
      context: sat.level ? `ระดับ${sat.level} · n = ${num(sat.n)}` : "ไม่มีคะแนน 1–5 ในกลุ่มนี้",
      sampleN: sat.n,
      icon: HeartHandshake,
    },
    {
      label: "ตั้งใจกลับมาอีก",
      value: `${ret.pct.toFixed(1)}%`,
      context: `${num(ret.count)} จาก ${num(ret.base)} คนที่ตอบข้อ 10`,
      sampleN: ret.base,
      icon: Repeat2,
    },
    {
      label: "งบต่อคนที่พบมากสุด",
      value: topSpend ? topSpend.label : "ไม่มีข้อมูล",
      context: topSpend ? `${num(topSpend.count)} คน (${topSpend.pct.toFixed(1)}%) จาก ${num(topSpend.base)} คนที่ตอบข้อ 7` : undefined,
      sampleN: topSpend?.base,
      icon: Wallet,
    },
  ];
}
