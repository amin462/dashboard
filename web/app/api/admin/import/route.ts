import type { NextRequest } from "next/server";
import { CODES } from "@/lib/survey/schema";
import {
  parseGoogleSheetsCsv,
  parseSubmittedAt,
  type CsvError,
  type InsertRow,
} from "@/lib/import/csv";
import { getSupabaseAdmin } from "@/lib/import/supabaseAdmin";
import { ADMIN_COOKIE, adminConfigured, isValidAdminCookie } from "@/lib/import/auth";

// นำเข้าข้อมูล CSV (ผู้ดูแล) — DATA_CONTRACT ข้อ 6: เขียนข้อมูลด้วย SERVICE_ROLE ฝั่ง server เท่านั้น
// body: multipart {file, mode} | JSON {csv, mode} | JSON {rows, mode}
// mode=preview -> {total, valid, errors[], sample[]} ไม่เขียน DB
// mode=commit  -> upsert ทีละ 200 แถว onConflict dedupe_key (ignoreDuplicates) + บันทึก import_logs

const CHUNK = 200;
const MAX_ROWS = 5000;
const MAX_CSV_BYTES = 5 * 1024 * 1024;
const SAMPLE = 10;
const MAX_ERRORS_RETURNED = 200;

const jsonFail = (error: string, status: number) =>
  Response.json({ ok: false, error }, { status });

type Input =
  | { kind: "csv"; csv: string; fileName: string }
  | { kind: "rows"; rows: unknown[]; fileName: string };

async function readInput(
  request: NextRequest,
): Promise<{ mode: "preview" | "commit"; input: Input } | Response> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const fd = await request.formData();
    const mode = normalizeMode(fd.get("mode"));
    const file = fd.get("file");
    if (!(file instanceof File)) {
      return jsonFail("แนบไฟล์ CSV ในฟิลด์ file", 400);
    }
    if (file.size > MAX_CSV_BYTES) {
      return jsonFail("ไฟล์ใหญ่เกิน 5 MB", 400);
    }
    return { mode, input: { kind: "csv", csv: await file.text(), fileName: file.name || "upload.csv" } };
  }

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") return jsonFail("body ต้องเป็น JSON", 400);
    const mode = normalizeMode(body.mode);
    if (typeof body.csv === "string") {
      if (body.csv.length > MAX_CSV_BYTES) return jsonFail("ข้อมูลใหญ่เกิน 5 MB", 400);
      const fileName = typeof body.fileName === "string" ? body.fileName : "inline.csv";
      return { mode, input: { kind: "csv", csv: body.csv, fileName } };
    }
    if (Array.isArray(body.rows)) {
      const fileName = typeof body.fileName === "string" ? body.fileName : "inline.rows";
      return { mode, input: { kind: "rows", rows: body.rows, fileName } };
    }
    return jsonFail("ต้องส่ง file (multipart), csv หรือ rows (JSON)", 400);
  }

  return jsonFail("content-type ไม่รองรับ (ใช้ multipart/form-data หรือ application/json)", 400);
}

/** mode: ค่าเริ่มต้น/ค่าที่ไม่รู้จัก = preview (ปลอดภัยสุด — ไม่เขียนฐานข้อมูล) */
function normalizeMode(v: unknown): "preview" | "commit" {
  return typeof v === "string" && v.trim() === "commit" ? "commit" : "preview";
}

/** แถวจาก JSON — ตรวจรูปแบบและเลือกเฉพาะฟิลด์ที่อนุญาต (กันฝัง id/source) */
function sanitizeRow(v: unknown): InsertRow | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const submittedAt =
    typeof o.submitted_at === "string" ? parseSubmittedAt(o.submitted_at) : null;
  if (!submittedAt) return null;
  const row: InsertRow = { source: "csv", submitted_at: submittedAt };
  for (const code of CODES) {
    const val = o[code];
    if (typeof val === "string") {
      const t = val.trim().slice(0, 2000);
      if (t) row[code] = t;
    }
  }
  return row;
}

function toInputRows(input: Input): { rows: InsertRow[]; errors: CsvError[] } {
  if (input.kind === "csv") {
    return parseGoogleSheetsCsv(input.csv);
  }
  const rows: InsertRow[] = [];
  const errors: CsvError[] = [];
  input.rows.forEach((v, i) => {
    const row = sanitizeRow(v);
    if (row) rows.push(row);
    else errors.push({ line: i + 1, reason: "แถวไม่ถูกต้อง (ไม่มี submitted_at ที่อ่านได้)" });
  });
  return { rows, errors };
}

async function countRows(admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>): Promise<number> {
  const { count, error } = await admin
    .from("survey_responses")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function POST(request: NextRequest) {
  // สิทธิ์: ตรวจซ้ำใน route ด้วย (proxy ตรวจก่อนแล้ว แต่กันเผื่อการตั้งค่า matcher)
  if (!adminConfigured() || !isValidAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return jsonFail("ไม่ได้รับอนุญาต — โปรดเข้าสู่ระบบผู้ดูแลอีกครั้ง", 401);
  }

  const parsedInput = await readInput(request);
  if (parsedInput instanceof Response) return parsedInput;
  const { mode, input } = parsedInput;

  let rows: InsertRow[];
  let errors: CsvError[];
  try {
    ({ rows, errors } = toInputRows(input));
  } catch (e) {
    return jsonFail(`อ่านไฟล์ไม่สำเร็จ: ${e instanceof Error ? e.message : String(e)}`, 400);
  }

  const total = rows.length + errors.length;
  if (rows.length > MAX_ROWS) {
    return jsonFail(`ไฟล์มีมากกว่า ${MAX_ROWS} แถว — แบ่งเป็นไฟล์ย่อยก่อนนำเข้า`, 400);
  }

  if (mode === "preview") {
    return Response.json({
      ok: true,
      mode,
      total,
      valid: rows.length,
      errors: errors.slice(0, MAX_ERRORS_RETURNED),
      errorsTruncated: errors.length > MAX_ERRORS_RETURNED,
      sample: rows.slice(0, SAMPLE),
    });
  }

  // mode = commit
  if (rows.length === 0) {
    // ไม่มีแถวที่นำเข้าได้ — ไม่แตะฐานข้อมูลเลย (ไม่เขียน import_logs)
    return Response.json({
      ok: true,
      mode,
      total,
      valid: 0,
      inserted: 0,
      duplicates: 0,
      errors: errors.slice(0, MAX_ERRORS_RETURNED),
      errorsTruncated: errors.length > MAX_ERRORS_RETURNED,
      failedRows: 0,
      note: "ไม่มีแถวที่นำเข้าได้ จึงไม่มีการบันทึกลงฐานข้อมูล",
      fileName: input.fileName,
    });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return jsonFail(
      "ยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase (ต้องมี NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env.local) — ขณะนี้เว็บรันในโหมดเดโม่",
      503,
    );
  }

  try {
    const before = await countRows(admin);

    const failedChunks: string[] = [];
    let failedRows = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK).map((r) => ({ ...r }));
      const { error } = await admin
        .from("survey_responses")
        .upsert(chunk, { onConflict: "dedupe_key", ignoreDuplicates: true });
      if (error) {
        failedRows += chunk.length;
        failedChunks.push(error.message);
      }
    }

    const after = await countRows(admin);
    const inserted = Math.max(0, after - before);
    const duplicates = Math.max(0, rows.length - inserted); // ตามสเปก: ซ้ำ = แถวที่ใช้ได้ - เพิ่มจริง
    const errorCount = errors.length;
    const note =
      failedRows > 0
        ? `บันทึกไม่สำเร็จบางส่วน (${failedRows} แถว): ${failedChunks[0]}`
        : errors.length > 0
          ? `แถวผิดพลาด ${errors.length} แถวไม่ได้นำเข้า`
          : null;

    let logWarning: string | null = null;
    const { error: logError } = await admin.from("import_logs").insert({
      source: "csv",
      file_name: input.fileName,
      total_rows: total,
      inserted,
      duplicates,
      errors: errorCount,
      note,
    });
    if (logError) logWarning = logError.message;

    return Response.json({
      ok: true,
      mode,
      total,
      valid: rows.length,
      inserted,
      duplicates,
      errors: errors.slice(0, MAX_ERRORS_RETURNED),
      errorsTruncated: errors.length > MAX_ERRORS_RETURNED,
      failedRows,
      note,
      logWarning,
      fileName: input.fileName,
    });
  } catch (e) {
    return jsonFail(
      `เขียนฐานข้อมูลไม่สำเร็จ: ${e instanceof Error ? e.message : String(e)}`,
      500,
    );
  }
}
