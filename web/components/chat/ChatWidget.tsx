"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { filtersFromSearchParams } from "@/lib/survey/filters";
import { MessageCircle, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { BUSINESS_CHOICES, FOLLOW_UPS, TOPIC_STARTERS, quickQuestions, type BusinessKey } from "./chat-config";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_LEN = 800;

/** ฟองทักทายข้างปุ่มแชต: หมุนทีละข้อความ (แสดงไม่เกิน 3 ข้อความต่อการเปิดเว็บ ปิดได้ แล้วจะไม่โผล่อีกในแท็บนี้) */
const TEASERS = ["สวัสดีครับ 👋 ไม่เข้าใจกราฟตรงไหน ถามผมได้เลย", "อยากรู้ว่าลูกค้าเป็นใคร ใช้จ่ายเท่าไร? ถามได้ครับ", "ช่วยวางแผนการตลาดให้ร้านคุณได้นะ ✨"];
const TEASER_KEY = "yala-chat-teaser-off";

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

/**
 * คำตอบ AI ที่ "พิมพ์ทีละนิด" (เฉพาะข้อความที่เพิ่งมาถึง ; ใช้เวลา 0.9–3 วินาที ตามความยาว)
 * ไม่ทำเมื่อผู้ใช้ตั้งลดการเคลื่อนไหว · กดที่ฟองเพื่อข้ามไปแสดงทั้งหมด · ตัด ** ที่ยังไม่ปิดออกระหว่างพิมพ์ กันดอกจันโผล่
 */
function TypedReply({ text, animate, onProgress }: { text: string; animate: boolean; onProgress: () => void }) {
  const [n, setN] = useState(animate ? 0 : text.length);
  const progress = useRef(onProgress);
  useEffect(() => {
    progress.current = onProgress;
  });
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    let start = 0;
    const total = Math.min(3000, Math.max(900, text.length * 12));
    const step = (t: number) => {
      if (!start) start = t;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const p = reduce ? 1 : Math.min(1, (t - start) / total);
      setN(Math.ceil(text.length * p));
      progress.current();
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animate, text]);

  const done = n >= text.length;
  const shown = done ? text : text.slice(0, n).replace(/\*\*[^*]*$/, "");
  return (
    <div onClick={() => setN(text.length)} aria-busy={!done}>
      <Rich text={shown} />
      {!done && <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-ink-3" />}
    </div>
  );
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
  /** index ของข้อความผู้ช่วยที่เพิ่งมาถึง (พิมพ์ทีละนิด) ; null = ไม่มี */
  const [typing, setTyping] = useState<number | null>(null);
  /** ฟองทักทาย: index ข้อความที่แสดงอยู่ (null = ไม่แสดง) และสถานะกำลังหดออก */
  const [teaser, setTeaser] = useState<number | null>(null);
  const [teaserLeaving, setTeaserLeaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ฟองทักทาย: รอ 4 วินาที → แสดง 7 วินาที → พัก 5 วินาที → ข้อความถัดไป (ครบ 3 ข้อความหรือผู้ใช้ปิด/เปิดแชต = หยุด)
  useEffect(() => {
    if (open) {
      // เปิดแชตแล้ว = ผู้ใช้รู้จักผู้ช่วยแล้ว ไม่ต้องทักอีกในแท็บนี้
      try {
        sessionStorage.setItem(TEASER_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    let off = false;
    try {
      off = sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {
      /* ไม่มี sessionStorage (โหมดส่วนตัว) = แสดงตามปกติ */
    }
    if (off) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    let t = 4000;
    TEASERS.forEach((_, i) => {
      at(t, () => {
        setTeaserLeaving(false);
        setTeaser(i);
      });
      at(t + 7000, () => setTeaserLeaving(true));
      at(t + 7250, () => setTeaser(null));
      t += 12_000;
    });
    return () => {
      timers.forEach(window.clearTimeout);
      setTeaser(null);
      setTeaserLeaving(false);
    };
  }, [open]);

  const dismissTeaser = () => {
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      /* ignore */
    }
    setTeaserLeaving(true);
    window.setTimeout(() => setTeaser(null), 250);
  };

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
        if (data && data.ok) {
          setTyping(history.length);
          setMessages([...history, { role: "assistant", content: data.reply }]);
        }
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
    setTyping(null);
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
        <div className="no-print fixed right-4 bottom-[4.75rem] z-40 flex flex-col items-end gap-2.5 lg:right-6 lg:bottom-6">
          {teaser !== null && (
            <div key={teaser} data-leaving={teaserLeaving} className="chat-teaser relative max-w-[17rem] rounded-2xl rounded-br-md bg-surface py-2.5 pr-9 pl-3.5 text-[14px] leading-5 text-ink shadow-[0_8px_24px_rgb(80_50_20/.22)]">
              <button
                type="button"
                onClick={() => {
                  dismissTeaser();
                  setOpen(true);
                }}
                className="text-left"
              >
                {TEASERS[teaser]}
              </button>
              <button
                type="button"
                onClick={dismissTeaser}
                aria-label="ปิดข้อความทักทาย"
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="chat-fab relative inline-flex h-12 items-center gap-2 rounded-full bg-amber px-4 text-[15px] font-semibold text-amber-fg shadow-[0_6px_20px_rgb(80_50_20/.28)] transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <MessageCircle className="chat-wiggle h-5 w-5" aria-hidden="true" />
            ถามผู้ช่วย
          </button>
        </div>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="ผู้ช่วยอ่านข้อมูล"
          className="chat-panel no-print fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface pb-[env(safe-area-inset-bottom)] lg:inset-auto lg:right-6 lg:bottom-6 lg:h-[620px] lg:max-h-[calc(100dvh-3rem)] lg:w-[400px] lg:rounded-2xl lg:pb-0 lg:shadow-[0_14px_48px_rgb(80_50_20/.3)]"
        >
          <header className="flex items-center gap-3 bg-navy-solid px-4 py-3 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-5 font-semibold">ผู้ช่วยอ่านข้อมูล</p>
              <p className="type-meta text-white/85">ตอบจากผลสำรวจวัดคูหาภิมุข</p>
            </div>
            <button type="button" onClick={reset} aria-label="เริ่มคุยใหม่" title="เริ่มคุยใหม่" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/15">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={close} aria-label="ปิดผู้ช่วย" title="ปิด" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/15">
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
                {BUSINESS_CHOICES.map((b, i) => (
                  <Chip
                    i={i}
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
                  <p>
                    {business ? "รับทราบครับ" : "ได้เลยครับ"} ขอรู้จักธุรกิจของคุณคร่าว ๆ หน่อยนะครับ จะได้แนะนำตรงจุดขึ้น
                  </p>
                  <p className="mt-2">
                    เล่าสั้น ๆ ได้เลย เช่น ขายอะไร อยู่ตรงไหน ตอนนี้ทำการตลาดอย่างไร ใช้ช่องทางไหน จัดโปรแบบไหน หรืออยากวางแผนเรื่องอะไร
                    (กดหัวข้อด้านล่างเพื่อเติมแบบฟอร์มสั้น ๆ แล้วแก้ข้อความในวงเล็บได้)
                  </p>
                </Bubble>
                <div className="flex flex-wrap gap-2 pl-1">
                  {TOPIC_STARTERS.map((t, i) => (
                    <Chip
                      i={i}
                      key={t.label}
                      onClick={() => {
                        setInput(t.template);
                        inputRef.current?.focus();
                      }}
                    >
                      {t.label}
                    </Chip>
                  ))}
                </div>
                <p className="pl-1 type-meta text-ink-3">หรือถามจากข้อมูลสำรวจโดยตรง:</p>
                <div className="flex flex-wrap gap-2 pl-1">
                  {quickQuestions(pathname).map((q, i) => (
                    <Chip key={q} i={i + TOPIC_STARTERS.length} onClick={() => ask(q)}>
                      {q}
                    </Chip>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.role === "assistant" ? (
                  <TypedReply
                    text={m.content}
                    animate={typing === i}
                    onProgress={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })}
                  />
                ) : (
                  m.content
                )}
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
                {FOLLOW_UPS.map((q, i) => (
                  <Chip key={q} i={i} onClick={() => ask(q)}>
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
                rows={input.length > 70 ? 4 : 1}
                value={input}
                maxLength={MAX_LEN}
                disabled={!picked}
                placeholder={!picked ? "เลือกประเภทธุรกิจก่อนนะครับ" : messages.length === 0 ? "เล่าธุรกิจของคุณคร่าว ๆ หรือพิมพ์คำถาม…" : "พิมพ์คำถามที่นี่…"}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    ask(input);
                  }
                }}
                className="field max-h-40 min-h-10 flex-1 resize-none py-2 text-[15px] leading-6"
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
        className={`chat-rise max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-6 break-words whitespace-pre-wrap ${
          mine ? "rounded-br-md bg-navy-solid text-navy-fg" : "rounded-bl-md bg-surface text-ink shadow-[var(--shadow-card)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Chip({ children, onClick, i = 0 }: { children: ReactNode; onClick: () => void; i?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
      className="chat-rise rounded-full border border-amber/60 bg-amber-soft px-3 py-1.5 text-left text-[14px] leading-5 font-medium text-amber-ink transition-colors duration-150 hover:bg-amber hover:text-amber-fg"
    >
      {children}
    </button>
  );
}

function Dot({ d }: { d: string }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: d }} />;
}
