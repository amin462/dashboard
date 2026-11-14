import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "../_data";
import DashLoading from "../loading";
import { VisitorsClient } from "./VisitorsClient";

export const metadata: Metadata = {
  title: "ผู้ตอบแบบสำรวจ",
  description: "วิเคราะห์ช่วงอายุ (SUR-01) และพื้นที่พำนัก (SUR-02) ของนักท่องเที่ยว",
};

async function VisitorsContent() {
  const { rows } = await getSurveyBundle();
  return <VisitorsClient rows={rows} />;
}

export default function VisitorsPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <VisitorsContent />
    </Suspense>
  );
}
