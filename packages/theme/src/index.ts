import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// @luwio/theme — light / dark / system theme management for React.
// Skeleton: a working provider + hook; tokens and SSR/no-flash script are on the roadmap.

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** The chosen theme, including `"system"`. */
  theme: Theme
  /** The concrete theme in effect — `"system"` resolved against the OS preference. */
  resolvedTheme: ResolvedTheme
  /** Switch the theme. */
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
ThemeContext.displayName = 'LuwioTheme'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export interface ThemeProviderProps {
  children: ReactNode
  /** Theme to start on. @default "system" */
  defaultTheme?: Theme
  /** Attribute written to `<html>` with the resolved theme. @default "data-theme" */
  attribute?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  attribute = 'data-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  // Track the OS preference so `"system"` stays live.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  // Reflect the resolved theme on <html> so CSS can key off it.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute(attribute, resolvedTheme)
    }
  }, [attribute, resolvedTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme],
  )

  return createElement(ThemeContext.Provider, { value }, children)
}

/** Read and set the active theme. Throws if used outside a `<ThemeProvider>`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (ctx === null) {
    throw new Error('@luwio/theme: useTheme must be used inside a <ThemeProvider>')
  }
  return ctx
}
