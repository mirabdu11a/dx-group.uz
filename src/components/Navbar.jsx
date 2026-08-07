import { useEffect, useState } from "react";
import logo from '../assets/logo-nav.svg';
import { NavLink, useLocation } from 'react-router-dom';
import iconPhone from '../assets/phone.svg';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [hide, setHide] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();

  // Scroll bo'yicha navbar yashirish/ko'rsatish
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 100 && !menuOpen) {
        setHide(true);
      } else {
        setHide(false);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll, menuOpen]);

  // Route o'zgarganda menyuni yopish
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Menyu ochiq bo'lganda body scrollni bloklash
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ESC tugmasi bosilganda menyuni yopish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav className={`Navbar ${hide ? "hide" : ""} ${menuOpen ? "menu-open" : ""}`}>
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
          <NavLink to="/" className="logo-link">
            <img className='logo' src={logo} alt="DX-GROUP logo" />
          </NavLink>

          {/* Burger button */}
          <button
            className={`burger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? t('nav.closeMenu', 'Menyuni yopish') : t('nav.openMenu', 'Menyuni ochish')}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul id="primary-navigation" className={`nav-list ${menuOpen ? "open" : ""}`}>
            <li><NavLink to='/' onClick={() => setMenuOpen(false)}>{t('nav.home')}</NavLink></li>
            <li><NavLink to='/about' onClick={() => setMenuOpen(false)}>{t('nav.about')}</NavLink></li>
            <li><NavLink to='/products' onClick={() => setMenuOpen(false)}>{t('nav.products')}</NavLink></li>
            <li><NavLink to='/portfolio' onClick={() => setMenuOpen(false)}>{t('nav.portfolio')}</NavLink></li>
            <li><NavLink to='/contact' onClick={() => setMenuOpen(false)}>{t('nav.contact')}</NavLink></li>

            {/* Mobil holatda select va telefon raqamlarini ham menyu ichida ko'rsatish */}
            <li className="mobile-only mobile-call">
              <a href="tel:+998983070550">
                <img src={iconPhone} alt="call icon" />
                +998983070550
              </a>
              <a href="tel:+998911664444">
                <img src={iconPhone} alt="call icon" />
                +998911664444
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Overlay - menyu ochiq bo'lganda fon qorayadi */}
      <div className={`nav-overlay ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)}></div>
    </nav>
  );
}