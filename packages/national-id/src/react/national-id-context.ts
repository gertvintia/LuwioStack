import { createContext } from 'react'
import type { INationalId } from '../types'

export const NationalIdContext = createContext<INationalId | undefined>(undefined)
NationalIdContext.displayName = 'LuwioNationalId'
