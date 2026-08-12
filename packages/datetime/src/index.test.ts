import { describe, expect, it } from 'vitest'
import { daysBetween, formatDate, toISO } from './index'

describe('@luwio/datetime', () => {
  it('formats an ISO string', () => {
    expect(toISO('2026-08-12T00:00:00.000Z')).toBe('2026-08-12T00:00:00.000Z')
  })

  it('formats a date for a locale', () => {
    const out = formatDate('2026-08-12T12:00:00Z', 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
    expect(out).toBe('August 12, 2026')
  })

  it('counts whole days between dates', () => {
    expect(daysBetween('2026-08-12', '2026-08-15')).toBe(3)
    expect(daysBetween('2026-08-15', '2026-08-12')).toBe(-3)
  })
})
