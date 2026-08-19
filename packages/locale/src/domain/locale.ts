import { getDataset } from '../dataset/registry'
import {
  type IContinent,
  type ICountry,
  type ILanguage,
  type ILanguages,
  type ILocale,
  type LocalePolicy,
  MatchingPolicy,
} from '../types'
import { normalizeLocale } from '../utils/normalize-locale'
import { resolvePolicy } from '../utils/resolve-policy'
import { CONTINENT_MAP, Continent } from './continent'
import { Country } from './country'
import { Language } from './language'

export class Locale implements ILocale {
  public readonly locale: string
  public readonly language_code: string
  public readonly country_code: string

  private constructor(
    language: string,
    region: string,
    policy: LocalePolicy = MatchingPolicy.LOOSE,
  ) {
    const normalized = normalizeLocale({ locale: `${language}-${region}` })
    const [lang = '', country = ''] = normalized.split('-')
    const effectivePolicy = resolvePolicy(policy, lang, country)
    const entries = getDataset()

    if (effectivePolicy === MatchingPolicy.STRICT) {
      const entry = entries.find((d) => d.locale.toLowerCase() === normalized.toLowerCase())
      if (!entry) {
        throw new Error(`Unknown locale: ${normalized}`)
      }
      this.locale = entry.locale
    } else {
      const languageExists = entries.some(
        (d) => d.language.iso_639_1.toLowerCase() === lang.toLowerCase(),
      )
      if (!languageExists) {
        throw new Error(`Unknown language in locale: ${normalized}`)
      }

      const countryExists = entries.some(
        (d) => d.country.iso_3166_1_alpha2.toLowerCase() === country.toLowerCase(),
      )
      if (!countryExists) {
        throw new Error(`Unknown country in locale: ${normalized}`)
      }

      this.locale = normalized
    }

    const [language_code = '', country_code = ''] = this.locale.split('-')
    this.language_code = language_code
    this.country_code = country_code
  }

  /** Build from separate language + country codes. */
  public static new(value: { language: string; country: string; policy?: LocalePolicy }): Locale {
    return new Locale(value.language, value.country, value.policy)
  }

  /** Build from a `language-country` string. */
  public static fromLocale(value: { locale: string; policy?: LocalePolicy }): Locale {
    const [language = '', country = ''] = value.locale.split('-')
    return new Locale(language, country, value.policy)
  }

  /** Build from a native {@link Intl.Locale}; requires a region. */
  public static fromIntlLocale(value: { locale: Intl.Locale; policy?: LocalePolicy }): Locale {
    const country = value.locale.region
    if (!country) {
      throw new Error(`Unsupported Intl.Locale: ${value.locale.toString()}. A country is required.`)
    }
    return new Locale(value.locale.language, country, value.policy)
  }

  public language(): ILanguage {
    return Language.new({ code: this.language_code })
  }

  public languages(): ILanguages {
    return this.country().languages().add(this.language())
  }

  public country(): ICountry {
    return Country.from({ code: this.country_code })
  }

  public continent(): IContinent {
    const entries = getDataset()
    const entry = entries.find(
      (d) => d.country.iso_3166_1_alpha2.toLowerCase() === this.country_code.toLowerCase(),
    )
    const name = entry?.country.continent
    const match = Object.entries(CONTINENT_MAP).find(([, continentName]) => continentName === name)
    if (!match) {
      throw new Error(`Unknown continent for locale: ${this.locale}`)
    }
    return Continent.new({ alpha2: match[0] })
  }

  public toIntlLocale(): Intl.Locale {
    return new Intl.Locale(this.locale)
  }
}
