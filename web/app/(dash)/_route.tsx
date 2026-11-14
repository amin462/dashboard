import { Suspense, type ReactNode } from "react";
import { PageSkeleton } from "@/components/ui/Skeletons";
import { getSurveyBundle } from "./_data";

export type SurveyBundle = Awaited<ReturnType<typeof getSurveyBundle>>;

async function Content({ render }: { render: (bundle: SurveyBundle) => ReactNode }) {
  return render(await getSurveyBundle());
}

/** ทุกหน้าวิเคราะห์ใช้ตัวนี้: อ่านข้อมูลจาก cache (_data.ts) ภายใต้ Suspense + skeleton โครงเดียวกับหน้าจริง */
export function DashRoute({ render }: { render: (bundle: SurveyBundle) => ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content render={render} />
    </Suspense>
  );
}
