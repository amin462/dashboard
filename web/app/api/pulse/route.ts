import { dataVersion } from "../../(dash)/_data";

// ตรวจว่ามีข้อมูลใหม่หรือยัง (เบามาก: ส่งแค่ "เวอร์ชัน" ไม่ส่งแถวข้อมูล/ข้อมูลส่วนบุคคล)
// ใช้แคชข้อมูลชุดเดียวกับหน้าเว็บ (revalidate 15 วินาที) → ผู้ชมหลายคนไม่ทำให้ฐานข้อมูลถูกเรียกถี่ขึ้น
export async function GET() {
  const version = await dataVersion();
  return Response.json({ version }, { headers: { "cache-control": "no-store" } });
}
