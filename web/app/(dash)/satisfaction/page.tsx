import type { Metadata } from "next";
import { DashRoute } from "../_route";
import { SatisfactionClient } from "./SatisfactionClient";

export const metadata: Metadata = {
  title: "ความพึงพอใจและข้อเสนอแนะ",
  description: "ความพึงพอใจต่อสถานที่ (SUR-09) ความตั้งใจกลับมา (SUR-10) และข้อเสนอแนะ (SUR-11)",
};

export default function SatisfactionPage() {
  return <DashRoute render={({ rows }) => <SatisfactionClient rows={rows} />} />;
}
