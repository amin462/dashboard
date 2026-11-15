"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatThaiDateTimeShort } from "@/components/format";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";

export type RecentRow = {
  id: string;
  source: string;
  submitted_at: string;
  is_complete: boolean;
  sur01: string | null;
  sur02: string | null;
  sur11: string | null;
};

const MAX_PICK = 50;
const th = "py-1.5 pr-3 font-medium";
const td = "py-1.5 pr-3 align-top";

function downloadBackup(rows: unknown[]): void {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deleted-rows-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** แถวผู้ตอบล่าสุด + เลือกลบแถวที่ทดสอบกรอก (ลบถาวร ต้องยืนยัน 2 ขั้น และดาวน์โหลดไฟล์สำรองให้ก่อนทุกครั้ง) */
export function RecentRowsPanel({ rows }: { rows: RecentRow[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "danger"; text: string } | null>(null);

  const toggle = (id: string) => {
    setConfirming(false);
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_PICK) next.add(id);
      return next;
    });
  };

  const del = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: [...picked] }),
      });
      const data = (await res.json().catch(() => null)) as { ok: boolean; deleted?: number; backup?: unknown[]; error?: string } | null;
      if (!data || !data.ok) {
        setMsg({ tone: "danger", text: data?.error ?? "ลบไม่สำเร็จ" });
      } else {
        if (data.backup && data.backup.length > 0) downloadBackup(data.backup);
        setMsg({ tone: "ok", text: `ลบแล้ว ${data.deleted ?? 0} แถว (ดาวน์โหลดไฟล์สำรอง .json ให้แล้ว) — หน้าแดชบอร์ดจะอัปเดตภายในไม่กี่สิบวินาที` });
        setPicked(new Set());
        router.refresh();
      }
    } catch {
      setMsg({ tone: "danger", text: "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง" });
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <Card title="แถวผู้ตอบล่าสุด — ลบแถวที่ทดสอบกรอก">
      <p className="type-meta text-ink-3">
        แสดง {rows.length} แถวล่าสุด (รวมที่ไม่นับในการวิเคราะห์) · เลือกแถวทดสอบแล้วกด “ลบถาวร” ได้ครั้งละไม่เกิน {MAX_PICK} แถว · ระบบดาวน์โหลดไฟล์สำรองให้ก่อนทุกครั้ง
        · คำตอบยังอยู่ใน Google Form (ถ้ารัน backfillAll() ซ้ำ แถวที่ลบจะกลับมา)
      </p>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line type-meta text-ink-3">
              <th className={th} scope="col">
                <span className="sr-only">เลือก</span>
              </th>
              <th className={th} scope="col">เวลาที่ส่ง</th>
              <th className={th} scope="col">แหล่ง</th>
              <th className={th} scope="col">สถานะ</th>
              <th className={th} scope="col">อายุ / พื้นที่</th>
              <th className={th} scope="col">ข้อเสนอแนะ (ย่อ)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const on = picked.has(r.id);
              return (
                <tr key={r.id} className={`border-b border-line last:border-0 ${on ? "bg-danger-soft" : ""}`}>
                  <td className={td}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(r.id)}
                      aria-label={`เลือกแถวที่ส่งเมื่อ ${formatThaiDateTimeShort(r.submitted_at)}`}
                      className="h-4 w-4 accent-[var(--navy-solid)]"
                    />
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{formatThaiDateTimeShort(r.submitted_at)}</td>
                  <td className={`${td} font-mono type-meta`}>{r.source}</td>
                  <td className={`${td} type-meta`}>{r.is_complete ? "นับ" : "ไม่นับ"}</td>
                  <td className={td}>{[r.sur01, r.sur02?.replace(/^จังหวัด/, "")].filter(Boolean).join(" · ") || "—"}</td>
                  <td className={`${td} max-w-[16rem] truncate text-ink-2`}>{r.sur11 ? r.sur11.slice(0, 40) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary h-8 px-3 text-[13px]"
          onClick={() => {
            setConfirming(false);
            setPicked(new Set(rows.filter((r) => r.source === "seed").slice(0, MAX_PICK).map((r) => r.id)));
          }}
        >
          เลือกแถวทดสอบ (source = seed)
        </button>
        <button type="button" className="btn btn-secondary h-8 px-3 text-[13px]" disabled={picked.size === 0} onClick={() => { setConfirming(false); setPicked(new Set()); }}>
          ล้างที่เลือก
        </button>
        {!confirming && (
          <button type="button" className="btn btn-primary h-8 px-3 text-[13px]" disabled={picked.size === 0 || busy} onClick={() => setConfirming(true)}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            ลบถาวร ({picked.size})
          </button>
        )}
      </div>

      {confirming && (
        <div role="alertdialog" aria-label="ยืนยันการลบ" className="mt-3 space-y-2 rounded-xl bg-danger-soft px-4 py-3 text-danger">
          <p className="font-semibold">ยืนยันลบ {picked.size} แถวแบบถาวร?</p>
          <p className="type-meta">ย้อนกลับในระบบไม่ได้ (ระบบจะดาวน์โหลดไฟล์สำรอง .json ให้ก่อน) ตัวเลขบนแดชบอร์ดจะเปลี่ยนทันทีที่ลบ</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary h-8 px-3 text-[13px]" disabled={busy} onClick={() => void del()}>
              {busy ? "กำลังลบ…" : "ยืนยันลบถาวร"}
            </button>
            <button type="button" className="btn btn-secondary h-8 px-3 text-[13px]" disabled={busy} onClick={() => setConfirming(false)}>
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {msg && (
        <div className="mt-3">
          <Notice tone={msg.tone}>{msg.text}</Notice>
        </div>
      )}
    </Card>
  );
}
