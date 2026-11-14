import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { LogOut, ScanSearch } from "lucide-react";
import { adminConfigured } from "@/lib/import/auth";
import { hasSupabaseEnv } from "@/lib/import/supabaseAdmin";
import { AdminFrame } from "@/components/shell/AdminFrame";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { logoutAction } from "../login/actions";
import { ImportClient } from "./ImportClient";

export const metadata = { title: "นำเข้าข้อมูล (ผู้ดูแล)" };

export default function AdminImportPage() {
  return (
    <AdminFrame
      title="นำเข้าข้อมูล"
      description="อัปโหลด CSV จาก Google Sheets → ตรวจก่อน → ยืนยันนำเข้า (ข้ามแถวซ้ำอัตโนมัติด้วย dedupe_key)"
      maxWidth="max-w-[820px]"
      actions={
        <>
          <Link href="/admin/quality" prefetch={false} className="btn btn-secondary h-8 px-2.5 text-[13px]">
            <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">คุณภาพข้อมูล</span>
          </Link>
          <Suspense fallback={null}>
            <LogoutButton />
          </Suspense>
        </>
      }
    >
      <Suspense fallback={null}>
        <EnvNotices />
      </Suspense>

      <ImportClient />

      <Card title="วิธีส่งออกไฟล์ CSV จาก Google Sheets">
        <ol className="list-decimal space-y-1 ps-5 text-ink-2">
          <li>เปิด Google Sheets ที่เก็บคำตอบของฟอร์ม (Response sheet)</li>
          <li>
            เมนู <strong className="font-medium text-ink">ไฟล์</strong> → <strong className="font-medium text-ink">ดาวน์โหลด</strong> →{" "}
            <strong className="font-medium text-ink">ค่าที่คั่นด้วยเครื่องหมายจุลภาค (.csv)</strong>
          </li>
          <li>นำไฟล์มาวางในช่องด้านบน หัวคอลัมน์ต้องเป็นคำถามเดิมของฟอร์ม + คอลัมน์ Timestamp</li>
        </ol>
        <p className="mt-3 type-meta text-ink-3">
          ระบบอ่านหัวคอลัมน์อัตโนมัติ รองรับเวลาแบบ พ.ศ./ค.ศ. และแก้ขีดในช่วงตัวเลขเป็น en dash ให้เอง
          แถวที่ไม่มีเวลาหรืออ่านเวลาไม่ได้จะถูกตัดออกพร้อมรายงาน
        </p>
      </Card>
    </AdminFrame>
  );
}

async function LogoutButton() {
  await connection(); // อ่าน env ตอนร้องขอจริง ไม่ bake ตอน build
  if (!adminConfigured()) return null;
  return (
    <form action={logoutAction}>
      <button type="submit" className="btn btn-secondary h-8 px-2.5 text-[13px]">
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">ออกจากระบบ</span>
      </button>
    </form>
  );
}

async function EnvNotices() {
  await connection();
  const dbReady = hasSupabaseEnv();
  const passcodeReady = adminConfigured();
  if (dbReady && passcodeReady) return null;
  return (
    <div className="space-y-2">
      {!dbReady && (
        <Notice tone="warn">
          <strong className="font-medium">โหมดเดโม่:</strong> ยังไม่ได้เชื่อมต่อ Supabase (ต้องมี <code>NEXT_PUBLIC_SUPABASE_URL</code> และ{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>) ตรวจไฟล์ล่วงหน้าได้ แต่ยืนยันนำเข้าจะไม่บันทึกลงฐานข้อมูล
        </Notice>
      )}
      {!passcodeReady && (
        <Notice tone="info">
          <strong className="font-medium">ยังไม่ได้ตั้ง ADMIN_PASSCODE</strong> — ตั้งค่าใน <code>.env.local</code> เพื่อเปิดใช้หน้าผู้ดูแลพร้อมรหัสผ่าน
        </Notice>
      )}
    </div>
  );
}
