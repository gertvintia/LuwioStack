# @luwio/money

Currency formatting and safe minor-unit math. Amounts are stored as integer minor units
(cents) so you never hit floating-point drift.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** Starts with construction, addition and formatting; allocation/rounding to follow.

## Install

```bash
npm install @luwio/money
```

No dependencies, no framework required.

## Usage

```ts
import { money, add, formatMoney } from '@luwio/money'

const price = money(1999, 'EUR')          // €19.99, stored as 1999 cents
const withTip = add(price, money(200, 'EUR'))

formatMoney(withTip, 'nl-BE')             // '€ 21,99'
formatMoney(money(1999, 'USD'), 'en-US')  // '$19.99'
```

Pairs naturally with [`@luwio/locale`](../locale) — pass its resolved locale to `formatMoney`.
