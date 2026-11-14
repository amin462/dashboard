import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "./_data";
import DashLoading from "./loading";
import { OverviewClient } from "./OverviewClient";

export const metadata: Metadata = {
  title: "ภาพรวม",
  description:
    "สรุปตัวชี้วัดหลัก จำนวนผู้ตอบรายวัน ช่วงเวลา และข้อค้นพบสำคัญจากแบบสำรวจวัดคูหาภิมุข",
};

async function OverviewContent() {
  const { rows } = await getSurveyBundle();
  return <OverviewClient rows={rows} />;
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <OverviewContent />
    </Suspense>
  );
}
