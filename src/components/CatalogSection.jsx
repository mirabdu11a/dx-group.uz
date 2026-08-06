import { useEffect, useRef, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useApi } from '../hooks/useApi'
import { fetchCategories, fetchProducts, fetchUrl } from '../api/endpoints'
import { useLanguage } from '../context/LanguageContext'
import { pickLocale } from '../utils/locale'
import { mediaUrl } from '../api/client'
import Skeleton from './Skeleton'

const SIDEBAR_SKELETON_COUNT = 6
const GRID_SKELETON_COUNT = 8

export default function CatalogSection() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlCategory = Number(searchParams.get('category')) || null
  const [items, setItems] = useState([])
  const [next, setNext] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const categories = useApi(fetchCategories)
  const products = useApi(
    () => fetchProducts(urlCategory ? { category: urlCategory } : {}),
    [urlCategory],
  )

  // Bumped on every filter change. "Show more" captures the value when it
  // starts and compares on arrival, so a slow response for the previous
  // category cannot append itself to the new list. The filter buttons are
  // never disabled, so this race is reachable by ordinary clicking.
  const generationRef = useRef(0)
  useEffect(() => {
    generationRef.current += 1
  }, [urlCategory])

  useEffect(() => {
    if (!products.data) return
    setItems(products.data.results)
    setNext(products.data.next)
    setLoadingMore(false)
  }, [products.data])

  const selectCategory = (id) => {
    setSearchParams(id ? { category: String(id) } : {})
  }

  const showMore = async () => {
    if (!next) return
    const generation = generationRef.current
    setLoadingMore(true)
    try {
      const nextPage = await fetchUrl(next)
      if (generationRef.current !== generation) return
      setItems((prev) => [...prev, ...nextPage.results])
      setNext(nextPage.next)
    } finally {
      if (generationRef.current === generation) setLoadingMore(false)
    }
  }

  return (
    <section className='CatalogSection section'>
      <div className="container">
        <h2 className="title mb-5">{t('catalog.title')}</h2>

        <div className="row">
          <aside className="col-md-3 CatalogSection__sidebar">
            <button
              type="button"
              className={`CatalogSection__filter${urlCategory === null ? ' is-active' : ''}`}
              onClick={() => selectCategory(null)}
            >
              {t('catalog.all')}
            </button>

            {categories.loading
              ? <Skeleton
                  count={SIDEBAR_SKELETON_COUNT}
                  className="CatalogSection__filter CatalogSection__filter--skeleton"
                  testId="filter-skeleton"
                />
              : (categories.data ?? []).map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`CatalogSection__filter${urlCategory === category.id ? ' is-active' : ''}`}
                    onClick={() => selectCategory(category.id)}
                  >
                    {pickLocale(category, language, 'name')}
                  </button>
                ))}
          </aside>

          <div className="col-md-9">
            {products.error ? (
              <p className="section-error">{t('state.error')}</p>
            ) : products.loading ? (
              <div className="row">
                <Skeleton
                  count={GRID_SKELETON_COUNT}
                  className="col-md-4 mb-4 card-skeleton"
                  testId="product-skeleton"
                />
              </div>
            ) : items.length === 0 ? (
              <p className="section-empty">{t('catalog.empty')}</p>
            ) : (
              <>
                <div className="row">
                  {items.map((product) => {
                    const name = pickLocale(product, language, 'name')
                    const image = mediaUrl(product.image)
                    return (
                      <div className="col-md-4 mb-4" key={product.id}>
                        <NavLink to={`/products/${product.id}`} className="ProductCard">
                          {image && <img src={image} alt={name} />}
                          <h3>{name}</h3>
                          <p>{pickLocale(product, language, 'tizer')}</p>
                        </NavLink>
                      </div>
                    )
                  })}
                </div>

                {next && (
                  <div className="CatalogSection__more">
                    <button
                      type="button"
                      className="button"
                      onClick={showMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? t('state.loading') : t('catalog.showMore')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
