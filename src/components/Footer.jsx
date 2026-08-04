import logo from '../assets/logo.svg'
import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className='Footer'>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <img className='footer-logo' src={logo} alt="logo" />
            <p>«DX-GROUP» — услуги по лизингу, производству и аренде по всему Узбекистану.</p>
          </div>
          <div className="col-md-4">
            <ul className="product-list">
              <h4>Каталог продукции</h4>
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
              <li><NavLink to='/'>Главная</NavLink></li>
              <li><NavLink to='/about'>О нас</NavLink></li>
              <li><NavLink to='/products'>Продукты</NavLink></li>
              <li><NavLink to='/portfolio'>Портфолио</NavLink></li>
              <li><NavLink to='/contact'>Контакты</NavLink></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
