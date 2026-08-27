import type { ICountry } from '@luwio/country'
import { registry } from '../registry'
import {
  type CardAccess,
  type CardReader,
  type EidReadOptions,
  type IIdentityDocument,
  UnsupportedCountryError,
} from '../types'

/**
 * Read a national eID card from a physical reader. `Eid.read(reader, country)` looks up the
 * country's card profile, waits for a card, and returns a normalized {@link IIdentityDocument}.
 *
 * Support is a per-country registry — {@link Eid.supportedCountries} lists what's covered and
 * {@link Eid.accessLevel} reports how readable each country's card is. An unregistered country
 * throws {@link UnsupportedCountryError} (distinct from a card that's merely unreadable).
 *
 * This package ships the framework only: the {@link CardReader} transport is supplied by the app
 * (e.g. a future `@luwio/eid/node` PC/SC binding), and country `read()` implementations are added
 * incrementally — until then they reject with `NotImplementedError`.
 *
 * The React-free domain lives here (`@luwio/eid`); `<Eid>` / `useEid` are at `@luwio/eid/react`.
 */
export const Eid = {
  /**
   * Read the card for `country` from `reader`. Throws {@link UnsupportedCountryError} if the country
   * has no profile; otherwise waits for a card and delegates to the country profile.
   */
  async read(
    reader: CardReader,
    country: ICountry,
    options: EidReadOptions = {},
  ): Promise<IIdentityDocument> {
    const profile = registry.get(country.code)
    if (!profile) throw new UnsupportedCountryError(country.code)
    const session = await reader.waitForCard()
    options.onCardPresent?.(session)
    try {
      return await profile.read(session, options.secrets)
    } finally {
      await session.close()
    }
  },

  /** Whether a card profile is registered for `country`. */
  isSupported(country: ICountry): boolean {
    return registry.has(country.code)
  },

  /** ISO 3166-1 alpha-2 codes with a registered card profile. */
  supportedCountries(): string[] {
    return [...registry.keys()]
  },

  /** How readable `country`'s card is. Throws {@link UnsupportedCountryError} if unregistered. */
  accessLevel(country: ICountry): CardAccess {
    const profile = registry.get(country.code)
    if (!profile) throw new UnsupportedCountryError(country.code)
    return profile.access
  },
}
