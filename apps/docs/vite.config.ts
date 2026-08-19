import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// During local dev we point the @luwio/* imports straight at each package's source
// directory, so the docs reflect edits instantly without a separate build step.
const pkgSrc = (pkg: string) => fileURLToPath(new URL(`../../packages/${pkg}/src`, import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5199,
  },
  resolve: {
    alias: {
      '@luwio/locale': pkgSrc('locale'),
      '@luwio/country': pkgSrc('country'),
      '@luwio/language': pkgSrc('language'),
      '@luwio/config': pkgSrc('config'),
      '@luwio/storage': pkgSrc('storage'),
    },
  },
})
