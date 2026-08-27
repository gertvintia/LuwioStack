import { createContext } from 'react'
import type { ITimezone } from '../types'

export const TimezoneContext = createContext<ITimezone | undefined>(undefined)
TimezoneContext.displayName = 'LuwioTimezone'
