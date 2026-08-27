export interface ICurrency {
  /** English display name, e.g. `"Euro"`. */
  name: string
  /** Machine-readable identifier, stable across translations. */
  machine_name: string
  /** ISO 4217 code, e.g. `"EUR"`. */
  code: string
  /** Currency symbol, e.g. `"€"`. */
  symbol: string
  /** Minor-unit digits (decimal places): 2 for EUR, 0 for JPY, 3 for BHD. */
  minor_units: number
}

export interface ICurrencies {
  readonly size: number
  add(currency: ICurrency): ICurrencies
  remove(currency: ICurrency): ICurrencies
  toArray(): ICurrency[]
}

/** A row in the bundled ISO 4217 dataset. Internal shape — the public model is {@link ICurrency}. */
export interface ICurrencyRow {
  code: string
  name: string
  symbol: string
  minor_units: number
}
