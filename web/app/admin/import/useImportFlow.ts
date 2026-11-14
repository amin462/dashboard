"use client";

import { useState } from "react";

export type PreviewError = { line: number; reason: string };
export type SampleRow = { submitted_at: string } & Partial<Record<string, string>>;
export type PreviewData = {
  total: number;
  valid: number;
  errors: PreviewError[];
  errorsTruncated: boolean;
  sample: SampleRow[];
};
export type CommitData = {
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

type ApiBody<T> = T & { ok: boolean; error?: string };

async function post<T>(file: File, mode: "preview" | "commit"): Promise<{ body: ApiBody<T> | null; error: string | null }> {
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);
    const res = await fetch("/api/admin/import", { method: "POST", body: fd });
    const body = (await res.json()) as ApiBody<T>;
    if (!res.ok || !body.ok) return { body: null, error: body.error ?? `เกิดข้อผิดพลาด (HTTP ${res.status})` };
    return { body, error: null };
  } catch {
    return { body: null, error: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ โปรดลองอีกครั้ง" };
  }
}

/** สถานะและการเรียก API ของหน้านำเข้า: เลือกไฟล์ → preview → commit (ตรรกะเดิม ไม่เปลี่ยน endpoint) */
export function useImportFlow() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<CommitData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);
  // เปลี่ยน key เพื่อ remount <input type=file> ให้ล้างไฟล์ที่เลือกค้างไว้
  const [inputKey, setInputKey] = useState(0);
  const clearInput = () => setInputKey((k) => k + 1);

  function reset(): void {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    clearInput();
  }

  async function runPreview(f: File): Promise<void> {
    setPreviewing(true);
    setError(null);
    const { body, error: err } = await post<PreviewData>(f, "preview");
    if (body) {
      setPreview({ total: body.total, valid: body.valid, errors: body.errors, errorsTruncated: body.errorsTruncated, sample: body.sample });
    } else {
      setError(err);
      setFile(null);
      clearInput();
    }
    setPreviewing(false);
  }

  function pick(next: File | undefined): void {
    if (!next) return;
    setResult(null);
    setPreview(null);
    setError(null);
    setFile(next);
    void runPreview(next);
  }

  async function commit(): Promise<void> {
    if (!file) return;
    setCommitting(true);
    setError(null);
    const { body, error: err } = await post<CommitData>(file, "commit");
    if (body) {
      setResult(body);
      setPreview(null);
      setFile(null);
      clearInput();
    } else {
      setError(err);
    }
    setCommitting(false);
  }

  return { file, preview, result, error, previewing, committing, inputKey, pick, commit, reset };
}
