"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function DashError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-[var(--shadow-card)]"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-bold text-ink">
        เกิดข้อผิดพลาดระหว่างโหลดข้อมูลแดชบอร์ด
      </h1>
      <p className="mt-1.5 max-w-md text-sm text-ink-muted">
        ระบบไม่สามารถแสดงข้อมูลหน้านี้ได้ชั่วคราว กรุณาลองโหลดใหม่อีกครั้ง
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span>ลองโหลดใหม่</span>
      </button>
    </div>
  );
}
