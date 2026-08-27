import { Language } from '@luwio/language'
import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Translations, useTranslations } from './react'
import { createTranslations } from './translations'

const en = Language.new({ code: 'en' })
const nl = Language.new({ code: 'nl' })
const enMessages = { greeting: { key: 'greeting', defaultValue: 'Hello' } }
const nlMessages = { greeting: { key: 'greeting', defaultValue: 'Hallo' } }

function Probe() {
  const { translations } = useTranslations()
  return <span data-testid="g">{translations.t('greeting')}</span>
}

describe('Translations / useTranslations', () => {
  it('exposes the store and re-renders when the language is activated', async () => {
    const tr = createTranslations()
    await tr.add(en, enMessages)
    await tr.add(nl, nlMessages)
    tr.activate(en)

    render(
      <Translations translations={tr}>
        <Probe />
      </Translations>,
    )
    expect(screen.getByTestId('g').textContent).toBe('Hello')

    act(() => {
      tr.activate(nl)
    })
    await waitFor(() => expect(screen.getByTestId('g').textContent).toBe('Hallo'))
  })

  it('loads a language ad-hoc through the hook, then activates it', async () => {
    const source = vi.fn(() => nlMessages)
    const tr = createTranslations()
    await tr.add(en, enMessages)
    tr.activate(en)

    function Switcher() {
      const { translations } = useTranslations()
      return (
        <button
          type="button"
          onClick={() => {
            void translations.add(nl, source).then(() => translations.activate(nl))
          }}
        >
          {translations.t('greeting')}
        </button>
      )
    }

    render(
      <Translations translations={tr}>
        <Switcher />
      </Translations>,
    )
    expect(screen.getByRole('button').textContent).toBe('Hello')

    await act(async () => {
      screen.getByRole('button').click()
    })
    await waitFor(() => expect(screen.getByRole('button').textContent).toBe('Hallo'))
    expect(source).toHaveBeenCalledTimes(1)
  })

  it('throws when used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/Translations/)
    spy.mockRestore()
  })
})
