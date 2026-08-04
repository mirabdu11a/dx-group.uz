import { CHAT_ID, TOKEN } from "../constants";
import { useState } from 'react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css';
import axios from "axios";
import { toast } from "react-toastify";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  let text = `Ismi: ${name}.%0ATelefon raqami : ${phone}.%0AXabar : ${message}.`;

  const sendFeedback = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  const uzbPhoneRegex = /^\+998\d{9}$/;

  if (!uzbPhoneRegex.test(phone)) {
    toast.error("Номер телефона должен начинаться с +998 и содержать 9 цифр!");
    setIsLoading(false);
    return;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`
    );

    toast.success("Завершено успешно. Дождитесь обратного звонка!");
    setName("");
    setPhone("");
    setMessage("");
  } catch (err) {
    toast.error("Произошла ошибка, попробуйте снова.");
  } finally {
    setIsLoading(false);
  }
};
  return (
    <section className='ContactSection section'>
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h2 className="title">
              Рассчитаем проект по выгодной цене
              <span>Заполните форму и мы свяжемся с вами, чтобы ответить на все вопросы.</span>
            </h2>
          </div>

          <div className="col-md-6">
            <form onSubmit={sendFeedback}>
              <div className="row">
                <input required value={name} onChange={(e) => setName(e.target.value)}  placeholder='Имя' type="fname"className='col-12 mb-3'  />
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
                  <textarea className='col-12 mb-3' value={message} onChange={(e) => setMessage(e.target.value)}  placeholder='Ваше сообщение' name="" id=""></textarea>

                <button className='button' type='submit' disabled={isLoading}>
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <span>Jo'natish</span>
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
