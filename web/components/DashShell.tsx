"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  ExternalLink,
  Globe,
  Lock,
  MapPin,
  Menu,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Disclaimer } from "./Disclaimer";
import { FilterBar } from "./FilterBar";
import { ThemeToggle } from "./ThemeProvider";
import { EXTERNAL_LINKS, NAV_ITEMS } from "./nav-config";

type DashShellProps = {
  children: ReactNode;
  headerMeta: ReactNode;
  mockBanner: ReactNode;
};

const MOBILE_BOTTOM_HREFS = ["/", "/business", "/satisfaction", "/reports"];

function NavLinksList({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <nav aria-label="เมนูวิเคราะห์ข้อมูล" className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const href = query ? `${item.href}?${query}` : item.href;

        return (
          <Link
            key={item.href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand text-white shadow-sm"
                : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive ? "text-white" : "text-ink-muted group-hover:text-brand"
              }`}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileBottomNavBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const quickItems = NAV_ITEMS.filter((i) =>
    MOBILE_BOTTOM_HREFS.includes(i.href)
  );

  return (
    <nav
      aria-label="เมนูด่วนสำหรับมือถือ"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 px-1 py-1.5">
        {quickItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const href = query ? `${item.href}?${query}` : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors ${
                isActive ? "text-brand" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate max-w-full px-1">{item.shortLabel}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          <span>ทั้งหมด</span>
        </button>
      </div>
    </nav>
  );
}

function BrandBlock() {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
        <MapPin className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-bold tracking-tight text-ink">
          Yala <span className="text-brand">Insight</span>
        </div>
        <p className="truncate text-xs text-ink-muted">
          วัดคูหาภิมุข · อ.เมืองยะลา
        </p>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto space-y-3 border-t border-line p-4">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={EXTERNAL_LINKS.mainSite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-2.5 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <Globe className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          <span>เว็บหลัก</span>
        </a>
        <a
          href={EXTERNAL_LINKS.survey}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-2.5 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <ClipboardList className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>แบบสำรวจ</span>
        </a>
      </div>

      <Link
        href="/admin/import"
        prefetch={false}
        className="flex items-center justify-between rounded-xl border border-line/80 bg-surface-subtle px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
      >
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>พื้นที่ผู้ดูแลระบบ</span>
        </span>
        <span className="text-[11px]">นำเข้า/คุณภาพ</span>
      </Link>
    </div>
  );
}

export function DashShell({
  children,
  headerMeta,
  mockBanner,
}: DashShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* Desktop Sidebar */}
      <aside
        aria-label="แถบนำทางหลัก"
        className="no-print hidden w-68 shrink-0 flex-col border-r border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen"
      >
        <BrandBlock />
        <div className="mx-4 mb-3 rounded-xl border border-line bg-surface-subtle px-3 py-2.5 text-xs">
          <span className="font-semibold text-ink">พื้นที่ศึกษา</span>
          <p className="mt-0.5 text-ink-muted">
            วัดคูหาภิมุข (วัดหน้าถ้ำ) · เพื่อผู้ประกอบการท้องถิ่น
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-1">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface-muted/50" />}>
            <NavLinksList />
          </Suspense>
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="เมนูนำทาง"
        >
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pr-3">
              <BrandBlock />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="ปิดเมนู"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-secondary hover:bg-surface-muted"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <Suspense fallback={null}>
                <NavLinksList onNavigate={() => setDrawerOpen(false)} />
              </Suspense>
            </div>
            <SidebarFooter />
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/85 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="เปิดเมนูนำทาง"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-subtle text-ink hover:bg-surface-muted lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink sm:text-base">
                แดชบอร์ดนักท่องเที่ยว · อ.เมืองยะลา
              </p>
              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs text-ink-muted">
                {headerMeta}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={EXTERNAL_LINKS.mainSite}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-3 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink sm:inline-flex"
            >
              <span>เว็บหลัก</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href={EXTERNAL_LINKS.survey}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-hover sm:inline-flex"
            >
              <span>แบบสำรวจ</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* Sticky Filter Bar */}
        <Suspense
          fallback={
            <div className="no-print h-14 border-b border-line bg-surface/80" />
          }
        >
          <FilterBar />
        </Suspense>

        {/* Page Body */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-5 pb-24 sm:px-6 lg:px-8 lg:pb-10">
          {/* Print-only header */}
          <div className="print-only mb-4 hidden border-b border-gray-300 pb-3">
            <h1 className="text-lg font-bold text-gray-900">
              รายงานสรุปข้อมูลนักท่องเที่ยว ณ วัดคูหาภิมุข (วัดหน้าถ้ำ) อ.เมืองยะลา
            </h1>
            <p className="text-xs text-gray-600">
              ระบบวิเคราะห์ข้อมูลเพื่อผู้ประกอบการท่องเที่ยวอำเภอเมืองยะลา (Yala Insight)
            </p>
          </div>

          {mockBanner}
          {children}
          <Disclaimer />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <Suspense fallback={null}>
        <MobileBottomNavBar onOpenMenu={() => setDrawerOpen(true)} />
      </Suspense>
    </div>
  );
}
