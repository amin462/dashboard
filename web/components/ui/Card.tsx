import type { ReactNode } from "react";

/** การ์ดมาตรฐาน: surface, เส้น 1px, radius 12, padding 20, ไม่มีเงา */
export function Card({ title, aside, children }: { title?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="print-card min-w-0 rounded-xl border border-line bg-surface p-5">
      {(title || aside) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="type-section">{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}
