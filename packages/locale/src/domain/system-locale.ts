import { type ILocale, MatchingPolicy } from '../types'
import { createLocale } from '../utils/create-locale'

/**
 * Detects the runtime's locale from {@link Intl}. The resolved locale often carries
 * only a language (e.g. `"nl"`), so we use {@link Intl.Locale.maximize} to infer a
 * likely region. Falls back to `en-US` if detection fails for any reason — importing
 * this module must never throw.
 */
function detectSystemLocale(): ILocale {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale
    const maximized = new Intl.Locale(resolved).maximize()
    console.log(maximized)
    if (maximized.region) {
      return createLocale({
        languageOrLocale: maximized.language,
        country: maximized.region,
        policy: MatchingPolicy.LOOSE,
      })
    }
  } catch {
    // fall through to the default
  }
  return createLocale({ languageOrLocale: 'en-US' })
}

/** The current runtime's locale, derived from {@link Intl.DateTimeFormat}. */
export const SystemLocale: ILocale = detectSystemLocale()
