import { be } from './countries/be'
import { de } from './countries/de'
import { ee } from './countries/ee'
import { es } from './countries/es'
import { fr } from './countries/fr'
import { it } from './countries/it'
import { nl } from './countries/nl'
import { pt } from './countries/pt'
import type { CardProfile } from './types'

// Per-country card profiles, keyed by ISO 3166-1 alpha-2. Add a country: implement a profile in
// `countries/<code>.ts` and register it here — purely additive, nothing else changes.
// (UK/GB is intentionally absent — there is no national eID card to read.)
export const registry = new Map<string, CardProfile>([
  ['BE', be],
  ['DE', de],
  ['EE', ee],
  ['ES', es],
  ['FR', fr],
  ['IT', it],
  ['NL', nl],
  ['PT', pt],
])
