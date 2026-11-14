"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NAV_GROUPS, NAV_ITEMS, isActivePath } from "../nav-config";

type NavListProps = {
  /** frame = บนแถบข้างสีกรมท่า, surface = ในแผ่นล่าง "เพิ่มเติม" */
  tone: "frame" | "surface";
  onNavigate?: () => void;
};

/** เมนูแบ่งกลุ่ม (วิเคราะห์ / ช่วยเหลือ / ผู้ดูแล) ; ส่งต่อตัวกรองใน query ไปทุกหน้าวิเคราะห์ */
export function NavList({ tone, onNavigate }: NavListProps) {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const frame = tone === "frame";

  return (
    <nav aria-label="เมนูหลัก" className="space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.key}>
          <p className={`px-3 pb-1 type-meta ${frame ? "text-frame-ink/65" : "text-ink-3"}`}>{group.label}</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.group === group.key).map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              const href = query && item.preserveQuery !== false ? `${item.href}?${query}` : item.href;
              const tone2 = frame
                ? active
                  ? "bg-white/10 text-white"
                  : "text-frame-ink hover:bg-white/5 hover:text-white"
                : active
                  ? "bg-amber-soft text-navy"
                  : "text-ink-2 hover:bg-surface-2";
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    prefetch={item.group === "admin" ? false : undefined}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-10 items-center gap-3 rounded-lg px-3 transition-colors duration-150 ${tone2}`}
                  >
                    {active && frame && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-amber" aria-hidden="true" />}
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
