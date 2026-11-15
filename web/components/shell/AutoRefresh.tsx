"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 15_000;
const MIN_GAP_MS = 8_000;

/**
 * อัปเดตข้อมูลอัตโนมัติ (ไม่ต้องกดรีเฟรช): ถามเซิร์ฟเวอร์ทุก 15 วินาทีขณะเปิดแท็บอยู่ (และทันทีที่กลับมาเปิดแท็บ)
 * ว่า "เวอร์ชันข้อมูล" ต่างจากที่หน้าแสดงอยู่ไหม — ถ้าต่าง (มีผู้ตอบใหม่) ค่อยโหลดข้อมูลหน้าใหม่ด้วย router.refresh()
 * (ไม่รีโหลดหน้า ตัวกรอง/แชตไม่หาย ; ถ้าไม่มีข้อมูลใหม่ก็ไม่โหลดอะไรเพิ่ม)
 */
export function AutoRefresh({ version }: { version: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [visible, setVisible] = useState(true);
  const shown = useRef(version);
  const lastRefresh = useRef(0);

  useEffect(() => {
    shown.current = version;
  }, [version]);

  useEffect(() => {
    let stop = false;
    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/pulse", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        if (stop || !data.version || data.version === shown.current) return;
        if (Date.now() - lastRefresh.current < MIN_GAP_MS) return;
        lastRefresh.current = Date.now();
        startTransition(() => router.refresh());
      } catch {
        // ออฟไลน์/ขัดข้องชั่วคราว: ลองใหม่รอบถัดไป
      }
    };
    const onVisibility = () => {
      setVisible(document.visibilityState === "visible");
      void check();
    };
    const id = window.setInterval(() => void check(), POLL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onVisibility);
    return () => {
      stop = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onVisibility);
    };
  }, [router]);

  return (
    <span className="inline-flex items-center gap-1.5 type-meta text-ink-3" title="ข้อมูลอัปเดตอัตโนมัติเมื่อมีผู้ตอบใหม่ ไม่ต้องกดรีเฟรช">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${pending ? "animate-pulse bg-amber" : visible ? "bg-ok" : "bg-muted-bar"}`} />
      <span className="hidden sm:inline">อัปเดตอัตโนมัติ</span>
    </span>
  );
}
