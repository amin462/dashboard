/**
 * smoke.ts — ตรวจเว็บที่รัน/ deploy อยู่ด้วย fetch ล้วน (ไม่ใช้ browser)
 * ใช้: pnpm -C web smoke -- https://<โดเมน> [--expect-real]
 *      ไม่ใส่ URL = http://localhost:3000
 *      --expect-real = ตรวจว่าไม่มีแบนเนอร์ "ข้อมูลตัวอย่าง"/"ข้อมูลทดสอบ" บนหน้า / (ใช้หลังลบ seed)
 * ต้องเปิดเซิร์ฟเวอร์ปลายทางไว้ก่อน (dev/start หรือโดเมนจริง) ; exit 1 ถ้ามีข้อตรวจไม่ผ่าน
 */
const PHRASE = "วัดคูหาภิมุข";
const DEFAULT_BASE = "http://localhost:3000";
const TIMEOUT_MS = 30_000;

const ROUTES = [
  "/",
  "/visitors",
  "/travel",
  "/awareness",
  "/spending",
  "/satisfaction",
  "/business",
  "/reports",
  "/guide",
  "/survey-poster",
  "/admin/login",
] as const;

type Result = { ok: boolean; check: string; detail: string };

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function errText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const expectReal = argv.includes("--expect-real");
  const baseArg = argv.find((a) => !a.startsWith("--")) ?? DEFAULT_BASE;

  let base: string;
  try {
    base = new URL(baseArg).origin;
  } catch {
    fail(`URL ไม่ถูกต้อง: ${baseArg} (ตัวอย่าง: https://example.vercel.app)`);
  }

  const results: Result[] = [];
  const get = (path: string, redirect: RequestRedirect = "follow") =>
    fetch(new URL(path, base), {
      redirect,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "cache-control": "no-cache" },
    });

  console.log(`SMOKE TEST — ${base}`);
  console.log(expectReal ? "โหมด --expect-real: หน้า / ต้องไม่มีข้อความ \"ข้อมูลตัวอย่าง\"" : "ไม่ได้ใส่ --expect-real: ข้ามการตรวจ \"ข้อมูลตัวอย่าง\" บนหน้า /");
  console.log("");

  // 1) หน้าเว็บทั้งหมด: 200 + มีคำว่า "วัดคูหาภิมุข"
  let homeHtml: string | null = null;
  for (const path of ROUTES) {
    try {
      const res = await get(path);
      const html = await res.text();
      if (path === "/") homeHtml = html;

      if (res.status !== 200) {
        results.push({ ok: false, check: `GET ${path}`, detail: `ได้ ${res.status} (คาด 200)` });
      } else if (!html.includes(PHRASE)) {
        results.push({ ok: false, check: `GET ${path}`, detail: `ได้ 200 แต่ไม่พบคำว่า "${PHRASE}"` });
      } else {
        results.push({ ok: true, check: `GET ${path}`, detail: `200 • พบคำว่า "${PHRASE}"` });
      }
    } catch (e) {
      results.push({ ok: false, check: `GET ${path}`, detail: `เรียกไม่สำเร็จ: ${errText(e)}` });
    }
  }

  // 2) /admin/quality ไม่มี cookie → redirect ไป /admin/login
  try {
    const res = await get("/admin/quality", "manual");
    const location = res.headers.get("location");
    if (res.status !== 307 && res.status !== 308) {
      results.push({
        ok: false,
        check: "GET /admin/quality (ไม่มี cookie)",
        detail: `ได้ ${res.status} (คาด 307/308 ไป /admin/login)`,
      });
    } else if (!location) {
      results.push({
        ok: false,
        check: "GET /admin/quality (ไม่มี cookie)",
        detail: `ได้ ${res.status} แต่ไม่มี header Location`,
      });
    } else {
      const target = new URL(location, base);
      const ok = target.pathname === "/admin/login";
      results.push({
        ok,
        check: "GET /admin/quality (ไม่มี cookie)",
        detail: ok ? `${res.status} → ${target.pathname}${target.search}` : `${res.status} → ${target.pathname}${target.search} (คาด /admin/login)`,
      });
    }
  } catch (e) {
    results.push({ ok: false, check: "GET /admin/quality (ไม่มี cookie)", detail: `เรียกไม่สำเร็จ: ${errText(e)}` });
  }

  // 3) POST /api/admin/import ไม่มี cookie → 401
  try {
    const res = await fetch(new URL("/api/admin/import", base), {
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await res.text(); // เก็บกวาด body
    results.push({
      ok: res.status === 401,
      check: "POST /api/admin/import (ไม่มี cookie)",
      detail: res.status === 401 ? "401 ไม่ได้รับอนุญาต" : `ได้ ${res.status} (คาด 401)`,
    });
  } catch (e) {
    results.push({ ok: false, check: "POST /api/admin/import (ไม่มี cookie)", detail: `เรียกไม่สำเร็จ: ${errText(e)}` });
  }

  // 4) --expect-real: หน้า / ต้องไม่มีข้อความ "ข้อมูลตัวอย่าง"
  if (expectReal) {
    if (homeHtml === null) {
      results.push({ ok: false, check: "หน้า / (--expect-real)", detail: "ไม่มี HTML ของหน้า / ให้ตรวจ" });
    } else if (homeHtml.includes("ข้อมูลตัวอย่าง") || homeHtml.includes("ข้อมูลทดสอบ")) {
      results.push({
        ok: false,
        check: "หน้า / (--expect-real)",
        detail: 'พบข้อความ "ข้อมูลตัวอย่าง"/"ข้อมูลทดสอบ" — ยังมี seed ในฐานข้อมูล หรือระบบ fallback เป็น mock',
      });
    } else {
      results.push({ ok: true, check: "หน้า / (--expect-real)", detail: 'ไม่พบข้อความ "ข้อมูลตัวอย่าง"' });
    }
  }

  console.table(
    results.map((r, i) => ({
      "#": i + 1,
      ผล: r.ok ? "✓" : "✗",
      รายการตรวจ: r.check,
      รายละเอียด: r.detail,
    })),
  );

  const failed = results.filter((r) => !r.ok).length;
  console.log("");
  console.log(failed === 0 ? `✓ ผ่านทั้งหมด ${results.length} รายการ` : `✗ ไม่ผ่าน ${failed}/${results.length} รายการ`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e: unknown) => {
  console.error(`✗ SMOKE TEST ล้มเหลว: ${errText(e)}`);
  process.exit(1);
});
