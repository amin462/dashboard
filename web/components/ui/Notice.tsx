import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export type NoticeTone = "warn" | "danger" | "info" | "ok";

const STYLE: Record<NoticeTone, { box: string; Icon: typeof Info }> = {
  warn: { box: "bg-warn-soft text-warn", Icon: AlertTriangle },
  danger: { box: "bg-danger-soft text-danger", Icon: XCircle },
  info: { box: "bg-amber-soft text-amber-ink", Icon: Info },
  ok: { box: "bg-ok-soft text-ok", Icon: CheckCircle2 },
};

/** ข้อความสถานะสั้น ๆ (ไอคอน + ประโยคเดียว) ใช้ในหน้าผู้ดูแล */
export function Notice({ tone, children }: { tone: NoticeTone; children: ReactNode }) {
  const { box, Icon } = STYLE[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-2 rounded-lg px-3 py-2 ${box}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
