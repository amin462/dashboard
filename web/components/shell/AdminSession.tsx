import { cookies } from "next/headers";
import { connection } from "next/server";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";
import { ADMIN_COOKIE, adminConfigured, sessionExpiry } from "@/lib/import/auth";

/** ปุ่มออกจากระบบ + เวลาที่เซสชันจะหมดอายุ (แสดงทุกหน้าผู้ดูแลที่ล็อกอินอยู่) */
export async function AdminSession() {
  await connection(); // อ่าน cookie/env ตอนร้องขอจริง
  if (!adminConfigured()) return null;
  const expiresAt = sessionExpiry((await cookies()).get(ADMIN_COOKIE)?.value);
  if (expiresAt === null) return null;
  const until = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(expiresAt));
  return (
    <>
      <span className="hidden type-meta text-ink-3 md:inline" title="ครบเวลาแล้วต้องเข้าสู่ระบบใหม่ ; เปลี่ยนรหัสผ่านผู้ดูแลเพื่อออกจากระบบทุกเครื่อง">
        เซสชันหมดอายุ {until} น.
      </span>
      <form action={logoutAction}>
        <button type="submit" className="btn btn-secondary h-8 px-2.5 text-[13px]">
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </form>
    </>
  );
}
