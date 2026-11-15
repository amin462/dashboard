import type { FreqResult, satisfaction } from "@/lib/survey/aggregate";
import { DISCLAIMER, QUESTIONS, type Row } from "@/lib/survey/schema";
import { compareOriginInterest, compareOriginSatisfaction, reliabilitySummary, wilsonCI } from "@/lib/survey/stats";

/** escape ข้อความทุกชิ้นที่ลงใน HTML (ข้อมูลผู้ตอบเป็น untrusted) */
export function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const e = escapeHtml;
const multiline = (s: string) => e(s).replace(/\r?\n/g, "<br>");
const stripNo = (title: string) => title.replace(/^\s*\d+\s*[.)]\s*/, "");

const STYLE = `
  @page WordSection1 { size: 21.0cm 29.7cm; margin: 2.54cm 2.54cm 2.54cm 3.81cm; }
  div.WordSection1 { page: WordSection1; }
  body { font-family: "TH Sarabun New", "THSarabunNew", "Angsana New", "Tahoma", sans-serif; font-size: 16pt; }
  p, li { font-family: "TH Sarabun New", "Angsana New", sans-serif; font-size: 16pt; margin: 0; }
  h1 { font-size: 20pt; font-weight: bold; margin: 0 0 6pt 0; }
  h2 { font-size: 18pt; font-weight: bold; margin: 14pt 0 4pt 0; }
  p.caption { font-weight: bold; margin: 12pt 0 3pt 0; page-break-after: avoid; }
  p.note { font-size: 14pt; margin: 3pt 0 6pt 0; }
  table { border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  th, td { border-top: 1pt solid windowtext; border-bottom: 1pt solid windowtext; border-left: none; border-right: none; padding: 2pt 6pt; font-size: 16pt; vertical-align: top; }
  th { font-weight: bold; text-align: center; }
  td.num { text-align: right; }
`;

function tableHtml(headers: string[], rows: string[][], numericFrom = 1): string {
  const head = `<tr>${headers.map((h) => `<th>${e(h)}</th>`).join("")}</tr>`;
  const body = rows
    .map((r) => `<tr>${r.map((c, i) => `<td${i >= numericFrom ? ' class="num"' : ""}>${e(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table>${head}${body}</table>`;
}

function frequencySection(r: FreqResult, tableNo: number): string {
  const multi = QUESTIONS[r.code].type === "multi";
  const rows = r.items.map((item) => {
    const ci = wilsonCI(item.count, r.base);
    return [item.label, String(item.count), item.pct.toFixed(1), ci ? `${ci.low.toFixed(1)}–${ci.high.toFixed(1)}` : "-"];
  });
  if (!multi) rows.push(["รวม", String(r.items.reduce((s, i) => s + i.count, 0)), r.base > 0 ? "100.0" : "-", ""]);
  const notes = [`n = ${r.base} คน`];
  if (multi) notes.push("ตอบได้หลายข้อ ร้อยละคิดจากจำนวนผู้ตอบข้อนี้ จึงรวมกันเกิน 100 ได้");
  if (r.skipped > 0) notes.push(`ไม่ตอบ ${r.skipped} คน`);
  if (r.notSpecified > 0) notes.push(`ไม่ประสงค์ระบุ/ประเมินไม่ได้ ${r.notSpecified} คน (นับรวมในฐาน)`);
  return (
    `<p class="caption">ตารางที่ ${tableNo} แสดงจำนวนและร้อยละของ${e(stripNo(r.title))}</p>` +
    tableHtml(["ตัวเลือก", "จำนวน (คน)", "ร้อยละ", "ช่วงเชื่อมั่น 95% (%)"], rows) +
    `<p class="note">หมายเหตุ ${e(notes.join(" ; "))}</p>`
  );
}

function statsSection(rows: Row[]): string {
  const rel = reliabilitySummary(rows);
  const sat = compareOriginSatisfaction(rows);
  const interest = compareOriginInterest(rows);
  const parts: string[] = [`<h2>สถิติประกอบการอ่านผล</h2>`];
  parts.push(
    `<p>ความคลาดเคลื่อนของร้อยละที่ความเชื่อมั่น 95%: ${rel.marginOfError === null ? "-" : `± ${rel.marginOfError.toFixed(1)} จุดร้อยละ`} (ผู้ตอบ ${rel.n} คน)</p>`,
  );
  if (sat.ok) {
    parts.push(`<p class="caption">เปรียบเทียบความพึงพอใจ ผู้ตอบจากจังหวัดยะลากับนอกจังหวัด (Welch t-test)</p>`);
    parts.push(
      tableHtml(
        ["กลุ่ม", "n", "ค่าเฉลี่ย", "SD"],
        [
          ["ยะลา", String(sat.yala.n), sat.yala.mean.toFixed(2), sat.yala.sd.toFixed(2)],
          ["นอกจังหวัด", String(sat.outside.n), sat.outside.mean.toFixed(2), sat.outside.sd.toFixed(2)],
        ],
      ),
    );
    parts.push(
      `<p class="note">t = ${sat.t.toFixed(2)}, df = ${sat.df.toFixed(1)}, p = ${sat.p.toFixed(4)} : ${
        sat.significant ? "แตกต่างกันอย่างมีนัยสำคัญทางสถิติที่ระดับ .05" : "ไม่พบความแตกต่างอย่างมีนัยสำคัญทางสถิติที่ระดับ .05"
      }</p>`,
    );
  } else {
    parts.push(`<p>เปรียบเทียบความพึงพอใจ ยะลา กับ นอกจังหวัด: ${e(sat.reason)}</p>`);
  }
  if (interest.ok) {
    parts.push(`<p class="caption">เปรียบเทียบความสนใจสินค้า/บริการ ผู้ตอบจากจังหวัดยะลากับนอกจังหวัด</p>`);
    parts.push(
      tableHtml(
        ["หมวด", "ยะลา (%)", "นอกจังหวัด (%)", "ส่วนต่าง (จุด)", "วิธีทดสอบ", "p-value", "มีนัยสำคัญ"],
        interest.categories.map((c) => [
          c.label,
          c.yala.pct.toFixed(1),
          c.outside.pct.toFixed(1),
          c.diffPts.toFixed(1),
          c.test.method === "fisher" ? "Fisher exact" : "ไคสแควร์",
          c.test.p.toFixed(4),
          c.significant ? "ใช่" : "ไม่",
        ]),
      ),
    );
    parts.push(`<p class="note">n ยะลา = ${interest.yalaBase} คน ; n นอกจังหวัด = ${interest.outsideBase} คน ; ส่วนต่าง = นอกจังหวัด ลบ ยะลา</p>`);
  } else {
    parts.push(`<p>เปรียบเทียบความสนใจสินค้า/บริการ ยะลา กับ นอกจังหวัด: ${e(interest.reason)}</p>`);
  }
  return parts.join("");
}

/**
 * สร้าง HTML สำหรับ Word (.doc) ของบทที่ 4 : ตารางจำนวน/ร้อยละ/ช่วงเชื่อมั่นต่อข้อ
 * ค่าทั้งหมดมาจาก lib/survey (ไม่คำนวณสถิติเองที่นี่) ; ข้อความทุกชิ้น escape แล้ว
 * rows ไม่ส่ง = ไม่ใส่ส่วนสถิติเปรียบเทียบ
 */
export function buildReportWordHtml(
  results: FreqResult[],
  sat: ReturnType<typeof satisfaction>,
  comments: Row[],
  totalFiltered: number,
  filterSummary: string,
  rows?: Row[],
): string {
  const body: string[] = [
    `<h1>${e("รายงานสรุปผลแบบสำรวจนักท่องเที่ยว ณ วัดคูหาภิมุข (อำเภอเมืองยะลา)")}</h1>`,
    `<p>จำนวนผู้ตอบสมบูรณ์ตามตัวกรอง ${e(totalFiltered)} คน</p>`,
    `<p>ตัวกรองที่ใช้: ${e(filterSummary || "ไม่มี (แสดงทั้งหมด)")}</p>`,
    `<p>ความพึงพอใจเฉลี่ย ${sat.mean !== null ? sat.mean.toFixed(2) : "-"} (SD ${sat.sd !== null ? sat.sd.toFixed(2) : "-"}) ระดับ${e(
      sat.level ?? "-",
    )} จากผู้ให้คะแนน ${e(sat.n)} คน</p>`,
    `<p class="note">${e(DISCLAIMER)}</p>`,
  ];
  results.forEach((r, i) => body.push(frequencySection(r, i + 1)));
  if (rows) body.push(statsSection(rows));
  if (comments.length > 0) {
    body.push(`<h2>ข้อเสนอแนะเพิ่มเติม (${e(comments.length)} รายการ)</h2>`);
    body.push(`<ol>${comments.map((c) => `<li>${multiline(c.sur11 ?? "")}</li>`).join("")}</ol>`);
  }
  body.push(`<p class="note">หมายเหตุ ${e(DISCLAIMER)}</p>`);

  return (
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8">` +
    `<title>${e("รายงานสรุปผลแบบสำรวจ")}</title>` +
    `<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->` +
    `<style>${STYLE}</style></head>` +
    `<body lang="TH"><div class="WordSection1">${body.join("\n")}</div></body></html>`
  );
}

const BOM = String.fromCharCode(0xfeff);

/** ดาวน์โหลดเป็นไฟล์ .doc (HTML ที่ Word เปิดได้) */
export function downloadWord(html: string, fileName: string): void {
  const blob = new Blob([BOM + html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
