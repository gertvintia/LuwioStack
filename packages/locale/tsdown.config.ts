import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Build against a paths-free tsconfig — see the note in @luwio/country's tsdown.config.ts.
  tsconfig: './tsconfig.build.json',
  // React and sibling @luwio/* packages are dependencies — never bundle them into this dist.
  external: [/^@luwio\//, 'react', 'react-dom'],
})
