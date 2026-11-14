"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Printer,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const DEFAULT_SURVEY_URL =
  "https://docs.google.com/forms/d/1uuheFOZgCXhNJBBLb62gnB3x0V10J6gxwmO3HiMLYc8/viewform";

export default function SurveyPosterPage() {
  const surveyUrl = process.env.NEXT_PUBLIC_SURVEY_URL || DEFAULT_SURVEY_URL;

  return (
    <div className="min-h-screen bg-canvas px-4 py-6 text-ink sm:px-6 lg:py-10 print:min-h-0 print:bg-white print:p-0">
      {/* แถบควบคุมบนหน้าจอ (ซ่อนตอนพิมพ์) */}
      <div className="no-print mx-auto mb-5 flex max-w-[186mm] flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-3 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>กลับหน้าแดชบอร์ด</span>
          </Link>
          <p className="hidden text-sm text-ink-muted sm:block">
            ตัวอย่างโปสเตอร์ขนาด A4 แนวตั้ง (1 หน้า) สำหรับพิมพ์ติดพื้นที่วัด
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>พิมพ์</span>
        </button>
      </div>

      {/* โปสเตอร์ A4 แนวตั้ง (คงโทนกระดาษสว่างคมชัดทั้งหน้าจอและเครื่องพิมพ์) */}
      <article
        aria-label="โปสเตอร์เชิญชวนตอบแบบสำรวจนักท่องเที่ยว วัดคูหาภิมุข"
        style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        className="mx-auto flex w-full max-w-[186mm] flex-col justify-between rounded-3xl border-[3px] border-[#0f5e59] bg-white p-6 text-[#1b2423] shadow-xl sm:p-9 print:max-w-full print:rounded-2xl print:border-[2.5px] print:p-6 print:shadow-none print:break-inside-avoid"
      >
        {/* ส่วนหัวสถาบัน */}
        <header className="border-b-2 border-[#e4e0d8] pb-4 print:pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#d97706] bg-[#0f5e59] text-white print:h-11 print:w-11"
              >
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold leading-tight text-[#0f5e59] sm:text-lg">
                  มหาวิทยาลัยราชภัฏยะลา
                </p>
                <p className="text-sm font-semibold text-[#78350f]">
                  คณะวิทยาการจัดการ · งานวิจัยเพื่อพัฒนาการท่องเที่ยวท้องถิ่น
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d97706]/40 bg-[#fef3c7] px-3.5 py-1 text-xs font-bold text-[#78350f]">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>อำเภอเมืองยะลา</span>
            </span>
          </div>
        </header>

        {/* หัวข้อหลัก */}
        <div className="my-5 text-center sm:my-6 print:my-4">
          <p className="inline-block rounded-full bg-[#e4f2f0] px-4 py-1 text-xs font-bold tracking-wide text-[#0a4541] sm:text-sm">
            ขอเชิญนักท่องเที่ยวทุกท่านร่วมแสดงความคิดเห็น
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-[#1b2423] sm:text-3xl print:text-[24pt] print:leading-[1.28]">
            ร่วมตอบแบบสำรวจนักท่องเที่ยว
            <span className="mt-1 block text-[#0f5e59]">
              วัดคูหาภิมุข (วัดหน้าถ้ำ)
            </span>
          </h1>
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-[#42504e] sm:text-base print:text-[11pt]">
            ความคิดเห็นของท่านจะนำไปใช้พัฒนาบริการ ร้านอาหาร ที่พัก ของฝาก และการต้อนรับนักท่องเที่ยวในพื้นที่อำเภอเมืองยะลาให้ดียิ่งขึ้น
          </p>
        </div>

        {/* กรอบ QR Code ขนาดใหญ่ */}
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border-2 border-[#0f5e59]/25 bg-[#faf8f3] px-5 py-6 text-center print:py-5">
          <div className="rounded-2xl border-2 border-[#0f5e59] bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={surveyUrl}
              size={248}
              level="M"
              bgColor="#ffffff"
              fgColor="#111827"
              includeMargin={false}
              title="คิวอาร์โค้ดแบบสำรวจนักท่องเที่ยว วัดคูหาภิมุข"
            />
          </div>

          <p className="mt-4 text-lg font-bold text-[#0f5e59] sm:text-xl">
            สแกน QR Code เพื่อตอบแบบสำรวจ
          </p>
          <p className="mt-1 break-all px-2 text-[11px] text-[#5d6a67]">
            {surveyUrl}
          </p>
        </div>

        {/* แถบเงื่อนไขและความมั่นใจตามข้อกำหนด */}
        <div className="my-5 rounded-2xl border border-[#f3d27a] bg-[#fef3c7] px-4 py-3 text-center text-sm font-bold text-[#78350f] sm:text-base print:my-4 print:py-2.5">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>ใช้เวลา 3–5 นาที · ไม่เก็บชื่อ เบอร์โทร อีเมล · อายุ 18 ปีขึ้นไป</span>
          </span>
        </div>

        {/* วิธีสแกน 3 ขั้นตอนสั้น ๆ */}
        <div className="grid grid-cols-3 gap-2.5 text-center sm:gap-4">
          <div className="rounded-2xl border border-[#dfd9cd] bg-[#faf8f3] p-3">
            <Camera
              className="mx-auto h-5 w-5 text-[#0f5e59]"
              aria-hidden="true"
            />
            <p className="mt-1.5 text-xs font-bold text-[#1b2423] sm:text-sm">
              1. เปิดกล้องมือถือ
            </p>
            <p className="mt-0.5 text-[11px] text-[#5d6a67] sm:text-xs">
              หรือแอปสแกน QR
            </p>
          </div>
          <div className="rounded-2xl border border-[#dfd9cd] bg-[#faf8f3] p-3">
            <Smartphone
              className="mx-auto h-5 w-5 text-[#0f5e59]"
              aria-hidden="true"
            />
            <p className="mt-1.5 text-xs font-bold text-[#1b2423] sm:text-sm">
              2. ส่องที่คิวอาร์โค้ด
            </p>
            <p className="mt-0.5 text-[11px] text-[#5d6a67] sm:text-xs">
              แตะลิงก์ที่หน้าจอ
            </p>
          </div>
          <div className="rounded-2xl border border-[#dfd9cd] bg-[#faf8f3] p-3">
            <CheckCircle2
              className="mx-auto h-5 w-5 text-[#0f5e59]"
              aria-hidden="true"
            />
            <p className="mt-1.5 text-xs font-bold text-[#1b2423] sm:text-sm">
              3. ตอบและกดส่ง
            </p>
            <p className="mt-0.5 text-[11px] text-[#5d6a67] sm:text-xs">
              ข้อมูลเป็นความลับ
            </p>
          </div>
        </div>

        {/* ท้ายกระดาษ */}
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#dfd9cd] pt-3 text-xs text-[#5d6a67] print:mt-4">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-[#0f5e59]" aria-hidden="true" />
            <span>เก็บข้อมูลเพื่อการศึกษาวิจัยและพัฒนาการท่องเที่ยวอย่างเป็นความลับ</span>
          </span>
          <span className="font-semibold text-[#0f5e59]">
            คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏยะลา
          </span>
        </footer>
      </article>
    </div>
  );
}
