import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { toast } from 'react-toastify'
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

  // Added beyond the brief: `catch { toast.error(t('form.failure')) }`
  // discarded `error.status` and `error.body`, which api/client.js
  // deliberately attaches. The backend throttles /api/lead/ at 5/hour/IP
  // and returns 429 — a visitor who trips it saw the same generic message
  // as any other failure, with no clue to wait. Pins the 429 branch.
  it('shows a throttled message when the backend returns 429', async () => {
    const error = new Error('too many requests')
    error.status = 429
    vi.spyOn(endpoints, 'sendLead').mockRejectedValue(error)
    const toastError = vi.spyOn(toast, 'error')

    renderForm()
    await fillIn()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Слишком много заявок. Попробуйте через час.'),
    )
  })

  // Added beyond the brief: a 400 validation failure (bad phone/name/message
  // length) is equally invisible under the old catch-all. DRF returns field
  // errors as `{ field: ['message'] }`; the first one should surface instead
  // of the generic failure toast.
  it('shows the first field error for a 400 validation failure', async () => {
    const error = new Error('bad request')
    error.status = 400
    error.body = { phone: ['Неверный номер.'] }
    vi.spyOn(endpoints, 'sendLead').mockRejectedValue(error)
    const toastError = vi.spyOn(toast, 'error')

    renderForm()
    await fillIn()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Неверный номер.'))
  })

  // A 400 with no parseable body (or any other status) still falls back to
  // the generic failure message — this is the "everything else" branch.
  it('falls back to the generic failure message for a status with no field errors', async () => {
    const error = new Error('server error')
    error.status = 500
    vi.spyOn(endpoints, 'sendLead').mockRejectedValue(error)
    const toastError = vi.spyOn(toast, 'error')

    renderForm()
    await fillIn()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Произошла ошибка, попробуйте снова.'),
    )
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
