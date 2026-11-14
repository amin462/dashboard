import type { Metadata } from "next";
import { DashRoute } from "../_route";
import { TravelClient } from "./TravelClient";

export const metadata: Metadata = {
  title: "การเดินทาง",
  description: "ผู้ร่วมเดินทาง (SUR-03) และพาหนะ (SUR-04) พร้อมตารางไขว้",
};

export default function TravelPage() {
  return <DashRoute render={({ rows }) => <TravelClient rows={rows} />} />;
}
