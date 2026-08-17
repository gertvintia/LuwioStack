import { useContext } from 'react'
import { GoogleMapsContext } from '../context'
import type { GoogleMapsContextValue } from '../types'

export function useGoogleMapsContext(): GoogleMapsContextValue {
  const ctx = useContext(GoogleMapsContext)
  if (!ctx) throw new Error('<GoogleMaps> is required above this component.')
  return ctx
}
