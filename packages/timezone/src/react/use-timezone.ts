import { useContext } from 'react'
import type { ITimezone } from '../types'
import { TimezoneContext } from './timezone-context'

export interface UseTimezoneResult {
  /**
   * The active timezone — the same object `Timezone.new()` returns. Use it like a `Timezone.new(...)`
   * result: `timezone.name`, `timezone.offset()`, `timezone.abbreviation()`.
   */
  timezone: ITimezone
}

/**
 * Read the active timezone from context. `timezone` is a full `Timezone` (see
 * {@link UseTimezoneResult}). The provider memoizes on `name`, so it's stable in dependency arrays.
 */
export function useTimezone(): UseTimezoneResult {
  const context = useContext(TimezoneContext)
  if (context === undefined) {
    throw new Error('useTimezone must be used within a <Timezone> provider')
  }
  return { timezone: context }
}
