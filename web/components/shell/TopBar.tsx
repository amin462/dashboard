"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeProvider";
import { titleOfPath } from "../nav-config";

/** Top bar 56px (sticky): ซ้าย = ชื่อหน้า (h1) ; ขวา = สถานะข้อมูล (slot) + สลับธีม */
export function TopBar({ children }: { children?: ReactNode }) {
  const title = titleOfPath(usePathname());
  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface px-4 lg:px-8">
      <h1 className="min-w-0 truncate text-lg leading-7 font-semibold lg:type-title">{title}</h1>
      <div className="flex shrink-0 items-center gap-3">
        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}
