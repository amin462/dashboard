import { Suspense, type ReactNode } from "react";
import { bangkokDate, formatThaiDateTimeShort } from "@/components/format";
import { FilterBar } from "@/components/filters/FilterBar";
import { DataBanner } from "@/components/shell/Banner";
import { DashShell } from "@/components/shell/DashShell";
import { SourcePill } from "@/components/shell/SourcePill";
import { getSurveyBundle } from "./_data";

async function TopMeta() {
  const { source, lastSubmittedAt } = await getSurveyBundle();
  return (
    <>
      <SourcePill source={source} />
      <span className="hidden type-meta text-ink-3 md:inline">อัปเดต {formatThaiDateTimeShort(lastSubmittedAt)}</span>
    </>
  );
}

async function FilterBarSlot() {
  const { lastSubmittedAt } = await getSurveyBundle();
  return <FilterBar anchor={bangkokDate(lastSubmittedAt)} />;
}

async function BannerSlot() {
  const { source, error, seedCount } = await getSurveyBundle();
  return <DataBanner source={source} error={error} seedCount={seedCount} />;
}

export default function DashLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DashShell
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
