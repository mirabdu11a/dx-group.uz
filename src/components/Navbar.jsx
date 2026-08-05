import { useEffect, useState } from "react";
import logo from '../assets/logo-nav.svg';
import { NavLink } from 'react-router-dom';
import iconPhone from '../assets/phone.svg';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [hide, setHide] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 100) {
        // pastga scroll
        setHide(true);
      } else {
        // tepaga scroll
        setHide(false);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <nav className={`Navbar ${hide ? "hide" : ""}`}>
      <div className="container">
        <div className="nav-head">
          <div className='head-call'>
            <a href="tel:+998983070550">
              <img src={iconPhone} alt="call icon" />
              +998983070550
            </a>
            <a href="tel:+998911664444">
              <img src={iconPhone} alt="call icon" />
              +998911664444
            </a>
          </div>

          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label={t('nav.language')}
          >
            <option value="ru">Русский</option>
            <option value="uz">O'zbekcha</option>
          </select>
        </div>

        <div className="nav-body">
          <NavLink to="/">
            <img className='logo' src={logo} alt="DX-GROUP logo" />
          </NavLink>

          <ul className="nav-list">
            <li><NavLink to='/'>{t('nav.home')}</NavLink></li>
            <li><NavLink to='/about'>{t('nav.about')}</NavLink></li>
            <li><NavLink to='/products'>{t('nav.products')}</NavLink></li>
            <li><NavLink to='/portfolio'>{t('nav.portfolio')}</NavLink></li>
            <li><NavLink to='/contact'>{t('nav.contact')}</NavLink></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
