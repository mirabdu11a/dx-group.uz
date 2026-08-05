import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import Navbar from './Navbar'
import '../i18n'

function renderNavbar() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Navbar />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('Navbar language switch', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders Russian labels by default', () => {
    renderNavbar()
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('О нас')).toBeInTheDocument()
    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.getByText('Портфолио')).toBeInTheDocument()
    expect(screen.getByText('Контакты')).toBeInTheDocument()
  })

  it('switches every label to Uzbek', async () => {
    renderNavbar()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'uz')

    // Every nav item, not just two of them: the brief's original test only
    // checked home + portfolio, which would not have failed if about,
    // products or contact had been left untranslated.
    expect(screen.getByText('Bosh sahifa')).toBeInTheDocument()
    expect(screen.getByText('Biz haqimizda')).toBeInTheDocument()
    expect(screen.getByText('Mahsulotlar')).toBeInTheDocument()
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Kontaktlar')).toBeInTheDocument()

    // And the Russian labels must actually be gone, not just present
    // alongside the Uzbek ones.
    expect(screen.queryByText('Главная')).not.toBeInTheDocument()
    expect(screen.queryByText('О нас')).not.toBeInTheDocument()
    expect(screen.queryByText('Продукты')).not.toBeInTheDocument()
    expect(screen.queryByText('Контакты')).not.toBeInTheDocument()
  })

  it('persists the choice', async () => {
    renderNavbar()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'uz')

    expect(window.localStorage.getItem('dx-lang')).toBe('uz')
  })

  it('restores the persisted choice on mount', () => {
    window.localStorage.setItem('dx-lang', 'uz')

    renderNavbar()

    expect(screen.getByText('Bosh sahifa')).toBeInTheDocument()
  })
})
