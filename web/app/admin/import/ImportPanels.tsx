"use client";

import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { num } from "@/components/format";
import { Card } from "@/components/ui/Card";
import { StatStrip } from "@/components/ui/StatStrip";
import type { CommitData, PreviewData } from "./useImportFlow";

const SAMPLE_COLUMNS: { code: string; label: string }[] = [
  { code: "sur01", label: "อายุ" },
  { code: "sur02", label: "พื้นที่พำนัก" },
  { code: "sur03", label: "มากับใคร" },
  { code: "sur04", label: "พาหนะ" },
  { code: "sur07", label: "ค่าใช้จ่าย" },
  { code: "sur08", label: "สนใจ (ข้อ 8)" },
  { code: "sur09", label: "พึงพอใจ" },
  { code: "sur11", label: "ข้อเสนอแนะ" },
];

const fmtTime = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 19)}`;

type PreviewPanelProps = {
  preview: PreviewData;
  committing: boolean;
  onCommit: () => void;
  onCancel: () => void;
};

/** ผลตรวจไฟล์ก่อนนำเข้า + ตัวอย่าง 10 แถว + ปุ่มยืนยัน */
export function PreviewPanel({ preview, committing, onCommit, onCancel }: PreviewPanelProps) {
  const invalid = preview.total - preview.valid;
  return (
    <Card title="ผลตรวจไฟล์ก่อนนำเข้า">
      <StatStrip
        label="ผลตรวจไฟล์"
        items={[
          { label: "แถวทั้งหมด", value: num(preview.total) },
          { label: "ใช้ได้", value: num(preview.valid) },
          { label: "ผิดพลาด", value: num(invalid) },
        ]}
      />

      {preview.errors.length > 0 && (
        <div className="mt-4 rounded-lg bg-danger-soft p-3 text-danger">
          <p className="font-medium">แถวที่นำเข้าไม่ได้</p>
          <ul className="mt-1 space-y-0.5 type-meta">
            {preview.errors.slice(0, 20).map((e, i) => (
              <li key={`${e.line}-${i}`}>
                บรรทัด {num(e.line)}: {e.reason}
              </li>
            ))}
          </ul>
          {(preview.errors.length > 20 || preview.errorsTruncated) && (
            <p className="mt-1 type-meta">…และอีก {num(Math.max(preview.errors.length - 20, 0))} รายการ</p>
          )}
        </div>
      )}

      {preview.sample.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <p className="type-meta text-ink-3">ตัวอย่าง 10 แถวแรก</p>
          <table className="mt-1 w-full min-w-[720px] border-collapse text-left type-meta">
            <thead>
              <tr className="border-b border-line text-ink-3">
                <th className="py-1.5 pr-3 font-medium">เวลา (UTC)</th>
                {SAMPLE_COLUMNS.map((c) => (
                  <th key={c.code} className="py-1.5 pr-3 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.sample.map((row, i) => (
                <tr key={i} className="border-b border-line text-ink-2">
                  <td className="py-1.5 pr-3 whitespace-nowrap">{fmtTime(row.submitted_at)}</td>
                  {SAMPLE_COLUMNS.map((c) => (
                    <td key={c.code} className="max-w-[160px] truncate py-1.5 pr-3">
                      {row[c.code] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onCommit} disabled={committing || preview.valid === 0} className="btn btn-primary">
          {committing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          {committing ? "กำลังนำเข้า…" : `ยืนยันนำเข้า ${num(preview.valid)} แถว`}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ยกเลิก
        </button>
      </div>
      <p className="mt-2 type-meta text-ink-3">ระบบข้ามแถวที่เคยนำเข้าแล้ว (ตรวจซ้ำด้วย dedupe_key) จึงนำเข้าไฟล์เดิมซ้ำได้ปลอดภัย</p>
    </Card>
  );
}

/** ผลหลังนำเข้า: เพิ่มใหม่ / ซ้ำ / ผิดพลาด */
export function ResultPanel({ result, onReset }: { result: CommitData; onReset: () => void }) {
  return (
    <Card title={`ผลการนำเข้า — ${result.fileName}`}>
      <StatStrip
        label="ผลการนำเข้า"
        items={[
          { label: "เพิ่มใหม่", value: num(result.inserted) },
          { label: "ซ้ำ (ข้าม)", value: num(result.duplicates) },
          { label: "ผิดพลาด", value: num(result.errors.length + result.failedRows) },
        ]}
      />
      {result.note && <p className="mt-3 type-meta text-warn">{result.note}</p>}
      {result.logWarning && <p className="mt-2 type-meta text-danger">บันทึก import_logs ไม่สำเร็จ: {result.logWarning}</p>}
      <button type="button" onClick={onReset} className="btn btn-secondary mt-4">
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        นำเข้าไฟล์ใหม่
      </button>
    </Card>
  );
}
