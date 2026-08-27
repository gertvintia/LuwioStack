import { timezoneRows } from '../data'
import type { ITimezone, ITimezones } from '../types'
import { Timezone } from './timezone'

/** An immutable collection of {@link ITimezone}, de-duplicated by IANA name. */
export class Timezones implements ITimezones {
  private readonly values: ITimezone[]

  private constructor(values: ITimezone[]) {
    this.values = values
  }

  static empty(): ITimezones {
    return new Timezones([])
  }

  /** Every IANA timezone in the bundled dataset. */
  static all(): ITimezones {
    return new Timezones(timezoneRows.map((name) => Timezone.new({ name })))
  }

  add(timezone: ITimezone): ITimezones {
    if (this.values.some((item) => item.name === timezone.name)) return this
    return new Timezones([...this.values, timezone])
  }

  remove(timezone: ITimezone): ITimezones {
    return new Timezones(this.values.filter((item) => item.name !== timezone.name))
  }

  toArray(): ITimezone[] {
    return this.values
  }

  get size(): number {
    return this.values.length
  }
}
