/**
 * screenshots.mjs — ถ่ายภาพหน้าจอชุดสำหรับคู่มือ/รายงาน ด้วย Edge/Chrome ที่ติดตั้งอยู่แล้ว (headless + CDP)
 * ไม่ต้องลง Playwright/browser เพิ่ม ; ใช้ Node >= 22 (WebSocket ในตัว)
 *
 *   pnpm -C web build && pnpm -C web exec next start -p 3100     # เปิดเว็บก่อน (อีกเทอร์มินัล)
 *   node web/scripts/screenshots.mjs docs/screenshots/demo               # ถ่ายทั้งชุด
 *   node web/scripts/screenshots.mjs docs/screenshots/real http://localhost:3100 --only=home-desktop,home-mobile
 *
 * หน้า /admin/* ต้องใช้ ADMIN_PASSCODE (อ่านจาก env หรือ web/.env.local — ไม่พิมพ์ลงจอ)
 * โปรไฟล์ชั่วคราวอยู่ที่ .tmp/edge-profile (ไดรฟ์เดียวกับโปรเจกต์ ไม่แตะไดรฟ์ C)
 * นอกจาก PNG ยังเขียน .tmp/print-preview/reports-print.pdf (A4) ไว้ตรวจการพิมพ์ ; เพิ่ม --pdf-preview เพื่อถ่ายภาพทีละหน้า A4
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith("--only=")) ?? "").replace("--only=", "").split(",").filter(Boolean);
const [outArg, baseArg] = args.filter((a) => !a.startsWith("--"));
const outDir = resolve(outArg ?? join(root, "docs", "screenshots", "demo"));
const base = (baseArg ?? "http://localhost:3100").replace(/\/$/, "");
const port = 9333;
const profile = join(root, ".tmp", "edge-profile");

const browserPath = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].find((p) => p && existsSync(p));
if (!browserPath) throw new Error("ไม่พบ Edge/Chrome — ตั้ง BROWSER_PATH");

function passcode() {
  if (process.env.ADMIN_PASSCODE) return process.env.ADMIN_PASSCODE;
  const envFile = join(root, "web", ".env.local");
  if (!existsSync(envFile)) return "";
  const m = readFileSync(envFile, "utf8").match(/^ADMIN_PASSCODE=(.*)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, ".tmp"), { recursive: true });
rmSync(profile, { recursive: true, force: true });

const proc = spawn(
  browserPath,
  ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" },
);

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* ยังไม่พร้อม */
    }
    await sleep(250);
  }
  throw new Error("เชื่อมต่อ browser ไม่ได้");
}

const ws = new WebSocket(await connect());
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});
let nextId = 0;
const pending = new Map();
const waiters = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) rej(new Error(msg.error.message));
    else res(msg.result);
  } else if (msg.method) {
    for (const w of [...waiters]) if (w.method === msg.method) { waiters.splice(waiters.indexOf(w), 1); w.res(); }
  }
};
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++nextId;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
const waitEvent = (method, ms = 15000) =>
  new Promise((res) => {
    const w = { method, res };
    waiters.push(w);
    setTimeout(res, ms);
  });
const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return r.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

const DESKTOP = { width: 1280, height: 800, mobile: false };
const MOBILE = { width: 390, height: 844, mobile: true };
let current = null;
async function viewport(v) {
  if (current === v) return;
  current = v;
  await send("Emulation.setDeviceMetricsOverride", { width: v.width, height: v.height, deviceScaleFactor: 1, mobile: v.mobile });
}

async function open(path) {
  const loaded = waitEvent("Page.loadEventFired");
  await send("Page.navigate", { url: base + path });
  await loaded;
  // รอจน skeleton ที่มองเห็นหายหมด แล้วรอแอนิเมชันกราฟอีกนิด
  for (let i = 0; i < 40; i++) {
    const n = await evalJs(`[...document.querySelectorAll('[class*="animate-pulse"]')].filter(e => e.offsetParent !== null).length`);
    if (!n) break;
    await sleep(250);
  }
  await sleep(1800);
}

async function shot(name, dir = outDir, tall = false) {
  const params = { format: "png" };
  if (tall) {
    // ถ่ายยาวเกินจอ (สูงสุด 1500px) เช่น หน้าพรีวิวนำเข้า
    const m = await send("Page.getLayoutMetrics");
    params.captureBeyondViewport = true;
    params.clip = { x: 0, y: 0, width: current.width, height: Math.min(Math.ceil(m.cssContentSize.height), 1500), scale: 1 };
  }
  const { data } = await send("Page.captureScreenshot", params);
  writeFileSync(join(dir, `${name}.png`), Buffer.from(data, "base64"));
  console.log("✓", name);
}

const clickJs = (sel, nth = 0) => evalJs(`(() => { const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(e => e.offsetParent !== null); if (!els[${nth}]) return false; els[${nth}].click(); return true; })()`);

const pages = ["home:/", "guide:/guide", "survey-poster:/survey-poster", "visitors:/visitors", "travel:/travel", "awareness:/awareness", "spending:/spending", "satisfaction:/satisfaction", "business:/business", "reports:/reports"];
const want = (name) => only.length === 0 || only.includes(name);

try {
  // ---------- เดสก์ท็อป ----------
  await viewport(DESKTOP);
  for (const p of pages) {
    const [name, path] = p.split(":");
    if (!want(`${name}-desktop`)) continue;
    await open(path);
    await shot(`${name}-desktop`);
  }
  if (want("filter-popover-desktop")) {
    await open("/");
    await clickJs('section[aria-label="ตัวกรองข้อมูล"] button[aria-haspopup="true"]', 1); // อายุ
    await sleep(300);
    await clickJs('section[aria-label="ตัวกรองข้อมูล"] input[type="checkbox"]', 1);
    await sleep(900);
    await shot("filter-popover-desktop");
  }
  if (want("visitors-table-desktop")) {
    await open("/visitors");
    await clickJs('button[aria-label="ดูเป็นตาราง"]', 0);
    await sleep(500);
    await shot("visitors-table-desktop");
  }
  if (want("reports-print-desktop")) {
    await open("/reports");
    await send("Emulation.setEmulatedMedia", { media: "print", features: [{ name: "prefers-color-scheme", value: "light" }] });
    current = null;
    await viewport({ width: 794, height: 1123, mobile: false });
    await sleep(800);
    await shot("reports-print-desktop");
    const pdf = await send("Page.printToPDF", { paperWidth: 8.27, paperHeight: 11.69, printBackground: true, preferCSSPageSize: true });
    const previewDir = join(root, ".tmp", "print-preview"); // PDF + ภาพตรวจหน้า A4 ไม่ปนกับภาพในเอกสาร
    mkdirSync(previewDir, { recursive: true });
    writeFileSync(join(previewDir, "reports-print.pdf"), Buffer.from(pdf.data, "base64"));
    console.log("✓ .tmp/print-preview/reports-print.pdf");
    if (args.includes("--pdf-preview")) {
      // เปิด PDF ใน viewer ของ browser แล้วเลื่อนถ่ายทีละหน้า (ใช้ตรวจการแบ่งหน้า A4)
      current = null;
      await viewport({ width: 900, height: 1272, mobile: false });
      const loaded = waitEvent("Page.loadEventFired");
      await send("Page.navigate", { url: "file:///" + join(previewDir, "reports-print.pdf").replace(/\\/g, "/") + "#toolbar=0&navpanes=0&view=FitH" });
      await loaded;
      await sleep(2500);
      for (let p = 1; p <= 10; p++) {
        await shot(`reports-print-p${p}`, previewDir);
        await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 450, y: 600, deltaX: 0, deltaY: 1272 });
        await sleep(900);
      }
    }
    await send("Emulation.setEmulatedMedia", { media: "", features: [{ name: "prefers-color-scheme", value: "light" }] });
    current = null;
    await viewport(DESKTOP);
  }
  // หน้าล็อกอินต้องถ่ายก่อนล็อกอิน (หลังล็อกอินจะถูกส่งต่อไป /admin/import)
  if (want("admin-login-desktop")) {
    await open("/admin/login");
    await shot("admin-login-desktop");
  }
  if (want("admin-login-mobile")) {
    await viewport(MOBILE);
    await open("/admin/login");
    await shot("admin-login-mobile");
    await viewport(DESKTOP);
  }

  // ---------- ผู้ดูแล (ล็อกอินครั้งเดียว) ----------
  if (["admin-import-desktop", "admin-quality-desktop", "admin-import-preview-desktop", "admin-import-mobile", "admin-quality-mobile"].some(want)) {
    const code = passcode();
    if (!code) throw new Error("ไม่พบ ADMIN_PASSCODE");
    await open("/admin/login");
    await evalJs(`(() => { const i = document.getElementById('passcode'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, ${JSON.stringify(code)}); i.dispatchEvent(new Event('input', { bubbles: true })); i.form.requestSubmit(); })()`);
    for (let i = 0; i < 40 && (await evalJs("location.pathname")) === "/admin/login"; i++) await sleep(250);
    if (want("admin-import-desktop")) { await open("/admin/import"); await shot("admin-import-desktop"); }
    if (want("admin-quality-desktop")) { await open("/admin/quality"); await shot("admin-quality-desktop"); }
    // พรีวิวนำเข้า CSV (ไม่กดยืนยัน = ไม่เขียนฐานข้อมูล) — ต้องมีไฟล์ตัวอย่าง (.tmp/demo-import.csv หรือ --csv=path)
    const csvPath = resolve((args.find((a) => a.startsWith("--csv=")) ?? "").replace("--csv=", "") || join(root, ".tmp", "demo-import.csv"));
    if (want("admin-import-preview-desktop") && existsSync(csvPath)) {
      await open("/admin/import");
      const { root: doc } = await send("DOM.getDocument");
      const { nodeId } = await send("DOM.querySelector", { nodeId: doc.nodeId, selector: 'input[type="file"]' });
      await send("DOM.setFileInputFiles", { files: [csvPath], nodeId });
      await sleep(2000);
      await shot("admin-import-preview-desktop", outDir, true);
    }
    await viewport(MOBILE);
    if (want("admin-import-mobile")) { await open("/admin/import"); await shot("admin-import-mobile"); }
    if (want("admin-quality-mobile")) { await open("/admin/quality"); await shot("admin-quality-mobile"); }
  }

  // ---------- มือถือ ----------
  await viewport(MOBILE);
  for (const p of pages) {
    const [name, path] = p.split(":");
    if (!want(`${name}-mobile`)) continue;
    await open(path);
    await shot(`${name}-mobile`);
  }
  if (want("filter-sheet-mobile")) {
    await open("/");
    await clickJs('section[aria-label="ตัวกรองข้อมูล"] button[aria-haspopup="dialog"]', 0);
    await sleep(700);
    await shot("filter-sheet-mobile");
  }
  // แชตผู้ช่วย AI (ต้องเปิดใช้: GEMINI_API_KEY หรือ CHAT_MOCK=1 บนเซิร์ฟเวอร์) — ไม่เปิด = ข้าม
  for (const [name, vp] of [["chat-desktop", DESKTOP], ["chat-mobile", MOBILE]]) {
    if (!want(name) && !want(`${name}-start`)) continue;
    await viewport(vp);
    await open("/spending");
    const opened = await evalJs(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('ถามผู้ช่วย'))`);
    if (!opened) continue;
    await evalJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('ถามผู้ช่วย'))?.click()`);
    await sleep(500);
    await shot(`${name}-start`);
    await evalJs(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.textContent.includes('ร้านอาหาร'))?.click()`);
    await sleep(400);
    await evalJs(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.textContent.includes('ควรโฆษณา'))?.click()`);
    await sleep(2500);
    await shot(name);
  }
} finally {
  ws.close();
  try {
    execFileSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
  } catch {
    proc.kill();
  }
  await sleep(800);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* Edge ยังปล่อยไฟล์ไม่หมด — ลบรอบหน้า */
  }
}
