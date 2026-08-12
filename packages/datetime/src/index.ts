// @luwio/datetime — small, dependency-free date & time helpers.
// Skeleton: starts with formatting/relative helpers built on Intl.

/** A date, or something that can be turned into one. */
export type DateInput = Date | number | string

function toDate(input: DateInput): Date {
  return input instanceof Date ? input : new Date(input)
}

/** ISO-8601 string for a date (defaults to the input's own value). */
export function toISO(input: DateInput): string {
  return toDate(input).toISOString()
}

/** Locale-aware date formatting via `Intl.DateTimeFormat`. */
export function formatDate(
  input: DateInput,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return new Intl.DateTimeFormat(locale, options).format(toDate(input))
}

/** Whole-day difference `b - a` (positive when `b` is later). */
export function daysBetween(a: DateInput, b: DateInput): number {
  const ms = toDate(b).getTime() - toDate(a).getTime()
  return Math.round(ms / 86_400_000)
}
