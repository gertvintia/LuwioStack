import { createContext } from 'react'
import type { GoogleMapsProviderContextValue } from './types'

export const GoogleMapsContext = createContext<GoogleMapsProviderContextValue | null>(null)
