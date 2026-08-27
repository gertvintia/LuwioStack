# @luwio/currency

Typed ISO 4217 currency data for React — a small domain model over the world's currencies (code,
name, symbol and minor units), with a `<Currency>` provider and a `useCurrency` hook. Mirrors
`@luwio/country` and `@luwio/language`.

```bash
npm i @luwio/currency
```

React 18+ is a peer dependency (only needed for the provider / hook).

## Usage

```ts
import { Currency, Currencies } from '@luwio/currency'

const eur = Currency.new({ code: 'EUR' }) // ISO 4217, case-insensitive; unknown codes throw
eur.name          // 'Euro'
eur.symbol        // '€'
eur.minor_units   // 2   (0 for JPY, 3 for BHD)
eur.machine_name  // 'euro'

// The whole dataset as an immutable, de-duplicated collection:
Currencies.all().toArray().length // every ISO 4217 currency in use
```

## React

```tsx
import { Currency, useCurrency } from '@luwio/currency/react'

function App() {
  return (
    <Currency currency={Currency.new({ code: 'EUR' })}>
      <Price amount={19.99} />
    </Currency>
  )
}

function Price({ amount }: { amount: number }) {
  const { currency } = useCurrency()
  return (
    <span>
      {currency.symbol}
      {amount.toFixed(currency.minor_units)}
    </span>
  )
}
```

`Currency` from `@luwio/currency` is the React-free domain class; `@luwio/currency/react` exports the `<Currency>` provider (which also carries `Currency.new`). Read the active currency anywhere below with
`useCurrency()` → `{ currency }`; it throws outside a `<Currency>` provider.

The bundled dataset is generated from `@luwio/iso-data` (ISO 4217 codes + symbols, with English names
and minor-unit digits from ICU) — do not edit `src/data/*.json` by hand.
