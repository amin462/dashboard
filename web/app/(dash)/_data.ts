import "server-only";
import { cacheLife } from "next/cache";
import { quality } from "@/lib/survey/aggregate";
import { getRawRows } from "@/lib/survey/data";
import { normalize } from "@/lib/survey/normalize";

/**
 * ข้อมูลทั้งแดชบอร์ดอ่านผ่าน cache นี้: revalidate ทุก 15 วินาที (ฝั่งเบราว์เซอร์ดึงใหม่เองทุก ~20 วินาทีด้วย AutoRefresh)
 * (ไม่ถูกแช่แข็งตอน build; แถวใหม่ใน Supabase ปรากฏภายใน ~15–40 วินาที)
 */
export async function getSurveyBundle() {
  "use cache";
  cacheLife({ stale: 30, revalidate: 15, expire: 3600 });

  const res = await getRawRows();
  const { rows, all } = normalize(res.rows);
  const q = quality(all);
  return {
    source: res.source,
    error: res.error,
    // แถวทดสอบจาก scripts/seed.ts ที่อยู่ในฐานข้อมูลจริง -> ต้องเตือนบนจอ ห้ามปนกับข้อมูลจริงโดยไม่รู้ตัว
    seedCount: res.rows.filter((r) => r.source === "seed").length,
    rows,
    totalAll: all.length,
    lastSubmittedAt: q.lastSubmittedAt,
  };
}

/** ตัวบ่งชี้ว่าข้อมูลเปลี่ยนหรือยัง (จำนวนผู้ส่งทั้งหมด + ผู้ตอบสมบูรณ์ + เวลาตอบล่าสุด) ให้ AutoRefresh เทียบกับที่หน้าเว็บแสดงอยู่ */
export function versionOf(b: { totalAll: number; rows: unknown[]; lastSubmittedAt: string | null }): string {
  return `${b.totalAll}.${b.rows.length}.${b.lastSubmittedAt ?? ""}`;
}

export async function dataVersion(): Promise<string> {
  return versionOf(await getSurveyBundle());
}
