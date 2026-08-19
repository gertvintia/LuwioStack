import { Country, type IContinent, type ICountry } from '@luwio/country'
import { type ILanguage, type ILanguages, Language } from '@luwio/language'
import type { ILocale } from '../types'
import { normalizeLocale } from '../utils/normalize-locale'

export class Locale implements ILocale {
  public readonly locale: string
  public readonly code: string
  public readonly language_code: string
  public readonly country_code: string

  private constructor(language: string, region: string) {
    const normalized = normalizeLocale({ locale: `${language}-${region}` })
    const [lang = '', country = ''] = normalized.split('-')

    // A locale is valid when its language and country are each known. There is no
    // "combination must exist" check — `Language.new` / `Country.new` throw with a
    // clear message if either code is unknown.
    Language.new({ code: lang })
    Country.new({ code: country })

    this.locale = normalized
    this.code = normalized
    this.language_code = lang
    this.country_code = country
  }

  /** Build from separate language + country codes. */
  public static new(value: { language: string; country: string }): Locale {
    return new Locale(value.language, value.country)
  }

  /** Build from a `language-country` string. */
  public static fromLocale(value: { locale: string }): Locale {
    const [language = '', country = ''] = value.locale.split('-')
    return new Locale(language, country)
  }

  /** Build from a native {@link Intl.Locale}; requires a region. */
  public static fromIntlLocale(value: { locale: Intl.Locale }): Locale {
    const country = value.locale.region
    if (!country) {
      throw new Error(`Unsupported Intl.Locale: ${value.locale.toString()}. A country is required.`)
    }
    return new Locale(value.locale.language, country)
  }

  public language(): ILanguage {
    return Language.new({ code: this.language_code })
  }

  public languages(): ILanguages {
    return this.country().languages().add(this.language())
  }

  public country(): ICountry {
    return Country.new({ code: this.country_code })
  }

  public continent(): IContinent {
    return this.country().continent()
  }

  public toIntlLocale(): Intl.Locale {
    return new Intl.Locale(this.locale)
  }
}
