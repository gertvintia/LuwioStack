import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Resolve @luwio/language to its source so tests run without a prior build (CI tests
// before it builds). At publish time it's a normal dependency, resolved from dist.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@luwio/language': fileURLToPath(new URL('../language/src/index.ts', import.meta.url)),
    },
  },
})
