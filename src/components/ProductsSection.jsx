import pr1 from '../assets/pr-sec1.webp'
import pr2 from '../assets/pr-sec2.webp'
import pr3 from '../assets/pr-sec3.webp'
import pr4 from '../assets/pre-sec4.webp'
import pr5 from '../assets/pre-sec5.webp'
import pr6 from '../assets/pre-sec6.webp'

import { NavLink } from 'react-router-dom'

export default function ProductsSection() {
  return (
    <section className='ProductsSection section'>
      <div className="container">
        <div className="title-head mb-5">
          <h2 className="title">Наша продукция<span>Нажмите «Подробно », чтобы узнать больше</span></h2>
          
          <NavLink to="/products">
            <button className="details-btn">
              <span>Посмотреть каталог</span>
              <svg
                className="details-btn__arrow"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13 6L19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </NavLink>
        </div>
        <div className="row"> 
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h3>КРУПНОЩИТОВАЯ ОПАЛУБКА</h3>
                <img src={pr1} alt="product" />
                <button className="details-btn">
                <svg
                  className="details-btn__arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
          </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h3>БАЛКА ОПАЛУБКИ
ДВУТАВРОВАЯ БДК 1 МС
BEAM H20
</h3>
                <img src={pr2} alt="product" />
                <button className="details-btn">
                <svg
                  className="details-btn__arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h3>КОМПЛЕКТУЮЩИЕ</h3>
                <img src={pr3} alt="product" />
                <button className="details-btn">
                <svg
                  className="details-btn__arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h3>КРУПНОЩИТОВАЯ ОПАЛУБКА</h3>
                <img src={pr4} alt="product" />
                <button className="details-btn">
                <svg
                  className="details-btn__arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h3>СТОЙКА ТЕЛЕСКОПИЧЕСКАЯ</h3>
                <img src={pr5} alt="product" />
                <button className="details-btn">
                <svg
                  className="details-btn__arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h3>ПРОМЫШЛЕННАЯ ОПАЛУБКА</h3>
                <img src={pr6} alt="product" />
                <button className="details-btn">
                <svg
                  className="details-btn__arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
