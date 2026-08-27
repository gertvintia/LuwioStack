import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Build against a paths-free tsconfig so the dts pass resolves @luwio/* from dist, not sibling src.
  tsconfig: './tsconfig.build.json',
  // Peers and sibling @luwio/* packages are external — never bundled into this dist.
  external: [/^@luwio\//, 'react', 'react-dom', '@lingui/core', '@lingui/react'],
})
