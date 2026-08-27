import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Resolve @luwio/language to its source so tests run without a prior build.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '@luwio/language': fileURLToPath(new URL('../language/src/index.ts', import.meta.url)),
    },
  },
})
