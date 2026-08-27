import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Build against a paths-free tsconfig so tsdown resolves @luwio/* from their built dist (as
  // external deps) rather than following `paths` into a sibling's src.
  tsconfig: './tsconfig.build.json',
  // Sibling @luwio/* packages and google-libphonenumber are real dependencies, and React is a peer
  // dependency (used by the `<Phone>` provider / `usePhone`) — never bundle any of them.
  external: [/^@luwio\//, 'google-libphonenumber', 'react', 'react-dom'],
})
