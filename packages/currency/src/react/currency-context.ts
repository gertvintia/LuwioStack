import { createContext } from 'react'
import type { ICurrency } from '../types'

export const CurrencyContext = createContext<ICurrency | undefined>(undefined)
CurrencyContext.displayName = 'LuwioCurrency'
