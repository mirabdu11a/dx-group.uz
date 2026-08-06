import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import bg1 from "../images/b1.jpg";
import bg2 from "../images/b2.jpg";
import bg3 from "../images/b3.jpg";

const images = [bg1, bg2, bg3];

export default function HeaderCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      {images.map((img, index) => (
        <div
          key={index}
          className={`header__bg ${index === activeIndex ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      <div className="header__overlay" />

      <div className="header__content">
        <div className="container">
          <h1>{t('header.title')}</h1>
          <p>{t('header.subtitle')}</p>
          <NavLink to="/products">
            <button className="button">{t('header.cta')}</button>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
