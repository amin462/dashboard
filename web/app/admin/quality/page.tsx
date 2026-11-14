import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Upload } from "lucide-react";
import { freq, quality } from "@/lib/survey/aggregate";
import { normalize } from "@/lib/survey/normalize";
import { getRawRows } from "@/lib/survey/data";
import { getSupabaseAdmin } from "@/lib/import/supabaseAdmin";
import { formatThaiDateTimeShort, num } from "@/components/format";
import { AdminFrame } from "@/components/shell/AdminFrame";
import { Notice } from "@/components/ui/Notice";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";
import { StatStripSkeleton, ChartCardSkeleton } from "@/components/ui/Skeletons";
import { ImportLogs, MissingTable, OthersCard, type LogRow } from "./QualitySections";
import { googleFormStatus, sourceStats } from "./sync-status";

export const metadata = { title: "คุณภาพข้อมูล (ผู้ดูแล)" };

/** ข้อที่ผู้ตอบอาจพิมพ์คำตอบ "อื่น ๆ" เอง — ต้องคนตรวจ */
const OTHER_CODES = ["sur02", "sur03", "sur04", "sur05", "sur06", "sur08"] as const;

export default function AdminQualityPage() {
  return (
    <AdminFrame
      title="คุณภาพข้อมูล"
      description="สถานะชุดข้อมูลทั้งหมด (ผ่าน/ไม่ผ่านคัดกรอง ข้อมูลขาด คำตอบที่ต้องตรวจ) แหล่งที่มา และประวัติการนำเข้าล่าสุด"
      maxWidth="max-w-[1100px]"
      actions={
        <Link href="/admin/import" prefetch={false} className="btn btn-secondary h-8 px-2.5 text-[13px]">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">นำเข้าข้อมูล</span>
        </Link>
      }
    >
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true">
            <StatStripSkeleton count={6} />
            <ChartCardSkeleton />
          </div>
        }
      >
        <QualityBody />
      </Suspense>
    </AdminFrame>
  );
}

async function QualityBody() {
  await connection(); // อ่าน env และฐานข้อมูลตอนร้องขอจริง (ไม่ bake ตอน build)

  const raw = await getRawRows();
  const { rows, all } = normalize(raw.rows);
  const q = quality(all);

  // คำตอบ "อื่น ๆ" ที่ต้องตรวจ
  const others = OTHER_CODES.map((code) => {
    const f = freq(rows, code);
    const counts = new Map<string, number>();
    for (const v of f.others) counts.set(v, (counts.get(v) ?? 0) + 1);
    return { code, title: f.title, total: f.others.length, list: Array.from(counts, ([value, count]) => ({ value, count })) };
  });
  const sur11 = rows.map((r) => r.sur11).filter((v): v is string => !!v);

  // ประวัติการนำเข้า (import_logs) — อ่านด้วย service role เฉพาะเมื่อมี env
  const admin = getSupabaseAdmin();
  let logs: LogRow[] | null = null;
  let logsError: string | null = null;
  if (admin) {
    const { data, error } = await admin
      .from("import_logs")
      .select("created_at,source,file_name,total_rows,inserted,duplicates,errors,note")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) logsError = error.message;
    else logs = (data ?? []) as LogRow[];
  }

  // สถานะซิงก์ Google Form นับเฉพาะแถว source='google_form' ; แยกจำนวนตามแหล่งข้อมูล
  // eslint-disable-next-line react-hooks/purity -- server component: ตั้งใจอ่านเวลาจริง ณ ตอนตอบคำขอ เพื่อวัดอายุของข้อมูลล่าสุด
  const sync = googleFormStatus(all, Date.now());
  const sources: Stat[] = sourceStats(all).map((s) => ({
    label: s.source,
    value: num(s.count),
    context: s.latest ? `ล่าสุด ${formatThaiDateTimeShort(s.latest)}` : "ไม่มีแถวจากแหล่งนี้",
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {raw.source === "supabase" ? (
          <Notice tone="info">ข้อมูลจริงจาก Supabase</Notice>
        ) : (
          <Notice tone="warn">ข้อมูลตัวอย่าง — ยังไม่เชื่อมต่อฐานข้อมูล ตัวเลขด้านล่างไม่ใช่ผลสำรวจจริง</Notice>
        )}
        {raw.error && <Notice tone="danger">อ่านฐานข้อมูลไม่สำเร็จ: {raw.error}</Notice>}
        <Notice tone={sync.tone}>
          {sync.text}
          {sync.detail && <span className="ml-2 type-meta">(Google Form ล่าสุด {formatThaiDateTimeShort(sync.detail)})</span>}
        </Notice>
      </div>

      <StatStrip
        label="สรุปคุณภาพข้อมูล"
        items={[
          { label: "แบบฟอร์มทั้งหมด", value: num(q.total) },
          { label: "สมบูรณ์ ใช้วิเคราะห์", value: num(q.complete) },
          { label: "ไม่ผ่านคัดกรอง (ข้อ 1–2)", value: num(q.failedScreening) },
          { label: "ไม่ยินยอม", value: num(q.noConsent) },
          { label: "ไม่ครบข้อบังคับ", value: num(q.missingRequired) },
          { label: "sur08 ขัดแย้ง", value: num(q.sur08Conflicts) },
        ]}
      />

      <section aria-label="จำนวนแถวตามแหล่งที่มา" className="space-y-2">
        <h2 className="type-section">แหล่งที่มาของข้อมูล (source)</h2>
        <StatStrip label="จำนวนแถวตามแหล่งที่มา" items={sources} />
      </section>

      <MissingTable items={q.missingByQuestion} />
      <OthersCard others={others} sur11={sur11} />
      <ImportLogs logs={logs} error={logsError} connected={Boolean(admin)} />
    </div>
  );
}
