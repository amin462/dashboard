// config สำหรับรัน test ของ web/lib/import/** (จนกว่าเจ้าของ web/vitest.config.mts จะเพิ่ม
// 'lib/**/*.test.ts' ใน include — ดู docs/HANDOFF_NOTES.md) ไฟล์นี้ไม่ถูก vitest หยิบอัตโนมัติ
// รัน: pnpm -C web exec vitest run --config lib/import/vitest.import.mts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

const webRoot = path.resolve(import.meta.dirname, '../..')

export default defineConfig({
  root: webRoot,
  resolve: {
    alias: { '@': webRoot },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
})
