import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { ADMIN_COOKIE, adminConfigured, isValidAdminCookie } from "@/lib/import/auth";
import { Notice } from "@/components/ui/Notice";
import { loginAction } from "./actions";

export const metadata = { title: "เข้าสู่ระบบผู้ดูแล" };

type Props = {
  searchParams: Promise<{ error?: string; logout?: string; next?: string }>;
};

/** กรอบหน้าล็อกอิน: โครงเดียวกับหน้าอื่น (ชื่อหน้าเป็น h1 + คำอธิบาย 1 บรรทัด) แต่จัดกลางจอ */
function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <p className="text-lg leading-6 font-semibold">Yala Insight</p>
      <p className="type-meta text-ink-3">วัดคูหาภิมุข · อ.เมืองยะลา</p>
      <div className="mt-4 rounded-xl border border-line bg-surface p-5">
        <h1 className="type-title">{title}</h1>
        <p className="mt-1 text-ink-2">{description}</p>
        <div className="mt-4 space-y-3">{children}</div>
      </div>
    </main>
  );
}

export default function AdminLoginPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <AuthShell title="ผู้ดูแลระบบ" description="กำลังโหลด…">
          <div className="h-24 animate-pulse rounded-lg bg-data-muted/60" />
        </AuthShell>
      }
    >
      <LoginCard searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginCard({ searchParams }: Props) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/admin/import";

  // ไม่ได้ตั้ง ADMIN_PASSCODE — ปิดหน้าผู้ดูแลทั้งหมด (fail closed)
  if (!adminConfigured()) {
    return (
      <AuthShell title="ปิดการเข้าถึงส่วนผู้ดูแล" description="ยังไม่ได้ตั้งค่า ADMIN_PASSCODE">
        <p className="text-ink-2">
          เพื่อความปลอดภัย ระบบจะไม่เปิดหน้าผู้ดูแลจนกว่าจะตั้งค่า ADMIN_PASSCODE ใน <code>.env.local</code> หรือ Environment Variables ของ Vercel
        </p>
        <Link href="/" className="btn btn-secondary w-full">
          กลับหน้าแดชบอร์ด
        </Link>
      </AuthShell>
    );
  }

  // ล็อกอินอยู่แล้ว -> ไปหน้าเป้าหมาย
  const store = await cookies();
  if (isValidAdminCookie(store.get(ADMIN_COOKIE)?.value)) redirect(next);

  return (
    <AuthShell title="ผู้ดูแลระบบ" description="กรอกรหัสผ่านผู้ดูแลเพื่อนำเข้าและตรวจคุณภาพข้อมูล">
      {sp.logout && <Notice tone="ok">ออกจากระบบเรียบร้อยแล้ว</Notice>}
      {sp.error && <Notice tone="danger">รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง</Notice>}

      <form action={loginAction} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="font-medium">รหัสผ่าน</span>
          <input id="passcode" name="passcode" type="password" required autoFocus autoComplete="current-password" className="field mt-1" />
        </label>
        <button type="submit" className="btn btn-primary w-full">
          เข้าสู่ระบบ
        </button>
      </form>

      <p className="type-meta text-ink-3">
        ตั้งรหัสผ่านที่ตัวแปร <code>ADMIN_PASSCODE</code> ใน <code>.env.local</code>
      </p>
    </AuthShell>
  );
}
