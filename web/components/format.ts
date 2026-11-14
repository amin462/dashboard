/** ตัวช่วยจัดรูปแบบวันที่/ตัวเลขภาษาไทย (เขตเวลา Asia/Bangkok) */

const TZ = "Asia/Bangkok";

export const num = (n: number): string => n.toLocaleString("th-TH");

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 20:11 */
function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("th-TH", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

/** 14 พ.ย. 20:11 */
export function formatThaiDateTimeShort(iso: string | null | undefined): string {
  const d = parse(iso);
  if (!d) return "ไม่มีข้อมูลเวลา";
  const date = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, day: "numeric", month: "short" }).format(d);
  return `${date} ${formatTime(d)}`;
}

/** 14 พ.ย. 2569 20:11 น. */
export function formatThaiDateTime(iso: string | null | undefined): string {
  const d = parse(iso);
  if (!d) return "ไม่มีข้อมูลเวลา";
  return new Intl.DateTimeFormat("th-TH", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }).format(d) + " น.";
}

/** 14 พ.ย. 69 (รับ YYYY-MM-DD) */
export function formatThaiDate(ymd: string): string {
  if (!ymd) return "";
  const d = new Date(`${ymd}T12:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return new Intl.DateTimeFormat("th-TH", { timeZone: TZ, day: "numeric", month: "short", year: "2-digit" }).format(d);
}

/** YYYY-MM-DD ตามเขตเวลาไทย ของ timestamp (ใช้เป็นจุดอ้างอิงปุ่ม 7/30 วัน) */
export function bangkokDate(iso: string | null | undefined): string | null {
  const d = parse(iso);
  if (!d) return null;
  return new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}

/** บวก/ลบวันกับสตริง YYYY-MM-DD */
export function addDays(ymd: string, days: number): string {
  return new Date(Date.parse(`${ymd}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}
