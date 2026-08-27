---
"@luwio/phone": minor
---

Implement `@luwio/phone` — typed phone-number parsing, validation, classification and formatting for React, powered by `google-libphonenumber` and integrated with `@luwio/country`. Everything lives on one `Phone` object: `Phone.parse(number, country?)` parses & validates (E.164 needs no country; a national-format string takes the `@luwio/country` `Country` it belongs to) and throws on anything invalid, exposing `countryCode` (ISO region), `dialCode`, `nationalNumber`, `type` (`PhoneNumberType`), `country()` (a `Country`) and `format('E164' | 'INTERNATIONAL' | 'NATIONAL' | 'RFC3966')`; `Phone.isValid(...)` is the non-throwing check. The same `Phone` is the React provider (`<Phone phone={…}>`) with `usePhone()` → `{ phone }`. `@luwio/country` and `google-libphonenumber` are dependencies; React is a peer dependency.
