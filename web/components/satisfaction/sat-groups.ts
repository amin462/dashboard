import { satisfaction, type SatResult } from "@/lib/survey/aggregate";
import { applyFilters, type Filters } from "@/lib/survey/filters";
import { QUESTIONS, type Row } from "@/lib/survey/schema";

export type SatGroup = {
  label: string;
  /** บรรทัดรองใต้ชื่อกลุ่ม (รายชื่อจังหวัดที่รวมอยู่) */
  sub?: string;
  /** คะแนนของกลุ่มจาก satisfaction() ของ lib */
  sat: SatResult;
};

type GroupDef = { label: string; sub?: string; filters: Filters };

/** 3 กลุ่มถิ่นพำนัก (ไม่นับ "ไม่ประสงค์ระบุ") */
const ORIGIN_DEFS: GroupDef[] = [
  { label: "ยะลา", filters: { origin: ["จังหวัดยะลา"] } },
  {
    label: "จังหวัดใกล้เคียง",
    sub: "ปัตตานี · นราธิวาส · สงขลา",
    filters: { origin: ["จังหวัดปัตตานี", "จังหวัดนราธิวาส", "จังหวัดสงขลา"] },
  },
  {
    label: "จังหวัดอื่น + ต่างประเทศ",
    sub: "จังหวัดอื่นในประเทศไทย · ต่างประเทศ",
    filters: { origin: ["จังหวัดอื่นในประเทศไทย", "ต่างประเทศ"] },
  },
];

const COMPANION_DEFS: GroupDef[] = QUESTIONS.sur03.choices
  .filter((c) => !QUESTIONS.sur03.notSpecified?.includes(c))
  .map((c) => ({ label: c, filters: { companion: [c] } }));

/** แบ่งแถวที่กรองแล้วด้วย applyFilters() แล้วหาค่าเฉลี่ยของแต่ละกลุ่มด้วย satisfaction() (ไม่คำนวณเอง) */
function build(rows: Row[], defs: GroupDef[]): SatGroup[] {
  return defs.map((d) => ({ label: d.label, sub: d.sub, sat: satisfaction(applyFilters(rows, d.filters)) }));
}

export const satByOrigin = (rows: Row[]) => build(rows, ORIGIN_DEFS);
export const satByCompanion = (rows: Row[]) => build(rows, COMPANION_DEFS);
