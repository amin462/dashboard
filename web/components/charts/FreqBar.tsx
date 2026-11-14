"use client";

import { useMemo } from "react";
import { topItem, type FreqItem, type FreqResult } from "@/lib/survey/aggregate";
import { OTHERS_LABEL, QUESTIONS, type Code } from "@/lib/survey/schema";
import { BarRows } from "./BarRows";
import { ChartCard, type ChartTableData } from "./ChartCard";
import { codeLabel, freqTakeaway, nonAnswerLabels, stripNumber } from "./chart-utils";

/** ข้อที่ตัวเลือกมีลำดับธรรมชาติ (อายุ/ค่าใช้จ่าย) คงลำดับเดิม ข้ออื่นเรียงมาก→น้อย */
const ORDINAL: Code[] = ["sur01", "sur07"];

function arrange(res: FreqResult): FreqItem[] {
  const tailLabels = [...(QUESTIONS[res.code].notSpecified ?? []), OTHERS_LABEL];
  const main = res.items.filter((i) => !tailLabels.includes(i.label));
  const tail = res.items.filter((i) => tailLabels.includes(i.label));
  if (!ORDINAL.includes(res.code)) main.sort((a, b) => b.count - a.count);
  return [...main, ...tail];
}

type FreqBarProps = {
  result: FreqResult;
  title?: string;
  /** ประโยคสรุปแทนค่าอัตโนมัติ */
  takeaway?: string;
  cta?: { href: string; label: string };
  /** ซ่อนรายการคำตอบพิมพ์เองของหมวด "อื่น ๆ" (หน้าสรุปที่ต้องการการ์ดกะทัดรัด ; ดูครบได้ในหน้าละเอียด) */
  hideOthers?: boolean;
};

export function FreqBar({ result, title, takeaway, cta, hideOthers = false }: FreqBarProps) {
  const name = title ?? stripNumber(result.title);
  const items = useMemo(() => arrange(result), [result]);
  const tailLabels = useMemo(() => [...(QUESTIONS[result.code].notSpecified ?? []), OTHERS_LABEL], [result.code]);
  const top = useMemo(() => topItem(result, nonAnswerLabels(result.code)), [result]);

  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["ตัวเลือก", "จำนวน (คน)", "ร้อยละ (%)"],
      rows: items.map((i) => [i.label, i.count.toLocaleString("th-TH"), `${i.pct.toFixed(1)}%`]),
    }),
    [items],
  );

  const otherTexts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of result.others) m.set(t, (m.get(t) ?? 0) + 1);
    return Array.from(m, ([text, count]) => ({ text, count })).sort((a, b) => b.count - a.count);
  }, [result.others]);

  return (
    <ChartCard
      title={name}
      code={codeLabel(result.code)}
      takeaway={takeaway ?? freqTakeaway(result)}
      base={result.base}
      skipped={result.skipped}
      notSpecified={result.notSpecified}
      note={result.code === "sur08" ? "ตอบได้หลายข้อ (รวม > 100% ได้)" : undefined}
      tableData={tableData}
      cta={cta}
    >
      {result.base === 0 ? (
        <p className="py-8 text-center text-ink-3">ไม่มีผู้ตอบข้อนี้ในกลุ่มที่เลือก</p>
      ) : (
        <BarRows
          label={`${name} ฐาน ${result.base} คน`}
          highlight={top?.label ?? null}
          rows={items.map((i) => ({ label: i.label, count: i.count, pct: i.pct, tail: tailLabels.includes(i.label) }))}
        />
      )}

      {!hideOthers && otherTexts.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="type-meta text-ink-3">คำตอบที่ผู้ตอบพิมพ์เองในหมวด “อื่น ๆ” ({result.others.length} รายการ)</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {otherTexts.map((o) => (
              <li key={o.text} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 type-meta text-ink-2">
                {o.text}
                {o.count > 1 && <strong className="ml-1 font-semibold text-ink">×{o.count}</strong>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
