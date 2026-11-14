import type { Metadata } from "next";
import { DashRoute } from "../_route";
import { SpendingClient } from "./SpendingClient";

export const metadata: Metadata = {
  title: "ค่าใช้จ่ายและความสนใจ",
  description: "ค่าใช้จ่าย (SUR-07) สินค้าและบริการที่สนใจ (SUR-08) และตารางไขว้",
};

export default function SpendingPage() {
  return <DashRoute render={({ rows }) => <SpendingClient rows={rows} />} />;
}
