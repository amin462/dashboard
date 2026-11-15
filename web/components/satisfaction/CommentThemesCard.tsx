import { ChevronDown, MessageSquareText } from "lucide-react";
import type { CommentSummary, CommentThemeResult } from "@/lib/survey/comments";
import { formatThaiDate } from "../format";
import { SmallSampleBadge } from "../ui/SmallSampleBadge";

/**
 * ข้อเสนอแนะ (ข้อ 11) แยกเป็นหัวข้อ : หัวข้อมาจากคำสำคัญที่กำหนดไว้ใน lib/survey/comments.ts
 * ใต้ทุกหัวข้อคือข้อความต้นฉบับของผู้ตอบ (ไม่ใช่ข้อความที่ AI แต่ง) ; ตัวเลขทั้งหมดคำนวณใน lib
 */
export function CommentThemesCard({ summary }: { summary: CommentSummary }) {
  const { base, total, noSuggestion, themes, other } = summary;
  const rows = other.count > 0 ? [...themes, other] : themes;
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section aria-label="ข้อเสนอแนะแยกเป็นหัวข้อ" className="print-card card flex h-full min-w-0 flex-col p-5">
      <header>
        <h2 className="type-section text-ink">ข้อเสนอแนะแยกเป็นหัวข้อ</h2>
        <p className="mt-0.5 text-ink-2">
          {base > 0
            ? `จัดกลุ่มจากคำสำคัญในคำตอบจริงของผู้ตอบ (ไม่ใช่ข้อความที่ AI แต่ง) · ${base.toLocaleString("th-TH")} ความเห็นที่มีข้อเสนอ จาก ${total.toLocaleString("th-TH")} ที่กรอกข้อความ`
            : "ยังไม่มีข้อเสนอแนะที่เป็นข้อความในกลุ่มที่เลือก"}
        </p>
      </header>

      {base > 0 && (
        <div className="mt-4 space-y-2">
          {rows.map((r, i) => (
            <ThemeRow key={r.key} r={r} max={max} top={i === 0 && r.key !== "other"} muted={r.key === "other"} />
          ))}
        </div>
      )}

      {base > 0 && (
        <footer className="mt-auto space-y-1 pt-4 type-meta text-ink-3">
          <p>
            ฐาน n = {base.toLocaleString("th-TH")} ความเห็น · ความเห็นหนึ่งอาจตรงหลายหัวข้อ (ร้อยละรวมกันเกิน 100% ได้)
            {noSuggestion > 0 ? ` · ไม่นับคำตอบ “ไม่มี” / “-” จำนวน ${noSuggestion.toLocaleString("th-TH")} รายการ` : ""}
          </p>
          <SmallSampleBadge n={base} />
        </footer>
      )}
      {base === 0 && (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center text-ink-3">
          <MessageSquareText className="h-6 w-6" aria-hidden="true" />
          <p>เมื่อมีผู้เขียนข้อเสนอแนะ จะแสดงเป็นหัวข้อที่นี่</p>
        </div>
      )}
    </section>
  );
}

function ThemeRow({ r, max, top, muted }: { r: CommentThemeResult; max: number; top: boolean; muted: boolean }) {
  const width = Math.max(4, Math.round((r.count / max) * 100));
  return (
    <details className="group rounded-xl bg-surface-2">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className={`leading-snug ${top ? "font-semibold text-ink" : "text-ink"}`}>{r.label}</p>
          <span aria-hidden="true" className="mt-1.5 block h-2 overflow-hidden rounded bg-surface">
            <span
              className={`block h-full rounded ${muted ? "bg-muted-bar" : top ? "bg-amber" : "bg-bar"}`}
              style={{ width: `${width}%` }}
            />
          </span>
        </div>
        <span className="shrink-0 text-right tabular-nums text-ink-2">
          <strong className="font-semibold text-ink">{r.count}</strong> ความเห็น · {r.pct.toFixed(1)}%
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="space-y-2 border-t border-line px-3.5 py-3">
        {r.quotes.map((q, i) => (
          <li key={`${q.date}-${i}`}>
            <p className="whitespace-pre-line text-ink">“{q.text}”</p>
            <p className="type-meta text-ink-3">
              {formatThaiDate(q.date)} · ช่วง{q.slot}
              {q.sat !== null ? ` · คะแนน ${q.sat}/5` : ""}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
