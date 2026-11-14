import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "../_data";
import DashLoading from "../loading";
import { SpendingClient } from "./SpendingClient";

export const metadata: Metadata = {
  title: "ค่าใช้จ่าย & ความสนใจ",
  description: "วิเคราะห์ช่วงค่าใช้จ่าย (SUR-07) สินค้าบริการที่สนใจ (SUR-08) และตารางไขว้",
};

async function SpendingContent() {
  const { rows } = await getSurveyBundle();
  return <SpendingClient rows={rows} />;
}

export default function SpendingPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <SpendingContent />
    </Suspense>
  );
}
