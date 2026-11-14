import type { NoticeTone } from "@/components/ui/Notice";

type SourceRow = { source: string; submitted_at: string };

export type SyncStatus = { tone: NoticeTone; text: string; detail?: string };

/** แหล่งข้อมูลที่รู้จัก (แสดงเสมอแม้เป็น 0) ตามลำดับนี้ ตามด้วยแหล่งอื่นที่พบ */
export const KNOWN_SOURCES = ["google_form", "csv", "seed"] as const;

const DAY_MS = 24 * 3600_000;

const latestOf = (rows: SourceRow[]): string | null =>
  rows.reduce<string | null>((best, r) => (!best || r.submitted_at > best ? r.submitted_at : best), null);

/**
 * สถานะซิงก์ Google Form : ใช้เฉพาะแถว source='google_form' เท่านั้น
 * (แถว csv / seed ต้องไม่ทำให้ดูเหมือนการซิงก์ปกติ)
 */
export function googleFormStatus(all: SourceRow[], now: number): SyncStatus {
  const latest = latestOf(all.filter((r) => r.source === "google_form"));
  if (!latest) {
    return { tone: "warn", text: "ยังไม่มีข้อมูลจาก Google Form — ตรวจการติดตั้ง syncToSupabase.gs" };
  }
  const age = now - Date.parse(latest);
  if (age > DAY_MS) {
    return { tone: "info", text: "ไม่มีคำตอบใหม่ใน 24 ชม.", detail: latest };
  }
  return { tone: "ok", text: "ซิงก์ Google Form ทำงานปกติ", detail: latest };
}

/** จำนวนแถวและเวลาส่งล่าสุดต่อแหล่งข้อมูล (นับจากทุกแถวรวมที่ไม่สมบูรณ์) */
export function sourceStats(all: SourceRow[]): { source: string; count: number; latest: string | null }[] {
  const found = Array.from(new Set(all.map((r) => r.source)));
  const order = [...KNOWN_SOURCES, ...found.filter((s) => !(KNOWN_SOURCES as readonly string[]).includes(s)).sort()];
  return order.map((source) => {
    const rows = all.filter((r) => r.source === source);
    return { source, count: rows.length, latest: latestOf(rows) };
  });
}
