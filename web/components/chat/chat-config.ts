export type BusinessKey = "restaurant" | "hotel" | "shop" | "tour";

/** ตัวเลือกประเภทธุรกิจในแชต (key ตรงกับ BUSINESS_TYPES ของ lib/survey) ; null = ยังไม่แน่ใจ/อื่น ๆ */
export const BUSINESS_CHOICES: { key: BusinessKey | null; label: string }[] = [
  { key: "restaurant", label: "ร้านอาหาร / เครื่องดื่ม" },
  { key: "hotel", label: "ที่พัก / โฮมสเตย์" },
  { key: "shop", label: "ร้านค้า / ของฝาก" },
  { key: "tour", label: "นำเที่ยว / ขนส่ง" },
  { key: null, label: "อื่น ๆ / ยังไม่แน่ใจ" },
];

const GENERAL = [
  "ลูกค้าส่วนใหญ่เป็นใคร",
  "ลูกค้าใช้จ่ายเท่าไรต่อคน",
  "ลูกค้าสนใจซื้ออะไรมากที่สุด",
  "ควรโฆษณาช่องทางไหน",
  "ลูกค้าพอใจมากแค่ไหน",
];

const PAGE_HINT: Record<string, string> = {
  "/": "อธิบายหน้าภาพรวมให้ฟังหน่อย",
  "/visitors": "อธิบายหน้านี้ให้ฟังหน่อย",
  "/travel": "อธิบายหน้านี้ให้ฟังหน่อย",
  "/awareness": "อธิบายหน้านี้ให้ฟังหน่อย",
  "/spending": "อธิบายหน้านี้ให้ฟังหน่อย",
  "/satisfaction": "อธิบายหน้านี้ให้ฟังหน่อย",
  "/business": "อธิบายหน้านี้ให้ฟังหน่อย",
};

/** ปุ่มคำถามสำเร็จรูป: คำถามอธิบายหน้าที่เปิดอยู่ (ถ้ามี) + คำถามทั่วไป */
export function quickQuestions(pathname: string): string[] {
  const hint = PAGE_HINT[pathname];
  return hint ? [hint, ...GENERAL] : GENERAL;
}

export const FOLLOW_UPS = ["อธิบายให้ง่ายกว่านี้หน่อย", "ขอตัวอย่างที่ทำได้จริง", "ตัวเลขนี้มาจากกี่คน"];
