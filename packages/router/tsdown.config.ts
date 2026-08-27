import { defineConfig } from 'tsdown'

export default defineConfig({
  // Two entries: the runtime library, and the (Node-only) Vite plugin.
  entry: ['src/index.ts', 'src/vite.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Build against a paths-free tsconfig — see the note in @luwio/country's tsdown.config.ts.
  tsconfig: './tsconfig.build.json',
  // @tanstack/react-router is deliberately NOT external: it's vendored into this dist so consumers
  // install only @luwio/router and can't reach the raw TanStack API — we re-export the structural
  // bits (RouterProvider, Outlet, redirect, notFound) ourselves. React (peer), Vite (optional peer,
  // plugin-only), Node built-ins and sibling @luwio/* packages stay external.
  external: [/^@luwio\//, /^node:/, 'react', 'react-dom', 'vite'],
})
