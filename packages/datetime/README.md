# @luwio/datetime

Small, dependency-free date & time helpers built on the platform `Intl` APIs.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** Starts with a handful of helpers; parsing/relative-time to follow.

## Install

```bash
npm install @luwio/datetime
```

No dependencies, no framework required.

## Usage

```ts
import { formatDate, daysBetween, toISO } from '@luwio/datetime'

formatDate('2026-08-12', 'en-US')        // 'Aug 12, 2026'
daysBetween('2026-08-12', '2026-08-15')  // 3
toISO(Date.now())                        // '2026-08-12T…Z'
```

Pairs naturally with [`@luwio/locale`](../locale) — feed its resolved locale straight into
`formatDate`.
