import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  BookOpen,
  ChevronDown,
  Compass,
  Filter,
  Gift,
  HelpCircle,
  Info,
  Lightbulb,
  SlidersHorizontal,
  Store,
  Utensils,
} from "lucide-react";
import { SmallSampleBadge } from "@/components/SmallSampleBadge";
import { INSIGHT_DISCLAIMER, THRESHOLDS } from "@/lib/survey/insights";
import {
  DISCLAIMER,
  SMALL_N,
  TARGET_FULL,
  TARGET_MIN,
} from "@/lib/survey/schema";

export const metadata: Metadata = {
  title: "คู่มือผู้ประกอบการ (วิธีอ่านและใช้ข้อมูล)",
  description:
    "คู่มือภาษาไทยเข้าใจง่ายสำหรับเจ้าของร้านอาหาร ที่พัก ของฝาก และนำเที่ยว เพื่ออ่านกราฟ ใช้ตัวกรอง และตัดสินใจจากผลสำรวจวัดคูหาภิมุข",
};

const QUICK_LINKS = [
  { href: "#about", label: "ระบบนี้คืออะไร" },
  { href: "#read-charts", label: "วิธีอ่านกราฟ" },
  { href: "#filters", label: "การใช้ตัวกรอง" },
  { href: "#examples", label: "ตัวอย่าง 4 ธุรกิจ" },
  { href: "#limits", label: "ข้อจำกัดข้อมูล" },
  { href: "#faq", label: "คำถามพบบ่อย" },
];

const DECISION_EXAMPLES = [
  {
    key: "restaurant",
    title: "ร้านอาหารและเครื่องดื่ม",
    icon: Utensils,
    tone: "bg-brand-soft text-brand-ink",
    ifSee:
      "กลุ่ม “ครอบครัว / เครือญาติ” มาเยอะที่สุด และช่วงเวลาที่มาเยือนหนาแน่นที่สุดคือช่วงเช้า (06–11 น.) หรือบ่าย (12–15 น.)",
    tryDo:
      "จัดเมนูชุดสำหรับครอบครัว เตรียมโต๊ะใหญ่หรือที่นั่งรองรับหลายคน และเตรียมวัตถุดิบ/พนักงานให้พร้อมก่อนช่วงเวลานั้น",
  },
  {
    key: "hotel",
    title: "โรงแรม / ที่พัก / โฮมสเตย์",
    icon: BedDouble,
    tone: "bg-accent-soft text-accent-ink",
    ifSee: `สัดส่วนผู้ตอบที่มาจากนอกจังหวัดยะลาตั้งแต่ ${THRESHOLDS.hotelOutsideYalaPct}% ขึ้นไป และมีกลุ่มที่ใช้จ่ายมากกว่า 1,000 บาทชัดเจน`,
    tryDo:
      "โปรโมตแพ็กเกจพักค้างคืน แนะนำจุดแวะเที่ยวต่อในอำเภอเมืองยะลา และเน้นช่องทางจองที่สะดวกสำหรับคนต่างจังหวัด",
  },
  {
    key: "shop",
    title: "ร้านค้า / ของฝาก / ผลิตภัณฑ์ชุมชน",
    icon: Gift,
    tone: "bg-brand-soft text-brand-ink",
    ifSee: `ผู้ตอบส่วนใหญ่ (มากกว่า ${THRESHOLDS.shopLowSpendPct}%) มีค่าใช้จ่ายรวมไม่เกิน 600 บาท และมาเพื่อทำบุญหรือท่องเที่ยวเชิงวัฒนธรรม`,
    tryDo:
      "เน้นสินค้าและชุดของฝากที่หยิบซื้อง่ายในราคาไม่เกิน 300 บาท จัดเป็นแพ็กของฝากพร้อมมอบหรือสินค้าระลึกถึงวัดหน้าถ้ำ",
  },
  {
    key: "tour",
    title: "นำเที่ยว / บริการเดินทาง / ขนส่ง",
    icon: Compass,
    tone: "bg-accent-soft text-accent-ink",
    ifSee: `ผู้ตอบที่ไม่ใช้รถส่วนตัว (รถโดยสาร / รถเช่า / รถทัวร์) มีตั้งแต่ ${THRESHOLDS.tourNoPrivateVehiclePct}% ขึ้นไป หรือสนใจบริการเดินทางและนำเที่ยวสูง`,
    tryDo:
      "เปิดบริการรับ-ส่งจากจุดเชื่อมต่อในเมือง หรือจัดแพ็กเกจนำเที่ยวสั้น ๆ ที่พาชมประวัติศาสตร์และจุดเด่นรอบวัดคูหาภิมุข",
  },
];

const FAQS = [
  {
    q: "1. เจ้าของร้านต้องสมัครสมาชิกหรือเข้าสู่ระบบก่อนใช้งานไหม?",
    a: "ไม่ต้องครับ ทุกหน้าวิเคราะห์ข้อมูล (ตั้งแต่ภาพรวมจนถึงรายงานส่งออก) เปิดให้ผู้ประกอบการเข้ามาอ่านและใช้ตัวกรองได้ทันที ส่วนระบบรหัสผ่านมีไว้เฉพาะสำหรับผู้ดูแลระบบที่หน้า “นำเข้าข้อมูล” และ “คุณภาพข้อมูล” เท่านั้น",
  },
  {
    q: "2. ทำไมตัวเลข “ฐาน n” ในแต่ละกราฟถึงไม่เท่ากัน?",
    a: "เพราะข้อ 1–4 เป็นคำถามบังคับที่ทุกคนต้องตอบ ส่วนข้อ 5–11 เป็นข้อไม่บังคับ ผู้ตอบบางคนอาจข้ามบางข้อไป ระบบจึงนับจำนวน “ผู้ที่ตอบข้อนั้นจริง ๆ” เป็นฐาน n ของแต่ละกราฟ เพื่อให้ค่าร้อยละสะท้อนสัดส่วนของผู้ตอบในข้อนี้อย่างตรงไปตรงมา",
  },
  {
    q: "3. หมวด “อื่น ๆ” ในกราฟมาจากไหน และดูรายละเอียดได้ที่ไหน?",
    a: "มาจากคำตอบที่ผู้ตอบแบบสำรวจพิมพ์ข้อความเพิ่มเติมเองนอกเหนือจากตัวเลือกมาตรฐาน (หรือข้อความจากแบบฟอร์มรุ่นก่อนปรับปรุง) ระบบจะรวมจำนวนเป็นหมวด “อื่น ๆ” บนกราฟ และแสดงข้อความทั้งหมดไว้ในกรอบด้านล่างของกราฟข้อนั้น ๆ",
  },
  {
    q: "4. ทำไมบางครั้งหน้า “มุมมองตามประเภทธุรกิจ” ไม่แสดงคำแนะนำหรือเตือนจำนวนน้อย?",
    a: `เพื่อป้องกันการตัดสินใจผิดพลาดจากตัวเลขที่น้อยเกินไป ถ้านักท่องเที่ยวตามตัวกรองที่เลือกมีน้อยกว่า ${SMALL_N} คน ระบบจะแสดงป้ายเตือน “${"จำนวนน้อย ตีความด้วยความระมัดระวัง"}” และงดแสดงข้อเสนอเบื้องต้นในส่วนที่ข้อมูลยังไม่ถึงเกณฑ์`,
  },
  {
    q: "5. อยากนำตารางตัวเลขไปเปิดใน Excel หรือพิมพ์แจกทีมงานต้องทำอย่างไร?",
    a: "ไปที่หน้า “รายงาน & ส่งออก” (/reports) แล้วกดปุ่ม “ส่งออก CSV” ไฟล์จะถูกสร้างพร้อมรหัสภาษาไทยที่เปิดใน Microsoft Excel ได้ทันทีโดยตัวอักษรไม่เพี้ยน หรือกดปุ่ม “พิมพ์ / บันทึก PDF” เพื่อจัดหน้ากระดาษขนาด A4 อัตโนมัติ",
  },
];

const SAT_LEVELS = [
  { range: "4.21 – 5.00", label: "มากที่สุด", tone: "bg-brand text-white dark:bg-[#0d736b]" },
  {
    range: "3.41 – 4.20",
    label: "มาก",
    tone: "bg-brand-soft text-brand-ink border border-brand/25",
  },
  {
    range: "2.61 – 3.40",
    label: "ปานกลาง",
    tone: "bg-accent-soft text-accent-ink border border-accent-border",
  },
  {
    range: "1.81 – 2.60",
    label: "น้อย",
    tone: "bg-surface-muted text-ink-secondary border border-line",
  },
  {
    range: "1.00 – 1.80",
    label: "น้อยที่สุด",
    tone: "bg-danger-soft text-danger border border-danger/20",
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="print-card rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-brand uppercase">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>คู่มือการใช้งานสำหรับผู้ประกอบการ</span>
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
              วิธีอ่านกราฟและใช้ข้อมูลเพื่อช่วยตัดสินใจ
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
              สรุปวิธีใช้งานแบบเข้าใจง่ายสำหรับเจ้าของร้านอาหาร ที่พัก ร้านของฝาก และบริการนำเที่ยวในอำเภอเมืองยะลา อ่านจบและนำไปใช้ดูตัวเลขจริงได้ทันที
            </p>
          </div>

          <div className="no-print flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-3.5 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <span>กลับหน้าภาพรวม</span>
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover dark:bg-[#0d736b] dark:hover:bg-[#0f857b]"
            >
              <span>ดูมุมมองธุรกิจของฉัน</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* สารบัญด่วนบนมือถือและเดสก์ท็อป */}
        <nav
          aria-label="หัวข้อในคู่มือ"
          className="no-print mt-4 flex flex-wrap gap-2 border-t border-line/70 pt-4"
        >
          {QUICK_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-line bg-surface-subtle px-3 py-1 text-xs font-semibold text-ink-secondary transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* 1. ระบบนี้คืออะไร & ข้อมูลมาจากไหน */}
      <section id="about" className="scroll-mt-36 space-y-3">
        <h2 className="text-lg font-bold text-ink">
          1. ระบบนี้คืออะไร และข้อมูลมาจากไหน
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="print-card rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Store className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold text-ink">
                ระบบนี้ช่วยอะไรเจ้าของร้านได้บ้าง
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              แดชบอร์ดนี้รวบรวมคำตอบจากนักท่องเที่ยวมาสรุปเป็นตัวเลขและคำแนะนำเบื้องต้น เพื่อให้ผู้ประกอบการเห็นภาพชัดว่า{" "}
              <strong className="font-semibold text-ink">
                ลูกค้าส่วนใหญ่เป็นใคร มาช่วงเวลาไหน ใช้จ่ายเท่าไหร่ รู้จักสถานที่จากช่องทางใด และกำลังมองหาสินค้า/บริการอะไร
              </strong>{" "}
              โดยไม่ต้องนั่งรวมข้อมูลเองในกระดาษหรือไฟล์ Excel
            </p>
          </article>

          <article className="print-card rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                <Info className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold text-ink">
                ข้อมูลมาจากแบบสำรวจ ณ วัดคูหาภิมุข
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              ข้อมูลมาจากการตอบแบบสำรวจออนไลน์ของผู้ที่มาเยือน{" "}
              <strong className="font-semibold text-ink">
                วัดคูหาภิมุข (วัดหน้าถ้ำ) อำเภอเมืองยะลา
              </strong>{" "}
              โดยระบบคัดเฉพาะชุดคำตอบที่ผ่านการคัดกรองเบื้องต้น ยินยอมให้ข้อมูล และตอบคำถามหลัก (ข้อ 1–4) ครบถ้วนเท่านั้น (ตั้งเป้าหมายขั้นต่ำ{" "}
              <span className="tabular-nums font-semibold text-ink">
                {TARGET_MIN}
              </span>{" "}
              คน / เป้าเต็ม{" "}
              <span className="tabular-nums font-semibold text-ink">
                {TARGET_FULL}
              </span>{" "}
              คน)
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              * หากด้านบนหน้าจอมีป้าย <strong className="text-accent-ink">“ข้อมูลตัวอย่าง”</strong> แสดงว่าระบบกำลังใช้ข้อมูลจำลอง 300 ชุดเพื่อสาธิตการใช้งาน
            </p>
          </article>
        </div>
      </section>

      {/* 2. อ่านกราฟอย่างไร */}
      <section id="read-charts" className="scroll-mt-36 space-y-3">
        <h2 className="text-lg font-bold text-ink">
          2. อ่านกราฟและตัวเลขอย่างไรให้ถูกต้อง
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="print-card rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-base font-bold text-ink">
              ฐาน n, ไม่ตอบ และ ไม่ประสงค์ระบุ ต่างกันอย่างไร
            </h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl border border-line/80 bg-surface-subtle p-3">
                <dt className="font-bold text-brand-ink">
                  ฐาน n = X คน (ตัวหารร้อยละ)
                </dt>
                <dd className="mt-1 text-ink-secondary">
                  คือจำนวนผู้ตอบคำถามข้อนั้นจริง ๆ (ไม่รวมคนที่ข้ามไม่ตอบ) ทุกกราฟจะระบุไว้ที่แถบด้านล่างเสมอ เช่น{" "}
                  <span className="tabular-nums font-medium text-ink">
                    ฐาน n = 276 คน · ไม่ตอบ 12 คน · ไม่ประสงค์ระบุ 5 คน
                  </span>
                </dd>
              </div>
              <div className="rounded-xl border border-line/80 bg-surface-subtle p-3">
                <dt className="font-bold text-ink">
                  ไม่ตอบ (ข้าม) vs ไม่ประสงค์ระบุ
                </dt>
                <dd className="mt-1 text-ink-secondary">
                  <strong>ไม่ตอบ</strong> คือเว้นว่างไม่กดเลือกเลย (ไม่นับในฐาน n) ส่วน{" "}
                  <strong>ไม่ประสงค์ระบุ / ยังประเมินไม่ได้</strong> คือผู้ตอบกดเลือกตัวเลือกนั้นเอง (นับรวมในฐาน n เพื่อให้เห็นสัดส่วนครบถ้วน)
                </dd>
              </div>
            </dl>
          </article>

          <article className="print-card rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-base font-bold text-ink">
              ข้อที่เลือกได้หลายคำตอบ & ป้ายเตือนข้อมูลน้อย
            </h3>
            <div className="mt-3 space-y-3 text-sm text-ink-secondary">
              <div className="rounded-xl border border-line/80 bg-surface-subtle p-3">
                <p className="font-bold text-ink">
                  ทำไมข้อ 8 “สินค้าและบริการที่สนใจ” ร้อยละเกิน 100% ได้?
                </p>
                <p className="mt-1">
                  เพราะผู้ตอบ 1 คนเลือกได้มากกว่า 1 อย่าง (เช่น สนใจทั้งอาหารและของฝาก) ระบบคิดร้อยละจาก{" "}
                  <strong>จำนวนคนที่ตอบข้อ 8</strong> ผลรวมร้อยละทุกแท่งจึงเกิน 100% ได้
                </p>
              </div>

              <div className="rounded-xl border border-accent-border bg-accent-soft/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-accent-ink">
                    เมื่อเห็นป้ายเตือนนี้:
                  </span>
                  <SmallSampleBadge n={3} />
                </div>
                <p className="mt-1.5 text-accent-ink">
                  แปลว่ากลุ่มที่ดูอยู่มีข้อมูลน้อยกว่า {SMALL_N} คน ตัวเลขร้อยละอาจเปลี่ยนมากหากมีคนตอบเพิ่มเพียงไม่กี่คน จึงควรอ่านอย่างระมัดระวัง
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* เกณฑ์แปลผลความพึงพอใจ */}
        <article className="print-card rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-ink">
              วิธีอ่านคะแนนความพึงพอใจ (ข้อ 9)
            </h3>
            <span className="rounded-full border border-line bg-surface-subtle px-3 py-0.5 text-xs font-semibold text-ink-secondary">
              ประเมิน “สถานที่วัดคูหาภิมุข” (ไม่ใช่ประเมินเว็บ)
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-secondary">
            ค่าเฉลี่ย (Mean) คำนวณจากผู้ให้คะแนน 1–5 เท่านั้น (ผู้ที่เลือก “ยังไม่สามารถประเมินได้” จะแยกแสดงจำนวนไว้ต่างหาก) โดยมีเกณฑ์แปลผล 5 ระดับดังนี้:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SAT_LEVELS.map((lv) => (
              <div
                key={lv.label}
                className={`rounded-xl px-3 py-2 text-center ${lv.tone}`}
              >
                <div className="tabular-nums text-xs font-semibold opacity-90">
                  {lv.range}
                </div>
                <div className="mt-0.5 text-sm font-bold">{lv.label}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* 3. ใช้ตัวกรองอย่างไร */}
      <section id="filters" className="scroll-mt-36 space-y-3">
        <h2 className="text-lg font-bold text-ink">
          3. ใช้แถบตัวกรองด้านบนอย่างไรให้ได้คำตอบตรงกลุ่มลูกค้า
        </h2>
        <article className="print-card rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <Filter className="h-4 w-4 text-brand" aria-hidden="true" />
                <span>กรองได้ 5 มิติทุกหน้า</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                เลือกกรองตาม <strong>ช่วงวันที่</strong>, <strong>ช่วงอายุ</strong>,{" "}
                <strong>พื้นที่พำนัก</strong>, <strong>ผู้ร่วมเดินทาง</strong> และ{" "}
                <strong>พาหนะ</strong> เมื่อเปลี่ยนหน้าเมนู ตัวกรองจะตามติดไปทุกหน้าโดยอัตโนมัติ
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <SlidersHorizontal
                  className="h-4 w-4 text-brand"
                  aria-hidden="true"
                />
                <span>เลือกหลายข้อ = รวมกัน / ข้ามหัวข้อ = เจาะจง</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                ติ๊กหลายตัวเลือกในหัวข้อเดียวกันจะรวมข้อมูลเข้าด้วยกัน (เช่น อายุ 18–24 และ 25–34 ปี) แต่ถ้าเลือกข้ามหัวข้อ ระบบจะคัดเฉพาะคนที่ตรงทั้งสองเงื่อนไข
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <Info className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>สลับดูตาราง & ล้างตัวกรอง</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                บนมือถือแตะปุ่ม <strong>“ตัวกรองข้อมูล”</strong> เพื่อเปิดเลือก หรือกดปุ่ม{" "}
                <strong>“ดูเป็นตาราง”</strong> บนการ์ดกราฟแต่ละใบเพื่ออ่านตัวเลขเรียงแถวได้ง่ายขึ้น
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* 4. ตัวอย่างการตัดสินใจ 4 ประเภทธุรกิจ */}
      <section id="examples" className="scroll-mt-36 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-ink">
            4. ตัวอย่างการนำข้อมูลไปตัดสินใจ (4 กลุ่มธุรกิจ)
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{INSIGHT_DISCLAIMER}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {DECISION_EXAMPLES.map((ex) => {
            const Icon = ex.icon;
            return (
              <article
                key={ex.key}
                className="print-card flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ex.tone}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-bold text-ink">{ex.title}</h3>
                  </div>

                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="rounded-xl bg-surface-subtle p-3">
                      <p className="text-xs font-bold text-ink-muted">
                        ถ้าเห็นในแดชบอร์ด…
                      </p>
                      <p className="mt-0.5 leading-relaxed text-ink">
                        {ex.ifSee}
                      </p>
                    </div>
                    <div className="rounded-xl border border-brand/20 bg-brand-soft/45 p-3">
                      <p className="text-xs font-bold text-brand-ink">
                        → ลองนำไปปรับใช้…
                      </p>
                      <p className="mt-0.5 leading-relaxed text-ink">
                        {ex.tryDo}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="rounded-2xl border border-line bg-surface-subtle px-4 py-3 text-sm text-ink-secondary">
          <strong className="font-semibold text-ink">สำหรับทุกประเภทธุรกิจ:</strong>{" "}
          สามารถดูข้อ 6 (<Link href="/awareness" className="font-semibold text-brand underline-offset-2 hover:underline">วัตถุประสงค์ & ช่องทางรับรู้</Link>) เพื่อเช็กว่าช่องทางใดติดอันดับ 1 แล้วเน้นโพสต์โปรโมตหรือลงโฆษณาในช่องทางนั้นก่อน
        </div>
      </section>

      {/* 5. ข้อจำกัดข้อมูล */}
      <section id="limits" className="scroll-mt-36 space-y-3">
        <h2 className="text-lg font-bold text-ink">
          5. ข้อจำกัดของข้อมูลที่ควรรู้ก่อนตัดสินใจ
        </h2>
        <article className="print-card rounded-2xl border border-accent-border bg-accent-soft/70 p-5 text-accent-ink">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="font-bold text-base">
                “{DISCLAIMER}”
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  ข้อมูลเก็บจากผู้ที่สะดวกตอบแบบสำรวจ ณ ช่วงเวลาที่เก็บข้อมูลจริง ไม่ใช่จำนวนนักท่องเที่ยวทั้งหมดที่เดินทางเข้าพื้นที่
                </li>
                <li>
                  แดชบอร์ดไม่เก็บชื่อ เบอร์โทร หรือข้อมูลส่วนตัวของผู้ตอบ เพื่อให้ทุกคนตอบอย่างสบายใจและเป็นความลับ
                </li>
                <li>
                  ควรใช้ข้อมูลนี้เป็น <strong>เข็มทิศประกอบการตัดสินใจ</strong> ร่วมกับสังเกตการณ์หน้าร้าน ต้นทุน และสภาพจริงของกิจการคุณ
                </li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      {/* 6. FAQ 5 ข้อ (Accordion อ่านง่ายบนมือถือ) */}
      <section id="faq" className="scroll-mt-36 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand" aria-hidden="true" />
          <h2 className="text-lg font-bold text-ink">
            6. คำถามที่พบบ่อย (FAQ)
          </h2>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((item, idx) => (
            <details
              key={item.q}
              open={idx === 0}
              className="print-card group rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-bold text-ink sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="leading-snug">{item.q}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-line/70 px-4 py-3.5 text-sm leading-relaxed text-ink-secondary sm:px-5">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
