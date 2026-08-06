import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { LanguageProvider } from '../context/LanguageContext'
import ContactSection from './ContactSection'
import * as endpoints from '../api/endpoints'
import '../i18n'

function renderForm() {
  return render(
    <LanguageProvider>
      <ContactSection />
    </LanguageProvider>,
  )
}

// Deviation from the brief, per its own warning: `react-international-phone`
// renders a plain `<input name="phone">` with no label and no aria-label, so
// its accessible name is "" — `getByRole('textbox', { name: /phone/i })`
// throws (confirmed by running the brief's version verbatim; see the RED
// evidence in the task report). The `name` attribute the component passes
// via `inputProps` is the one stable, unique hook into this third-party
// input, so select on it directly instead.
function getPhoneInput() {
  return document.querySelector('input[name="phone"]')
}

async function fillIn({ name = 'Иван', phone = '+998901234567', message = 'Тест' } = {}) {
  await userEvent.clear(screen.getByPlaceholderText('Имя'))
  await userEvent.type(screen.getByPlaceholderText('Имя'), name)

  const phoneInput = getPhoneInput()
  await userEvent.clear(phoneInput)
  await userEvent.type(phoneInput, phone)

  await userEvent.type(screen.getByPlaceholderText('Ваше сообщение'), message)
}

describe('ContactSection', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('posts the lead to the backend', async () => {
    const sendLead = vi.spyOn(endpoints, 'sendLead').mockResolvedValue({ id: 1 })

    renderForm()
    await fillIn()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() =>
      expect(sendLead).toHaveBeenCalledWith({
        name: 'Иван',
        phone: '+998901234567',
        message: 'Тест',
      }),
    )
  })

  it('clears the fields after a successful submit', async () => {
    vi.spyOn(endpoints, 'sendLead').mockResolvedValue({ id: 1 })

    renderForm()
    await fillIn()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => expect(screen.getByPlaceholderText('Имя')).toHaveValue(''))
  })

  it('rejects a non-Uzbek number without calling the backend', async () => {
    const sendLead = vi.spyOn(endpoints, 'sendLead').mockResolvedValue({ id: 1 })

    renderForm()
    await fillIn({ phone: '+79001234567' })
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => expect(sendLead).not.toHaveBeenCalled())
  })

  it('keeps the entered values when the backend fails', async () => {
    vi.spyOn(endpoints, 'sendLead').mockRejectedValue(new Error('boom'))

    renderForm()
    await fillIn()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Имя')).toHaveValue('Иван'),
    )
  })

  it('shows Uzbek labels when the language is Uzbek', async () => {
    window.localStorage.setItem('dx-lang', 'uz')

    renderForm()

    expect(screen.getByPlaceholderText('Ismingiz')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Jo'natish" })).toBeInTheDocument()
  })

  // Added beyond the brief, per the standing instruction: this is the actual
  // security property Task 10 delivers — the bot token used to live in this
  // bundle and the form posted straight to api.telegram.org. None of the
  // brief's five tests would catch a regression that put a stray
  // `axios.post('https://api.telegram.org/...')` back next to the sendLead
  // call (they only assert sendLead's own arguments). axios is still an
  // installed dependency (see the task report), so spying on its `post`
  // method and asserting it is never invoked directly pins "nothing in this
  // component talks to Telegram" independently of what sendLead does.
  it('never calls Telegram directly', async () => {
    const axiosPost = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} })
    const sendLead = vi.spyOn(endpoints, 'sendLead').mockResolvedValue({ id: 1 })

    renderForm()
    await fillIn()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => expect(sendLead).toHaveBeenCalled())
    expect(axiosPost).not.toHaveBeenCalled()
  })
})
