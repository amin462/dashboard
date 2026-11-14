import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../ThemeProvider";

type AdminFrameProps = {
  title: string;
  /** คำอธิบายหน้า 1 บรรทัด */
  description: string;
  /** ปุ่มมุมขวาของ top bar */
  actions?: ReactNode;
  /** กว้างสุดของเนื้อหา (ค่าเริ่มต้น 1000px) */
  maxWidth?: string;
  children: ReactNode;
};

/** โครงหน้าผู้ดูแล: top bar 56px (ชื่อหน้า = h1) → คำอธิบาย 1 บรรทัด → เนื้อหา ; ใช้โครงเดียวกับหน้าแดชบอร์ด */
export function AdminFrame({ title, description, actions, maxWidth = "max-w-[1000px]", children }: AdminFrameProps) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-3 bg-canvas px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="btn btn-secondary h-8 shrink-0 px-2.5 text-[13px]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            แดชบอร์ด
          </Link>
          <h1 className="min-w-0 truncate text-lg leading-7 font-semibold lg:type-title">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </header>
      <main className={`mx-auto w-full space-y-4 px-4 pt-5 pb-10 lg:px-8 lg:pt-6 ${maxWidth}`}>
        <p className="text-ink-2">{description}</p>
        {children}
      </main>
    </div>
  );
}
