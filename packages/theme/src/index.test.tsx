import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from './index'

const wrapper =
  (defaultTheme: 'light' | 'dark' | 'system' = 'dark') =>
  ({ children }: { children: ReactNode }) => (
    <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
  )

describe('@luwio/theme', () => {
  it('exposes the default theme and resolves it', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper('dark') })
    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('switches theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper('dark') })
    act(() => result.current.setTheme('light'))
    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('reflects the resolved theme on <html>', () => {
    renderHook(() => useTheme(), { wrapper: wrapper('dark') })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('throws outside a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/)
  })
})
