import type { FreqResult, satisfaction } from "@/lib/survey/aggregate";
import { DISCLAIMER, type Row } from "@/lib/survey/schema";

function escapeCell(value: string | number, sanitizeFormula: boolean): string {
  let str = String(value);
  // กัน CSV/formula injection ในคอลัมน์ข้อความอิสระ
  if (sanitizeFormula && /^[=+\-@\t\r]/.test(str)) str = `'${str}`;
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/** สร้าง CSV รายงาน (ความถี่ทุกข้อ + ข้อเสนอแนะ) จากผลของ lib/survey */
export function buildReportCsv(
  results: FreqResult[],
  sat: ReturnType<typeof satisfaction>,
  comments: Row[],
  totalFiltered: number,
  filterSummary: string,
): string {
  const lines: string[][] = [
    ["รายงานสรุปผลแบบสำรวจนักท่องเที่ยว ณ วัดคูหาภิมุข (อำเภอเมืองยะลา)"],
    ["จำนวนผู้ตอบสมบูรณ์ตามตัวกรอง (คน)", String(totalFiltered)],
    ["ตัวกรองที่ใช้", filterSummary || "ไม่มี (แสดงทั้งหมด)"],
    [
      "ความพึงพอใจเฉลี่ย (1-5)",
      sat.mean !== null ? sat.mean.toFixed(2) : "-",
      "SD",
      sat.sd !== null ? sat.sd.toFixed(2) : "-",
      "ระดับ",
      sat.level ?? "-",
      "ผู้ให้คะแนน 1-5 (คน)",
      String(sat.n),
    ],
    ["จำนวนข้อเสนอแนะที่เป็นข้อความ (ข้อ 11)", String(comments.length)],
    ["หมายเหตุ", DISCLAIMER],
    [],
    ["รหัสข้อ", "หัวข้อคำถาม", "ตัวเลือก", "จำนวน (คน)", "ร้อยละ (%)", "ฐานผู้ตอบข้อนี้ (คน)", "ไม่ตอบ (คน)", "ไม่ประสงค์ระบุ (คน)"],
  ];

  for (const r of results) {
    for (const item of r.items) {
      lines.push([
        r.code.toUpperCase(),
        r.title,
        item.label,
        String(item.count),
        item.pct.toFixed(1),
        String(r.base),
        String(r.skipped),
        String(r.notSpecified),
      ]);
    }
  }

  if (comments.length > 0) {
    lines.push([]);
    lines.push(["ข้อเสนอแนะเพิ่มเติม (SUR-11)", "วันที่", "ช่วงเวลา", "คะแนนความพึงพอใจ"]);
    for (const c of comments) lines.push([c.sur11 ?? "", c.date, c.slot, c.sat !== null ? String(c.sat) : "-"]);
  }

  return lines.map((row, ri) => row.map((cell, ci) => escapeCell(cell, ri > 7 && ci === 0)).join(",")).join("\r\n");
}

const BOM = String.fromCharCode(0xfeff);

/** ดาวน์โหลดไฟล์ CSV (ใส่ UTF-8 BOM ให้ Excel อ่านภาษาไทยถูก) */
export function downloadCsv(csv: string, fileName: string): void {
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
