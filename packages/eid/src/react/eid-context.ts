import { createContext } from 'react'
import type { CardReader } from '../types'

// The injected transport, or null when the app hasn't wired one yet. `undefined` means "no provider".
export const EidContext = createContext<CardReader | null | undefined>(undefined)
EidContext.displayName = 'LuwioEid'
