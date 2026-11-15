"use client";

import { useSyncExternalStore } from "react";
import { bangkokDate } from "../format";

const noop = () => () => {};

/** วันนี้ (YYYY-MM-DD เวลาไทย) ; ฝั่งเซิร์ฟเวอร์/ตอน hydrate = null เพื่อไม่ให้หน้า prerender แช่วันเก่า */
export function useBangkokToday(): string | null {
  return useSyncExternalStore(
    noop,
    () => bangkokDate(new Date().toISOString()),
    () => null,
  );
}
