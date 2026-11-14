import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "../_data";
import DashLoading from "../loading";
import { SatisfactionClient } from "./SatisfactionClient";

export const metadata: Metadata = {
  title: "ความพึงพอใจ & ข้อเสนอแนะ",
  description: "วิเคราะห์คะแนนความพึงพอใจ (SUR-09) ความตั้งใจกลับมา (SUR-10) และข้อเสนอแนะ (SUR-11)",
};

async function SatisfactionContent() {
  const { rows } = await getSurveyBundle();
  return <SatisfactionClient rows={rows} />;
}

export default function SatisfactionPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <SatisfactionContent />
    </Suspense>
  );
}
