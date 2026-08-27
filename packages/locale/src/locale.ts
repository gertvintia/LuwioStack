import { SystemLocale } from './domain/system-locale'
import { createLocale } from './utils/create-locale'
import { resolveLocale } from './utils/resolve-locale'

/**
 * Build and resolve locales — pure, React-free. The companion to `<LocaleProvider>`: construct an
 * {@link ILocale} here, then hand it to the provider.
 *
 * - `Locale.new` — construct an exact locale (throws on an unknown language/country). See
 *   {@link createLocale}.
 * - `Locale.resolve` — collapse a detected/optional locale onto the ones your app supports. See
 *   {@link resolveLocale}.
 * - `Locale.system` — the runtime's detected locale (from {@link Intl}).
 *
 * @example
 * Locale.new({ languageOrLocale: 'nl-BE' })
 * Locale.resolve({ detected: Locale.system, supported: ['nl-BE', 'en-US'], overrides: { '*': 'nl-BE' } })
 */
export const Locale = {
  new: createLocale,
  resolve: resolveLocale,
  system: SystemLocale,
}
