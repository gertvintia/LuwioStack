import { render, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { __resetGoogleQueryCacheForTests } from './cache'
import { GOOGLE_MAPS_LIBRARY_NAMES, GoogleMapsProvider, useGoogleMaps } from './index'

// Stub the Google global so the base script "loads" instantly (no network, no 15s timer)
// and importLibrary resolves with an empty namespace per library.
beforeEach(() => {
  ;(window as unknown as { google: unknown }).google = {
    maps: { importLibrary: async () => ({}) },
  }
})
afterEach(() => __resetGoogleQueryCacheForTests())

describe('@luwio/google/map', () => {
  it('exposes the known library names', () => {
    expect(GOOGLE_MAPS_LIBRARY_NAMES).toContain('places')
    expect(GOOGLE_MAPS_LIBRARY_NAMES).toContain('maps')
  })

  it('renders the provider with its children', () => {
    const { getByText } = render(
      <GoogleMapsProvider apiKey="test-key">
        <span>child</span>
      </GoogleMapsProvider>,
    )
    expect(getByText('child')).toBeTruthy()
  })

  it('throws when a hook is used outside the provider', () => {
    expect(() => renderHook(() => useGoogleMaps(['maps']))).toThrow(/GoogleMapsProvider/)
  })
})
