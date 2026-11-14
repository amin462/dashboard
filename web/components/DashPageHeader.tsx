import type { ReactNode } from "react";
import { SmallSampleBadge } from "./SmallSampleBadge";

type DashPageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  filteredCount: number;
  totalCount: number;
  isFiltered: boolean;
  actions?: ReactNode;
};

export function DashPageHeader({
  eyebrow = "รายงานวิเคราะห์ข้อมูลผู้ตอบแบบสำรวจ",
  title,
  subtitle,
  filteredCount,
  totalCount,
  isFiltered,
  actions,
}: DashPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wide text-brand uppercase">
          {eyebrow}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
            {title}
          </h1>
          {filteredCount > 0 && <SmallSampleBadge n={filteredCount} />}
        </div>
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        <p className="mt-1.5 tabular-nums text-xs font-medium text-ink-secondary">
          {isFiltered ? (
            <>
              กำลังแสดงผลตามตัวกรอง{" "}
              <strong className="font-bold text-brand">
                {filteredCount.toLocaleString("th-TH")}
              </strong>{" "}
              จากผู้ตอบสมบูรณ์ทั้งหมด {totalCount.toLocaleString("th-TH")} คน
            </>
          ) : (
            <>
              ฐานข้อมูลผู้ตอบสมบูรณ์ทั้งหมด{" "}
              <strong className="font-bold text-ink">
                {totalCount.toLocaleString("th-TH")}
              </strong>{" "}
              คน
            </>
          )}
        </p>
      </div>

      {actions && (
        <div className="no-print flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
