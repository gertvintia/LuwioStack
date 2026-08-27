import { createContext } from 'react'
import type { ICountry } from '../types'

export const CountryContext = createContext<ICountry | undefined>(undefined)
CountryContext.displayName = 'LuwioCountry'
