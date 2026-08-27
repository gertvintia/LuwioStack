export interface ITimezone {
  /** IANA timezone identifier, e.g. `"Europe/Brussels"`. */
  name: string
  /** Machine-readable slug, stable across translations, e.g. `"europe_brussels"`. */
  machine_name: string
  /**
   * Minutes east of UTC at `at` — DST-aware. `60` for CET, `120` for CEST, `-300` for US Eastern
   * (winter). Defaults to now.
   */
  offset(at?: Date): number
  /** The short zone name at `at`, e.g. `"EST"` / `"EDT"` (or `"GMT+1"` where no abbreviation exists). */
  abbreviation(at?: Date): string
}

export interface ITimezones {
  readonly size: number
  add(timezone: ITimezone): ITimezones
  remove(timezone: ITimezone): ITimezones
  toArray(): ITimezone[]
}
