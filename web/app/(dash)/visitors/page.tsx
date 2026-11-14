import type { Metadata } from "next";
import { DashRoute } from "../_route";
import { VisitorsClient } from "./VisitorsClient";

export const metadata: Metadata = {
  title: "ผู้ตอบแบบสำรวจ",
  description: "วิเคราะห์ช่วงอายุ (SUR-01) และพื้นที่พำนัก (SUR-02) ของนักท่องเที่ยว",
};

export default function VisitorsPage() {
  return <DashRoute render={({ rows }) => <VisitorsClient rows={rows} />} />;
}
