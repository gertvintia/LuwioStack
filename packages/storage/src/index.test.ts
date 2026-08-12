import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalStorage, useSessionStorage } from './index'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))
    expect(result.current[0]).toBe(0)
  })

  it('persists and reads back a value', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))
    act(() => result.current[1](42))
    expect(result.current[0]).toBe(42)
    expect(window.localStorage.getItem('count')).toBe('42')
  })

  it('supports updater functions', () => {
    const { result } = renderHook(() => useLocalStorage('count', 10))
    act(() => result.current[1]((n) => n + 5))
    expect(result.current[0]).toBe(15)
  })

  it('removes a value', () => {
    const { result } = renderHook(() => useLocalStorage('name', 'anon'))
    act(() => result.current[1]('gert'))
    act(() => result.current[2]())
    expect(result.current[0]).toBe('anon')
    expect(window.localStorage.getItem('name')).toBeNull()
  })
})

describe('useSessionStorage', () => {
  it('works against sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage('tab', 'a'))
    act(() => result.current[1]('b'))
    expect(window.sessionStorage.getItem('tab')).toBe('"b"')
  })
})
