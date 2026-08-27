import { currencyRows } from '../data'
import type { ICurrencies, ICurrency } from '../types'
import { Currency } from './currency'

/** An immutable collection of {@link ICurrency}, de-duplicated by ISO 4217 code. */
export class Currencies implements ICurrencies {
  private readonly values: ICurrency[]

  private constructor(values: ICurrency[]) {
    this.values = values
  }

  static empty(): ICurrencies {
    return new Currencies([])
  }

  /** Every currency in the bundled ISO 4217 dataset, in source order. */
  static all(): ICurrencies {
    return new Currencies(currencyRows.map((row) => Currency.new({ code: row.code })))
  }

  add(currency: ICurrency): ICurrencies {
    const exists = this.values.some(
      (item) => item.code.toLowerCase() === currency.code.toLowerCase(),
    )
    if (exists) return this
    return new Currencies([...this.values, currency])
  }

  remove(currency: ICurrency): ICurrencies {
    return new Currencies(
      this.values.filter((item) => item.code.toLowerCase() !== currency.code.toLowerCase()),
    )
  }

  toArray(): ICurrency[] {
    return this.values
  }

  get size(): number {
    return this.values.length
  }
}
