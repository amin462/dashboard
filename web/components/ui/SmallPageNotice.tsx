import { AlertTriangle } from "lucide-react";
import { SMALL_PAGE_N } from "@/lib/survey/schema";
import { num } from "../format";

/** แถบเตือนทั้งหน้า: ผู้ตอบ (หลังกรอง) ยังน้อย ผลอาจเปลี่ยนมากเมื่อมีข้อมูลเพิ่ม */
export function SmallPageNotice({ n, total, isFiltered }: { n: number; total: number; isFiltered: boolean }) {
  return (
    <div role="status" className="flex items-start gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-warn">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        <strong className="font-semibold">กลุ่มตัวอย่างยังน้อย</strong> — หน้านี้อิงผู้ตอบ {num(n)} คน
        {isFiltered && total !== n ? ` (จาก ${num(total)} คนก่อนกรอง)` : ""} น้อยกว่า {num(SMALL_PAGE_N)} คน
        ตัวเลขและร้อยละอาจเปลี่ยนมากเมื่อมีผู้ตอบเพิ่ม ใช้เป็นแนวโน้มเบื้องต้นเท่านั้น
      </p>
    </div>
  );
}
