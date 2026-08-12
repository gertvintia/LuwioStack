// @luwio/money — currency formatting and safe minor-unit math.
// Skeleton: money is stored in integer minor units to avoid float drift.

export interface Money {
  /** Amount in minor units (e.g. cents). */
  readonly cents: number
  /** ISO 4217 currency code, e.g. `'EUR'`. */
  readonly currency: string
}

/** Construct a {@link Money} value from an integer amount of minor units. */
export function money(cents: number, currency: string): Money {
  if (!Number.isInteger(cents)) {
    throw new TypeError('@luwio/money: `cents` must be an integer (minor units)')
  }
  return { cents, currency }
}

/** Add two amounts of the same currency. */
export function add(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`@luwio/money: cannot add ${a.currency} and ${b.currency}`)
  }
  return money(a.cents + b.cents, a.currency)
}

/** Locale-aware currency formatting via `Intl.NumberFormat`. */
export function formatMoney(value: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
  }).format(value.cents / 100)
}
