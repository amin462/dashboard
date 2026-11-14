import type { ReactNode } from "react";
import { Suspense } from "react";
import { PageFooter } from "../ui/PageFooter";
import { BottomTabBar } from "./BottomTabBar";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type DashShellProps = {
  children: ReactNode;
  /** ขวาของ top bar: ป้ายแหล่งข้อมูล + เวลาอัปเดต */
  topMeta: ReactNode;
  /** แถวตัวกรอง 44px */
  filterBar: ReactNode;
  /** แบนเนอร์ข้อมูลตัวอย่าง/ข้อมูลทดสอบ (บรรทัดเดียว) */
  banner: ReactNode;
};

/** โครงหน้า: แถบข้างกรมท่า + top bar 56px + ตัวกรอง + แบนเนอร์ + เนื้อหา (max 1240px) + แท็บล่างมือถือ */
export function DashShell({ children, topMeta, filterBar, banner }: DashShellProps) {
  return (
    <div className="min-h-screen bg-canvas lg:flex print:block">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopBar>{topMeta}</TopBar>
        {filterBar}
        {banner}
        <main className="mx-auto w-full max-w-[1240px] px-4 pt-5 pb-24 lg:px-8 lg:pt-6 lg:pb-10 print:max-w-none print:p-0">
          <p className="print-only mb-3 border-b border-line pb-2 font-semibold">
            Yala Insight · แดชบอร์ดนักท่องเที่ยว วัดคูหาภิมุข อ.เมืองยะลา
          </p>
          {children}
          <PageFooter />
        </main>
      </div>
      <Suspense fallback={null}>
        <BottomTabBar />
      </Suspense>
    </div>
  );
}
