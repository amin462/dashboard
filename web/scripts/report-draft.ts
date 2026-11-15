/**
 * report-draft.ts — ร่าง "บทที่ 4 ผลการวิเคราะห์ข้อมูล" เป็น Markdown ภาษาไทย จากข้อมูลจริงใน Supabase (อ่านอย่างเดียว)
 * ใช้: pnpm -C web exec tsx scripts/report-draft.ts [--from=YYYY-MM-DD] [--to=YYYY-MM-DD] [--out=docs/REPORT_RESULTS_DRAFT.md]
 * ตัวเลขทุกค่ามาจาก lib/survey/* (freq, multiFreq, satisfaction, collectionProgress, stats, insights) ; สคริปต์นี้จัดรูปแบบข้อความเท่านั้น
 * ไม่มี env -> หยุด (ไม่ใช้ mock) ; out เป็นพาธเทียบกับรากโปรเจกต์ (โฟลเดอร์เหนือ web/)
 */
import fs from "node:fs";
import path from "node:path";
import { argValue, fetchAllRaw, fail } from "./_db";
import { normalize } from "../lib/survey/normalize";
import { applyFilters } from "../lib/survey/filters";
import { collectionProgress, freq, multiFreq, quality, satisfaction, type FreqResult } from "../lib/survey/aggregate";
import {
  compareOriginInterest,
  compareOriginSatisfaction,
  marginOfError,
  reliabilitySummary,
  wilsonCI,
} from "../lib/survey/stats";
import { BUSINESS_TYPES, businessInsights, overviewInsights, type Insight } from "../lib/survey/insights";
import { sanitizeComment } from "../lib/ai/context";
import { DISCLAIMER, OTHERS_LABEL, QUESTIONS, SMALL_N, TARGET_FULL, TARGET_MIN, type Row } from "../lib/survey/schema";

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const thaiDate = (ymd: string | null) => {
  const m = ymd ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd) : null;
  return m ? `${Number(m[3])} ${TH_MONTHS[Number(m[2]) - 1]} ${Number(m[1]) + 543}` : "-";
};
const f1 = (x: number) => x.toFixed(1);
const f2 = (x: number) => x.toFixed(2);
const pStr = (p: number) => (p < 0.001 ? "< 0.001" : p.toFixed(3));

let tableNo = 0;
const out: string[] = [];
const push = (...s: string[]) => out.push(...s);

function interpretFreq(f: FreqResult): string {
  const skip = QUESTIONS[f.code].notSpecified ?? [];
  const cand = f.items.filter((i) => !skip.includes(i.label) && i.count > 0);
  if (f.base === 0 || cand.length === 0) return "ไม่มีข้อมูลเพียงพอสำหรับการตีความ";
  const max = Math.max(...cand.map((i) => i.count));
  const tops = cand.filter((i) => i.count === max);
  const pct = tops[0].pct;
  if (tops.length > 1) {
    return `ตัวเลือกที่พบมากที่สุดเท่ากันคือ ${tops.map((t) => t.label).join(" และ ")} ตัวเลือกละ ${max} คน (ร้อยละ ${f1(pct)})`;
  }
  const word = pct > 50 ? "ส่วนใหญ่" : "มากที่สุด";
  return `ผู้ตอบ${word}คือ ${tops[0].label} จำนวน ${max} คน คิดเป็นร้อยละ ${f1(pct)} ของผู้ตอบข้อนี้`;
}

/** ตารางความถี่ตามรูปแบบตารางบทที่ 4 */
function freqTable(f: FreqResult, subject: string, multi = false): void {
  tableNo++;
  push(`**ตารางที่ ${tableNo}** แสดงจำนวนและร้อยละของผู้ตอบแบบสำรวจจำแนกตาม${subject}`, "");
  push("| ตัวเลือก | จำนวน (คน) | ร้อยละ | ช่วงเชื่อมั่น 95% |", "|---|---:|---:|---:|");
  for (const it of f.items) {
    const ci = wilsonCI(it.count, f.base);
    push(`| ${it.label} | ${it.count} | ${f1(it.pct)} | ${ci ? `${f1(ci.low)}–${f1(ci.high)}` : "-"} |`);
  }
  push("");
  push(
    `ฐานการคำนวณ (n) = ${f.base} คน (ผู้ตอบข้อนี้) ; ไม่ตอบ ${f.skipped} คน ; ตอบ "ไม่ประสงค์ระบุ/ยังประเมินไม่ได้" ${f.notSpecified} คน (นับรวมในฐาน)` +
      (multi ? " ; ข้อนี้เลือกได้หลายตัวเลือก ร้อยละคิดจากจำนวนผู้ตอบข้อนี้ จึงรวมกันเกิน 100 ได้ ; ช่วงเชื่อมั่นเป็นแบบ Wilson ต่อตัวเลือก" : " ; ช่วงเชื่อมั่นเป็นแบบ Wilson"),
    "",
  );
  push(`ตีความ: ${interpretFreq(f)}`, "");
  const others = f.others.map(sanitizeComment).filter(Boolean);
  if (others.length) {
    push(`> หมายเหตุ (ให้คนตรวจ): ข้อความ "${OTHERS_LABEL}" ที่ผู้ตอบพิมพ์เอง ${others.length} รายการ: ${others.map((o) => `"${o}"`).join(", ")}`, "");
  }
  if (f.base > 0 && f.base < SMALL_N) push(`> คำเตือน: ฐาน n < ${SMALL_N} ตีความด้วยความระมัดระวัง`, "");
}

function insightBlock(list: Insight[]): void {
  if (!list.length) {
    push(`- (ไม่มีข้อเสนอ: ข้อมูลไม่ถึงเกณฑ์ขั้นต่ำ n ≥ ${SMALL_N} หรือไม่เข้าเงื่อนไขของกฎ)`, "");
    return;
  }
  for (const i of list) {
    push(`- **${i.title}** — ${i.detail}`);
    push(`  - หลักฐาน: ${i.evidence.map((e) => `${e.label} = ${e.value}`).join(" ; ")} (n = ${i.n})`);
  }
  push("");
}

async function main() {
  const from = argValue("from");
  const to = argValue("to");
  const outArg = argValue("out") ?? "docs/REPORT_RESULTS_DRAFT.md";
  for (const [k, v] of [["from", from], ["to", to]] as const) {
    if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) fail(`--${k} ต้องเป็นรูปแบบ YYYY-MM-DD`);
  }
  const raw = await fetchAllRaw();
  const norm = normalize(raw);
  const filters = { ...(from ? { from } : {}), ...(to ? { to } : {}) };
  const rows: Row[] = applyFilters(norm.rows, filters);
  const allFiltered: Row[] = applyFilters(norm.all, filters);
  const n = rows.length;
  const q = quality(allFiltered);
  const prog = collectionProgress(rows);
  const rel = reliabilitySummary(rows);

  const nowTh = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short",
  }).format(new Date());

  push("# บทที่ 4 ผลการวิเคราะห์ข้อมูล (ร่าง)", "");
  push("> **ร่างอัตโนมัติ — ตรวจตัวเลขกับแดชบอร์ดก่อนนำลงเล่ม**", "");
  push(`- สร้างเมื่อ: ${nowTh} (เวลาไทย)`);
  push(`- ตัวกรองที่ใช้: ${from || to ? `วันที่ ${from ? thaiDate(from) : "ต้น"} ถึง ${to ? thaiDate(to) : "ล่าสุด"}` : "ไม่มี (ข้อมูลทั้งหมด)"} ; วิเคราะห์เฉพาะแบบสอบถามที่สมบูรณ์ (is_complete)`);
  push("- ตัวเลขทุกค่าคำนวณจาก `web/lib/survey/*` (ฟังก์ชันเดียวกับแดชบอร์ด) ; ประโยคตีความสร้างจากตัวเลขตามกฎตายตัว ไม่มีการเดาเหตุผล", "");

  // 4.1
  push("## 4.1 ข้อมูลทั่วไปและการเก็บข้อมูล", "");
  tableNo++;
  push(`**ตารางที่ ${tableNo}** แสดงจำนวนแบบสอบถามที่ได้รับและสถานะความสมบูรณ์`, "");
  push("| รายการ | จำนวน (ชุด) |", "|---|---:|");
  push(`| ส่งเข้ามาทั้งหมด | ${q.total} |`);
  push(`| สมบูรณ์ (นำมาวิเคราะห์) | ${q.complete} |`);
  push(`| ไม่ผ่านคำถามคัดกรอง | ${q.failedScreening} |`);
  push(`| ไม่ยินยอม | ${q.noConsent} |`);
  push(`| ผ่านคัดกรอง/ยินยอมแต่ตอบข้อบังคับไม่ครบ | ${q.missingRequired} |`, "");
  push(`ช่วงวันที่เก็บข้อมูล (ชุดสมบูรณ์): ${thaiDate(prog.firstDate)} ถึง ${thaiDate(prog.lastDate)} (มีผู้ตอบ ${prog.activeDays} วัน เฉลี่ย ${f1(prog.perActiveDay)} ชุดต่อวันที่มีผู้ตอบ)`, "");
  push(`เทียบเป้าหมาย: ชุดสมบูรณ์ ${n} ชุด เทียบเป้าขั้นต่ำ ${TARGET_MIN} ชุด = ร้อยละ ${f1(prog.pctOfMin)} (ขาดอีก ${prog.remainingToMin} ชุด) ; เทียบเป้าเต็ม ${TARGET_FULL} ชุด = ร้อยละ ${f1(prog.pctOfFull)} (ขาดอีก ${prog.remainingToFull} ชุด)`, "");
  push(
    `ความคลาดเคลื่อนที่ระดับความเชื่อมั่น 95% (สัดส่วน 0.5): n = ${rel.n} → ${rel.marginOfError === null ? "-" : `±${f1(rel.marginOfError)}`} จุดร้อยละ ; ถ้าครบเป้า ${rel.target} ชุด → ±${rel.marginAtTarget === null ? "-" : f1(rel.marginAtTarget)} จุดร้อยละ`,
    "",
  );
  push("> ตัวอย่างเป็นแบบสะดวก ณ วัดคูหาภิมุข ความคลาดเคลื่อน/ช่วงเชื่อมั่นจึงเป็นเพียงตัวบ่งชี้ความไม่แน่นอนเชิงตัวอย่าง", "");

  // 4.2
  push("## 4.2 ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม", "");
  freqTable(freq(rows, "sur01"), "ช่วงอายุ");
  freqTable(freq(rows, "sur02"), "ที่อยู่อาศัย");
  freqTable(freq(rows, "sur03"), "ผู้ร่วมเดินทาง");
  freqTable(freq(rows, "sur04"), "พาหนะที่ใช้เดินทาง");

  // 4.3
  push("## 4.3 การเดินทางและการรับรู้", "");
  freqTable(freq(rows, "sur05"), "วัตถุประสงค์ในการเดินทาง");
  freqTable(freq(rows, "sur06"), "ช่องทางที่ทำให้รู้จักสถานที่");

  // 4.4
  push("## 4.4 ค่าใช้จ่ายและความสนใจสินค้า/บริการ", "");
  freqTable(freq(rows, "sur07"), "ค่าใช้จ่ายโดยประมาณต่อบุคคล");
  freqTable(multiFreq(rows), "สินค้าและบริการที่สนใจ (เลือกได้หลายข้อ)", true);
  if (q.sur08Conflicts > 0) push(`> หมายเหตุ: มี ${q.sur08Conflicts} ชุดที่ตอบ "ไม่มีความสนใจเป็นพิเศษ" ร่วมกับข้ออื่น ระบบตัดตัวเลือก "ไม่มีความสนใจเป็นพิเศษ" ออกตามกฎข้อมูล`, "");

  // 4.5
  push("## 4.5 ความพึงพอใจและความตั้งใจกลับมา", "");
  const sat = satisfaction(rows);
  tableNo++;
  push(`**ตารางที่ ${tableNo}** แสดงการกระจายคะแนนความพึงพอใจโดยรวม (1 = น้อยที่สุด, 5 = มากที่สุด)`, "");
  push("| คะแนน | จำนวน (คน) | ร้อยละ | ช่วงเชื่อมั่น 95% |", "|---:|---:|---:|---:|");
  for (const d of sat.dist) {
    const ci = wilsonCI(d.count, sat.n);
    push(`| ${d.score} | ${d.count} | ${f1(d.pct)} | ${ci ? `${f1(ci.low)}–${f1(ci.high)}` : "-"} |`);
  }
  push("");
  push(`ฐานการคำนวณ (n) = ${sat.n} คน (ให้คะแนน 1–5) ; ตอบ "ยังไม่สามารถประเมินได้" ${sat.cannotRate} คน ; ไม่ตอบ ${sat.skipped} คน`, "");
  push(
    sat.mean === null
      ? "ตีความ: ไม่มีข้อมูลเพียงพอ"
      : `ตีความ: ค่าเฉลี่ยความพึงพอใจ = ${f2(sat.mean)}${sat.sd === null ? "" : ` (SD = ${f2(sat.sd)} ส่วนเบี่ยงเบนมาตรฐานตัวอย่าง n−1)`} อยู่ในระดับ "${sat.level}"`,
    "",
  );
  freqTable(freq(rows, "sur10"), "ความตั้งใจที่จะกลับมาเยือนอีก");

  // 4.6
  push("## 4.6 เปรียบเทียบผู้ตอบที่อาศัยในจังหวัดยะลากับนอกจังหวัด", "");
  const cs = compareOriginSatisfaction(rows);
  if (cs.ok) {
    tableNo++;
    push(`**ตารางที่ ${tableNo}** แสดงการเปรียบเทียบคะแนนความพึงพอใจเฉลี่ยระหว่างผู้ตอบในจังหวัดยะลากับนอกจังหวัด (Welch t-test)`, "");
    push("| กลุ่ม | n | ค่าเฉลี่ย | SD |", "|---|---:|---:|---:|");
    push(`| ยะลา | ${cs.yala.n} | ${f2(cs.yala.mean)} | ${f2(cs.yala.sd)} |`);
    push(`| นอกจังหวัด | ${cs.outside.n} | ${f2(cs.outside.mean)} | ${f2(cs.outside.sd)} |`, "");
    push(`ผลต่างค่าเฉลี่ย (นอกจังหวัด − ยะลา) = ${f2(cs.diff)} ; t = ${f2(cs.t)}, df = ${f1(cs.df)}, p = ${pStr(cs.p)}${cs.cohenD === null ? "" : `, Cohen's d = ${f2(cs.cohenD)}`}`, "");
    push(`ตีความ: ที่ระดับนัยสำคัญ 0.05 ${cs.significant ? "พบ" : "ไม่พบ"}ความแตกต่างอย่างมีนัยสำคัญทางสถิติของคะแนนเฉลี่ยระหว่างสองกลุ่ม`, "");
  } else {
    push(`**ความพึงพอใจ:** เทียบไม่ได้ — ${cs.reason}`, "");
  }
  const ci2 = compareOriginInterest(rows);
  if (ci2.ok) {
    tableNo++;
    push(`**ตารางที่ ${tableNo}** แสดงจำนวนและร้อยละของผู้ที่สนใจสินค้า/บริการแต่ละหมวด จำแนกตามถิ่นที่อยู่ (ฐาน: ยะลา ${ci2.yalaBase} คน, นอกจังหวัด ${ci2.outsideBase} คน)`, "");
    push("| หมวด | ยะลา จำนวน (ร้อยละ) | นอกจังหวัด จำนวน (ร้อยละ) | ผลต่าง (จุดร้อยละ) | วิธีทดสอบ | p |", "|---|---:|---:|---:|---|---:|");
    for (const c of ci2.categories) {
      push(`| ${c.label} | ${c.yala.count} (${f1(c.yala.pct)}) | ${c.outside.count} (${f1(c.outside.pct)}) | ${c.diffPts >= 0 ? "+" : ""}${f1(c.diffPts)} | ${c.test.method === "fisher" ? "Fisher exact" : "ไคสแควร์"} | ${pStr(c.test.p)}${c.significant ? " *" : ""} |`);
    }
    push("");
    const sig = ci2.categories.filter((c) => c.significant);
    push(`ตีความ: ที่ระดับนัยสำคัญ 0.05 ${sig.length ? `พบความแตกต่างอย่างมีนัยสำคัญในหมวด ${sig.map((c) => c.label).join(", ")}` : "ไม่พบหมวดใดที่แตกต่างอย่างมีนัยสำคัญ"} (* = p < 0.05 ; เทียบ 5 หมวดพร้อมกันโดยไม่ปรับค่า p)`, "");
  } else {
    push(`**ความสนใจสินค้า/บริการ:** เทียบไม่ได้ — ${ci2.reason}`, "");
  }

  // 4.7
  push("## 4.7 ข้อเสนอแนะจากผู้ตอบแบบสอบถาม", "");
  const comments = rows
    .filter((r) => r.sur11 && r.sur11.trim() !== "")
    .map((r) => sanitizeComment(r.sur11 as string))
    .filter((c) => c.length > 0);
  const TRIVIAL = /^(-+|\.+|ไม่มี(ครับ|ค่ะ|คะ)?|ไม่มีข้อเสนอแนะ|none|no|n\/a)$/i;
  const real = comments.filter((c) => !TRIVIAL.test(c));
  push(`มีผู้กรอกช่องข้อเสนอแนะ ${comments.length} คน จากผู้ตอบ ${n} คน (ร้อยละ ${n ? f1((comments.length / n) * 100) : "0.0"}) ; เป็นข้อเสนอแนะที่มีเนื้อหา ${real.length} คน (ที่เหลือกรอก "-" หรือ "ไม่มี")`, "");
  if (real.length) {
    push("ตัวอย่างข้อความ (ไม่เกิน 10 ข้อความ ตัดข้อมูลระบุตัวตนแล้ว):", "");
    real.slice(0, 10).forEach((c, i) => push(`${i + 1}. ${c}`));
    push("");
  }

  // 4.8
  push("## 4.8 ข้อเสนอสำหรับผู้ประกอบการ", "");
  push("ข้อเสนอสร้างจากกฎกำหนดตายตัวใน `lib/survey/insights.ts` ทุกข้อมีหลักฐานตัวเลขและ n กำกับ", "");
  push("### ภาพรวม", "");
  insightBlock(overviewInsights(rows));
  for (const b of BUSINESS_TYPES) {
    push(`### ${b.label}`, "");
    insightBlock(businessInsights(rows, b.key));
  }

  // 4.9
  push("## 4.9 ข้อจำกัดของข้อมูล", "");
  push(`- ${DISCLAIMER}`);
  const moe = marginOfError(n);
  push(`- จำนวนตัวอย่างที่ใช้วิเคราะห์ n = ${n} ชุด ${n < TARGET_MIN ? `ยังไม่ถึงเป้าขั้นต่ำ ${TARGET_MIN} ชุด` : `ถึงเป้าขั้นต่ำ ${TARGET_MIN} ชุดแล้ว`} ; ความคลาดเคลื่อนโดยประมาณ ${moe === null ? "-" : `±${f1(moe)}`} จุดร้อยละ`);
  push("- ตัวอย่างแบบสะดวก (convenience sample) ไม่ใช่การสุ่ม ช่วงเชื่อมั่นและค่า p เป็นตัวบ่งชี้ความไม่แน่นอนเชิงตัวอย่าง ไม่ใช่การอนุมานไปยังนักท่องเที่ยวทั้งหมดอย่างเคร่งครัด");
  push("- กลุ่มย่อยที่มีผู้ตอบน้อยกว่า 5 คนไม่ทดสอบและควรตีความด้วยความระมัดระวัง ; การเทียบหลายหมวดพร้อมกันยังไม่ปรับค่า p");
  push(`- ข้อมูลช่วงที่ใช้: ${thaiDate(prog.firstDate)} ถึง ${thaiDate(prog.lastDate)} (${prog.activeDays} วันที่มีผู้ตอบ)`, "");

  const target = path.resolve(import.meta.dirname ?? ".", "..", "..", outArg);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, out.join("\n") + "\n", { encoding: "utf8" });
  console.log(`✓ เขียน ${target} (${tableNo} ตาราง, n=${n})`);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
