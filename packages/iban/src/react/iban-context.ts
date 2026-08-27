import { createContext } from 'react'
import type { IIban } from '../types'

export const IbanContext = createContext<IIban | undefined>(undefined)
IbanContext.displayName = 'LuwioIban'
