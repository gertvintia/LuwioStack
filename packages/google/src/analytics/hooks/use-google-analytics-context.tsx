import { useContext } from 'react'
import { GoogleAnalyticsContext } from '../context'
import type { GoogleAnalyticsContextValue } from '../types'

export function useGoogleAnalyticsContext(): GoogleAnalyticsContextValue {
  const ctx = useContext(GoogleAnalyticsContext)
  if (!ctx) throw new Error('<GoogleAnalytics> is required above this component.')
  return ctx
}
