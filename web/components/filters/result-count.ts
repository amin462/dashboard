"use client";

import { useSyncExternalStore } from "react";

/**
 * จำนวนผู้ตอบหลังกรอง (เขียนโดย DashPage, อ่านโดยแถบตัวกรองที่อยู่ใน layout)
 * ใช้ external store เล็ก ๆ เพราะตัวกรองอยู่นอกต้นไม้ของหน้า และไม่ต้องการส่งแถวข้อมูลซ้ำ
 */
export type ResultCount = { filtered: number; total: number } | null;

let current: ResultCount = null;
const listeners = new Set<() => void>();

export function setResultCount(next: ResultCount): void {
  if (current?.filtered === next?.filtered && current?.total === next?.total) return;
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useResultCount(): ResultCount {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
