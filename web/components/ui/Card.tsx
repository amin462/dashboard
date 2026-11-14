import type { ReactNode } from "react";

/** การ์ดมาตรฐาน v2: ขาว radius 14 เงานุ่ม ไม่มีเส้นขอบ padding 20 */
export function Card({ title, aside, children }: { title?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="print-card card min-w-0 p-5">
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
