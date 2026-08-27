// Domain — validate with `NationalId.parse(value, country)`. React-free (uses @luwio/country).
// React bindings live at `@luwio/national-id/react`.
export { NationalId } from './domain/national-id'
export {
  type INationalId,
  type NationalIdDetails,
  type NationalIdSpec,
  type Sex,
  UnsupportedCountryError,
} from './types'
