import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // React is a peer dependency (used by the `<Timezone>` provider / `useTimezone`) — never bundle it.
  external: ['react', 'react-dom'],
})
