import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "../_data";
import DashLoading from "../loading";
import { AwarenessClient } from "./AwarenessClient";

export const metadata: Metadata = {
  title: "วัตถุประสงค์ & ช่องทางรับรู้",
  description: "วิเคราะห์วัตถุประสงค์การเดินทาง (SUR-05) และช่องทางรับรู้ (SUR-06)",
};

async function AwarenessContent() {
  const { rows } = await getSurveyBundle();
  return <AwarenessClient rows={rows} />;
}

export default function AwarenessPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <AwarenessContent />
    </Suspense>
  );
}
