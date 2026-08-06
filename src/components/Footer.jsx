import logo from '../assets/logo.svg'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation();

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
              <li><NavLink to='/products'>Крупнощитовая опалубка</NavLink></li>
              <li><NavLink to='/products'>Балка опалубки двутавровая бдк 1 мс beam h20</NavLink></li>
              <li><NavLink to='/products'>Комплектующие</NavLink></li>
              <li><NavLink to='/products'>Крупнощитовая опалубка</NavLink></li>
              <li><NavLink to='/products'>Стойка телескопическая</NavLink></li>
              <li><NavLink to='/products'>Промышленная опалубка</NavLink></li>

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
