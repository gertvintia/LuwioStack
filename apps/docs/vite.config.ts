import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// During local dev we point the @luwio/* imports straight at each package's source
// directory, so the docs reflect edits instantly without a separate build step.
const pkgSrc = (pkg: string) => fileURLToPath(new URL(`../../packages/${pkg}/src`, import.meta.url))
const pkgReact = (pkg: string) =>
  fileURLToPath(new URL(`../../packages/${pkg}/src/react.ts`, import.meta.url))

export default defineConfig({
  plugins: [react()],
  // No fixed port — Vite picks a free one; open the docs in the browser on `pnpm dev`.
  server: {
    open: true,
  },
  resolve: {
    // `/react` subpaths first so they aren't swallowed by the bare-specifier aliases below.
    alias: {
      // @luwio/bootstrap's React entry is react.tsx (not .ts), so alias it explicitly.
      '@luwio/bootstrap/react': fileURLToPath(
        new URL('../../packages/bootstrap/src/react.tsx', import.meta.url),
      ),
      '@luwio/bootstrap': pkgSrc('bootstrap'),
      '@luwio/locale/react': pkgReact('locale'),
      '@luwio/country/react': pkgReact('country'),
      '@luwio/language/react': pkgReact('language'),
      '@luwio/currency/react': pkgReact('currency'),
      '@luwio/phone/react': pkgReact('phone'),
      '@luwio/timezone/react': pkgReact('timezone'),
      '@luwio/iban/react': pkgReact('iban'),
      '@luwio/national-id/react': pkgReact('national-id'),
      '@luwio/eid/react': pkgReact('eid'),
      '@luwio/locale': pkgSrc('locale'),
      '@luwio/country': pkgSrc('country'),
      '@luwio/language': pkgSrc('language'),
      '@luwio/currency': pkgSrc('currency'),
      '@luwio/phone': pkgSrc('phone'),
      '@luwio/timezone': pkgSrc('timezone'),
      '@luwio/iban': pkgSrc('iban'),
      '@luwio/national-id': pkgSrc('national-id'),
      '@luwio/eid': pkgSrc('eid'),
      '@luwio/config': pkgSrc('config'),
      '@luwio/storage': pkgSrc('storage'),
    },
  },
})
