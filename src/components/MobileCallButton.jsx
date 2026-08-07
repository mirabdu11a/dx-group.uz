import { useState } from 'react';
import iconPhone from '../assets/phone.svg';
import { useTranslation } from 'react-i18next';

export default function MobileCallButton() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className={`MobileCallButton ${open ? 'open' : ''}`}>
      {/* Ochilganda ko'rinadigan raqamlar */}
      <div className="call-options">
        <a href="tel:+998983070550" className="call-option" onClick={() => setOpen(false)}>
          <img src={iconPhone} alt="call icon" />
          <span>+998 98 307 05 50</span>
        </a>
        <a href="tel:+998911664444" className="call-option" onClick={() => setOpen(false)}>
          <img src={iconPhone} alt="call icon" />
          <span>+998 91 166 44 44</span>
        </a>
      </div>

      {/* Asosiy tugma */}
      <button
        className="call-main-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('nav.call', "Qo'ng'iroq qilish")}
        aria-expanded={open}
      >
        <span className="pulse"></span>
        <img src={iconPhone} alt="phone" className={`phone-icon ${open ? 'rotate' : ''}`} />
      </button>
    </div>
  );
}