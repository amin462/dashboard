import { Suspense, type ReactNode } from "react";
import { bangkokDate, formatThaiDateTimeShort } from "@/components/format";
import { monthsWithData } from "@/lib/survey/filters";
import { FilterBar } from "@/components/filters/FilterBar";
import { DataBanner } from "@/components/shell/Banner";
import { EXTERNAL_LINKS } from "@/components/nav-config";
import { AutoRefresh } from "@/components/shell/AutoRefresh";
import { DashShell } from "@/components/shell/DashShell";
import { SourcePill } from "@/components/shell/SourcePill";
import { getSurveyBundle, versionOf } from "./_data";

async function TopMeta() {
  const bundle = await getSurveyBundle();
  const { source, lastSubmittedAt, seedCount } = bundle;
  return (
    <>
      <AutoRefresh version={versionOf(bundle)} />
      <a
        href={EXTERNAL_LINKS.survey}
        target="_blank"
        rel="noopener noreferrer"
        title="เปิดแบบสำรวจจริงในแท็บใหม่ (ผู้ตอบที่ส่งจะนับเป็นข้อมูลจริง)"
        className="hidden h-7 items-center gap-1 rounded-full border border-amber/60 bg-amber-soft px-3 type-meta font-medium text-amber-ink hover:bg-amber hover:text-amber-fg md:inline-flex"
      >
        ลองตอบแบบสำรวจ
      </a>
      <SourcePill source={source} seedCount={seedCount} />
      <span className="hidden type-meta text-ink-3 md:inline">อัปเดต {formatThaiDateTimeShort(lastSubmittedAt)}</span>
    </>
  );
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** ช่วงข้อมูลวิจัย (วันตัดข้อมูลของรายงาน) จาก env ; ไม่ตั้ง/รูปแบบผิด = null (ซ่อนปุ่ม) */
function researchRange(): { from?: string; to?: string } | null {
  const from = process.env.NEXT_PUBLIC_RESEARCH_FROM?.trim();
  const to = process.env.NEXT_PUBLIC_RESEARCH_TO?.trim();
  const r = { from: from && YMD.test(from) ? from : undefined, to: to && YMD.test(to) ? to : undefined };
  return r.from || r.to ? r : null;
}

async function FilterBarSlot() {
  const { lastSubmittedAt, rows } = await getSurveyBundle();
  return <FilterBar anchor={bangkokDate(lastSubmittedAt)} months={monthsWithData(rows)} research={researchRange()} />;
}

async function BannerSlot() {
  const { source, error, seedCount, stale } = await getSurveyBundle();
  return <DataBanner source={source} error={error} seedCount={seedCount} stale={stale} />;
}

export default function DashLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DashShell
      chatEnabled={Boolean(process.env.GEMINI_API_KEY) || process.env.CHAT_MOCK === "1"}
      topMeta={
        <Suspense fallback={<span className="inline-block h-4 w-32 animate-pulse rounded bg-muted-bar/60" />}>
          <TopMeta />
        </Suspense>
      }
      filterBar={
        <Suspense fallback={<div className="no-print sticky top-14 z-20 h-11 border-b border-line bg-surface" />}>
          <FilterBarSlot />
        </Suspense>
      }
      banner={
        <Suspense fallback={null}>
          <BannerSlot />
        </Suspense>
      }
    >
      {children}
    </DashShell>
  );
}
