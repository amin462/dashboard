import type { Quality } from "@/lib/survey/aggregate";
import { formatThaiDateTime, num } from "@/components/format";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";

const th = "py-1.5 pr-3 font-medium";
const td = "py-1.5 pr-3";

export type LogRow = {
  created_at: string;
  source: string;
  file_name: string | null;
  total_rows: number;
  inserted: number;
  duplicates: number;
  errors: number;
  note: string | null;
};

export type OtherAnswers = { code: string; title: string; total: number; list: { value: string; count: number }[] };

/** ข้อมูลขาดรายข้อ sur05–sur11 (นับเฉพาะแถวสมบูรณ์) */
export function MissingTable({ items }: { items: Quality["missingByQuestion"] }) {
  return (
    <Card title="ข้อมูลขาดรายข้อ (sur05–sur11)">
      <p className="type-meta text-ink-3">นับเฉพาะแถวสมบูรณ์ ข้อ sur01–sur04 เป็นข้อบังคับ ตรวจอยู่ในช่อง “ไม่ครบข้อบังคับ” แล้ว</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line type-meta text-ink-3">
              <th className={th}>ข้อ</th>
              <th className={th}>คำถาม</th>
              <th className={`${th} text-center`}>ข้อบังคับ</th>
              <th className={`${th} text-right`}>ขาด</th>
              <th className="py-1.5 text-right font-medium">ร้อยละ</th>
            </tr>
          </thead>
          <tbody>
            {items
              .filter((m) => m.code >= "sur05" && m.code <= "sur11")
              .map((m) => (
                <tr key={m.code} className="border-b border-line text-ink-2">
                  <td className={`${td} font-mono type-meta`}>{m.code}</td>
                  <td className={td}>{m.title}</td>
                  <td className={`${td} text-center`}>{m.required ? "บังคับ" : "ไม่บังคับ"}</td>
                  <td className={`${td} text-right`}>{num(m.missing)}</td>
                  <td className="py-1.5 text-right">{m.pct}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** คำตอบ “อื่น ๆ” ที่ผู้ตอบพิมพ์เอง + ข้อความข้อ 11 */
export function OthersCard({ others, sur11 }: { others: OtherAnswers[]; sur11: string[] }) {
  return (
    <Card title="คำตอบ “อื่น ๆ” ที่ต้องตรวจ">
      <p className="type-meta text-ink-3">ค่าที่ผู้ตอบพิมพ์เองและไม่ตรงตัวเลือกมาตรฐาน ใช้ตัดสินว่าควรเพิ่มตัวเลือกใหม่หรือไม่</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {others.map((o) => (
          <div key={o.code} className="rounded-lg border border-line bg-surface-2 p-3">
            <p className="font-medium">
              <span className="font-mono type-meta text-ink-3">{o.code}</span> {o.title}
              {o.total > 0 && <span className="ml-2 type-meta text-warn">{num(o.total)} คำตอบ</span>}
            </p>
            {o.list.length === 0 ? (
              <p className="mt-1 type-meta text-ink-3">ไม่มี — ผู้ตอบเลือกจากตัวเลือกทั้งหมด</p>
            ) : (
              <ul className="mt-1 space-y-0.5 type-meta text-ink-2">
                {o.list.slice(0, 8).map((v) => (
                  <li key={v.value} className="flex justify-between gap-2">
                    <span className="truncate">{v.value}</span>
                    <span className="text-ink-3">{num(v.count)}</span>
                  </li>
                ))}
                {o.list.length > 8 && <li className="text-ink-3">…และอีก {num(o.list.length - 8)} ค่า</li>}
              </ul>
            )}
          </div>
        ))}
        <div className="rounded-lg border border-line bg-surface-2 p-3 sm:col-span-2">
          <p className="font-medium">
            <span className="font-mono type-meta text-ink-3">sur11</span> ข้อเสนอแนะ (ข้อความเปิด)
            {sur11.length > 0 && <span className="ml-2 type-meta text-warn">{num(sur11.length)} คำตอบ</span>}
          </p>
          {sur11.length === 0 ? (
            <p className="mt-1 type-meta text-ink-3">ยังไม่มีข้อเสนอแนะ</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-5 type-meta text-ink-2">
              {sur11.slice(0, 6).map((t, i) => (
                <li key={i} className="line-clamp-2">
                  {t}
                </li>
              ))}
              {sur11.length > 6 && <li className="list-none text-ink-3">…และอีก {num(sur11.length - 6)} คำตอบ</li>}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

/** ประวัติการนำเข้า (import_logs 20 รายการล่าสุด) */
export function ImportLogs({ logs, error, connected }: { logs: LogRow[] | null; error: string | null; connected: boolean }) {
  return (
    <Card title="ประวัติการนำเข้า (20 รายการล่าสุด)">
      {!connected ? (
        <Notice tone="warn">โหมดเดโม่: ยังไม่ได้เชื่อมต่อ Supabase จึงไม่มีประวัติการนำเข้าให้แสดง</Notice>
      ) : error ? (
        <Notice tone="danger">อ่าน import_logs ไม่สำเร็จ: {error}</Notice>
      ) : logs && logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line type-meta text-ink-3">
                <th className={th}>เวลา</th>
                <th className={th}>ที่มา</th>
                <th className={th}>ไฟล์</th>
                <th className={`${th} text-right`}>ทั้งหมด</th>
                <th className={`${th} text-right`}>เพิ่มใหม่</th>
                <th className={`${th} text-right`}>ซ้ำ</th>
                <th className={`${th} text-right`}>ผิดพลาด</th>
                <th className="py-1.5 font-medium">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} className="border-b border-line text-ink-2">
                  <td className={`${td} whitespace-nowrap`}>{formatThaiDateTime(l.created_at)}</td>
                  <td className={`${td} font-mono type-meta`}>{l.source}</td>
                  <td className={`${td} max-w-[200px] truncate`}>{l.file_name || "—"}</td>
                  <td className={`${td} text-right`}>{num(l.total_rows)}</td>
                  <td className={`${td} text-right font-medium text-ink`}>{num(l.inserted)}</td>
                  <td className={`${td} text-right`}>{num(l.duplicates)}</td>
                  <td className={`${td} text-right`}>{num(l.errors)}</td>
                  <td className="max-w-[220px] truncate py-1.5 type-meta">{l.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-ink-3">ยังไม่มีประวัติการนำเข้า บันทึกจะปรากฏเมื่อมีการยืนยันนำเข้า CSV</p>
      )}
    </Card>
  );
}
