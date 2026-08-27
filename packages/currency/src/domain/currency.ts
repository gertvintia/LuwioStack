import { currencyRows } from '../data'
import type { ICurrency } from '../types'
import { toMachineName } from '../utils/to-machine-name'

export class Currency implements ICurrency {
  public readonly name: string
  public readonly machine_name: string
  public readonly code: string
  public readonly symbol: string
  public readonly minor_units: number

  private constructor(value: string) {
    const row = currencyRows.find((r) => r.code.toLowerCase() === value.toLowerCase())
    if (!row) {
      throw new Error(`Unknown currency: ${value}`)
    }

    this.code = row.code
    this.name = row.name
    this.machine_name = toMachineName(row.name)
    this.symbol = row.symbol
    this.minor_units = row.minor_units
  }

  /** Look up by ISO 4217 code, e.g. `Currency.new({ code: 'EUR' })`. An unknown code throws. */
  public static new(value: { code: string }): Currency {
    return new Currency(value.code)
  }
}
