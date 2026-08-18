import { getDataset } from '../dataset/registry'
import type { IContinent, ICountries } from '../types'
import { toMachineName } from '../utils/to-machine-name'
import { Countries } from './countries'
import { Country } from './country'

export const CONTINENT_MAP: Record<string, string> = {
  AF: 'Africa',
  AN: 'Antarctica',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America',
}

export class Continent implements IContinent {
  public readonly name: string
  public readonly machine_name: string
  public readonly alpha2: string

  private constructor(name: string, alpha2: string) {
    this.name = name
    this.alpha2 = alpha2
    this.machine_name = toMachineName(name)
  }

  public static new(value: { alpha2: string }): Continent {
    const name = CONTINENT_MAP[value.alpha2.toUpperCase()]
    if (!name) {
      throw new Error(`Unknown continent code: ${value.alpha2}`)
    }
    return new Continent(name, value.alpha2.toUpperCase())
  }

  public static africa(): Continent {
    return Continent.new({ alpha2: 'AF' })
  }

  public static antarctica(): Continent {
    return Continent.new({ alpha2: 'AN' })
  }

  public static asia(): Continent {
    return Continent.new({ alpha2: 'AS' })
  }

  public static europe(): Continent {
    return Continent.new({ alpha2: 'EU' })
  }

  public static northAmerica(): Continent {
    return Continent.new({ alpha2: 'NA' })
  }

  public static oceania(): Continent {
    return Continent.new({ alpha2: 'OC' })
  }

  public static southAmerica(): Continent {
    return Continent.new({ alpha2: 'SA' })
  }

  public countries(): ICountries {
    const entries = getDataset()
    const seen = new Set<string>()
    let result: ICountries = Countries.empty()

    for (const d of entries) {
      if (d.country.continent === this.name && !seen.has(d.country.iso_3166_1_alpha2)) {
        seen.add(d.country.iso_3166_1_alpha2)
        result = result.add(Country.from({ code: d.country.iso_3166_1_alpha2 }))
      }
    }

    return result
  }
}
