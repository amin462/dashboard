"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function DashError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center card px-6 py-12 text-center">
      <AlertCircle className="h-10 w-10 text-danger" strokeWidth={1.25} aria-hidden="true" />
      <h2 className="mt-3 type-section">โหลดข้อมูลหน้านี้ไม่สำเร็จ</h2>
      <p className="mt-1 max-w-md text-ink-2">ระบบแสดงข้อมูลไม่ได้ชั่วคราว ลองโหลดใหม่อีกครั้ง</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-4">
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        ลองใหม่
      </button>
    </div>
  );
}
