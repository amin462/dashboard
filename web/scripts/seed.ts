/**
 * seed.ts — เติมข้อมูลตัวอย่าง 300 แถว (makeMock จาก lib/survey/mock) ลง Supabase
 * ใช้: pnpm seed            → upsert (ข้าม dedupe_key ที่มีอยู่แล้ว รันซ้ำได้)
 *      pnpm seed -- --clear → ลบเฉพาะแถว source='seed' แล้วออก (ไม่แตะข้อมูลจริง)
 * env: อ่านจาก .env.local (node --env-file) หรือ fallback อ่านไฟล์เอง — ต้องมี
 *      NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { makeMock } from "../lib/survey/mock";
import { CODES, type Code, type RawRow } from "../lib/survey/schema";
import fs from "node:fs";
import path from "node:path";

// ---- env: ใช้ที่โหลดแล้วจาก --env-file ก่อน ถ้าไม่มีค่อยอ่าน .env.local เอง (ไม่ override) ----
function loadEnvFile(): void {
  const need = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  if (need.every((k) => process.env[k])) return;
  const file = path.join(import.meta.dirname ?? ".", "..", ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

const isClear = process.argv.includes("--clear");

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function main(): void {
  loadEnvFile();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    fail('ต้องมี NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env.local (ดู PLAN.md)');
  }
  run(url as string, key as string);
}

async function run(url: string, key: string): Promise<void> {
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  if (isClear) {
    const { count: before, error: e1 } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true })
      .eq("source", "seed");
    if (e1) fail(`นับแถว seed ไม่สำเร็จ: ${e1.message}`);
    const { error: e2 } = await supabase.from("survey_responses").delete().eq("source", "seed");
    if (e2) fail(`ลบแถว seed ไม่สำเร็จ: ${e2.message}`);
    console.log(`✓ ลบข้อมูลตัวอย่าง (source='seed') ${before ?? 0} แถว — ข้อมูลจริง (google_form/csv) ไม่ถูกแตะ`);
    return;
  }

  const mock: RawRow[] = makeMock(300, 42);
  // แถวสำหรับ insert: ตัด id/is_complete (generated) ออก — dedupe_key ให้ trigger ตั้งเอง
  const rows = mock.map((r) => {
    const row: Record<string, string | null> = {
      source: "seed",
      submitted_at: r.submitted_at,
    };
    for (const code of CODES as readonly Code[]) {
      const v = r[code];
      row[code] = typeof v === "string" && v.trim() ? v.trim() : null;
    }
    return row;
  });

  const { count: before, error: eb } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact", head: true });
  if (eb) fail(`นับแถวเดิมไม่สำเร็จ: ${eb.message}`);

  const CHUNK = 200;
  let chunkErrors = 0;
  const chunkErrorMessages: string[] = [];
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("survey_responses")
      .upsert(chunk, { onConflict: "dedupe_key", ignoreDuplicates: true });
    if (error) {
      chunkErrors += chunk.length;
      chunkErrorMessages.push(error.message);
    }
  }

  const { count: after, error: ea } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact", head: true });
  if (ea) fail(`นับแถวหลัง insert ไม่สำเร็จ: ${ea.message}`);

  const inserted = Math.max(0, (after ?? 0) - (before ?? 0));
  const skipped = Math.max(0, rows.length - inserted - chunkErrors);
  console.log(`✓ ข้อมูลตัวอย่าง 300 แถว (source='seed')`);
  console.log(`  เพิ่มใหม่: ${inserted} แถว`);
  console.log(`  ข้าม (มีอยู่แล้ว/ซ้ำ): ${skipped} แถว`);
  if (chunkErrors > 0) {
    console.error(`  บันทึกไม่สำเร็จ ${chunkErrors} แถว: ${chunkErrorMessages[0]}`);
    process.exitCode = 1;
  }
}

main();
