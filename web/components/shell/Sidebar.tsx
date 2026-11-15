import Link from "next/link";
import { Suspense } from "react";
import { FooterLinks } from "./FooterLinks";
import { NavList } from "./NavList";

/** โหมดพัฒนา: ปุ่มตัวบ่งชี้ของ Next (มุมซ้ายล่าง ~56px) ทับลิงก์ท้ายแถบ จึงเว้นขอบล่างเพิ่ม ; โปรดักชันไม่มีปุ่มนี้ */
const FOOTER_PB = process.env.NODE_ENV === "development" ? "pb-16" : "pb-4";

/** แถบข้างสีครีม 248px (≥1024px) */
export function Sidebar() {
  return (
    <aside aria-label="แถบนำทาง" className="no-print sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-frame lg:flex">
      <Link href="/" className="block shrink-0 px-5 pt-5 pb-3 [@media(max-height:760px)]:pt-3 [@media(max-height:760px)]:pb-2">
        <span className="block text-lg leading-6 font-semibold text-ink">Yala Insight</span>
        <span className="block type-meta text-frame-ink [@media(max-height:760px)]:hidden">วัดคูหาภิมุข · อ.เมืองยะลา</span>
      </Link>
      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <Suspense fallback={null}>
          <NavList tone="frame" />
        </Suspense>
      </div>
      <div className={`shrink-0 border-t border-line px-5 pt-3 ${FOOTER_PB}`}>
        <FooterLinks tone="frame" />
      </div>
    </aside>
  );
}
