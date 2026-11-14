import Link from "next/link";
import { Suspense } from "react";
import { FooterLinks } from "./FooterLinks";
import { NavList } from "./NavList";

/** แถบข้างสีกรมท่า 232px (≥1024px) */
export function Sidebar() {
  return (
    <aside aria-label="แถบนำทาง" className="no-print sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col bg-frame lg:flex">
      <Link href="/" className="block px-5 pt-5 pb-4">
        <span className="block text-lg leading-6 font-semibold text-white">Yala Insight</span>
        <span className="block type-meta text-frame-ink">วัดคูหาภิมุข · อ.เมืองยะลา</span>
      </Link>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <Suspense fallback={null}>
          <NavList tone="frame" />
        </Suspense>
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <FooterLinks tone="frame" />
      </div>
    </aside>
  );
}
