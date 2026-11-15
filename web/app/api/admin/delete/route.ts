import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminConfigured, isValidAdminCookie } from "@/lib/import/auth";
import { isSameOrigin } from "@/lib/import/originCheck";
import { parseDeleteIds } from "@/lib/import/deleteRows";
import { getSupabaseAdmin } from "@/lib/import/supabaseAdmin";

// ลบแถวผู้ตอบ (ผู้ดูแลเท่านั้น) — ใช้ล้างแถวที่ทดสอบกรอก
// ปลอดภัยไว้ก่อน: ตรวจ cookie ซ้ำ, ลบเฉพาะ id ที่ระบุ (ไม่เกิน 50), ส่งแถวเดิมกลับไปให้ดาวน์โหลดสำรองก่อน/พร้อมลบ,
// บันทึกลง import_logs (source=admin_delete) เป็นหลักฐาน ; ไม่มีโหมด "ลบทั้งหมด"
// หมายเหตุ: คำตอบยังอยู่ใน Google Form/Sheets ; ถ้าสั่ง backfillAll() ใน Apps Script ซ้ำ แถวที่ลบจะถูกใส่กลับ

const jsonFail = (error: string, status: number) => Response.json({ ok: false, error }, { status });

export async function POST(request: NextRequest) {
  if (!adminConfigured() || !isValidAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return jsonFail("ไม่ได้รับอนุญาต — โปรดเข้าสู่ระบบผู้ดูแลอีกครั้ง", 401);
  }
  if (!isSameOrigin(request.headers.get("origin"), request.headers.get("host"))) {
    return jsonFail("คำขอข้ามเว็บไม่ได้รับอนุญาต", 403);
  }
  const body = await request.json().catch(() => null);
  const parsed = parseDeleteIds(body);
  if (!parsed.ok) return jsonFail(parsed.error, 400);

  const admin = getSupabaseAdmin();
  if (!admin) return jsonFail("ยังไม่ได้ตั้งค่า Supabase (โหมดเดโม่) ลบไม่ได้", 503);

  // 1) อ่านแถวเดิมไว้เป็นไฟล์สำรอง
  const found = await admin.from("survey_responses").select("*").in("id", parsed.ids);
  if (found.error) return jsonFail(`อ่านแถวไม่สำเร็จ: ${found.error.message}`, 502);
  const backup = found.data ?? [];
  if (backup.length === 0) return Response.json({ ok: true, deleted: 0, backup: [] });

  // 2) ลบ
  const del = await admin.from("survey_responses").delete().in("id", backup.map((r) => r.id as string)).select("id");
  if (del.error) return jsonFail(`ลบไม่สำเร็จ: ${del.error.message}`, 502);
  const deleted = del.data?.length ?? 0;

  // 3) บันทึกหลักฐาน (ล้มเหลวไม่ทำให้การลบย้อนกลับ)
  await admin.from("import_logs").insert({
    source: "admin_delete",
    file_name: null,
    total_rows: parsed.ids.length,
    inserted: 0,
    duplicates: 0,
    errors: 0,
    note: `ลบแถวผู้ตอบ ${deleted} แถว (id: ${backup.map((r) => String(r.id).slice(0, 8)).join(", ")})`,
  });

  return Response.json({ ok: true, deleted, backup });
}
