import { type PropsWithChildren, useMemo } from 'react'
import { Timezone as TimezoneClass } from '../domain/timezone'
import type { ITimezone } from '../types'
import { TimezoneContext } from './timezone-context'

export interface TimezoneProps extends PropsWithChildren {
  /** A resolved timezone, e.g. `Timezone.new({ name: 'Europe/Brussels' })` or `Timezone.system`. */
  timezone: ITimezone
}

/**
 * Provides `timezone` to descendants. Read it with {@link useTimezone}.
 *
 * `<Timezone>` takes an already-built {@link ITimezone}; the same export carries `Timezone.new` /
 * `Timezone.system`, so one import from `@luwio/timezone/react` both builds and provides. (The
 * React-free domain class lives at `@luwio/timezone`.)
 */
export function Timezone({ timezone, children }: TimezoneProps) {
  // Key on the IANA name, so a fresh-but-equal ITimezone passed each render keeps a stable identity.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on name, not identity
  const value = useMemo(() => timezone, [timezone.name])
  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>
}

/** Look up a timezone by IANA name — the domain factory, surfaced on the provider. */
Timezone.new = TimezoneClass.new
/** The runtime's timezone — the domain value, surfaced on the provider. */
Timezone.system = TimezoneClass.system
