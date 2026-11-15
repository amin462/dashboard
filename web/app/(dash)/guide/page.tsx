import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Filter,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { SmallSampleBadge } from "@/components/ui/SmallSampleBadge";
import { INSIGHT_DISCLAIMER } from "@/lib/survey/insights";
import { DISCLAIMER, SMALL_N, TARGET_FULL, TARGET_MIN } from "@/lib/survey/schema";
import { DECISION_EXAMPLES, FAQS, QUICK_LINKS, SAT_LEVELS } from "./content";

export const metadata: Metadata = {
  title: "คู่มือผู้ประกอบการ",
  description:
    "คู่มือภาษาไทยเข้าใจง่ายสำหรับเจ้าของร้านอาหาร ที่พัก ของฝาก และนำเที่ยว เพื่ออ่านกราฟ ใช้ตัวกรอง และตัดสินใจจากผลสำรวจวัดคูหาภิมุข",
};

const STEPS = [
  {
    icon: LayoutDashboard,
    title: "ดูภาพรวมก่อน",
    text: "เปิดหน้า “ภาพรวม” จะเห็นว่าลูกค้าส่วนใหญ่เป็นใคร มาช่วงไหน และใช้จ่ายเท่าไหร่ ใช้เวลาประมาณ 30 วินาที",
    link: { href: "/", label: "ไปหน้าภาพรวม" },
  },
  {
    icon: Filter,
    title: "กรองให้ตรงกลุ่มลูกค้า",
    text: "ใช้แถบตัวกรองด้านบน (บนมือถือแตะปุ่ม “ตัวกรอง”) เลือกช่วงวันที่ อายุ หรือพื้นที่ ตัวกรองจะตามไปทุกหน้า",
    link: null,
  },
  {
    icon: MessageCircle,
    title: "สงสัยอะไร ถามผู้ช่วย",
    text: "กดปุ่ม “ถามผู้ช่วย” มุมล่างขวา แล้วพิมพ์คำถามสั้น ๆ เช่น “ลูกค้าส่วนใหญ่มาช่วงไหน” ผู้ช่วยตอบจากผลสำรวจเท่านั้น",
    link: null,
  },
] as const;

/** หัวข้อพับเก็บ: อ่านเมื่ออยากรู้เท่านั้น */
function More({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="print-card group card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-semibold text-ink sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="leading-snug">{title}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="space-y-2 border-t border-line px-4 py-3.5 text-sm leading-relaxed text-ink-2 sm:px-5">
        {children}
      </div>
    </details>
  );
}

const H2 = "text-lg leading-7 font-semibold text-ink";

const SAMPLE_ROWS = [
  { l: "ช่วงบ่าย", w: "78%", v: "40 คน · 52%", top: true },
  { l: "ช่วงเช้า", w: "50%", v: "26 คน · 34%", top: false },
  { l: "ช่วงเย็น", w: "22%", v: "11 คน · 14%", top: false },
];

export default function GuidePage() {
  return (
    <div className="lg:grid lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-8">
      {/* สารบัญ: เลื่อนแนวนอนบนมือถือ / ติดด้านข้างบนเดสก์ท็อป */}
      <nav aria-label="หัวข้อในคู่มือ" className="no-print mb-5 lg:mb-0">
        <ul className="thin-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
          {QUICK_LINKS.map((item) => (
            <li key={item.href} className="shrink-0">
              <a
                href={item.href}
                className="block rounded-lg bg-surface px-3 py-1.5 text-[13px] whitespace-nowrap text-ink-2 shadow-[0_1px_2px_rgb(80_50_20/.08)] transition-colors duration-150 hover:bg-amber-soft hover:text-navy lg:bg-transparent lg:shadow-none"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-10">
        {/* เปิดเรื่อง */}
        <header className="space-y-3">
          <p className="max-w-2xl text-[15px] leading-7 text-ink-2">
            หน้านี้สรุปวิธีใช้แดชบอร์ดสำหรับเจ้าของร้านอาหาร ที่พัก ร้านของฝาก และบริการนำเที่ยวในอำเภอเมืองยะลา
            ข้อมูลมาจากแบบสำรวจนักท่องเที่ยวที่วัดคูหาภิมุข ไม่ต้องเข้าสู่ระบบ อ่านจบแล้วลองเปิดดูได้เลย
          </p>
          <Link href="/business" className="btn btn-primary no-print">
            ดูมุมมองธุรกิจของฉัน
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        {/* 1. เริ่มใน 3 ขั้น */}
        <section id="start" className="scroll-mt-24 space-y-4">
          <h2 className={H2}>เริ่มใน 3 ขั้น</h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="print-card card flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-soft text-[15px] font-semibold text-amber-ink"
                    >
                      {i + 1}
                    </span>
                    <Icon className="h-5 w-5 text-ink-3" aria-hidden="true" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-ink">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-2">{s.text}</p>
                  {s.link && (
                    <Link
                      href={s.link.href}
                      className="no-print mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-navy hover:underline"
                    >
                      {s.link.label}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* 2. อ่านกราฟใน 10 วินาที — ภาพประกอบคงที่ (ไม่ใช่ข้อมูลจริง) */}
        <section id="read" className="scroll-mt-24 space-y-4">
          <h2 className={H2}>อ่านกราฟใน 10 วินาที</h2>
          <div className="print-card card grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
            <figure aria-label="ตัวอย่างกราฟแท่งประกอบคำอธิบาย (ไม่ใช่ข้อมูลจริง)" className="space-y-2">
              <div className="space-y-2.5 rounded-xl bg-surface-2 p-4 text-sm">
                {SAMPLE_ROWS.map((r) => (
                  <div key={r.l} className="flex items-center gap-2">
                    <span className={`w-16 shrink-0 ${r.top ? "font-semibold text-ink" : "text-ink-2"}`}>{r.l}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded bg-surface">
                      <span className={`block h-full rounded ${r.top ? "bg-amber" : "bg-bar"}`} style={{ width: r.w }} />
                    </span>
                    <span className={`w-24 shrink-0 text-right tabular-nums ${r.top ? "font-semibold text-ink" : "text-ink-2"}`}>{r.v}</span>
                  </div>
                ))}
                <p className="type-meta text-ink-3">ฐาน n = 77 คน</p>
              </div>
              <figcaption className="type-meta text-ink-3">ภาพตัวอย่างประกอบคำอธิบาย ไม่ใช่ข้อมูลจริง</figcaption>
            </figure>

            <dl className="space-y-3 text-sm leading-relaxed text-ink-2">
              <div>
                <dt className="font-semibold text-ink">แท่งสีส้มอิฐ = อันดับ 1</dt>
                <dd>แท่งที่ยาวที่สุดและเด่นที่สุดคือคำตอบที่พบมากที่สุด ส่วนแท่งสีเทาคืออันดับรองลงมา</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">ตัวเลขท้ายแถว = จำนวนคน · ร้อยละ</dt>
                <dd>
                  ร้อยละคิดจาก <strong className="text-ink">ฐาน n</strong> คือจำนวนคนที่ตอบข้อนั้นจริง ๆ ระบุไว้ใต้กราฟทุกใบ
                </dd>
              </div>
              <div>
                <dt className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                  ป้ายเตือนข้อมูลน้อย <SmallSampleBadge n={3} />
                </dt>
                <dd>กลุ่มที่ดูอยู่มีไม่ถึง {SMALL_N} คน ตัวเลขอาจเปลี่ยนมากเมื่อมีคนตอบเพิ่ม ให้ใช้ประกอบเท่านั้น</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 3. ธุรกิจของฉัน */}
        <section id="business" className="scroll-mt-24 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={H2}>ธุรกิจของฉันควรดูอะไร</h2>
            <span className="rounded-full bg-surface-2 px-3 py-0.5 text-xs text-ink-2">{INSIGHT_DISCLAIMER}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {DECISION_EXAMPLES.map((ex) => {
              const Icon = ex.icon;
              return (
                <article key={ex.key} className="print-card card flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ex.tone}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-[15px] leading-6 font-semibold text-ink">{ex.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-2">
                    <span className="font-semibold text-ink">ถ้าเห็นว่า </span>
                    {ex.ifSee}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-2">
                    <span className="font-semibold text-amber-ink">ลองทำ: </span>
                    {ex.tryDo}
                  </p>
                </article>
              );
            })}
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            ธุรกิจอื่น ๆ ดู{" "}
            <Link href="/awareness" className="font-semibold text-navy underline-offset-2 hover:underline">
              ช่องทางที่ลูกค้ารู้จักสถานที่
            </Link>{" "}
            เพื่อเลือกลงโพสต์หรือโฆษณาในช่องทางที่ติดอันดับ 1 ก่อน
          </p>
        </section>

        {/* 4. รายละเอียดเพิ่มเติม (พับเก็บ) */}
        <section id="more" className="scroll-mt-24 space-y-3">
          <h2 className={H2}>รายละเอียดเพิ่มเติม</h2>
          <p className="text-sm text-ink-2">แตะหัวข้อเพื่อเปิดอ่าน อ่านเฉพาะที่อยากรู้</p>
          <div className="space-y-2.5">
            <More title="ข้อมูลมาจากไหน และนับใครบ้าง">
              <p>
                มาจากแบบสำรวจออนไลน์ของผู้ที่มาเยือนวัดคูหาภิมุข (วัดหน้าถ้ำ) อำเภอเมืองยะลา
                นับเฉพาะชุดคำตอบที่ผ่านการคัดกรอง ยินยอมให้ข้อมูล และตอบข้อ 1–4 ครบ เป้าหมายขั้นต่ำ{" "}
                <strong className="text-ink">{TARGET_MIN}</strong> คน เป้าเต็ม <strong className="text-ink">{TARGET_FULL}</strong> คน
              </p>
              <p>ถ้าด้านบนมีป้าย “ข้อมูลตัวอย่าง” แปลว่าตัวเลขยังเป็นข้อมูลจำลองเพื่อสาธิต ไม่ใช่ผลสำรวจจริง</p>
            </More>
            <More title="ฐาน n, ไม่ตอบ และ ไม่ประสงค์ระบุ ต่างกันอย่างไร">
              <p>
                <strong className="text-ink">ฐาน n</strong> คือจำนวนคนที่ตอบข้อนั้นจริง ๆ ใช้เป็นตัวหารร้อยละ{" "}
                <strong className="text-ink">ไม่ตอบ</strong> คือเว้นว่าง ไม่นับในฐาน n ส่วน{" "}
                <strong className="text-ink">ไม่ประสงค์ระบุ / ยังประเมินไม่ได้</strong> คือผู้ตอบเลือกตัวเลือกนั้นเอง นับรวมในฐาน n
              </p>
            </More>
            <More title="ทำไมร้อยละบางข้อรวมกันเกิน 100%">
              <p>
                ข้อที่เลือกได้หลายคำตอบ (เช่น สินค้าและบริการที่สนใจ) ผู้ตอบ 1 คนเลือกได้หลายอย่าง
                ระบบคิดร้อยละจากจำนวนคนที่ตอบข้อนั้น ผลรวมทุกแท่งจึงเกิน 100% ได้
              </p>
            </More>
            <More title="เลือกตัวกรองหลายข้อ จะได้อะไร">
              <p>
                เลือกหลายตัวเลือกในหัวข้อเดียวกัน = รวมกัน (เช่น อายุ 18–24 และ 25–34 ปี) เลือกข้ามหัวข้อ = เอาเฉพาะคนที่ตรงทุกเงื่อนไข
                ปุ่ม “ดูเป็นตาราง” บนการ์ดกราฟใช้อ่านตัวเลขเรียงแถว
              </p>
            </More>
            <More title="วิธีอ่านคะแนนความพึงพอใจ (ข้อ 9)">
              <p>
                ค่าเฉลี่ยคิดจากผู้ให้คะแนน 1–5 เท่านั้น เป็นการประเมินสถานที่วัดคูหาภิมุข ไม่ใช่ประเมินเว็บ เกณฑ์แปลผล 5 ระดับ:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-5">
                {SAT_LEVELS.map((lv) => (
                  <div key={lv.label} className={`rounded-xl px-3 py-2 text-center ${lv.tone}`}>
                    <div className="text-xs font-semibold tabular-nums">{lv.range}</div>
                    <div className="mt-0.5 text-sm font-semibold">{lv.label}</div>
                  </div>
                ))}
              </div>
            </More>
          </div>
        </section>

        {/* 5. ข้อจำกัด */}
        <section id="limits" className="scroll-mt-24 space-y-3">
          <h2 className={H2}>ข้อจำกัดที่ควรรู้ก่อนตัดสินใจ</h2>
          <article className="print-card rounded-xl bg-warn-soft p-5 text-warn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="space-y-2 text-sm leading-relaxed">
                <p className="text-base font-semibold">“{DISCLAIMER}”</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>ข้อมูลเก็บจากผู้ที่สะดวกตอบแบบสำรวจในช่วงที่เก็บข้อมูล ไม่ใช่จำนวนนักท่องเที่ยวทั้งหมด</li>
                  <li>ไม่เก็บชื่อ เบอร์โทร หรือข้อมูลส่วนตัวของผู้ตอบ</li>
                  <li>
                    ใช้เป็น <strong>เข็มทิศประกอบการตัดสินใจ</strong> ร่วมกับการสังเกตหน้าร้าน ต้นทุน และสภาพจริงของกิจการ
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="scroll-mt-24 space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-navy" aria-hidden="true" />
            <h2 className={H2}>คำถามที่พบบ่อย</h2>
          </div>
          <div className="space-y-2.5">
            {FAQS.map((item) => (
              <More key={item.q} title={item.q.replace(/^\d+\.\s*/, "")}>
                <p>{item.a}</p>
              </More>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
