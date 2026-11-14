"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Row } from "@/lib/survey/schema";
import { formatThaiDate } from "../format";

/** SUR-11 ข้อเสนอแนะ: รายการข้อความ (ใหม่→เก่า) + ค้นหา */
export function CommentList({ comments }: { comments: Row[] }) {
  const [term, setTerm] = useState("");
  const matched = useMemo(() => {
    const q = term.trim().toLowerCase();
    return q ? comments.filter((r) => (r.sur11 ?? "").toLowerCase().includes(q)) : comments;
  }, [comments, term]);

  return (
    <section aria-label="ข้อเสนอแนะจากผู้ตอบ" className="print-card card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="type-section">ข้อเสนอแนะจากผู้ตอบ</h2>
            <span className="rounded border border-line px-1.5 text-[11px] leading-[18px] text-ink-3">SUR-11</span>
          </div>
          <p className="mt-0.5 text-ink-2">
            แสดง {matched.length.toLocaleString("th-TH")} จาก {comments.length.toLocaleString("th-TH")} ความเห็น (ใหม่ → เก่า)
          </p>
        </div>
        <div className="no-print relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="ค้นหาคำ เช่น ที่จอดรถ ห้องน้ำ"
            aria-label="ค้นหาในข้อเสนอแนะ"
            className="field pl-9"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="ล้างคำค้นหา"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-ink-3 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {comments.length === 0 ? (
        <p className="py-8 text-center text-ink-3">ยังไม่มีผู้กรอกข้อเสนอแนะในกลุ่มที่เลือก</p>
      ) : matched.length === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่พบข้อเสนอแนะที่มีคำว่า “{term}”</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {matched.map((r) => (
            <li key={r.id} className="py-3">
              <p className="text-ink">“{r.sur11}”</p>
              <p className="mt-1 type-meta text-ink-3">
                {formatThaiDate(r.date)} · ช่วง{r.slot}
                {r.sat !== null && ` · คะแนน ${r.sat}/5`}
                {r.sur02 && ` · ${r.sur02}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
