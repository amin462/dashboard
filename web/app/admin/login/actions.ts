"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminConfigured, cookieOptions, createSession, isValidPasscode } from "@/lib/import/auth";
import { lockedForSec, recordFailure, recordSuccess } from "@/lib/import/loginLimit";

function safeNext(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/admin/import";
}

/** ระบุผู้ใช้ด้วย IP (ไว้จำกัดการเดารหัสผ่านเท่านั้น ไม่เก็บถาวร) */
async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function loginAction(formData: FormData): Promise<void> {
  const passcode = String(formData.get("passcode") ?? "").slice(0, 200);
  const next = safeNext(formData.get("next"));
  const key = await clientKey();

  // ถูกล็อกจากการเดาผิดซ้ำ ๆ : ไม่ตรวจรหัสเลย (ไม่ให้ใช้เป็นช่องทางเดา)
  const wait = lockedForSec(key);
  if (wait > 0) redirect(`/admin/login?locked=${wait}&next=${encodeURIComponent(next)}`);

  if (adminConfigured() && isValidPasscode(passcode)) {
    recordSuccess(key);
    const store = await cookies();
    store.set(ADMIN_COOKIE, createSession().value, cookieOptions);
    console.info("[admin] login ok");
    redirect(next);
  }

  // หน่วงเล็กน้อยทุกครั้งที่ผิด ชะลอการเดาอัตโนมัติ
  await new Promise((r) => setTimeout(r, 600));
  const lockedSec = recordFailure(key);
  console.warn("[admin] login failed", lockedSec > 0 ? `(locked ${lockedSec}s)` : "");
  if (lockedSec > 0) redirect(`/admin/login?locked=${lockedSec}&next=${encodeURIComponent(next)}`);
  redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
}

/** ออกจากระบบ: ลบ cookie เซสชัน (ทำผ่าน POST เท่านั้น เพราะเป็น server action) */
export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  console.info("[admin] logout");
  redirect("/admin/login?logout=1");
}
