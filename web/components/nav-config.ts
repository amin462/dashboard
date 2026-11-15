import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Compass,
  FileSpreadsheet,
  HeartHandshake,
  Info,
  LayoutDashboard,
  Megaphone,
  ScanSearch,
  Store,
  Upload,
  Users,
  Wallet,
} from "lucide-react";

export type NavGroupKey = "analysis" | "help" | "admin";

export type NavItem = {
  href: string;
  /** ชื่อเต็ม = หัวเรื่องบน top bar */
  label: string;
  /** ชื่อในเมนูข้าง (สั้นพอไม่ถูกตัด "…" ที่ 1280px) ; ไม่ระบุ = ใช้ label */
  navLabel?: string;
  /** ชื่อสั้นสำหรับแท็บล่างบนมือถือ */
  shortLabel: string;
  icon: LucideIcon;
  group: NavGroupKey;
  /** ส่งต่อ query ตัวกรองไปหน้าถัดไปหรือไม่ (ค่าเริ่มต้น: ใช่) */
  preserveQuery?: boolean;
};

export const NAV_GROUPS: { key: NavGroupKey; label: string }[] = [
  { key: "analysis", label: "วิเคราะห์" },
  { key: "help", label: "ช่วยเหลือ" },
  { key: "admin", label: "ผู้ดูแล" },
];

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ภาพรวม", shortLabel: "ภาพรวม", icon: LayoutDashboard, group: "analysis" },
  { href: "/visitors", label: "ผู้ตอบแบบสำรวจ", shortLabel: "ผู้ตอบ", icon: Users, group: "analysis" },
  { href: "/travel", label: "การเดินทาง", shortLabel: "เดินทาง", icon: Compass, group: "analysis" },
  { href: "/awareness", label: "วัตถุประสงค์ & ช่องทางรับรู้", navLabel: "การรับรู้ & ช่องทาง", shortLabel: "ช่องทาง", icon: Megaphone, group: "analysis" },
  { href: "/spending", label: "ค่าใช้จ่าย & ความสนใจ", shortLabel: "ใช้จ่าย", icon: Wallet, group: "analysis" },
  { href: "/satisfaction", label: "ความพึงพอใจ & ข้อเสนอแนะ", navLabel: "ความพึงพอใจ", shortLabel: "พึงพอใจ", icon: HeartHandshake, group: "analysis" },
  { href: "/business", label: "มุมมองตามประเภทธุรกิจ", navLabel: "ตามประเภทธุรกิจ", shortLabel: "ธุรกิจ", icon: Store, group: "analysis" },
  { href: "/reports", label: "รายงาน & ส่งออก", shortLabel: "รายงาน", icon: FileSpreadsheet, group: "analysis" },
  { href: "/guide", label: "คู่มือ", shortLabel: "คู่มือ", icon: BookOpen, group: "help" },
  { href: "/about", label: "เกี่ยวกับงานวิจัย", shortLabel: "งานวิจัย", icon: Info, group: "help" },
  { href: "/admin/import", label: "นำเข้าข้อมูล", shortLabel: "นำเข้า", icon: Upload, group: "admin", preserveQuery: false },
  { href: "/admin/quality", label: "คุณภาพข้อมูล", shortLabel: "คุณภาพ", icon: ScanSearch, group: "admin", preserveQuery: false },
];

/** แท็บล่างบนมือถือ (ช่องที่ 5 = "เพิ่มเติม" เปิด sheet) */
export const MOBILE_TAB_HREFS = ["/", "/visitors", "/spending", "/business"];

export const EXTERNAL_LINKS = {
  mainSite: process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://travel-zeta-lac.vercel.app",
  survey:
    process.env.NEXT_PUBLIC_SURVEY_URL ||
    "https://docs.google.com/forms/d/1uuheFOZgCXhNJBBLb62gnB3x0V10J6gxwmO3HiMLYc8/viewform",
};

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function titleOfPath(pathname: string): string {
  return NAV_ITEMS.find((i) => isActivePath(pathname, i.href))?.label ?? "Yala Insight";
}
