import "server-only";
import { cacheLife } from "next/cache";
import { quality } from "@/lib/survey/aggregate";
import { getRawRows } from "@/lib/survey/data";
import { normalize } from "@/lib/survey/normalize";

/**
 * ข้อมูลทั้งแดชบอร์ดอ่านผ่าน cache นี้: revalidate ทุก 60 วินาที
 * (ไม่ถูกแช่แข็งตอน build; แถวใหม่ใน Supabase ปรากฏภายใน ~1 นาที)
 */
export async function getSurveyBundle() {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });

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
