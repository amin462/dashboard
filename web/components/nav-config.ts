import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Compass,
  FileSpreadsheet,
  HeartHandshake,
  LayoutDashboard,
  Megaphone,
  QrCode,
  Store,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  preserveQuery?: boolean;
  section?: "analysis" | "resource";
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "ภาพรวม",
    shortLabel: "ภาพรวม",
    description: "สรุปตัวเลขสำคัญรายวันและช่วงเวลา",
    icon: LayoutDashboard,
  },
  {
    href: "/visitors",
    label: "ผู้ตอบแบบสำรวจ",
    shortLabel: "ผู้ตอบ",
    description: "ช่วงอายุและพื้นที่พำนัก",
    icon: Users,
  },
  {
    href: "/travel",
    label: "การเดินทาง",
    shortLabel: "เดินทาง",
    description: "ผู้ร่วมเดินทางและพาหนะที่ใช้",
    icon: Compass,
  },
  {
    href: "/awareness",
    label: "วัตถุประสงค์ & ช่องทางรับรู้",
    shortLabel: "ช่องทาง",
    description: "เหตุผลการมาและช่องทางประชาสัมพันธ์",
    icon: Megaphone,
  },
  {
    href: "/spending",
    label: "ค่าใช้จ่าย & ความสนใจ",
    shortLabel: "ค่าใช้จ่าย",
    description: "งบประมาณ สินค้าที่สนใจ และตารางไขว้",
    icon: Wallet,
  },
  {
    href: "/satisfaction",
    label: "ความพึงพอใจ & ข้อเสนอแนะ",
    shortLabel: "พึงพอใจ",
    description: "คะแนนสถานที่ การกลับมา และความเห็น",
    icon: HeartHandshake,
  },
  {
    href: "/business",
    label: "มุมมองตามประเภทธุรกิจ",
    shortLabel: "ธุรกิจ",
    description: "ข้อแนะนำเฉพาะ 4 กลุ่มผู้ประกอบการ",
    icon: Store,
  },
  {
    href: "/reports",
    label: "รายงาน & ส่งออก",
    shortLabel: "รายงาน",
    description: "ตารางสรุปทุกข้อ ส่งออก CSV และพิมพ์ A4",
    icon: FileSpreadsheet,
  },
  {
    href: "/guide",
    label: "คู่มือ",
    shortLabel: "คู่มือ",
    description: "วิธีอ่านกราฟ ใช้ตัวกรอง และตัวอย่างตัดสินใจ",
    icon: BookOpen,
    section: "resource",
  },
  {
    href: "/survey-poster",
    label: "โปสเตอร์ QR",
    shortLabel: "โปสเตอร์ QR",
    description: "โปสเตอร์ A4 สำหรับพิมพ์ติดพื้นที่วัด",
    icon: QrCode,
    preserveQuery: false,
    section: "resource",
  },
];

/** สีหมวดหมู่คงที่ทุกหน้า (อ้างอิง Design Tokens) */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-muted)",
] as const;

/** แปลง ISO timestamp เป็นวัน-เวลาเขตไทย (Asia/Bangkok) ที่อ่านง่าย */
export function formatThaiDateTime(iso: string | null | undefined): string {
  if (!iso) return "ไม่มีข้อมูลเวลา";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "ไม่มีข้อมูลเวลา";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d) + " น.";
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

export function formatThaiDate(ymd: string): string {
  if (!ymd) return "";
  const d = new Date(`${ymd}T12:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  try {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "short",
      year: "2-digit",
    }).format(d);
  } catch {
    return ymd;
  }
}

export const EXTERNAL_LINKS = {
  mainSite:
    process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
    "https://travel-zeta-lac.vercel.app",
  survey:
    process.env.NEXT_PUBLIC_SURVEY_URL ||
    "https://docs.google.com/forms/d/1uuheFOZgCXhNJBBLb62gnB3x0V10J6gxwmO3HiMLYc8/viewform",
};
