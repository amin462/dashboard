import 'server-only'
import type { ChatMessage } from './request'

export type GeminiResult = { ok: true; text: string } | { ok: false; code: 'quota' | 'blocked' | 'error' }

export const DEFAULT_MODEL = 'gemini-flash-lite-latest'

/** เรียก Gemini (Google AI Studio) ฝั่งเซิร์ฟเวอร์ ; ไม่คืนรายละเอียด error ที่อาจมีข้อมูลภายในให้ผู้ใช้ */
export async function askGemini(opts: {
  system: string
  context: string
  messages: ChatMessage[]
  apiKey: string
  model?: string
}): Promise<GeminiResult> {
  const model = opts.model || DEFAULT_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const contents = opts.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  try {
    const call = () => fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${opts.system}\n\n# บริบทข้อมูล (คำนวณโดยระบบ ใช้ตอบเท่านั้น)\n${opts.context}` }],
        },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(25_000),
    })
    let res = await call()
    // 503 = โมเดลคนใช้เยอะชั่วคราว: ลองซ้ำ 1 ครั้ง แล้วตอบว่าไม่ว่าง
    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, 1200))
      res = await call()
    }
    if (res.status === 429 || res.status === 503) return { ok: false, code: 'quota' }
    if (!res.ok) {
      // log เฉพาะสถานะ (ไม่ log คีย์/เนื้อหา) ไว้ดีบักใน Vercel logs เช่น 403 = โปรเจกต์คีย์ใช้ฟรีไม่ได้, 404 = ชื่อรุ่นผิด
      console.error('[chat] Gemini HTTP', res.status, model)
      return { ok: false, code: 'error' }
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
      promptFeedback?: { blockReason?: string }
    }
    if (data.promptFeedback?.blockReason) {
      console.error('[chat] Gemini blocked prompt:', data.promptFeedback.blockReason)
      return { ok: false, code: 'blocked' }
    }
    const cand = data.candidates?.[0]
    const text = cand?.content?.parts?.map((p) => p.text ?? '').join('').trim()
    if (!text) {
      console.error('[chat] Gemini empty reply, finishReason:', cand?.finishReason)
      return { ok: false, code: cand?.finishReason === 'SAFETY' ? 'blocked' : 'error' }
    }
    return { ok: true, text }
  } catch {
    return { ok: false, code: 'error' }
  }
}
