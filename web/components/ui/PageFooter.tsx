import { ExternalLink } from "lucide-react";
import { DISCLAIMER } from "@/lib/survey/schema";
import { EXTERNAL_LINKS } from "../nav-config";

/** ท้ายทุกหน้าวิเคราะห์: ข้อความประจำตาม DATA_CONTRACT §3 + ข้อมูลโครงการ */
export function PageFooter() {
  return (
    <footer aria-label="หมายเหตุข้อมูล" className="mt-8 border-t border-line pt-4 type-meta text-ink-3">
      <p>
        <span className="font-medium text-ink-2">หมายเหตุข้อมูล: </span>
        {DISCLAIMER}
      </p>
      <p className="mt-1">
        โครงการวิจัยแดชบอร์ดวิเคราะห์ข้อมูลนักท่องเที่ยว (กรณีศึกษาวัดคูหาภิมุข อ.เมืองยะลา) · คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏยะลา · 2569
        {" · "}
        <a
          href={EXTERNAL_LINKS.mainSite}
          target="_blank"
          rel="noopener noreferrer"
          className="no-print inline-flex items-center gap-1 text-navy hover:underline"
        >
          เว็บหลักโครงการ
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </p>
    </footer>
  );
}
