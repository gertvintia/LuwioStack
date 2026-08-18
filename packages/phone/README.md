# @luwio/phone

Parse and format phone numbers.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** A small, dependency-free core today; full per-country validation and
> formatting (à la libphonenumber) is on the roadmap.

## Install

```bash
npm install @luwio/phone
```

No dependencies, no framework required.

## Usage

```ts
import { parsePhone, formatPhone } from '@luwio/phone'

const p = parsePhone('0470 12 34 56', '+32') // default country code for local numbers
p.e164                       // '+32470123456'
formatPhone(p, 'national')   // '470123456'
formatPhone(p, 'e164')       // '+32470123456'
```

## API surface

- `parsePhone(input, defaultCountryCode?)` → `{ countryCode, nationalNumber, e164 }`
- `formatPhone(phone, 'e164' | 'international' | 'national')` → string
