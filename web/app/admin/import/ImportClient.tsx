"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  UploadCloud,
} from "lucide-react";

type PreviewError = { line: number; reason: string };
type SampleRow = { submitted_at: string } & Partial<Record<string, string>>;
type PreviewData = {
  total: number;
  valid: number;
  errors: PreviewError[];
  errorsTruncated: boolean;
  sample: SampleRow[];
};
type CommitData = {
  total: number;
  valid: number;
  inserted: number;
  duplicates: number;
  errors: PreviewError[];
  failedRows: number;
  note?: string | null;
  logWarning?: string | null;
  fileName: string;
};

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

function num(n: number): string {
  return n.toLocaleString("th-TH");
}

function fmtTime(iso: string): string {
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)}`;
}

export function ImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<CommitData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset(): void {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function pick(next: File | undefined): void {
    if (!next) return;
    if (preview || result) {
      // เปลี่ยนไฟล์ = เริ่มใหม่
      setResult(null);
      setPreview(null);
    }
    setError(null);
    setFile(next);
    void runPreview(next);
  }

  async function runPreview(f: File): Promise<void> {
    setPreviewing(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("mode", "preview");
      const res = await fetch("/api/admin/import", { method: "POST", body: fd });
      const body = (await res.json()) as PreviewData & { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? `เกิดข้อผิดพลาด (HTTP ${res.status})`);
        setFile(null);
        return;
      }
      setPreview({
        total: body.total,
        valid: body.valid,
        errors: body.errors,
        errorsTruncated: body.errorsTruncated,
        sample: body.sample,
      });
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ โปรดลองอีกครั้ง");
      setFile(null);
    } finally {
      setPreviewing(false);
    }
  }

  async function commit(): Promise<void> {
    if (!file) return;
    setCommitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", "commit");
      const res = await fetch("/api/admin/import", { method: "POST", body: fd });
      const body = (await res.json()) as CommitData & { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? `เกิดข้อผิดพลาด (HTTP ${res.status})`);
        return;
      }
      setResult(body);
      setPreview(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ โปรดลองอีกครั้ง");
    } finally {
      setCommitting(false);
    }
  }

  const invalid = preview ? preview.total - preview.valid : 0;

  return (
    <div className="space-y-5">
      {/* โซนลากวางไฟล์ */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed bg-surface-subtle px-6 py-10 text-center transition-colors ${
          dragOver ? "border-brand bg-brand-soft" : "border-border-strong"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-ink">
          ลากไฟล์ CSV มาวางที่นี่ หรือ
        </p>
        <label className="cursor-pointer rounded-2xl border border-brand/30 bg-surface px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand-soft">
          เลือกไฟล์ .csv
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>
        {previewing ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            กำลังตรวจไฟล์…
          </p>
        ) : file ? (
          <p className="flex items-center gap-2 text-xs text-ink-secondary">
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            {file.name}
          </p>
        ) : (
          <p className="text-xs text-ink-muted">
            ไฟล์จาก Google Sheets: ไฟล์ → ดาวน์โหลด → ค่าที่คั่นด้วยเครื่องหมายจุลภาค (.csv)
          </p>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* ผลตรวจก่อนนำเข้า */}
      {preview ? (
        <div className="rounded-3xl border border-border-line bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-border-line bg-surface-muted px-3 py-1 font-semibold text-ink">
              แถวทั้งหมด {num(preview.total)}
            </span>
            <span className="rounded-full border border-brand/25 bg-brand-soft px-3 py-1 font-semibold text-brand-ink">
              ใช้ได้ {num(preview.valid)}
            </span>
            <span
              className={`rounded-full border px-3 py-1 font-semibold ${
                invalid > 0
                  ? "border-danger/30 bg-danger-soft text-danger"
                  : "border-border-line bg-surface-muted text-ink-muted"
              }`}
            >
              ผิดพลาด {num(invalid)}
            </span>
          </div>

          {preview.errors.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-danger/25 bg-danger-soft/60 p-3">
              <p className="text-xs font-bold text-danger">แถวที่ไม่สามารถนำเข้าได้</p>
              <ul className="mt-2 space-y-1 text-xs text-danger">
                {preview.errors.slice(0, 20).map((e, i) => (
                  <li key={`${e.line}-${i}`} className="tabular-nums">
                    บรรทัด {num(e.line)}: {e.reason}
                  </li>
                ))}
              </ul>
              {preview.errors.length > 20 || preview.errorsTruncated ? (
                <p className="mt-2 text-xs text-danger">…และอีก {num(Math.max(preview.errors.length - 20, 0))} รายการ</p>
              ) : null}
            </div>
          ) : null}

          {preview.sample.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <p className="text-xs font-bold text-ink-secondary">ตัวอย่าง 10 แถวแรก</p>
              <table className="mt-2 w-full min-w-[720px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border-line text-ink-muted">
                    <th className="py-2 pr-3 font-semibold">เวลา (UTC)</th>
                    {SAMPLE_COLUMNS.map((c) => (
                      <th key={c.code} className="py-2 pr-3 font-semibold">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.map((row, i) => (
                    <tr key={i} className="border-b border-border-line/60 text-ink-secondary">
                      <td className="py-2 pr-3 tabular-nums whitespace-nowrap">{fmtTime(row.submitted_at)}</td>
                      {SAMPLE_COLUMNS.map((c) => (
                        <td key={c.code} className="max-w-[160px] truncate py-2 pr-3">
                          {row[c.code] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void commit()}
              disabled={committing || preview.valid === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {committing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              )}
              {committing ? "กำลังนำเข้า…" : `ยืนยันนำเข้า ${num(preview.valid)} แถว`}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-2xl border border-border-line bg-surface px-4 py-3 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-muted"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              ยกเลิก
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            ระบบข้ามแถวที่เคยนำเข้าแล้วโดยอัตโนมัติ (ตรวจซ้ำด้วย dedupe_key) จึงนำเข้าไฟล์เดิมซ้ำได้ปลอดภัย
          </p>
        </div>
      ) : null}

      {/* ผลลัพธ์หลังนำเข้า */}
      {result ? (
        <div className="rounded-3xl border border-border-line bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink">ผลการนำเข้า — {result.fileName}</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-brand/25 bg-brand-soft px-3 py-4">
              <p className="text-2xl font-bold tabular-nums text-brand-ink">{num(result.inserted)}</p>
              <p className="mt-1 text-xs font-semibold text-brand-ink">เพิ่มใหม่</p>
            </div>
            <div className="rounded-2xl border border-accent-border bg-accent-soft px-3 py-4">
              <p className="text-2xl font-bold tabular-nums text-accent-ink">{num(result.duplicates)}</p>
              <p className="mt-1 text-xs font-semibold text-accent-ink">ซ้ำ (ข้าม)</p>
            </div>
            <div
              className={`rounded-2xl border px-3 py-4 ${
                result.errors.length > 0 || result.failedRows > 0
                  ? "border-danger/30 bg-danger-soft"
                  : "border-border-line bg-surface-muted"
              }`}
            >
              <p className="text-2xl font-bold tabular-nums text-danger">
                {num(result.errors.length + result.failedRows)}
              </p>
              <p className="mt-1 text-xs font-semibold text-danger">ผิดพลาด</p>
            </div>
          </div>

          {result.note ? <p className="mt-3 text-xs text-accent-ink">{result.note}</p> : null}
          {result.logWarning ? (
            <p className="mt-2 text-xs text-danger">บันทึก import_logs ไม่สำเร็จ: {result.logWarning}</p>
          ) : null}

          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-muted"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            นำเข้าไฟล์ใหม่
          </button>
        </div>
      ) : null}
    </div>
  );
}
