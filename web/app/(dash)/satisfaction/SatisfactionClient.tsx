"use client";

import { freq, satisfaction } from "@/lib/survey/aggregate";
import type { Row } from "@/lib/survey/schema";
import { RevisitChart } from "@/components/charts/RevisitChart";
import { SatisfactionChart } from "@/components/charts/SatisfactionChart";
import { num } from "@/components/format";
import { CommentList } from "@/components/page/CommentList";
import { DashPage } from "@/components/page/DashPage";
import { shareStat } from "@/components/page/stat-helpers";
import { StatStrip } from "@/components/ui/StatStrip";

export function SatisfactionClient({ rows }: { rows: Row[] }) {
  return (
    <DashPage rows={rows} description="ระดับความพึงพอใจต่อสถานที่ (ไม่ใช่ผลประเมินระบบ) แนวโน้มการกลับมา และเสียงจากผู้ตอบ">
      {({ rows: filtered }) => {
        const sat = satisfaction(filtered);
        const revisit = freq(filtered, "sur10");
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SatisfactionChart result={sat} />
              <RevisitChart result={revisit} />
            </div>
            <CommentList comments={comments} />
          </>
        );
      }}
    </DashPage>
  );
}
