import { fileURLToPath } from 'node:url'
import { luwioRouter } from '@luwio/router/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Point @luwio/* imports at each package's source during dev, so edits reflect instantly.
const pkgSrc = (pkg: string) => fileURLToPath(new URL(`../../packages/${pkg}/src`, import.meta.url))
const pkgReact = (pkg: string) =>
  fileURLToPath(new URL(`../../packages/${pkg}/src/react.ts`, import.meta.url))

export default defineConfig({
  // Vertical slice: scan all of src/ so each feature's *.route.tsx lives beside its code.
  plugins: [react(), luwioRouter({ routesDir: 'src' })],
  // No fixed port — Vite picks a free one; open the app in the browser on `pnpm dev`.
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
      '@luwio/router': pkgSrc('router'),
      '@luwio/translations': pkgSrc('translations'),
      '@luwio/locale': pkgSrc('locale'),
      '@luwio/country': pkgSrc('country'),
      '@luwio/language': pkgSrc('language'),
      '@luwio/config': pkgSrc('config'),
      '@luwio/storage': pkgSrc('storage'),
    },
  },
})
