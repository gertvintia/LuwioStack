import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { createConfig } from './index'

const { ConfigProvider, useConfig, useConfigValue } = createConfig({
  apiUrl: 'https://api.example.com',
  debug: false,
})

describe('createConfig', () => {
  it('exposes defaults with no provider', () => {
    const { result } = renderHook(() => useConfig())
    expect(result.current.apiUrl).toBe('https://api.example.com')
    expect(result.current.debug).toBe(false)
  })

  it('merges provider overrides over defaults', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ConfigProvider value={{ debug: true }}>{children}</ConfigProvider>
    )
    const { result } = renderHook(() => useConfig(), { wrapper })
    expect(result.current.debug).toBe(true)
    expect(result.current.apiUrl).toBe('https://api.example.com')
  })

  it('reads a single value', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ConfigProvider value={{ apiUrl: 'https://staging.example.com' }}>{children}</ConfigProvider>
    )
    const { result } = renderHook(() => useConfigValue('apiUrl'), { wrapper })
    expect(result.current).toBe('https://staging.example.com')
  })
})
