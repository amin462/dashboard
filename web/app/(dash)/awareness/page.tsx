import type { Metadata } from "next";
import { DashRoute } from "../_route";
import { AwarenessClient } from "./AwarenessClient";

export const metadata: Metadata = {
  title: "วัตถุประสงค์ และช่องทางรับรู้",
  description: "วัตถุประสงค์ (SUR-05) และช่องทางที่รู้จักสถานที่ (SUR-06) เพื่อวางแผนประชาสัมพันธ์",
};

export default function AwarenessPage() {
  return <DashRoute render={({ rows }) => <AwarenessClient rows={rows} />} />;
}
