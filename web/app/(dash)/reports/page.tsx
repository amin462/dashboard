import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "../_data";
import DashLoading from "../loading";
import { ReportsClient } from "./ReportsClient";

export const metadata: Metadata = {
  title: "รายงาน & ส่งออก",
  description: "ตารางสรุปความถี่และร้อยละทุกข้อคำถาม พร้อมส่งออก CSV และพิมพ์ PDF",
};

async function ReportsContent() {
  const { rows } = await getSurveyBundle();
  return <ReportsClient rows={rows} />;
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <ReportsContent />
    </Suspense>
  );
}
