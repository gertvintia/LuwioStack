import { Locale } from '../domain/locale'
import type { ILocale, LocalePolicy } from '../types'

/**
 * Creates an {@link ILocale} from a language code, locale string, or language + region pair.
 *
 * @param value.languageOrLocale - A language code (`"en"`) or locale string (`"en-US"`).
 * @param value.country - Optional region code (`"US"`). Combined with `languageOrLocale` when provided.
 * @param value.policy - Matching policy; a uniform {@link MatchingPolicy} or a rule map.
 * @throws If the resulting locale is invalid under the effective policy.
 *
 * @example
 * createLocale({ languageOrLocale: 'en-US' })
 * createLocale({ languageOrLocale: 'en', country: 'US' })
 * createLocale({ languageOrLocale: 'en', country: 'BE', policy: MatchingPolicy.LOOSE })
 */
export function createLocale(value: {
  languageOrLocale: string
  country?: string
  policy?: LocalePolicy
}): ILocale {
  if (value.country) {
    return Locale.new({
      language: value.languageOrLocale,
      country: value.country,
      policy: value.policy,
    })
  }

  return Locale.fromLocale({
    locale: value.languageOrLocale,
    policy: value.policy,
  })
}
