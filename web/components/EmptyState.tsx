"use client";

import { usePathname, useRouter } from "next/navigation";
import { FilterX, SearchX } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  reason?: string;
  onReset?: () => void;
  showReset?: boolean;
};

export function EmptyState({
  title = "ไม่พบข้อมูลผู้ตอบตามตัวกรองที่เลือก",
  reason = "ตัวกรองที่เลือกอาจแคบเกินไป ลองขยายช่วงวันที่ หรือล้างตัวกรองบางรายการเพื่อดูภาพรวมทั้งหมด",
  onReset,
  showReset = true,
}: EmptyStateProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }
    router.replace(pathname, { scroll: false });
  };

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center shadow-[var(--shadow-card)]"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-ink-muted">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">
        {reason}
      </p>
      {showReset && (
        <button
          type="button"
          onClick={handleReset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover dark:bg-[#0d736b] dark:hover:bg-[#0f857b]"
        >
          <FilterX className="h-4 w-4" aria-hidden="true" />
          <span>ล้างตัวกรองทั้งหมด</span>
        </button>
      )}
    </div>
  );
}
