import { Locale } from '../domain/locale'
import type { ILocale } from '../types'

/**
 * Creates an {@link ILocale} from a language code, locale string, or language + region pair.
 *
 * @param value.languageOrLocale - A language code (`"en"`) or locale string (`"en-US"`).
 * @param value.country - Optional region code (`"US"`). Combined with `languageOrLocale` when provided.
 * @throws If the language or the country is unknown.
 *
 * @example
 * createLocale({ languageOrLocale: 'en-US' })
 * createLocale({ languageOrLocale: 'en', country: 'US' })
 */
export function createLocale(value: { languageOrLocale: string; country?: string }): ILocale {
  if (value.country) {
    return Locale.new({ language: value.languageOrLocale, country: value.country })
  }

  return Locale.fromLocale({ locale: value.languageOrLocale })
}
