"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { Notice } from "@/components/ui/Notice";
import { PreviewPanel, ResultPanel } from "./ImportPanels";
import { useImportFlow } from "./useImportFlow";

export function ImportClient() {
  const flow = useImportFlow();
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          flow.pick(e.dataTransfer.files?.[0]);
        }}
        className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors duration-150 ${
          dragOver ? "border-navy bg-amber-soft" : "border-line bg-surface"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-ink-3" strokeWidth={1.25} aria-hidden="true" />
        <p className="font-medium text-ink">ลากไฟล์ CSV มาวางที่นี่ หรือ</p>
        <label className="btn btn-secondary cursor-pointer">
          เลือกไฟล์ .csv
          <input key={flow.inputKey} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => flow.pick(e.target.files?.[0])} />
        </label>
        {flow.previewing ? (
          <p role="status" className="flex items-center gap-2 type-meta text-ink-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            กำลังตรวจไฟล์…
          </p>
        ) : flow.file ? (
          <p className="flex items-center gap-2 type-meta text-ink-2">
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            {flow.file.name}
          </p>
        ) : (
          <p className="type-meta text-ink-3">ไฟล์จาก Google Sheets: ไฟล์ → ดาวน์โหลด → ค่าที่คั่นด้วยเครื่องหมายจุลภาค (.csv)</p>
        )}
      </div>

      {flow.error && <Notice tone="danger">{flow.error}</Notice>}
      {flow.preview && <PreviewPanel preview={flow.preview} committing={flow.committing} onCommit={() => void flow.commit()} onCancel={flow.reset} />}
      {flow.result && <ResultPanel result={flow.result} onReset={flow.reset} />}
    </div>
  );
}
