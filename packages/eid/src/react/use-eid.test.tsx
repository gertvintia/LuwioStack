import { Country } from '@luwio/country'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'
import type { CardReader, CardSession } from '../types'
import { NotImplementedError } from '../types'
import { Eid } from './eid-provider'
import { useEid } from './use-eid'

const BE = Country.new({ code: 'BE' })
const DE = Country.new({ code: 'DE' })

function fakeReader(): CardReader {
  const session: CardSession = {
    atr: new Uint8Array([0x3b]),
    transmit: () => Promise.resolve(new Uint8Array()),
    close: () => Promise.resolve(),
  }
  return {
    listReaders: () => Promise.resolve(['Fake Reader 0']),
    waitForCard: () => Promise.resolve(session),
  }
}

const wrapper =
  (reader: CardReader | null) =>
  ({ children }: PropsWithChildren) => <Eid reader={reader}>{children}</Eid>

describe('useEid', () => {
  it('starts idle and drives the lifecycle to error for an unimplemented country (DE)', async () => {
    const { result } = renderHook(() => useEid(), { wrapper: wrapper(fakeReader()) })
    expect(result.current.status).toBe('idle')

    await act(async () => {
      await result.current.read(DE)
    })

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBeInstanceOf(NotImplementedError)
    expect(result.current.card).toBeNull()
  })

  it('reports no-reader when no transport is wired', async () => {
    const { result } = renderHook(() => useEid(), { wrapper: wrapper(null) })
    await act(async () => {
      await result.current.read(BE)
    })
    expect(result.current.status).toBe('no-reader')
  })

  it('reset returns to idle', async () => {
    const { result } = renderHook(() => useEid(), { wrapper: wrapper(fakeReader()) })
    await act(async () => {
      await result.current.read(BE)
    })
    act(() => result.current.reset())
    expect(result.current.status).toBe('idle')
  })

  it('exposes the domain statics on the provider', () => {
    expect(Eid.supportedCountries()).toContain('BE')
    expect(Eid.accessLevel(BE)).toEqual({ level: 'open' })
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useEid())).toThrow(/within a <Eid> provider/)
  })
})
