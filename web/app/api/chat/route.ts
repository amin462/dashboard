import type { NextRequest } from "next/server";
import { askGemini } from "@/lib/ai/gemini";
import { buildContext } from "@/lib/ai/context";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { rateLimit } from "@/lib/ai/ratelimit";
import { PAGE_TITLES, parseChatRequest } from "@/lib/ai/request";
import { bangkokDate } from "@/components/format";
import { getSurveyBundle } from "../../(dash)/_data";

// ผู้ช่วย AI ตอบจากสถิติสรุปของ lib/survey (ไม่ส่งแถวรายคน, ไม่เก็บบทสนทนา)
// คีย์ GEMINI_API_KEY อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น ; ไม่มีคีย์ -> 503 code=disabled (เว็บส่วนอื่นทำงานปกติ)
// ตอบ { ok:true, reply } | { ok:false, code: disabled|bad_request|rate_limited|quota|blocked|error, message }

const LIMIT_PER_MIN = 8;
const fail = (code: string, message: string, status: number, headers?: HeadersInit) =>
  Response.json({ ok: false, code, message }, { status, headers });

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  // CHAT_MOCK=1 (ไม่มีคีย์) = โหมดจำลองไว้ดูหน้าตา UI เท่านั้น ห้ามใช้บน production จริง
  const mock = !apiKey && process.env.CHAT_MOCK === "1";
  if (!apiKey && !mock) return fail("disabled", "ผู้ช่วย AI ยังไม่เปิดใช้งาน", 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip, LIMIT_PER_MIN, 60_000);
  if (!rl.ok) {
    return fail("rate_limited", `ถามถี่เกินไป กรุณารออีก ${rl.retryAfterSec} วินาที`, 429, {
      "retry-after": String(rl.retryAfterSec),
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("bad_request", "รูปแบบคำขอไม่ถูกต้อง", 400);
  }
  const req = parseChatRequest(body);
  if (!req) return fail("bad_request", "รูปแบบคำขอไม่ถูกต้อง", 400);

  const { rows } = await getSurveyBundle();
  const context = buildContext(rows, {
    business: req.business,
    pageTitle: req.page ? PAGE_TITLES[req.page] : null,
    filters: req.filters,
    today: bangkokDate(new Date().toISOString()),
  });

  if (mock) {
    return Response.json({
      ok: true,
      reply: `(โหมดจำลอง) ผู้ตอบแบบสำรวจตอนนี้มี ${rows.length} คน
- ตัวอย่างข้อความตอบกลับสำหรับดูหน้าตาแชต
- เมื่อใส่คีย์จริง **ผู้ช่วยจะตอบจากข้อมูลสำรวจ** พร้อมฐาน n`,
    });
  }

  const result = await askGemini({
    system: SYSTEM_PROMPT,
    context,
    messages: req.messages,
    apiKey: apiKey as string,
    model: process.env.GEMINI_MODEL,
  });
  if (result.ok) return Response.json({ ok: true, reply: result.text });
  if (result.code === "quota") {
    return fail("quota", "ผู้ช่วยกำลังมีผู้ใช้งานจำนวนมาก กรุณาลองใหม่อีกครั้งในอีกสักครู่", 429);
  }
  if (result.code === "blocked") {
    return fail("blocked", "ขออภัย ระบบตอบคำถามนี้ไม่ได้ ลองพิมพ์ใหม่ด้วยคำอื่น หรือกดปุ่มคำถามสำเร็จรูปนะครับ", 422);
  }
  return fail("error", "ผู้ช่วยขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง", 502);
}
