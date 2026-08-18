import { createContext } from 'react'
import type { GoogleAnalyticsContextValue } from './types'

export const GoogleAnalyticsContext = createContext<GoogleAnalyticsContextValue | null>(null)
