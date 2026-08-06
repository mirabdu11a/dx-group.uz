import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import logo1 from '../assets/logo1.svg';
import logo2 from '../assets/logo2.svg';
import logo3 from '../assets/logo1.svg';
import logo4 from '../assets/logo2.svg';
import logo5 from '../assets/logo1.svg';

export default function Partners() {
 const { t } = useTranslation();
 const logos = [logo1, logo2, logo3, logo4, logo5];

  return (
    <section className="Partners section">
      <div className="container">

        <h2 className="title mb-5">
          {t('partners.title')}
          <span>{t('partners.subtitle')}</span>
        </h2>
      </div>

      <div className="slider">
        <div className="slider-track">
          {[...logos, ...logos].map((logo, idx) => (
            <div className="slide" key={idx}>
              <img src={logo} alt={`Partner ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
