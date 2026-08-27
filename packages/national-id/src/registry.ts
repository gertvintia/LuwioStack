import { be } from './countries/be'
import { de } from './countries/de'
import { es } from './countries/es'
import { fr } from './countries/fr'
import { gb } from './countries/gb'
import { it } from './countries/it'
import { nl } from './countries/nl'
import { pt } from './countries/pt'
import type { NationalIdSpec } from './types'

// Per-country validators, keyed by ISO 3166-1 alpha-2. Add a country: implement a spec in
// `countries/<code>.ts` and register it here — purely additive, nothing else changes.
export const registry = new Map<string, NationalIdSpec>([
  ['BE', be],
  ['DE', de],
  ['ES', es],
  ['FR', fr],
  ['GB', gb],
  ['IT', it],
  ['NL', nl],
  ['PT', pt],
])
