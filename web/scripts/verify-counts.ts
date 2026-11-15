/**
 * verify-counts.ts — ตรวจนับอิสระ (ไม่ใช้ normalize/freq ของแอปในการนับฝั่ง "ดิบ")
 * ใช้: pnpm -C web exec tsx scripts/verify-counts.ts
 * ดึงแถว is_complete=true แล้วนับข้อความดิบต่อตัวเลือกข้อ 1–10 ด้วยโค้ดง่าย ๆ ในไฟล์นี้
 * เทียบกับ freq()/multiFreq() ของแอปทีละตัวเลือก ; ไม่ตรง -> exit 1
 * นับ "อื่น ๆ": ข้อความดิบที่ไม่อยู่ในรายการตัวเลือก (หลัง trim/แปลงขีดเป็น en dash) รวมเป็นกลุ่ม "อื่น ๆ" เหมือนแอป
 * ข้อ 9: ฝั่งดิบนับข้อความเต็ม (เช่น "5 (มากที่สุด)") ; ข้อ 8: แยกด้วย ',' แล้วตัดซ้ำ ; ถ้ามี "ไม่มีความสนใจเป็นพิเศษ" ร่วมกับข้ออื่น แอปตัดตัวเลือกนั้นทิ้ง (conflict)
 * อ่านฐานข้อมูลอย่างเดียว
 */
import { fetchAllRaw } from "./_db";
import { normalize } from "../lib/survey/normalize";
import { freq, multiFreq } from "../lib/survey/aggregate";
import { OTHERS_LABEL, QUESTIONS, SUR08_NONE, type Code } from "../lib/survey/schema";

const CODES_CHECK: Code[] = ["sur01", "sur02", "sur03", "sur04", "sur05", "sur06", "sur07", "sur08", "sur09", "sur10"];

// ทำซ้ำแบบง่าย: ตัดช่องว่าง + ขีดระหว่างตัวเลข -> en dash (ตามที่ Sheets/ฟอร์มอาจส่งมา)
function simpleClean(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "") return null;
  return s.replace(/(\d)\s*[-‐‑‒—]\s*(\d)/g, "$1–$2");
}

async function main() {
  const raw = (await fetchAllRaw()).filter((r) => r.is_complete === true);
  const { rows } = normalize(raw.map((r) => ({ ...r })));
  console.log(`แถวสมบูรณ์ (is_complete=true): ${raw.length} (แอป normalize ได้ ${rows.length})`);
  let diffs = 0;
  let total = 0;
  const lines: string[] = [];
  for (const code of CODES_CHECK) {
    const q = QUESTIONS[code];
    const mine = new Map<string, number>();
    let skipped = 0;
    let conflicts = 0;
    for (const r of raw) {
      const v = simpleClean(r[code]);
      if (v === null) {
        skipped++;
        continue;
      }
      let vals = [v];
      if (code === "sur08") {
        vals = Array.from(new Set(v.split(",").map((s) => s.trim()).filter(Boolean)));
        if (vals.includes(SUR08_NONE) && vals.length > 1) {
          conflicts++;
          vals = vals.filter((x) => x !== SUR08_NONE);
        }
      }
      for (const x of vals) {
        const key = q.choices.includes(x) ? x : OTHERS_LABEL;
        mine.set(key, (mine.get(key) ?? 0) + 1);
      }
    }
    const app = code === "sur08" ? multiFreq(rows) : freq(rows, code);
    const labels = [...q.choices, OTHERS_LABEL];
    let qDiff = 0;
    for (const label of labels) {
      const a = app.items.find((i) => i.label === label)?.count ?? 0;
      const b = mine.get(label) ?? 0;
      total++;
      if (a !== b) {
        qDiff++;
        lines.push(`  ✗ ${code} "${label}": ดิบ=${b} แอป=${a}`);
      }
    }
    if (app.skipped !== skipped) {
      qDiff++;
      lines.push(`  ✗ ${code} ไม่ตอบ: ดิบ=${skipped} แอป=${app.skipped}`);
    }
    diffs += qDiff;
    const otherCount = mine.get(OTHERS_LABEL) ?? 0;
    console.log(
      `${qDiff === 0 ? "✓" : "✗"} ${code.padEnd(6)} ฐาน=${raw.length - skipped} ไม่ตอบ=${skipped}` +
        (otherCount ? ` อื่น ๆ(ไม่อยู่ในรายการ)=${otherCount}` : "") +
        (conflicts ? ` sur08 conflict=${conflicts}` : "") +
        ` ต่างกัน ${qDiff} ตัวเลือก`,
    );
  }
  if (lines.length) console.log(lines.join("\n"));
  console.log(`\nสรุป: ตรวจ ${total} ตัวเลือก ต่างกัน ${diffs}`);
  if (diffs > 0) process.exit(1);
  console.log("ตรงกันทุกตัวเลือก");
}

main().catch((e) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
