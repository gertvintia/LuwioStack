import type { ITimezone } from '../types'
import { toMachineName } from '../utils/to-machine-name'

/**
 * An IANA timezone, e.g. `Timezone.new({ name: 'Europe/Brussels' })`. Offsets and abbreviations are
 * computed from the runtime's `Intl` timezone database, so they're DST-aware for any instant.
 */
export class Timezone implements ITimezone {
  public readonly name: string
  public readonly machine_name: string

  private constructor(name: string) {
    try {
      // Validates the name against the runtime's IANA database (throws RangeError if unknown).
      new Intl.DateTimeFormat('en-US', { timeZone: name })
    } catch {
      throw new Error(`Unknown timezone: ${name}`)
    }
    this.name = name
    this.machine_name = toMachineName(name)
  }

  /** Look up a timezone by IANA name, e.g. `Timezone.new({ name: 'Europe/Brussels' })`. Throws on an unknown name. */
  public static new(value: { name: string }): Timezone {
    return new Timezone(value.name)
  }

  /** The runtime's timezone, from `Intl.DateTimeFormat().resolvedOptions().timeZone`. */
  public static readonly system: Timezone = new Timezone(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  )

  /** Minutes east of UTC at `at` (DST-aware). `60` for CET, `120` for CEST, `-300` for US Eastern. */
  public offset(at: Date = new Date()): number {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: this.name,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const p: Record<string, string> = {}
    for (const part of dtf.formatToParts(at)) p[part.type] = part.value
    const n = (type: string) => Number(p[type] ?? '0')
    const asUTC = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'))
    return Math.round((asUTC - (at.getTime() - at.getMilliseconds())) / 60000)
  }

  /** The short zone name at `at`, e.g. `"EST"` / `"EDT"` (or `"GMT+1"` where no abbreviation exists). */
  public abbreviation(at: Date = new Date()): string {
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: this.name, timeZoneName: 'short' })
    return dtf.formatToParts(at).find((part) => part.type === 'timeZoneName')?.value ?? ''
  }
}
