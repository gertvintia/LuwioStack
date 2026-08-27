import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Build against a paths-free tsconfig: the `paths` in tsconfig.json exist only so
  // `tsc --noEmit` typechecks against sibling source before a build. tsdown must resolve
  // @luwio/* from their built dist (as external deps), or its dts pass follows `paths` into
  // a sibling's src and emits stray .d.ts there.
  tsconfig: './tsconfig.build.json',
  // Sibling @luwio/* packages are real dependencies, and React is a peer dependency (used by the
  // `<Country>` provider / `useCountry`) — never bundle any of them into this dist.
  external: [/^@luwio\//, 'react', 'react-dom'],
})
