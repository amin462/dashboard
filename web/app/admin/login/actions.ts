"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminConfigured,
  cookieOptions,
  isValidPasscode,
  sessionToken,
} from "@/lib/import/auth";

function safeNext(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/admin/import";
}

export async function loginAction(formData: FormData): Promise<void> {
  const passcode = String(formData.get("passcode") ?? "");
  const next = safeNext(formData.get("next"));

  if (!adminConfigured() || isValidPasscode(passcode)) {
    const store = await cookies();
    store.set(ADMIN_COOKIE, sessionToken(), cookieOptions);
    redirect(next);
  }

  redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login?logout=1");
}
