"use client";

import { usePathname, useRouter } from "next/navigation";
import { FilterX, SearchX } from "lucide-react";

type EmptyStateProps = {
  reason?: string;
  /** ซ่อนปุ่มล้างตัวกรอง (เช่น กรณีไม่มีข้อมูลเลย) */
  showReset?: boolean;
};

export function EmptyState({
  reason = "ไม่พบผู้ตอบที่ตรงกับตัวกรองที่เลือก ลองขยายช่วงวันที่หรือล้างตัวกรอง",
  showReset = true,
}: EmptyStateProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div role="status" className="flex flex-col items-center rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <SearchX className="h-10 w-10 text-ink-3" strokeWidth={1.25} aria-hidden="true" />
      <p className="mt-3 max-w-md text-ink-2">{reason}</p>
      {showReset && (
        <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="btn btn-primary mt-4">
          <FilterX className="h-4 w-4" aria-hidden="true" />
          ล้างตัวกรอง
        </button>
      )}
    </div>
  );
}
