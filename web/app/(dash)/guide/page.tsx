import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Filter,
  HelpCircle,
  Info,
  Lightbulb,
  SlidersHorizontal,
  Store,
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

export default function GuidePage() {
  return (
    <div className="space-y-6">
      {/* คำอธิบาย 1 บรรทัด + สารบัญ (ชื่อหน้าอยู่ใน top bar) */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-3xl text-ink-2">
          วิธีใช้งานแบบเข้าใจง่ายสำหรับเจ้าของร้านอาหาร ที่พัก ร้านของฝาก และบริการนำเที่ยวในอำเภอเมืองยะลา อ่านจบแล้วนำไปดูตัวเลขจริงได้ทันที
        </p>
        <Link href="/business" className="btn btn-primary no-print">
          ดูมุมมองธุรกิจของฉัน
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <nav aria-label="หัวข้อในคู่มือ" className="no-print flex flex-wrap gap-2">
        {QUICK_LINKS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-lg bg-surface px-3 py-1 shadow-[0_1px_2px_rgb(20_40_80/.08)] text-[13px] text-ink-2 transition-colors duration-150 hover:bg-amber-soft hover:text-navy"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* 1. ระบบนี้คืออะไร & ข้อมูลมาจากไหน */}
      <section id="about" className="scroll-mt-28 space-y-3">
        <h2 className="type-section text-ink">
          1. ระบบนี้คืออะไร และข้อมูลมาจากไหน
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="print-card card p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-soft text-navy">
                <Store className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="type-section text-ink">
                ระบบนี้ช่วยอะไรเจ้าของร้านได้บ้าง
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              แดชบอร์ดนี้รวบรวมคำตอบจากนักท่องเที่ยวมาสรุปเป็นตัวเลขและคำแนะนำเบื้องต้น เพื่อให้ผู้ประกอบการเห็นภาพชัดว่า{" "}
              <strong className="font-semibold text-ink">
                ลูกค้าส่วนใหญ่เป็นใคร มาช่วงเวลาไหน ใช้จ่ายเท่าไหร่ รู้จักสถานที่จากช่องทางใด และกำลังมองหาสินค้า/บริการอะไร
              </strong>{" "}
              โดยไม่ต้องนั่งรวมข้อมูลเองในกระดาษหรือไฟล์ Excel
            </p>
          </article>

          <article className="print-card card p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-soft text-amber-ink">
                <Info className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="type-section text-ink">
                ข้อมูลมาจากแบบสำรวจ ณ วัดคูหาภิมุข
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
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
            <p className="mt-2 text-xs text-ink-3">
              * หากด้านบนหน้าจอมีป้าย <strong className="text-warn">“ข้อมูลตัวอย่าง”</strong> แสดงว่าระบบกำลังใช้ข้อมูลจำลอง 300 ชุดเพื่อสาธิตการใช้งาน
            </p>
          </article>
        </div>
      </section>

      {/* 2. อ่านกราฟอย่างไร */}
      <section id="read-charts" className="scroll-mt-28 space-y-3">
        <h2 className="type-section text-ink">
          2. อ่านกราฟและตัวเลขอย่างไรให้ถูกต้อง
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="print-card card p-5">
            <h3 className="type-section text-ink">
              ฐาน n, ไม่ตอบ และ ไม่ประสงค์ระบุ ต่างกันอย่างไร
            </h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="font-bold text-navy">
                  ฐาน n = X คน (ตัวหารร้อยละ)
                </dt>
                <dd className="mt-1 text-ink-2">
                  คือจำนวนผู้ตอบคำถามข้อนั้นจริง ๆ (ไม่รวมคนที่ข้ามไม่ตอบ) ทุกกราฟจะระบุไว้ที่แถบด้านล่างเสมอ เช่น{" "}
                  <span className="tabular-nums font-medium text-ink">
                    ฐาน n = 276 คน · ไม่ตอบ 12 คน · ไม่ประสงค์ระบุ 5 คน
                  </span>
                </dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="font-bold text-ink">
                  ไม่ตอบ (ข้าม) vs ไม่ประสงค์ระบุ
                </dt>
                <dd className="mt-1 text-ink-2">
                  <strong>ไม่ตอบ</strong> คือเว้นว่างไม่กดเลือกเลย (ไม่นับในฐาน n) ส่วน{" "}
                  <strong>ไม่ประสงค์ระบุ / ยังประเมินไม่ได้</strong> คือผู้ตอบกดเลือกตัวเลือกนั้นเอง (นับรวมในฐาน n เพื่อให้เห็นสัดส่วนครบถ้วน)
                </dd>
              </div>
            </dl>
          </article>

          <article className="print-card card p-5">
            <h3 className="type-section text-ink">
              ข้อที่เลือกได้หลายคำตอบ & ป้ายเตือนข้อมูลน้อย
            </h3>
            <div className="mt-3 space-y-3 text-sm text-ink-2">
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="font-bold text-ink">
                  ทำไมข้อ 8 “สินค้าและบริการที่สนใจ” ร้อยละเกิน 100% ได้?
                </p>
                <p className="mt-1">
                  เพราะผู้ตอบ 1 คนเลือกได้มากกว่า 1 อย่าง (เช่น สนใจทั้งอาหารและของฝาก) ระบบคิดร้อยละจาก{" "}
                  <strong>จำนวนคนที่ตอบข้อ 8</strong> ผลรวมร้อยละทุกแท่งจึงเกิน 100% ได้
                </p>
              </div>

              <div className="rounded-xl bg-warn-soft p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-warn">
                    เมื่อเห็นป้ายเตือนนี้:
                  </span>
                  <SmallSampleBadge n={3} />
                </div>
                <p className="mt-1.5 text-warn">
                  แปลว่ากลุ่มที่ดูอยู่มีข้อมูลน้อยกว่า {SMALL_N} คน ตัวเลขร้อยละอาจเปลี่ยนมากหากมีคนตอบเพิ่มเพียงไม่กี่คน จึงควรอ่านอย่างระมัดระวัง
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* เกณฑ์แปลผลความพึงพอใจ */}
        <article className="print-card card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="type-section text-ink">
              วิธีอ่านคะแนนความพึงพอใจ (ข้อ 9)
            </h3>
            <span className="rounded-full border border-line bg-surface-2 px-3 py-0.5 text-xs font-semibold text-ink-2">
              ประเมิน “สถานที่วัดคูหาภิมุข” (ไม่ใช่ประเมินเว็บ)
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-2">
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
      <section id="filters" className="scroll-mt-28 space-y-3">
        <h2 className="type-section text-ink">
          3. ใช้แถบตัวกรองด้านบนอย่างไรให้ได้คำตอบตรงกลุ่มลูกค้า
        </h2>
        <article className="print-card card p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <Filter className="h-4 w-4 text-navy" aria-hidden="true" />
                <span>กรองได้ 5 มิติทุกหน้า</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-2">
                เลือกกรองตาม <strong>ช่วงวันที่</strong>, <strong>ช่วงอายุ</strong>,{" "}
                <strong>พื้นที่พำนัก</strong>, <strong>ผู้ร่วมเดินทาง</strong> และ{" "}
                <strong>พาหนะ</strong> เมื่อเปลี่ยนหน้าเมนู ตัวกรองจะตามติดไปทุกหน้าโดยอัตโนมัติ
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <SlidersHorizontal
                  className="h-4 w-4 text-navy"
                  aria-hidden="true"
                />
                <span>เลือกหลายข้อ = รวมกัน / ข้ามหัวข้อ = เจาะจง</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-2">
                ติ๊กหลายตัวเลือกในหัวข้อเดียวกันจะรวมข้อมูลเข้าด้วยกัน (เช่น อายุ 18–24 และ 25–34 ปี) แต่ถ้าเลือกข้ามหัวข้อ ระบบจะคัดเฉพาะคนที่ตรงทั้งสองเงื่อนไข
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <Info className="h-4 w-4 text-amber-ink" aria-hidden="true" />
                <span>สลับดูตาราง & ล้างตัวกรอง</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-2">
                บนมือถือแตะปุ่ม <strong>“ตัวกรอง”</strong> เพื่อเปิดเลือก หรือกดปุ่ม{" "}
                <strong>“ดูเป็นตาราง”</strong> บนการ์ดกราฟแต่ละใบเพื่ออ่านตัวเลขเรียงแถวได้ง่ายขึ้น
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* 4. ตัวอย่างการตัดสินใจ 4 ประเภทธุรกิจ */}
      <section id="examples" className="scroll-mt-28 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="type-section text-ink">
            4. ตัวอย่างการนำข้อมูลไปตัดสินใจ (4 กลุ่มธุรกิจ)
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-amber-soft px-2.5 py-0.5 text-xs font-semibold text-warn">
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
                className="print-card flex flex-col justify-between card p-5"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ex.tone}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="type-section text-ink">{ex.title}</h3>
                  </div>

                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="rounded-xl bg-surface-2 p-3">
                      <p className="text-xs font-bold text-ink-3">
                        ถ้าเห็นในแดชบอร์ด…
                      </p>
                      <p className="mt-0.5 leading-relaxed text-ink">
                        {ex.ifSee}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-soft p-3">
                      <p className="text-xs font-bold text-navy">
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

        <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
          <strong className="font-semibold text-ink">สำหรับทุกประเภทธุรกิจ:</strong>{" "}
          สามารถดูข้อ 6 (<Link href="/awareness" className="font-semibold text-navy underline-offset-2 hover:underline">วัตถุประสงค์ & ช่องทางรับรู้</Link>) เพื่อเช็กว่าช่องทางใดติดอันดับ 1 แล้วเน้นโพสต์โปรโมตหรือลงโฆษณาในช่องทางนั้นก่อน
        </div>
      </section>

      {/* 5. ข้อจำกัดข้อมูล */}
      <section id="limits" className="scroll-mt-28 space-y-3">
        <h2 className="type-section text-ink">
          5. ข้อจำกัดของข้อมูลที่ควรรู้ก่อนตัดสินใจ
        </h2>
        <article className="print-card rounded-xl bg-warn-soft p-5 text-warn">
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
      <section id="faq" className="scroll-mt-28 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-navy" aria-hidden="true" />
          <h2 className="type-section text-ink">
            6. คำถามที่พบบ่อย (FAQ)
          </h2>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((item, idx) => (
            <details
              key={item.q}
              open={idx === 0}
              className="print-card group card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-bold text-ink sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="leading-snug">{item.q}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-line px-4 py-3.5 text-sm leading-relaxed text-ink-2 sm:px-5">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
