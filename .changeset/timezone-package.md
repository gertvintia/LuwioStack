---
"@luwio/timezone": minor
---

New package `@luwio/timezone` — typed IANA timezone data for React, the base `@luwio/datetime` will build on. `Timezone.new({ name })` validates against the runtime's tz database (throws on unknown) and exposes `name`, `machine_name`, DST-aware `offset(at?)` (minutes east of UTC) and `abbreviation(at?)`, all computed from `Intl`; `Timezone.system` is the runtime zone and `Timezones.all()` enumerates every IANA zone. Split like the other packages: React-free domain at `@luwio/timezone`, and a `<Timezone>` provider + `useTimezone()` at `@luwio/timezone/react`. React is a peer dependency.
