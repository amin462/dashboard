import type { Metadata } from "next";
import { Suspense } from "react";
import { getSurveyBundle } from "../_data";
import DashLoading from "../loading";
import { BusinessClient } from "./BusinessClient";

export const metadata: Metadata = {
  title: "มุมมองตามประเภทธุรกิจ",
  description: "ตัวชี้วัดและข้อแนะนำเบื้องต้นสำหรับร้านอาหาร ที่พัก ของฝาก และนำเที่ยว",
};

async function BusinessContent() {
  const { rows } = await getSurveyBundle();
  return <BusinessClient rows={rows} />;
}

export default function BusinessPage() {
  return (
    <Suspense fallback={<DashLoading />}>
      <BusinessContent />
    </Suspense>
  );
}
