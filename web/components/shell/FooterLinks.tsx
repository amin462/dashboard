import Link from "next/link";
import { EXTERNAL_LINKS } from "../nav-config";

/** ลิงก์ท้ายแถบข้าง/แผ่นเมนู: เว็บหลัก · แบบสำรวจ · โปสเตอร์ QR */
export function FooterLinks({ tone }: { tone: "frame" | "surface" }) {
  const cls =
    tone === "frame"
      ? "text-frame-ink hover:text-white"
      : "text-ink-2 hover:text-brand";
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 type-meta">
      <li>
        <a href={EXTERNAL_LINKS.mainSite} target="_blank" rel="noopener noreferrer" className={cls}>
          เว็บหลัก
        </a>
      </li>
      <li>
        <a href={EXTERNAL_LINKS.survey} target="_blank" rel="noopener noreferrer" className={cls}>
          แบบสำรวจ
        </a>
      </li>
      <li>
        <Link href="/survey-poster" prefetch={false} className={cls}>
          โปสเตอร์ QR
        </Link>
      </li>
    </ul>
  );
}
