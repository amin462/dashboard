"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Row } from "@/lib/survey/schema";
import { formatThaiDate } from "../format";

/** แสดงทีละกี่รายการ (กดแสดงเพิ่มเพื่อไม่ให้ DOM ใหญ่เมื่อข้อความเป็นพันรายการ) */
const PAGE = 30;

/** จังหวัดยะลา -> ยะลา, จังหวัดอื่นในประเทศไทย -> จังหวัดอื่น */
function shortOrigin(v: string): string {
  return v.startsWith("จังหวัดอื่น") ? "จังหวัดอื่น" : v.replace(/^จังหวัด/, "");
}

/** ชิปบอกกลุ่มผู้ตอบ (ข้ามค่า "ไม่ประสงค์ระบุ") */
function tagsOf(r: Row): string[] {
  const out: string[] = [];
  if (r.sur01 && r.sur01 !== "ไม่ประสงค์ระบุ") out.push(r.sur01);
  if (r.sur02 && r.sur02 !== "ไม่ประสงค์ระบุ") out.push(shortOrigin(r.sur02));
  if (r.sur03 && r.sur03 !== "ไม่ประสงค์ระบุ") out.push(r.sur03);
  return out;
}

/** SUR-11 ข้อเสนอแนะ: การ์ดสูงคงที่ (~480px) + ค้นหา + รายการเลื่อนในกรอบ (ใหม่→เก่า) */
export function CommentList({ comments }: { comments: Row[] }) {
  const [term, setTerm] = useState("");
  const [shown, setShown] = useState(PAGE);
  const matched = useMemo(() => {
    const q = term.trim().toLowerCase();
    return q ? comments.filter((r) => (r.sur11 ?? "").toLowerCase().includes(q)) : comments;
  }, [comments, term]);
  const visible = matched.slice(0, shown);

  return (
    <section
      aria-label="ข้อเสนอแนะจากผู้ตอบ"
      className="print-card card flex h-[520px] min-w-0 flex-col p-5 print:h-auto"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="type-section">ข้อเสนอแนะจากผู้ตอบ</h2>
          </div>
          <p className="mt-0.5 text-ink-2">
            {matched.length.toLocaleString("th-TH")} จาก {comments.length.toLocaleString("th-TH")} ความเห็น (ใหม่ → เก่า)
          </p>
        </div>
        <div className="no-print relative w-full sm:w-60">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setShown(PAGE);
            }}
            placeholder="ค้นหา เช่น ที่จอดรถ ห้องน้ำ"
            aria-label="ค้นหาในข้อเสนอแนะ"
            className="field pl-9"
          />
          {term && (
            <button
              type="button"
              onClick={() => {
                setTerm("");
                setShown(PAGE);
              }}
              aria-label="ล้างคำค้นหา"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-ink-3 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {comments.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-ink-3">ยังไม่มีผู้กรอกข้อเสนอแนะในกลุ่มที่เลือก</p>
      ) : matched.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-ink-3">ไม่พบข้อเสนอแนะที่มีคำว่า “{term}”</p>
      ) : (
        <ul
          tabIndex={0}
          aria-label="รายการข้อเสนอแนะ เลื่อนดูได้"
          className="thin-scroll mt-3 min-h-0 flex-1 divide-y divide-line overflow-y-auto pr-2 print:overflow-visible"
        >
          {visible.map((r) => {
            const tags = tagsOf(r);
            return (
              <li key={r.id} className="py-3 first:pt-0">
                <p className="text-ink">“{r.sur11}”</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-1.5 type-meta text-ink-3">
                  <span>
                    {formatThaiDate(r.date)} · ช่วง{r.slot}
                  </span>
                  {r.sat !== null && (
                    <span className="rounded-md bg-amber-soft px-1.5 font-medium text-amber-ink">คะแนน {r.sat}/5</span>
                  )}
                  {tags.map((t) => (
                    <span key={t} className="rounded-md bg-surface-2 px-1.5 text-ink-2">
                      {t}
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
          {matched.length > visible.length && (
            <li className="no-print py-3 text-center">
              <button type="button" onClick={() => setShown((s) => s + PAGE)} className="btn btn-secondary h-8 text-[13px]">
                แสดงเพิ่มอีก {Math.min(PAGE, matched.length - visible.length).toLocaleString("th-TH")} รายการ
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
