"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeProvider";
import { titleOfPath } from "../nav-config";

/** Top bar 56px (sticky): ซ้าย = ชื่อหน้า (h1) ; ขวา = สถานะข้อมูล (slot) + สลับธีม */
export function TopBar({ children }: { children?: ReactNode }) {
  const title = titleOfPath(usePathname());
  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-3 bg-canvas px-4 lg:px-8">
      <h1 className="min-w-0 line-clamp-2 text-base leading-6 font-semibold sm:text-lg sm:leading-7 lg:type-title">{title}</h1>
      <div className="flex shrink-0 items-center gap-3">
        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}
