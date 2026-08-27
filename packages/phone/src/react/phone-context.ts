import { createContext } from 'react'
import type { IPhone } from '../types'

export const PhoneContext = createContext<IPhone | undefined>(undefined)
PhoneContext.displayName = 'LuwioPhone'
