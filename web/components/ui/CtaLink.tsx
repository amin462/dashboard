"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

/** ปุ่ม CTA อำพันมน ลิงก์ไปหน้าย่อย (ส่งต่อตัวกรองใน query) */
export function CtaLink({ href, children }: { href: string; children: string }) {
  const query = useSearchParams().toString();
  return (
    <Link href={query ? `${href}?${query}` : href} className="no-print btn btn-primary h-9 self-start px-4 text-[13px]">
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
