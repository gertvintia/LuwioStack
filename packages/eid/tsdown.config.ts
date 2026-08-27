import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts', 'src/node.ts', 'src/electron.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Build against a paths-free tsconfig so tsdown resolves @luwio/* from their built dist.
  tsconfig: './tsconfig.build.json',
  // Sibling @luwio/* packages are real dependencies; React is a peer dependency; the PC/SC binding
  // (@pokusew/pcsclite) is an optional native peer; Node built-ins stay external — never bundle any.
  external: [/^@luwio\//, /^node:/, '@pokusew/pcsclite', 'react', 'react-dom'],
})
