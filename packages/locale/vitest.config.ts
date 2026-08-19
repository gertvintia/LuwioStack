import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Resolve sibling @luwio/* packages to their source so tests run without a prior build
// (CI tests before it builds). At publish time they're normal dependencies, from dist.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '@luwio/country': fileURLToPath(new URL('../country/src/index.ts', import.meta.url)),
      '@luwio/language': fileURLToPath(new URL('../language/src/index.ts', import.meta.url)),
    },
  },
})
