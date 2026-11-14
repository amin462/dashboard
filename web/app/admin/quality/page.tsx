import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Database,
  FlaskConical,
  ScanSearch,
} from "lucide-react";
import { freq, quality } from "@/lib/survey/aggregate";
import { normalize } from "@/lib/survey/normalize";
import { getRawRows } from "@/lib/survey/data";
import { getSupabaseAdmin } from "@/lib/import/supabaseAdmin";

export const metadata = { title: "คุณภาพข้อมูล (ผู้ดูแล)" };

/** ข้อที่ผู้ตอบอาจพิมพ์คำตอบ "อื่น ๆ" เอง — ต้องคนตรวจ */
const OTHER_CODES = ["sur02", "sur03", "sur04", "sur05", "sur06", "sur08"] as const;

type LogRow = {
  created_at: string;
  source: string;
  file_name: string | null;
  total_rows: number;
  inserted: number;
  duplicates: number;
  errors: number;
  note: string | null;
};

const thDate = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});
const thNum = new Intl.NumberFormat("th-TH");

export default function AdminQualityPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand">
            <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
            สำหรับผู้ดูแลระบบ
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">คุณภาพข้อมูลและประวัติการนำเข้า</h1>
          <p className="mt-1 text-sm text-ink-muted">
            สรุปสถานะชุดข้อมูลทั้งหมด (ผ่าน/ไม่ผ่านคัดกรอง ข้อมูลขาด และคำตอบที่ต้องตรวจ) พร้อมบันทึกการนำเข้า 20 รายการล่าสุด
          </p>
        </div>
        <Link
          href="/admin/import"
          className="inline-flex items-center gap-2 rounded-2xl border border-border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-muted"
        >
          <Database className="h-4 w-4" aria-hidden="true" />
          ไปหน้านำเข้าข้อมูล
        </Link>
      </div>

      <Suspense fallback={<QualitySkeleton />}>
        <QualityBody />
      </Suspense>
    </main>
  );
}

function QualitySkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-surface-muted" />
    </div>
  );
}

async function QualityBody() {
  await connection(); // อ่าน env และฐานข้อมูลตอนร้องขอจริง (ไม่ bake ตอน build)

  const raw = await getRawRows();
  const { rows, all } = normalize(raw.rows);
  const q = quality(all);

  // คำตอบ "อื่น ๆ" ที่ต้องตรวจ: ค่าที่ไม่ตรงตัวเลือกมาตรฐานของแต่ละข้อ
  const othersByCode = OTHER_CODES.map((code) => {
    const f = freq(rows, code);
    const counts = new Map<string, number>();
    for (const v of f.others) counts.set(v, (counts.get(v) ?? 0) + 1);
    return { code, title: f.title, total: f.others.length, list: Array.from(counts, ([value, count]) => ({ value, count })) };
  });
  const sur11Texts = rows.map((r) => r.sur11).filter((v): v is string => !!v);

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

  // สถานะการซิงก์จาก Google Form: ข้อมูลใหม่ภายใน 24 ชม. = น่าจะทำงานอยู่
  const lastMs = q.lastSubmittedAt ? Date.parse(q.lastSubmittedAt) : null;
  // eslint-disable-next-line react-hooks/purity -- server component: ตั้งใจอ่านเวลาจริง ณ ตอนตอบคำขอ เพื่อวัดอายุของข้อมูลล่าสุด
  const ageH = lastMs ? (Date.now() - lastMs) / 3600000 : null;
  const syncOk = ageH !== null && ageH < 24;

  return (
    <div className="mt-6 space-y-5">
      {/* แถบสถานะแหล่งข้อมูล + การซิงก์ */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {raw.source === "supabase" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-ink">
            <Database className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ข้อมูลจริง (Supabase)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink">
            <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ข้อมูลตัวอย่าง (ยังไม่เชื่อมต่อฐานข้อมูล)
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            syncOk ? "border-brand/25 bg-brand-soft text-brand-ink" : "border-accent-border bg-accent-soft text-accent-ink"
          }`}
        >
          <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {lastMs
            ? `ข้อมูลล่าสุด ${thDate.format(lastMs)} (${ageH !== null && ageH < 1 ? "ภายใน 1 ชม." : `${Math.round(ageH ?? 0)} ชม. ที่แล้ว`}) — ซิงก์ Google Form ${syncOk ? "ทำงานปกติ" : "อาจหยุดทำงาน ควรตรวจ Apps Script trigger"}`
            : "ยังไม่มีข้อมูล submitted_at"}
        </span>
        {raw.error ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            อ่านฐานข้อมูลไม่สำเร็จ: {raw.error}
          </span>
        ) : null}
      </div>

      {/* สรุปตัวเลขหลัก */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="แบบฟอร์มทั้งหมด" value={q.total} tone="neutral" />
        <Kpi label="สมบูรณ์ ใช้วิเคราะห์" value={q.complete} tone="good" />
        <Kpi label="ไม่ผ่านคัดกรอง (ข้อ 1–2)" value={q.failedScreening} tone="warn" />
        <Kpi label="ไม่ยินยอม" value={q.noConsent} tone="warn" />
        <Kpi label="ไม่ครบข้อบังคับ" value={q.missingRequired} tone="warn" />
        <Kpi label="sur08 ขัดแย้ง" value={q.sur08Conflicts} tone="bad" />
      </section>

      {/* ข้อมูลขาดรายข้อ */}
      <Card title="ข้อมูลขาดรายข้อ (sur05–sur11)" icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}>
        <p className="text-xs text-ink-muted">
          นับเฉพาะแถวสมบูรณ์ที่ผ่านคัดกรองและยินยอม — ข้อ sur01–sur04 เป็นข้อบังคับ ตรวจอยู่ในการ์ด &ldquo;ไม่ครบข้อบังคับ&rdquo; แล้ว
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-line text-xs text-ink-muted">
                <th className="py-2 pr-3 font-semibold">ข้อ</th>
                <th className="py-2 pr-3 font-semibold">คำถาม</th>
                <th className="py-2 pr-3 text-center font-semibold">ข้อบังคับ</th>
                <th className="py-2 pr-3 text-right font-semibold">ขาด</th>
                <th className="py-2 text-right font-semibold">ร้อยละ</th>
              </tr>
            </thead>
            <tbody>
              {q.missingByQuestion
                .filter((m) => m.code >= "sur05" && m.code <= "sur11")
                .map((m) => (
                  <tr key={m.code} className="border-b border-border-line/60 text-ink-secondary">
                    <td className="py-2 pr-3 font-mono text-xs tabular-nums text-ink-muted">{m.code}</td>
                    <td className="py-2 pr-3">{m.title}</td>
                    <td className="py-2 pr-3 text-center">{m.required ? "บังคับ" : "ไม่บังคับ"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{thNum.format(m.missing)}</td>
                    <td className="py-2 text-right tabular-nums">{m.pct}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* คำตอบ "อื่น ๆ" ที่ต้องตรวจ */}
      <Card title="คำตอบ “อื่น ๆ” ที่ต้องตรวจ" icon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
        <p className="text-xs text-ink-muted">
          ค่าที่ผู้ตอบพิมพ์เองแล้วไม่ตรงกับตัวเลือกมาตรฐาน (รวมข้อ 11 ที่เป็นข้อความเปิด) — ใช้ตรวจว่าควรเพิ่มตัวเลือกใหม่หรือไม่
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {othersByCode.map((o) => (
            <div key={o.code} className="rounded-2xl border border-border-line bg-surface-subtle p-3">
              <p className="text-xs font-bold text-ink">
                <span className="font-mono text-ink-muted">{o.code}</span> {o.title}
                {o.total > 0 ? (
                  <span className="ms-2 rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-ink">
                    {thNum.format(o.total)} คำตอบ
                  </span>
                ) : null}
              </p>
              {o.list.length === 0 ? (
                <p className="mt-2 text-xs text-ink-muted">ไม่มี — ผู้ตอบเลือกจากตัวเลือกทั้งหมด</p>
              ) : (
                <ul className="mt-2 space-y-1 text-xs text-ink-secondary">
                  {o.list.slice(0, 8).map((v) => (
                    <li key={v.value} className="flex items-baseline justify-between gap-2">
                      <span className="truncate">{v.value}</span>
                      <span className="tabular-nums text-ink-muted">{thNum.format(v.count)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {o.list.length > 8 ? (
                <p className="mt-1.5 text-[10px] text-ink-muted">…และอีก {thNum.format(o.list.length - 8)} ค่า</p>
              ) : null}
            </div>
          ))}
          <div className="rounded-2xl border border-border-line bg-surface-subtle p-3 sm:col-span-2">
            <p className="text-xs font-bold text-ink">
              <span className="font-mono text-ink-muted">sur11</span> ข้อเสนอแนะ (ข้อความเปิด)
              {sur11Texts.length > 0 ? (
                <span className="ms-2 rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-ink">
                  {thNum.format(sur11Texts.length)} คำตอบ
                </span>
              ) : null}
            </p>
            {sur11Texts.length === 0 ? (
              <p className="mt-2 text-xs text-ink-muted">ยังไม่มีข้อเสนอแนะ</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 ps-5 text-xs text-ink-secondary">
                {sur11Texts.slice(0, 6).map((t, i) => (
                  <li key={i} className="line-clamp-2">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {sur11Texts.length > 6 ? (
              <p className="mt-1.5 text-[10px] text-ink-muted">…และอีก {thNum.format(sur11Texts.length - 6)} คำตอบ</p>
            ) : null}
          </div>
        </div>
      </Card>

      {/* ประวัติการนำเข้า */}
      <Card title="ประวัติการนำเข้า (import_logs 20 รายการล่าสุด)" icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}>
        {!admin ? (
          <p className="rounded-2xl border border-accent-border bg-accent-soft px-4 py-3 text-sm text-accent-ink">
            โหมดเดโม่: ยังไม่ได้เชื่อมต่อ Supabase จึงไม่มีประวัติการนำเข้าให้แสดง
          </p>
        ) : logsError ? (
          <p className="rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            อ่าน import_logs ไม่สำเร็จ: {logsError}
          </p>
        ) : logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-line text-xs text-ink-muted">
                  <th className="py-2 pr-3 font-semibold">เวลา</th>
                  <th className="py-2 pr-3 font-semibold">ที่มา</th>
                  <th className="py-2 pr-3 font-semibold">ไฟล์</th>
                  <th className="py-2 pr-3 text-right font-semibold">ทั้งหมด</th>
                  <th className="py-2 pr-3 text-right font-semibold">เพิ่มใหม่</th>
                  <th className="py-2 pr-3 text-right font-semibold">ซ้ำ</th>
                  <th className="py-2 pr-3 text-right font-semibold">ผิดพลาด</th>
                  <th className="py-2 font-semibold">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-b border-border-line/60 text-ink-secondary">
                    <td className="py-2 pr-3 tabular-nums whitespace-nowrap">{thDate.format(Date.parse(l.created_at))}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{l.source}</td>
                    <td className="max-w-[200px] truncate py-2 pr-3">{l.file_name || "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{thNum.format(l.total_rows)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums font-semibold text-brand-ink">{thNum.format(l.inserted)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{thNum.format(l.duplicates)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{thNum.format(l.errors)}</td>
                    <td className="max-w-[220px] truncate py-2 text-xs">{l.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">ยังไม่มีประวัติการนำเข้า — บันทึกจะปรากฏเมื่อมีการยืนยันนำเข้า CSV</p>
        )}
      </Card>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: "good" | "warn" | "bad" | "neutral" }) {
  const toneClass =
    tone === "good"
      ? "border-brand/25 bg-brand-soft text-brand-ink"
      : tone === "warn"
        ? "border-accent-border bg-accent-soft text-accent-ink"
        : tone === "bad"
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-border-line bg-surface text-ink";
  return (
    <div className={`rounded-2xl border px-3 py-4 text-center ${toneClass}`}>
      <p className="text-2xl font-bold tabular-nums">{thNum.format(value)}</p>
      <p className="mt-1 text-xs font-semibold leading-snug">{label}</p>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border-line bg-surface p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">{icon}</span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
