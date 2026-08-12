import { createContext } from 'react'
import type { ILocale } from '../types'

export const LocaleContext = createContext<ILocale | undefined>(undefined)
LocaleContext.displayName = 'LuwioLocale'
