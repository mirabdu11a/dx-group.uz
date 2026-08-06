import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useApi } from '../hooks/useApi'
import { fetchCategories } from '../api/endpoints'
import { useLanguage } from '../context/LanguageContext'
import { pickLocale } from '../utils/locale'
import { mediaUrl } from '../api/client'
import Skeleton from './Skeleton'

const HOME_LIMIT = 6
const SKELETON_COUNT = 6

function Arrow() {
  return (
    <svg
      className="details-btn__arrow"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ProductsSection() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data, loading, error } = useApi(fetchCategories)

  const categories = (data ?? []).slice(0, HOME_LIMIT)

  return (
    <section className='ProductsSection section'>
      <div className="container">
        <div className="title-head mb-5">
          <h2 className="title">{t('catalog.title')}<span>{t('catalog.subtitle')}</span></h2>

          <NavLink to="/products">
            <button className="details-btn">
              <span>{t('catalog.viewAll')}</span>
              <Arrow />
            </button>
          </NavLink>
        </div>

        {error ? (
          <p className="section-error">{t('state.error')}</p>
        ) : (
          <div className="row">
            {loading ? (
              <Skeleton
                count={SKELETON_COUNT}
                className="col-md-4 mb-4 card-skeleton"
                testId="category-skeleton"
              />
            ) : categories.length === 0 ? (
              <p className="section-empty">{t('state.empty')}</p>
            ) : (
              categories.map((category) => {
                const name = pickLocale(category, language, 'name')
                const image = mediaUrl(category.image)
                return (
                  <div className="col-md-4 mb-4" key={category.id}>
                    <NavLink
                      to={`/products?category=${category.id}`}
                      className="card"
                      aria-label={name}
                    >
                      <div className="card-body">
                        <h3>{name}</h3>
                        {image && <img src={image} alt={name} />}
                        <span className="details-btn">
                          <Arrow />
                        </span>
                      </div>
                    </NavLink>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </section>
  )
}
