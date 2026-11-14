import type { Metadata } from "next";
import { DashRoute } from "../_route";
import { BusinessClient } from "./BusinessClient";

export const metadata: Metadata = {
  title: "มุมมองตามประเภทธุรกิจ",
  description: "ตัวชี้วัดและข้อเสนอเบื้องต้นสำหรับร้านอาหาร ที่พัก ของฝาก และนำเที่ยว",
};

export default function BusinessPage() {
  return <DashRoute render={({ rows }) => <BusinessClient rows={rows} />} />;
}
