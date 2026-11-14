import { Suspense, type ReactNode } from "react";
import { DashShell } from "@/components/DashShell";
import { DataSourceBadge, MockBanner } from "@/components/MockBanner";
import { formatThaiDateTime } from "@/components/nav-config";
import { getSurveyBundle } from "./_data";

async function HeaderMeta() {
  const { source, lastSubmittedAt } = await getSurveyBundle();
  return (
    <>
      <DataSourceBadge source={source} />
      <span className="hidden text-line-strong sm:inline">·</span>
      <span className="truncate tabular-nums">
        <span className="hidden sm:inline">อัปเดตล่าสุด: </span>
        {formatThaiDateTime(lastSubmittedAt)}
      </span>
    </>
  );
}

async function MockBannerSlot() {
  const { source, error } = await getSurveyBundle();
  return <MockBanner source={source} error={error} />;
}

export default function DashLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <DashShell
      headerMeta={
        <Suspense
          fallback={
            <span className="inline-block h-4 w-40 animate-pulse rounded bg-surface-muted" />
          }
        >
          <HeaderMeta />
        </Suspense>
      }
      mockBanner={
        <Suspense fallback={null}>
          <MockBannerSlot />
        </Suspense>
      }
    >
      {children}
    </DashShell>
  );
}
