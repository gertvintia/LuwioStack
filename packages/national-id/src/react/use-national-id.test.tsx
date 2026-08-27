import { Country } from '@luwio/country'
import { render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NationalId } from './national-id-provider'
import { useNationalId } from './use-national-id'

const BE = Country.new({ code: 'BE' })

describe('<NationalId> / useNationalId', () => {
  it('provides the parsed national ID to descendants', () => {
    function Show() {
      const { nationalId } = useNationalId()
      const { details } = nationalId
      const extra = details.countryCode === 'BE' ? `${details.sex}:${details.isBis}` : ''
      return (
        <span>
          {nationalId.countryCode}:{extra}
        </span>
      )
    }
    render(
      <NationalId nationalId={NationalId.parse('85073003328', BE)}>
        <Show />
      </NationalId>,
    )
    expect(screen.getByText('BE:male:false')).toBeTruthy()
  })

  it('exposes parse/isValid on the provider', () => {
    expect(NationalId.isValid('85073003328', BE)).toBe(true)
    expect(NationalId.parse('85073003328', BE).value).toBe('85073003328')
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useNationalId())).toThrow(/within a <NationalId> provider/)
  })
})
