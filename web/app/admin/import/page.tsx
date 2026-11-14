import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { FlaskConical, Lock, LogOut, ShieldAlert, Database } from "lucide-react";
import { adminConfigured } from "@/lib/import/auth";
import { hasSupabaseEnv } from "@/lib/import/supabaseAdmin";
import { logoutAction } from "../login/actions";
import { ImportClient } from "./ImportClient";

export const metadata = { title: "นำเข้าข้อมูล (ผู้ดูแล)" };

export default function AdminImportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            สำหรับผู้ดูแลระบบ
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">นำเข้าข้อมูลจาก Google Sheets</h1>
          <p className="mt-1 text-sm text-ink-muted">
            อัปโหลด CSV → ตรวจสอบก่อน → ยืนยันนำเข้า (ข้ามแถวซ้ำอัตโนมัติด้วย dedupe_key)
          </p>
        </div>
        {adminConfigured() ? (
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl border border-border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-muted"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              ออกจากระบบ
            </button>
          </form>
        ) : null}
      </div>

      {/* แบนเนอร์ตามค่า env จริงตอนรัน (ไม่ bake ตอน build) */}
      <Suspense fallback={null}>
        <EnvBanners />
      </Suspense>

      <div className="mt-6">
        <ImportClient />
      </div>

      <section className="mt-8 rounded-3xl border border-border-line bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink">วิธีส่งออกไฟล์ CSV จาก Google Sheets</h2>
        <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-sm leading-relaxed text-ink-secondary">
          <li>เปิด Google Sheets ที่เก็บคำตอบของฟอร์ม (Response sheet)</li>
          <li>
            เมนู <strong>ไฟล์</strong> → <strong>ดาวน์โหลด</strong> →{" "}
            <strong>ค่าที่คั่นด้วยเครื่องหมายจุลภาค (.csv)</strong>
          </li>
          <li>นำไฟล์ที่ได้มาวางในช่องด้านบน — หัวคอลัมน์ต้องเป็นคำถามเดิมของฟอร์ม + คอลัมน์ Timestamp</li>
        </ol>
        <p className="mt-3 text-xs text-ink-muted">
          ระบบอ่านหัวคอลัมน์อัตโนมัติ (คัดกรอง 1–2, คำชี้แจง, ข้อ 1–11) รองรับเวลาแบบ พ.ศ./ค.ศ.
          และแก้ขีดในช่วงตัวเลขเป็น en dash ให้เอง แถวที่ไม่มีเวลาหรือเวลาอ่านไม่ได้จะถูกตัดออกพร้อมรายงาน
        </p>
        <Link
          href="/admin/quality"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <Database className="h-4 w-4" aria-hidden="true" />
          ดูคุณภาพข้อมูลและประวัติการนำเข้า →
        </Link>
      </section>
    </main>
  );
}

async function EnvBanners() {
  await connection(); // อ่าน env ตอนร้องขอจริง ไม่ bake ค่าตอน build
  const dbReady = hasSupabaseEnv();
  const passcodeReady = adminConfigured();
  if (dbReady && passcodeReady) return null;

  return (
    <div className="mt-5 space-y-3">
      {!dbReady ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-accent-border bg-accent-soft px-4 py-3 text-sm text-accent-ink"
        >
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-bold">โหมดเดโม่:</strong> ยังไม่ได้เชื่อมต่อ Supabase
            (ต้องมี <code>NEXT_PUBLIC_SUPABASE_URL</code> และ <code>SUPABASE_SERVICE_ROLE_KEY</code>)
            ตรวจไฟล์ล่วงหน้าได้ตามปกติ แต่ยืนยันนำเข้าจะไม่บันทึกลงฐานข้อมูล
          </p>
        </div>
      ) : null}
      {!passcodeReady ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-border-line bg-surface-muted px-4 py-3 text-sm text-ink-secondary"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-bold">ยังไม่ได้ตั้ง ADMIN_PASSCODE</strong> — หน้าผู้ดูแลเปิดให้เข้าถึงได้เลยในโหมดเดโม่
            เมื่อใช้งานจริงให้ตั้งค่าตัวแปรนี้ใน <code>.env.local</code> เพื่อขอรหัสผ่านทุกครั้ง
          </p>
        </div>
      ) : null}
    </div>
  );
}
