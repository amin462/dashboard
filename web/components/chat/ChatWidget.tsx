"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { filtersFromSearchParams } from "@/lib/survey/filters";
import { MessageCircle, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { BUSINESS_CHOICES, FOLLOW_UPS, quickQuestions, type BusinessKey } from "./chat-config";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_LEN = 600;

/** ตัวหนา **...** → <strong> (ไม่ใช้ dangerouslySetInnerHTML) */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

/** แสดงคำตอบ AI แบบ markdown ย่อ: ย่อหน้า + รายการ (- / * / • / 1.) */
function Rich({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim());
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul${blocks.length}`} className="ml-4 list-disc space-y-0.5">
        {list.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  for (const l of lines) {
    const m = l.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) list.push(m[1]);
    else {
      flush();
      if (l) blocks.push(<p key={`p${blocks.length}`}>{inline(l)}</p>);
    }
  }
  flush();
  return <div className="space-y-1.5">{blocks}</div>;
}

type ApiResult = { ok: true; reply: string } | { ok: false; code?: string; message?: string };

/**
 * ผู้ช่วยแชต: ปุ่มลอยมุมขวาล่าง → แผงแชต (มือถือเต็มจอ)
 * ขั้นแรกถามประเภทธุรกิจ → ปุ่มคำถามสำเร็จรูป + ช่องพิมพ์อิสระ ; ส่งหน้าที่เปิดอยู่ให้ AI รู้ว่า "กราฟนี้" คือหน้าไหน
 */
export function ChatWidget({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [business, setBusiness] = useState<BusinessKey | null>(null);
  const [picked, setPicked] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // มือถือ: เต็มจอ → ล็อกการเลื่อนของหน้าเบื้องหลัง
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 1023px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error, picked, open]);

  useEffect(() => {
    if (open && picked) inputRef.current?.focus();
  }, [open, picked]);

  const send = useCallback(
    async (history: Msg[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history,
            business,
            page: pathname,
            // ตัวกรองที่เปิดอยู่ใน URL ตอนกดส่ง -> ผู้ช่วยตอบจากกลุ่มเดียวกับที่ผู้ใช้เห็นบนจอ
            filters: filtersFromSearchParams(new URLSearchParams(window.location.search)),
          }),
        });
        const data = (await res.json().catch(() => null)) as ApiResult | null;
        if (data && data.ok) setMessages([...history, { role: "assistant", content: data.reply }]);
        else setError((data && !data.ok && data.message) || "ผู้ช่วยขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง");
      } catch {
        setError("เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    },
    [business, pathname],
  );

  const ask = (text: string) => {
    const q = text.trim().slice(0, MAX_LEN);
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    void send(next);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const reset = () => {
    setMessages([]);
    setBusiness(null);
    setPicked(false);
    setError(null);
    setInput("");
  };

  if (!enabled) return null;

  const last = messages[messages.length - 1];
  const showFollowUps = !loading && !error && last?.role === "assistant";

  return (
    <>
      {!open && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="no-print fixed right-4 bottom-[4.75rem] z-40 inline-flex h-12 items-center gap-2 rounded-full bg-amber px-4 text-[15px] font-semibold text-amber-fg shadow-[0_6px_20px_rgb(20_40_80/.28)] transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy lg:right-6 lg:bottom-6"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          ถามผู้ช่วย
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="ผู้ช่วยอ่านข้อมูล"
          className="no-print fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface pb-[env(safe-area-inset-bottom)] lg:inset-auto lg:right-6 lg:bottom-6 lg:h-[620px] lg:max-h-[calc(100dvh-3rem)] lg:w-[400px] lg:rounded-2xl lg:pb-0 lg:shadow-[0_14px_48px_rgb(20_40_80/.3)]"
        >
          <header className="flex items-center gap-3 bg-frame px-4 py-3 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber text-amber-fg">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-5 font-semibold">ผู้ช่วยอ่านข้อมูล</p>
              <p className="type-meta text-frame-ink">ตอบจากผลสำรวจวัดคูหาภิมุข</p>
            </div>
            <button type="button" onClick={reset} aria-label="เริ่มคุยใหม่" title="เริ่มคุยใหม่" className="flex h-9 w-9 items-center justify-center rounded-lg text-frame-ink hover:bg-white/10">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={close} aria-label="ปิดผู้ช่วย" title="ปิด" className="flex h-9 w-9 items-center justify-center rounded-lg text-frame-ink hover:bg-white/10">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4" aria-live="polite" aria-busy={loading}>
            <Bubble role="assistant">
              สวัสดีครับ ผมช่วยอธิบายผลสำรวจนักท่องเที่ยววัดคูหาภิมุขให้เข้าใจง่าย ๆ และช่วยคิดว่าจะนำไปใช้กับร้านของคุณอย่างไร
              {!picked && <p className="mt-2 font-medium">คุณทำธุรกิจอะไรอยู่ครับ?</p>}
            </Bubble>

            {!picked && (
              <div className="flex flex-wrap gap-2 pl-1">
                {BUSINESS_CHOICES.map((b) => (
                  <Chip
                    key={b.key ?? "none"}
                    onClick={() => {
                      setBusiness(b.key);
                      setPicked(true);
                    }}
                  >
                    {b.label}
                  </Chip>
                ))}
              </div>
            )}

            {picked && messages.length === 0 && (
              <>
                <Bubble role="assistant">
                  {business ? "รับทราบครับ" : "ได้เลยครับ"} ลองกดคำถามด้านล่าง หรือพิมพ์ถามได้เลย เช่น &quot;ไม่เข้าใจกราฟนี้&quot;
                </Bubble>
                <div className="flex flex-wrap gap-2 pl-1">
                  {quickQuestions(pathname).map((q) => (
                    <Chip key={q} onClick={() => ask(q)}>
                      {q}
                    </Chip>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.role === "assistant" ? <Rich text={m.content} /> : m.content}
              </Bubble>
            ))}

            {loading && (
              <Bubble role="assistant">
                <span className="inline-flex items-center gap-1 py-1" role="status" aria-label="กำลังพิมพ์">
                  <Dot d="0ms" />
                  <Dot d="150ms" />
                  <Dot d="300ms" />
                </span>
              </Bubble>
            )}

            {error && (
              <div role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-[14px] text-danger">
                {error}
                {messages.length > 0 && messages[messages.length - 1].role === "user" && (
                  <button type="button" onClick={() => void send(messages)} className="ml-2 font-semibold underline">
                    ลองอีกครั้ง
                  </button>
                )}
              </div>
            )}

            {showFollowUps && (
              <div className="flex flex-wrap gap-2 pl-1">
                {FOLLOW_UPS.map((q) => (
                  <Chip key={q} onClick={() => ask(q)}>
                    {q}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-line bg-surface px-3 pt-3 pb-2">
            <div className="flex items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">
                พิมพ์คำถาม
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={MAX_LEN}
                disabled={!picked}
                placeholder={picked ? "พิมพ์คำถามที่นี่…" : "เลือกประเภทธุรกิจก่อนนะครับ"}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    ask(input);
                  }
                }}
                className="field max-h-28 min-h-10 flex-1 resize-none py-2 text-[15px] leading-6"
              />
              <button
                type="submit"
                disabled={!picked || loading || !input.trim()}
                aria-label="ส่งคำถาม"
                className="btn btn-primary h-10 w-10 shrink-0 !px-0"
              >
                <SendHorizontal className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-center text-[12px] leading-4 text-ink-3">
              ตอบจากผลสำรวจ ไม่ใช่คำแนะนำที่รับประกันผล · ควรเทียบตัวเลขกับกราฟอีกครั้ง
            </p>
          </form>
        </section>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-6 break-words whitespace-pre-wrap ${
          mine ? "rounded-br-md bg-navy-solid text-navy-fg" : "rounded-bl-md bg-surface text-ink shadow-[var(--shadow-card)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Chip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-amber/60 bg-amber-soft px-3 py-1.5 text-left text-[14px] leading-5 font-medium text-amber-ink transition-colors duration-150 hover:bg-amber hover:text-amber-fg"
    >
      {children}
    </button>
  );
}

function Dot({ d }: { d: string }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: d }} />;
}
