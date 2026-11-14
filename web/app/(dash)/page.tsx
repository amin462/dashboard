import type { Metadata } from "next";
import { DashRoute } from "./_route";
import { OverviewClient } from "./OverviewClient";

export const metadata: Metadata = {
  title: "ภาพรวม",
  description: "สรุปตัวชี้วัดหลัก จำนวนผู้ตอบรายวัน ช่วงเวลา และข้อค้นพบสำคัญจากแบบสำรวจวัดคูหาภิมุข",
};

export default function OverviewPage() {
  return <DashRoute render={({ rows }) => <OverviewClient rows={rows} />} />;
}
