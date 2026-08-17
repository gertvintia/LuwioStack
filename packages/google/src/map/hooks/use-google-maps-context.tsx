import { useContext } from 'react'
import { GoogleMapsContext } from '../context'
import type { GoogleMapsProviderContextValue } from '../types'

export function useGoogleMapsContext(): GoogleMapsProviderContextValue {
  const ctx = useContext(GoogleMapsContext)
  if (!ctx) throw new Error('<GoogleMapsProvider> is required above this component.')
  return ctx
}
