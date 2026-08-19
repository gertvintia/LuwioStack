/**
 * Converts a human-readable name to a stable snake_case machine name.
 *
 * - Normalizes Unicode (NFD) and strips diacritics (é → e, ñ → n, …)
 * - Lowercases
 * - Replaces any run of non-alphanumeric characters with a single underscore
 * - Trims leading/trailing underscores
 */
export function toMachineName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // strip combining marks (diacritics)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // non-alphanumeric runs → _
    .replace(/^_|_$/g, '') // trim edges
}
