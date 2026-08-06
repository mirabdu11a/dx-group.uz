import logo from '../assets/logo.svg'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useApi } from '../hooks/useApi'
import { fetchCategories } from '../api/endpoints'
import { useLanguage } from '../context/LanguageContext'
import { pickLocale } from '../utils/locale'

export default function Footer() {
  const { t } = useTranslation();
  const { language } = useLanguage()
  const { data } = useApi(fetchCategories)

  // The footer stays silent on error and while loading — an empty list is
  // the right fallback here, unlike the home section's skeletons/error text.
  const categories = data ?? []

  return (
    <footer className='Footer'>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <img className='footer-logo' src={logo} alt="logo" />
            <p>{t('footer.about')}</p>
          </div>
          <div className="col-md-4">
            <ul className="product-list">
              <h4>{t('footer.catalog')}</h4>
              {categories.map((category) => (
                <li key={category.id}>
                  <NavLink to={`/products?category=${category.id}`}>
                    {pickLocale(category, language, 'name')}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-4">
            <ul className="nav-list">
              <li><NavLink to='/'>{t('nav.home')}</NavLink></li>
              <li><NavLink to='/about'>{t('nav.about')}</NavLink></li>
              <li><NavLink to='/products'>{t('nav.products')}</NavLink></li>
              <li><NavLink to='/portfolio'>{t('nav.portfolio')}</NavLink></li>
              <li><NavLink to='/contact'>{t('nav.contact')}</NavLink></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
