/**
 * _db.ts — ตัวช่วยอ่าน (read-only) survey_responses สำหรับสคริปต์รายงาน
 * ไม่ใช้ mock ; ไม่มี env -> หยุดพร้อมข้อความชัดเจน ; ไม่พิมพ์ค่าคีย์
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { CODES, type RawRow } from "../lib/survey/schema";

function loadEnvFile(): void {
  const file = path.join(import.meta.dirname ?? ".", "..", ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

export function argValue(name: string): string | undefined {
  const p = `--${name}=`;
  return process.argv.find((a) => a.startsWith(p))?.slice(p.length);
}

/** ดึงทุกแถวดิบ (อ่านอย่างเดียว) แบ่งหน้า 1000 */
export async function fetchAllRaw(): Promise<RawRow[]> {
  loadEnvFile();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    fail("ไม่พบ NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY (หรือ NEXT_PUBLIC_SUPABASE_ANON_KEY) ใน web/.env.local — ไม่ใช้ mock จึงหยุดการทำงาน");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const cols = ["id", "source", "submitted_at", "is_complete", ...CODES].join(",");
  const rows: RawRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("survey_responses")
      .select(cols)
      .order("submitted_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + 999);
    if (error) fail(`อ่านฐานข้อมูลไม่สำเร็จ: ${error.message}`);
    const page = (data ?? []) as unknown as RawRow[];
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
}
