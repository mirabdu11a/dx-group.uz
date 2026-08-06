import { useState } from 'react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

import { sendLead } from '../api/endpoints'

const UZ_PHONE = /^\+998\d{9}$/

export default function ContactSection() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()

    if (!UZ_PHONE.test(phone)) {
      toast.error(t('form.invalidPhone'))
      return
    }

    setIsLoading(true)
    try {
      // The backend stores the lead and forwards it to Telegram. The bot
      // token lives there, not in this bundle.
      await sendLead({ name, phone, message })
      toast.success(t('form.success'))
      setName('')
      setPhone('')
      setMessage('')
    } catch {
      toast.error(t('form.failure'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='ContactSection section'>
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h2 className="title">
              {t('form.title')}
              <span>{t('form.subtitle')}</span>
            </h2>
          </div>

          <div className="col-md-6">
            <form onSubmit={submit}>
              <div className="row">
                <input required value={name} onChange={(e) => setName(e.target.value)}  placeholder={t('form.name')} type="fname"className='col-12 mb-3'  />
                <PhoneInput
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: true
                  }}
                  className='mb-3 '
                  defaultCountry="uz"
                  value={phone}
                  onChange={(phone) => setPhone(phone)}
                />
                  <textarea className='col-12 mb-3' value={message} onChange={(e) => setMessage(e.target.value)}  placeholder={t('form.message')} name="" id=""></textarea>

                <button className='button' type='submit' disabled={isLoading}>
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <span>{t('form.submit')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
