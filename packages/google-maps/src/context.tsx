import { createContext } from 'react'
import type { GoogleMapsContextValue } from './types'

export const GoogleMapsContext = createContext<GoogleMapsContextValue | null>(null)
