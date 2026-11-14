"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

const noopSubscribe = () => () => {};

/** Bottom sheet สำหรับมือถือ: Esc / แตะฉากหลังเพื่อปิด, เลื่อนเนื้อหาภายในได้ */
export function BottomSheet({ open, title, onClose, children, footer }: BottomSheetProps) {
  // portal ไป body เพื่อไม่ติด stacking context ของแถบ sticky (ไม่งั้นจมใต้แท็บล่าง)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="no-print fixed inset-0 z-50 flex items-end">
      <button
        type="button"
        aria-label="ปิด"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />
      <div className="relative flex max-h-[85dvh] w-full flex-col rounded-t-2xl bg-surface shadow-[0_-8px_24px_rgb(20_40_80/.2)]">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 className="type-section">{title}</h2>
          <button type="button" onClick={onClose} aria-label="ปิด" className="btn btn-secondary w-9 px-0">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-line p-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
