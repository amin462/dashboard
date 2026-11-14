"use client";

import { crosstab, freq, overview, satisfaction } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { SatisfactionChart } from "@/components/charts/SatisfactionChart";
import { num } from "@/components/format";
import { RevisitDonutCard } from "@/components/overview/RevisitDonutCard";
import { CommentList } from "@/components/page/CommentList";
import { DashPage } from "@/components/page/DashPage";
import { shareStat } from "@/components/page/stat-helpers";
import { SatByGroupCard } from "@/components/satisfaction/SatByGroupCard";
import { SatRevisitHeat } from "@/components/satisfaction/SatRevisitHeat";
import { satByCompanion, satByOrigin } from "@/components/satisfaction/sat-groups";
import { Cell } from "@/components/ui/Cell";
import { StatStrip } from "@/components/ui/StatStrip";

export function SatisfactionClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="ระดับความพึงพอใจต่อสถานที่ (ไม่ใช่ผลประเมินระบบ) แนวโน้มการกลับมา และเสียงจากผู้ตอบ">
      {({ rows: filtered }) => {
        const sat = satisfaction(filtered);
        const revisit = freq(filtered, "sur10");
        const intent = overview(filtered).returnIntent;
        const comments = filtered
          .filter((r) => Boolean(r.sur11 && r.sur11.trim() !== ""))
          .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
        return (
          <>
            <StatStrip
              items={[
                {
                  label: "ความพึงพอใจเฉลี่ย (เต็ม 5)",
                  value: sat.mean !== null ? sat.mean.toFixed(2) : "—",
                  context: sat.level ? `แปลผล: ระดับ${sat.level}` : "ไม่มีผู้ให้คะแนน 1–5",
                  sampleN: sat.n,
                },
                {
                  label: "ส่วนเบี่ยงเบนมาตรฐาน (SD)",
                  value: sat.sd !== null ? sat.sd.toFixed(2) : "—",
                  context: `จากผู้ให้คะแนน 1–5 จำนวน ${num(sat.n)} คน`,
                  sampleN: sat.n,
                },
                shareStat("ตั้งใจจะกลับมาอีก", revisit.items.find((i) => i.label === "ตั้งใจจะกลับมาอีก"), revisit, 10),
                {
                  label: "ข้อเสนอแนะที่เป็นข้อความ",
                  value: `${num(comments.length)} รายการ`,
                  context: "คำตอบข้อ 11 ที่กรอกข้อความ",
                },
              ]}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Cell span="lg:col-span-6">
                <SatisfactionChart result={sat} />
              </Cell>
              <Cell span="lg:col-span-6">
                <RevisitDonutCard result={revisit} intent={intent} hideCta />
              </Cell>
              <Cell span="lg:col-span-6">
                <SatByGroupCard title="ความพึงพอใจตามถิ่นพำนัก" code="SUR-09 × 02" groups={satByOrigin(filtered)} overall={sat} />
              </Cell>
              <Cell span="lg:col-span-6">
                <SatByGroupCard title="ความพึงพอใจตามผู้ร่วมเดินทาง" code="SUR-09 × 03" groups={satByCompanion(filtered)} overall={sat} />
              </Cell>
              <Cell span="lg:col-span-5">
                <SatRevisitHeat result={crosstab(filtered, "sur09", "sur10")} />
              </Cell>
              <Cell span="lg:col-span-7">
                <CommentList comments={comments} />
              </Cell>
            </div>
          </>
        );
      }}
    </DashPage>
  );
}
