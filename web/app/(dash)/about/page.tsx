import type { Metadata } from "next";
import { Bot, ClipboardCheck, Database, Info, Scale, ShieldCheck, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { collectionProgress } from "@/lib/survey/aggregate";
import { DISCLAIMER, SMALL_N, TARGET_FULL, TARGET_MIN } from "@/lib/survey/schema";
import { CollectionProgressCard } from "@/components/overview/CollectionProgressCard";
import { DashRoute } from "../_route";

export const metadata: Metadata = {
  title: "เกี่ยวกับงานวิจัย",
  description: "ที่มา วัตถุประสงค์ วิธีเก็บข้อมูล ข้อจำกัด และความเป็นส่วนตัวของแดชบอร์ดผลสำรวจนักท่องเที่ยววัดคูหาภิมุข",
};

// ชื่อผู้จัดทำ/อาจารย์ที่ปรึกษา: ตั้งผ่าน env (ไม่ตั้ง = ไม่แสดง) เช่น "จัดทำโดย … · อาจารย์ที่ปรึกษา …"
const CREDIT = process.env.NEXT_PUBLIC_RESEARCH_CREDIT;

function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 type-section">
        <span className="text-amber">{icon}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-2 leading-7 text-ink-2">{children}</div>
    </section>
  );
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-ink-2">
        แดชบอร์ดนี้เป็นส่วนหนึ่งของโครงการวิจัยแดชบอร์ดวิเคราะห์ข้อมูลนักท่องเที่ยว (กรณีศึกษาวัดคูหาภิมุข อ.เมืองยะลา) คณะวิทยาการจัดการ
        มหาวิทยาลัยราชภัฏยะลา ปี 2569
        {CREDIT ? ` · ${CREDIT}` : ""}
      </p>

      <DashRoute render={({ rows, totalAll }) => <CollectionProgressCard progress={collectionProgress(rows)} totalSubmitted={totalAll} />} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Block icon={<Info className="h-5 w-5" aria-hidden="true" />} title="ที่มาและวัตถุประสงค์">
          <p>
            ผู้ประกอบการท้องถิ่นรอบวัดคูหาภิมุขมักตัดสินใจจากประสบการณ์ ทั้งที่มีข้อมูลผู้มาเยือนที่ช่วยได้ เช่น ลูกค้าเป็นใคร มาช่วงไหน ใช้จ่ายเท่าไร
            และรู้จักสถานที่จากช่องทางใด
          </p>
          <List
            items={[
              "สรุปผลแบบสำรวจนักท่องเที่ยวให้อ่านง่ายสำหรับผู้ประกอบการ 4 กลุ่ม: ร้านอาหารและเครื่องดื่ม โรงแรม/ที่พัก/โฮมสเตย์ ร้านค้า/ของฝาก และนำเที่ยว/ขนส่ง",
              "ให้ข้อเสนอเบื้องต้นที่อ้างอิงตัวเลขจริงจากผู้ตอบ พร้อมแสดงฐานจำนวนผู้ตอบทุกครั้ง",
              "ลดภาระการนั่งรวมข้อมูลเองในกระดาษหรือไฟล์ Excel",
            ]}
          />
        </Block>

        <Block icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />} title="เก็บข้อมูลอย่างไร">
          <List
            items={[
              "นักท่องเที่ยวสแกน QR ที่วัดคูหาภิมุข แล้วตอบแบบสำรวจออนไลน์ (Google Form) ข้อคำถาม 11 ข้อ",
              "มีข้อคัดกรองก่อนตอบ: อายุ 18 ปีขึ้นไป และกำลังมาเยี่ยมชมเพื่อการท่องเที่ยว/เยี่ยมชมสถานที่ รวมถึงต้องยินยอมเข้าร่วมโดยสมัครใจ",
              `เลือกกลุ่มตัวอย่างแบบสะดวก (ผู้ที่สะดวกตอบ) เป้าหมายขั้นต่ำ ${TARGET_MIN} ชุด และเป้าเต็ม ${TARGET_FULL} ชุด`,
              "ระบบนับเฉพาะผู้ตอบที่สมบูรณ์ คือผ่านคัดกรอง ยินยอม และตอบข้อบังคับ (ข้อ 1–4) ครบ",
            ]}
          />
        </Block>

        <Block icon={<Database className="h-5 w-5" aria-hidden="true" />} title="ข้อมูลมาถึงหน้าจอได้อย่างไร">
          <p>
            คำตอบที่ส่งจาก Google Form จะถูกส่งเข้าฐานข้อมูล (Supabase) อัตโนมัติ แล้วแดชบอร์ดอ่านมาคำนวณและแสดงผลใหม่ภายในประมาณ 1 นาที
            ตัวเลขทุกค่าบนหน้าจอคำนวณโดยระบบกลางชุดเดียวกัน ไม่ได้พิมพ์ใส่ด้วยมือ
          </p>
        </Block>

        <Block icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />} title="ความเป็นส่วนตัว">
          <List
            items={[
              "แบบสำรวจไม่ถามชื่อ เบอร์โทร อีเมล หรือข้อมูลที่ระบุตัวตนของผู้ตอบ",
              "ผู้เข้าชมแดชบอร์ดเห็นเฉพาะสถิติสรุป ไม่เห็นคำตอบรายบุคคล และไม่ต้องสมัครสมาชิก",
              "เฉพาะผู้ดูแลระบบ (ใช้รหัสผ่าน) เท่านั้นที่นำเข้าและตรวจคุณภาพข้อมูลได้",
            ]}
          />
        </Block>

        <Block icon={<Scale className="h-5 w-5" aria-hidden="true" />} title="อ่านผลอย่างไรให้ถูกต้อง และข้อจำกัด">
          <List
            items={[
              DISCLAIMER,
              "ร้อยละคิดจากจำนวนผู้ตอบข้อนั้นจริง (ฐาน n) ซึ่งแสดงไว้ใต้ทุกกราฟ ข้อที่ตอบได้หลายข้อ (ข้อ 8) รวมกันเกิน 100% ได้",
              `เมื่อฐาน n น้อยกว่า ${SMALL_N} ระบบจะขึ้นป้ายเตือนว่าจำนวนน้อย ตีความด้วยความระมัดระวัง ยิ่งผู้ตอบน้อย ตัวเลขยิ่งเปลี่ยนง่ายเมื่อมีผู้ตอบเพิ่ม`,
              "ข้อเสนอสำหรับธุรกิจเป็นข้อสังเกตเบื้องต้นจากข้อมูลสำรวจ ไม่ใช่คำรับประกันรายได้หรือผลลัพธ์",
            ]}
          />
        </Block>

        <Block icon={<Bot className="h-5 w-5" aria-hidden="true" />} title="ผู้ช่วย AI">
          <List
            items={[
              "ผู้ช่วย AI (ปุ่ม “ถามผู้ช่วย”) ตอบจากสถิติสรุปของแดชบอร์ดนี้เท่านั้น และถูกกำหนดให้ไม่แต่งตัวเลข",
              "ระบบส่งเฉพาะสถิติสรุปให้บริการ Google Gemini ไม่ส่งคำตอบรายบุคคล และไม่บันทึกบทสนทนา",
              "AI อาจเข้าใจหรือสรุปผิดพลาดได้ ควรเทียบตัวเลขกับกราฟในหน้าจออีกครั้งก่อนตัดสินใจ",
            ]}
          />
        </Block>

        <Block icon={<Wrench className="h-5 w-5" aria-hidden="true" />} title="เทคโนโลยีที่ใช้">
          <p>Next.js (React) · Supabase (PostgreSQL) · Recharts · Google Forms / Apps Script · Vercel</p>
        </Block>
      </div>
    </div>
  );
}
