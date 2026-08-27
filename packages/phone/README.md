# @luwio/phone

Typed phone-number parsing, validation and formatting for React — everything on one `Phone` object,
backed by [`google-libphonenumber`](https://github.com/ruimarinho/google-libphonenumber) and
integrated with [`@luwio/country`](../country). Mirrors `@luwio/country` / `@luwio/currency` /
`@luwio/language`.

```bash
npm i @luwio/phone
```

`@luwio/country` and `google-libphonenumber` are dependencies (installed automatically); React 18+ is
a peer dependency (only for the provider / hook).

## Usage

```ts
import { Phone, PhoneNumberType } from '@luwio/phone'
import { Country } from '@luwio/country'

// E.164 needs no country; a national-format string takes the Country it belongs to.
const p = Phone.parse('+32470123456')
// const p = Phone.parse('0470 12 34 56', Country.new({ code: 'BE' }))

p.countryCode    // 'BE'   (ISO region)
p.dialCode       // 32     (country calling code)
p.nationalNumber // 470123456
p.type           // PhoneNumberType.MOBILE
p.country()      // a @luwio/country Country — p.country().name === 'Belgium'

p.format()                // '+32470123456'      (E.164, default)
p.format('INTERNATIONAL') // '+32 470 12 34 56'
p.format('NATIONAL')      // '0470 12 34 56'

Phone.parse('nope')            // throws — invalid instances never exist
Phone.isValid('+32470123456')  // true  (non-throwing check)
```

## React

```tsx
import { Phone, usePhone } from '@luwio/phone/react'

function App() {
  return (
    <Phone phone={Phone.parse('+32470123456')}>
      <Line />
    </Phone>
  )
}

function Line() {
  const { phone } = usePhone()
  return <span>{phone.format('INTERNATIONAL')} · {phone.type} · {phone.country().name}</span>
}
```

`Phone` is the (React-free) domain class: `Phone.parse(...)` builds and validates. `<Phone phone={…}>`
provides it; `usePhone()` → `{ phone }` reads it (throws outside a provider) — the same shape as `Country` / `Currency`. Backed by Google's libphonenumber, so validity and line-type classification
match libphonenumber exactly.
