import { useEffect, useState } from "react";
import logo from '../assets/logo-nav.svg';
import { NavLink } from 'react-router-dom';
import iconPhone from '../assets/phone.svg';

export default function Navbar() {
  const [hide, setHide] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

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

          <select>
            <option value="ru">Русский</option>
            <option value="uz">O'zbekcha</option>
          </select>
        </div>

        <div className="nav-body">
          <NavLink to="/">
            <img className='logo' src={logo} alt="DX-GROUP logo" />
          </NavLink>

          <ul className="nav-list">
            <li><NavLink to='/'>Главная</NavLink></li>
            <li><NavLink to='/about'>О нас</NavLink></li>
            <li><NavLink to='/products'>Продукты</NavLink></li>
            <li><NavLink to='/portfolio'>Портфолио</NavLink></li>
            <li><NavLink to='/contact'>Контакты</NavLink></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
