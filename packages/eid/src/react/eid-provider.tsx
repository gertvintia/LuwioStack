import type { PropsWithChildren } from 'react'
import { Eid as EidDomain } from '../domain/eid'
import type { CardReader } from '../types'
import { EidContext } from './eid-context'

export interface EidProps extends PropsWithChildren {
  /**
   * The card-reader transport, supplied by the app (e.g. a future `@luwio/eid/node` PC/SC binding).
   * `null` is allowed for environments without a reader yet — `useEid().read` then reports
   * `'no-reader'`.
   */
  reader: CardReader | null
}

/**
 * Provides the card `reader` to descendants; read cards with {@link useEid}.
 *
 * The same export carries the domain statics (`Eid.read`, `Eid.supportedCountries`,
 * `Eid.isSupported`, `Eid.accessLevel`), so one import from `@luwio/eid/react` both reads and
 * provides. (The React-free domain lives at `@luwio/eid`.)
 */
export function Eid({ reader, children }: EidProps) {
  return <EidContext.Provider value={reader}>{children}</EidContext.Provider>
}

/** Read a card — the domain facade, surfaced on the provider. */
Eid.read = EidDomain.read
/** Whether a card profile is registered for a country. */
Eid.isSupported = EidDomain.isSupported
/** ISO codes with a registered card profile. */
Eid.supportedCountries = EidDomain.supportedCountries
/** How readable a country's card is. */
Eid.accessLevel = EidDomain.accessLevel
