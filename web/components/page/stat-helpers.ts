import { Percent, Trophy, Users } from "lucide-react";
import type { FreqItem, FreqResult } from "@/lib/survey/aggregate";
import { num } from "../format";
import type { Stat } from "../ui/StatStrip";

/** "อันดับ 1 ของข้อ N" เป็นช่อง StatStrip : ค่ามาจาก topItem()/freq() ไม่คำนวณเอง */
export function topStat(label: string, top: FreqItem | null, f: FreqResult, qNo: number, empty = "ไม่มีข้อมูล"): Stat {
  return {
    label,
    value: top ? top.label : empty,
    context: top
      ? `${num(top.count)} คน (${top.pct.toFixed(1)}%) จากผู้ตอบข้อ ${qNo} จำนวน ${num(f.base)} คน`
      : `ไม่มีผู้ตอบข้อ ${qNo} ในกลุ่มนี้`,
    sampleN: f.base,
    icon: Trophy,
  };
}

/** สัดส่วนของตัวเลือกหนึ่ง (เช่น % สนใจอาหาร) เป็นช่อง StatStrip */
export function shareStat(label: string, item: FreqItem | undefined, f: FreqResult, qNo: number): Stat {
  return {
    label,
    value: `${(item?.pct ?? 0).toFixed(1)}%`,
    context: `${num(item?.count ?? 0)} จาก ${num(f.base)} คนที่ตอบข้อ ${qNo}`,
    sampleN: f.base,
    icon: Percent,
  };
}

/** ช่อง "จำนวนผู้ตอบในกลุ่มที่แสดง" */
export function countStat(filtered: number, total: number): Stat {
  return {
    label: "ผู้ตอบในกลุ่มที่แสดง",
    value: `${num(filtered)} คน`,
    context: `จากผู้ตอบสมบูรณ์ทั้งหมด ${num(total)} คน`,
    sampleN: filtered,
    icon: Users,
  };
}
