import type { Metadata } from "next";
import { DashRoute } from "../_route";
import { ReportsClient } from "./ReportsClient";

export const metadata: Metadata = {
  title: "รายงานและส่งออก",
  description: "ตารางสรุปความถี่และร้อยละทุกข้อคำถาม พร้อมส่งออก CSV และพิมพ์ PDF",
};

export default function ReportsPage() {
  return (
    <DashRoute
      render={({ rows, source, lastSubmittedAt, seedCount }) => (
        <ReportsClient rows={rows} source={source} updatedAt={lastSubmittedAt} seedCount={seedCount} />
      )}
    />
  );
}
