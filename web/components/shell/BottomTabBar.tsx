"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { MOBILE_TAB_HREFS, NAV_ITEMS, isActivePath } from "../nav-config";
import { FooterLinks } from "./FooterLinks";
import { NavList } from "./NavList";

/** แท็บล่างบนจอเล็ก (<1024px): 4 หน้าหลัก + "เพิ่มเติม" เปิดเมนูทั้งหมดในแผ่นล่าง */
export function BottomTabBar() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const [moreOpen, setMoreOpen] = useState(false);
  const tabs = MOBILE_TAB_HREFS.map((h) => NAV_ITEMS.find((i) => i.href === h)).filter((i) => !!i);
  const moreActive = !tabs.some((t) => isActivePath(pathname, t.href));

  const cell = "flex h-14 flex-col items-center justify-center gap-0.5 type-meta transition-colors duration-150";

  return (
    <>
      <nav aria-label="เมนูด่วน" className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 bg-frame pb-[env(safe-area-inset-bottom)] lg:hidden">
        {tabs.map((t) => {
          const active = isActivePath(pathname, t.href);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={query ? `${t.href}?${query}` : t.href}
              aria-current={active ? "page" : undefined}
              className={`${cell} ${active ? "text-white shadow-[inset_0_2px_0_var(--amber)]" : "text-frame-ink"}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {t.shortLabel}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          className={`${cell} ${moreActive ? "text-white" : "text-frame-ink"}`}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          เพิ่มเติม
        </button>
      </nav>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="เมนูทั้งหมด">
        <div className="p-3">
          <NavList tone="surface" onNavigate={() => setMoreOpen(false)} />
          <div className="mt-4 border-t border-line px-3 pt-3">
            <FooterLinks tone="surface" />
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
