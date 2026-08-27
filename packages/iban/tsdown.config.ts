import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Build against a paths-free tsconfig so tsdown resolves @luwio/* from their built dist.
  tsconfig: './tsconfig.build.json',
  // Sibling @luwio/* packages are real dependencies, and React is a peer dependency — never bundle.
  external: [/^@luwio\//, 'react', 'react-dom'],
})
