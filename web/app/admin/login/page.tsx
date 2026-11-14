import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { KeyRound, FlaskConical } from "lucide-react";
import { ADMIN_COOKIE, adminConfigured, isValidAdminCookie } from "@/lib/import/auth";
import { loginAction } from "./actions";

export const metadata = { title: "เข้าสู่ระบบผู้ดูแล" };

type Props = {
  searchParams: Promise<{ error?: string; logout?: string; next?: string }>;
};

export default function AdminLoginPage({ searchParams }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginCard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div className="rounded-3xl border border-border-line bg-surface p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="space-y-2">
          <span className="block h-5 w-32 animate-pulse rounded bg-surface-muted" />
          <span className="block h-4 w-48 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-6 h-40 animate-pulse rounded-2xl bg-surface-subtle" />
    </div>
  );
}

async function LoginCard({ searchParams }: Props) {
  const sp = await searchParams;
  const next =
    sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/admin/import";

  // ไม่ได้ตั้ง ADMIN_PASSCODE — ปิดหน้าผู้ดูแลทั้งหมด (fail closed)
  if (!adminConfigured()) {
    return (
      <div className="rounded-3xl border border-border-line bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
            <FlaskConical className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-ink">ปิดการเข้าถึงส่วนผู้ดูแล</h1>
            <p className="text-sm text-ink-muted">ยังไม่ได้ตั้งค่า ADMIN_PASSCODE</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
          เพื่อความปลอดภัย ระบบจะไม่เปิดหน้าผู้ดูแลจนกว่าจะตั้งค่า ADMIN_PASSCODE
          ในไฟล์ .env.local หรือ Environment Variables ของ Vercel
        </p>
        <Link href="/" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-border-line px-4 py-3 text-sm font-bold text-ink">
          กลับหน้าแดชบอร์ด
        </Link>
      </div>
    );
  }

  // ล็อกอินอยู่แล้ว -> ไปหน้าเป้าหมาย
  const store = await cookies();
  if (isValidAdminCookie(store.get(ADMIN_COOKIE)?.value)) redirect(next);

  return (
    <div className="rounded-3xl border border-border-line bg-surface p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-ink">ผู้ดูแลระบบ</h1>
          <p className="text-sm text-ink-muted">กรอกรหัสผ่านผู้ดูแล (ADMIN_PASSCODE)</p>
        </div>
      </div>

      {sp.logout ? (
        <p className="mt-4 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-2.5 text-sm text-brand-ink">
          ออกจากระบบเรียบร้อยแล้ว
        </p>
      ) : null}
      {sp.error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger"
        >
          รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง
        </p>
      ) : null}

      <form action={loginAction} className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <label className="block text-sm font-semibold text-ink" htmlFor="passcode">
          รหัสผ่าน
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-2xl border border-border-line bg-surface-subtle px-4 py-3 text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
        >
          เข้าสู่ระบบ
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-ink-muted">
        รหัสผ่านตั้งได้ใน <code>.env.local</code> ที่ตัวแปร <code>ADMIN_PASSCODE</code> (ดู PLAN.md)
      </p>
    </div>
  );
}
