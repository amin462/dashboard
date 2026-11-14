import { FlaskConical } from "lucide-react";

type DataBannerProps = {
  source: "supabase" | "mock";
  error?: string;
  /** จำนวนแถวทดสอบ (source='seed') ที่ปนอยู่ในฐานข้อมูลจริง */
  seedCount?: number;
};

/** แบนเนอร์บรรทัดเดียว 36px (warn-soft) + "รายละเอียด" แบบ disclosure ; ไม่มีเหตุให้เตือน = ไม่แสดง */
export function DataBanner({ source, error, seedCount = 0 }: DataBannerProps) {
  let summary: string;
  let detail: string;
  let role: "alert" | "status" = "status";

  if (source === "supabase" && seedCount > 0) {
    role = "alert";
    summary = `มีข้อมูลทดสอบปนอยู่ ${seedCount.toLocaleString("th-TH")} แถว — ผลบนจอยังไม่ใช่ข้อมูลจริงทั้งหมด`;
    detail = "ผู้ดูแลต้องลบแถวทดสอบด้วยคำสั่ง pnpm seed:clear ก่อนนำผลไปใช้";
  } else if (source === "mock") {
    summary = error
      ? "ข้อมูลตัวอย่าง (Demo 300 ชุด) — อ่านฐานข้อมูลไม่สำเร็จ"
      : "ข้อมูลตัวอย่าง (Demo 300 ชุด) — ยังไม่ได้เชื่อมต่อฐานข้อมูลจริง";
    detail = error
      ? `ระบบสลับไปใช้ข้อมูลจำลองอัตโนมัติ สาเหตุ: ${error}`
      : "ระบบแสดงข้อมูลจำลองอัตโนมัติเพราะยังไม่ได้ตั้งค่า Supabase ตัวเลขทั้งหมดบนจอไม่ใช่ผลสำรวจจริง";
  } else {
    return null;
  }

  return (
    <details role={role} className="no-print group border-b border-line bg-warn-soft text-warn">
      <summary className="mx-auto flex h-9 max-w-[1240px] cursor-pointer list-none items-center gap-2 px-4 type-meta lg:px-8 [&::-webkit-details-marker]:hidden">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-medium">{summary}</span>
        <span className="shrink-0 underline group-open:no-underline">รายละเอียด</span>
      </summary>
      <p className="mx-auto max-w-[1240px] px-4 pb-2 type-meta lg:px-8">{detail}</p>
    </details>
  );
}
