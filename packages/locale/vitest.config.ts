import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))

// Resolve sibling @luwio/* packages to their source so tests run without a prior build (CI tests
// before it builds). `/react` subpaths first, so they aren't swallowed by the bare-specifier alias.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '@luwio/country/react': src('country/src/react.ts'),
      '@luwio/language/react': src('language/src/react.ts'),
      '@luwio/country': src('country/src/index.ts'),
      '@luwio/language': src('language/src/index.ts'),
    },
  },
})
