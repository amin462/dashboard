import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "../_data";
import DashLoading from "../loading";
import { TravelClient } from "./TravelClient";

export const metadata: Metadata = {
  title: "การเดินทาง",
  description: "วิเคราะห์ผู้ร่วมเดินทาง (SUR-03) และพาหนะ (SUR-04)",
};

async function TravelContent() {
  const { rows } = await getSurveyBundle();
  return <TravelClient rows={rows} />;
}

export default function TravelPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <TravelContent />
    </Suspense>
  );
}
