"use client";

import { useMemo } from "react";
import type { SatResult } from "@/lib/survey/aggregate";
import { SMALL_N, SMALL_N_WARNING } from "@/lib/survey/schema";
import { num } from "../format";
import { ChartCard, type ChartTableData } from "../charts/ChartCard";
import { SmallSampleBadge } from "../ui/SmallSampleBadge";
import type { SatGroup } from "./sat-groups";

type Props = {
  title: string;
  code: string;
  groups: SatGroup[];
  /** satisfaction() ของทุกคนที่แสดง (เส้นอ้างอิงค่าเฉลี่ยรวม) */
  overall: SatResult;
};

/** ตำแหน่งบนแถบ 0–100% ของค่าเฉลี่ย (สเกลคะแนน 1–5 ; เรขาคณิตของแถบเท่านั้น) */
const pos = (mean: number) => Math.max(0, Math.min(100, ((mean - 1) / 4) * 100));

/** ค่าเฉลี่ยความพึงพอใจแยกกลุ่ม : แถบแนวนอน (สเกล 1–5) + ค่าเฉลี่ย + n ; กลุ่ม n < 5 = ป้ายเตือนและแถบสีจาง */
export function SatByGroupCard({ title, code, groups, overall }: Props) {
  const best = useMemo(
    () =>
      groups.reduce<SatGroup | null>(
        (b, g) => (g.sat.n >= SMALL_N && g.sat.mean !== null && (!b || g.sat.mean > (b.sat.mean ?? 0)) ? g : b),
        null,
      ),
    [groups],
  );
  const anySmall = groups.some((g) => g.sat.n < SMALL_N);
  const tableData: ChartTableData = useMemo(
    () => ({
      headers: ["กลุ่ม", "ค่าเฉลี่ย (เต็ม 5)", "ผู้ให้คะแนน (คน)"],
      rows: groups.map((g) => [g.label, g.sat.mean !== null ? g.sat.mean.toFixed(2) : "—", num(g.sat.n)]),
    }),
    [groups],
  );

  return (
    <ChartCard
      title={title}
      code={code}
      takeaway={
        best && best.sat.mean !== null
          ? `สูงสุด: ${best.label} (${best.sat.mean.toFixed(2)} / 5)`
          : `ยังไม่มีกลุ่มที่มีผู้ให้คะแนนอย่างน้อย ${SMALL_N} คน`
      }
      base={overall.n}
      baseText={`ฐาน: ผู้ให้คะแนน 1–5 รวม ${num(overall.n)} คน · แถบสเกล 1–5${
        overall.mean !== null ? ` · เส้นประ = ค่าเฉลี่ยรวม ${overall.mean.toFixed(2)}` : ""
      }`}
      note={anySmall ? `กลุ่ม n < ${SMALL_N}: ${SMALL_N_WARNING}` : undefined}
      tableData={tableData}
    >
      <ul aria-label={title} className="flex flex-1 flex-col justify-evenly gap-3">
        {groups.map((g) => {
          const small = g.sat.n < SMALL_N;
          const mean = g.sat.mean;
          const top = best?.label === g.label;
          return (
            <li key={g.label}>
              <div className="grid grid-cols-[minmax(6rem,38%)_minmax(0,1fr)_5.5rem] items-center gap-3">
                <span className="min-w-0 leading-5 text-ink">
                  <span className={top ? "font-medium" : ""}>{g.label}</span>
                  {g.sub && <span className="block type-meta text-ink-3">{g.sub}</span>}
                </span>
                <span
                  className="relative h-3 rounded bg-surface-2"
                  role="img"
                  aria-label={mean !== null ? `${g.label} ค่าเฉลี่ย ${mean.toFixed(2)} จาก 5` : `${g.label} ไม่มีคะแนน`}
                >
                  {mean !== null && (
                    <span
                      className={`block h-full rounded ${small ? "bg-muted-bar" : top ? "bg-amber" : "bg-bar"}`}
                      style={{ width: `${Math.max(1.5, pos(mean))}%` }}
                    />
                  )}
                  {overall.mean !== null && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -bottom-1 w-0 border-l border-dashed border-ink-3"
                      style={{ left: `${pos(overall.mean)}%` }}
                    />
                  )}
                </span>
                <span className="text-right whitespace-nowrap">
                  <strong className={`font-semibold ${small ? "text-ink-3" : "text-ink"}`}>
                    {mean !== null ? mean.toFixed(2) : "—"}
                  </strong>
                  <span className="ml-1 type-meta text-ink-3">n={num(g.sat.n)}</span>
                </span>
              </div>
              {small && <SmallSampleBadge n={g.sat.n} compact className="mt-1" />}
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
