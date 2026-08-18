# @luwio/theme

Light / dark / system theme management for React.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** A working provider + hook today; design tokens and an SSR no-flash script are on the roadmap.

## Install

```bash
npm install @luwio/theme
```

React 18+ is a peer dependency.

## Usage

```tsx
import { ThemeProvider, useTheme } from '@luwio/theme'

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ThemeToggle />
    </ThemeProvider>
  )
}

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      {theme} ({resolvedTheme})
    </button>
  )
}
```

`ThemeProvider` writes the resolved theme to `<html data-theme="…">` (configurable via
`attribute`) and keeps `"system"` in sync with the OS preference, so your CSS can do:

```css
:root[data-theme='dark'] { --bg: #0b0d12; }
```

## API surface

- `<ThemeProvider defaultTheme? attribute?>` — provides + applies the theme.
- `useTheme()` → `{ theme, resolvedTheme, setTheme }`.
