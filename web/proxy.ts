import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminConfigured, isValidAdminCookie } from "./lib/import/auth";

// สิทธิ์ผู้ดูแล (DATA_CONTRACT ข้อ 6): /admin/* และ /api/admin/* ต้องมี cookie ที่ตั้งด้วย ADMIN_PASSCODE
// - /api/admin/* ไม่ผ่าน -> 401 JSON ; /admin/* ไม่ผ่าน -> redirect ไปหน้าเข้าสู่ระบบ
// - ไม่ได้ตั้ง ADMIN_PASSCODE = ปิดทั้งหมด (หน้า login แจ้งให้ตั้งค่า)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();
  // fail closed: ไม่ได้ตั้ง ADMIN_PASSCODE = ห้ามเข้า (isValidAdminCookie คืน false)
  if (adminConfigured() && isValidAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return Response.json(
      { ok: false, error: "ไม่ได้รับอนุญาต — โปรดเข้าสู่ระบบผู้ดูแลอีกครั้ง" },
      { status: 401 },
    );
  }

  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
