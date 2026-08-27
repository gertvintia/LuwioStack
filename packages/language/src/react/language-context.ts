import { createContext } from 'react'
import type { ILanguage } from '../types'

export const LanguageContext = createContext<ILanguage | undefined>(undefined)
LanguageContext.displayName = 'LuwioLanguage'
