import { ExternalLink, Info } from "lucide-react";
import { DISCLAIMER } from "@/lib/survey/schema";
import { EXTERNAL_LINKS } from "./nav-config";

export function Disclaimer() {
  return (
    <footer
      aria-label="ขอบเขตและข้อจำกัดข้อมูลและข้อมูลโครงการวิจัย"
      className="mt-8 rounded-2xl border border-line bg-surface-subtle px-4 py-3.5 text-sm text-ink-secondary print-card"
    >
      <div className="flex items-start gap-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        <p className="leading-relaxed">
          <span className="font-semibold text-ink">หมายเหตุข้อมูล: </span>
          {DISCLAIMER}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-line/80 pt-3 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-relaxed">
          <span className="font-semibold text-ink-secondary">
            โครงการวิจัย:
          </span>{" "}
          ระบบแดชบอร์ดวิเคราะห์ข้อมูลนักท่องเที่ยวเพื่อสนับสนุนการตัดสินใจของผู้ประกอบการท่องเที่ยว
          (กรณีศึกษาวัดคูหาภิมุข อำเภอเมืองยะลา) · คณะวิทยาการจัดการ
          มหาวิทยาลัยราชภัฏยะลา · ปีที่จัดทำ 2569
        </p>
        <a
          href={EXTERNAL_LINKS.mainSite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-brand transition-colors hover:underline print:text-gray-800"
        >
          <span>เว็บหลักโครงการ</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
