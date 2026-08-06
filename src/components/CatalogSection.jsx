import { useEffect, useMemo, useRef, useState } from 'react'
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

  // `!= null` (not truthiness) so category id `0` is never mistaken for
  // "no filter" — mirrors the same presence check in api/endpoints.js.
  const categoryParam = searchParams.get('category')
  const parsedCategory = categoryParam != null ? Number(categoryParam) : null
  const urlCategory = Number.isNaN(parsedCategory) ? null : parsedCategory

  const categories = useApi(fetchCategories)
  const products = useApi(
    () => fetchProducts(urlCategory != null ? { category: urlCategory } : {}),
    [urlCategory],
  )

  // "Show more" pages accumulate here, on top of whatever `products.data`
  // (the first page) holds. These come from a second, independent request
  // (fetchUrl), so — unlike the first page — they can't be derived from
  // `products` and genuinely need their own state.
  const [extraResults, setExtraResults] = useState([])
  // undefined = "no show-more fetched yet for this filter, use
  // products.data.next"; once "show more" resolves this holds the next
  // cursor for the page after that (possibly null, on the last page).
  const [moreNext, setMoreNext] = useState(undefined)
  const [loadingMore, setLoadingMore] = useState(false)

  // Clears the accumulated "show more" state when the filter changes.
  // Done here, during render (the documented React pattern for resetting
  // state from a prop/derived value), rather than in an effect — an
  // effect-based reset would still leave one committed, painted frame
  // where the previous category's extra pages are attached to the new
  // category's first page. Doing it here means `items` below is always
  // correct on the very render `products.data` changes.
  const [resetKey, setResetKey] = useState(urlCategory)
  if (resetKey !== urlCategory) {
    setResetKey(urlCategory)
    setExtraResults([])
    setMoreNext(undefined)
    setLoadingMore(false)
  }

  // Bumped on every filter change. "Show more" captures the value when it
  // starts and compares on arrival, so a slow response for the previous
  // category cannot append itself to the new list. The filter buttons are
  // never disabled, so this race is reachable by ordinary clicking.
  const generationRef = useRef(0)
  useEffect(() => {
    generationRef.current += 1
  }, [urlCategory])

  // Derived directly from `products.data` rather than synced into state by
  // an effect. useApi batches `data` and `loading:false` into one update,
  // so an effect-based sync would leave a committed, painted frame where
  // `loading` is already false but `items` still shows the previous
  // category's cards — the effect that copies `products.data` into state
  // only runs after that frame paints. Deriving during render closes that
  // window entirely.
  const items = useMemo(
    () => [...(products.data?.results ?? []), ...extraResults],
    [products.data, extraResults],
  )
  const next = moreNext !== undefined ? moreNext : (products.data?.next ?? null)

  const selectCategory = (id) => {
    setSearchParams(id != null ? { category: String(id) } : {})
  }

  const showMore = async () => {
    if (!next) return
    const generation = generationRef.current
    setLoadingMore(true)
    try {
      const nextPage = await fetchUrl(next)
      if (generationRef.current !== generation) return
      setExtraResults((prev) => [...prev, ...nextPage.results])
      setMoreNext(nextPage.next)
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
