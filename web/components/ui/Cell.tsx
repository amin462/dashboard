import type { ReactNode } from "react";

/**
 * ช่องใน grid 12 คอลัมน์ที่ให้การ์ดข้างในสูงเท่าแถว (flex stretch ไม่พึ่ง height:100%)
 * ส่ง class ของ span เป็นข้อความเต็ม เช่น "lg:col-span-8" เพื่อให้ Tailwind เห็นชื่อ class
 */
export function Cell({ span, children }: { span: string; children: ReactNode }) {
  return <div className={`anim-rise flex min-w-0 [&>*]:min-w-0 [&>*]:flex-1 ${span}`}>{children}</div>;
}
