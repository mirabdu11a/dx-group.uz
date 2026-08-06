import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useApi } from '../hooks/useApi'
import { fetchPortfolioList, fetchUrl } from '../api/endpoints'
import { useLanguage } from '../context/LanguageContext'
import { pickLocale } from '../utils/locale'
import { mediaUrl } from '../api/client'
import Skeleton from '../components/Skeleton'

const SKELETON_COUNT = 6

// The API sends ISO dates; the site shows the local dd.mm.yyyy form. A
// missing date (the field isn't documented as required) renders blank
// rather than throwing on `.split('-')` of undefined.
function formatDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

export default function Portfolio() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data, loading, error } = useApi(fetchPortfolioList)

  // "Show more" pages accumulate here, on top of whatever `data.results`
  // (the first page) holds. These come from a second, independent request
  // (fetchUrl), so — unlike the first page — they can't be derived from
  // `data` and genuinely need their own state.
  const [extraResults, setExtraResults] = useState([])
  // undefined = "no show-more fetched yet, use data.next"; once "show
  // more" resolves this holds the next cursor for the page after that
  // (possibly null, on the last page).
  const [moreNext, setMoreNext] = useState(undefined)
  const [loadingMore, setLoadingMore] = useState(false)

  // Derived directly from `data` rather than synced into state by a
  // useEffect. useApi batches `data` and `loading:false` into one update,
  // so an effect-based sync would leave a committed, painted frame where
  // `loading` is already false but `items` still shows the previous
  // (empty) value — a one-frame flash of stale content once real data
  // exists. Deriving during render closes that window entirely.
  const items = useMemo(
    () => [...(data?.results ?? []), ...extraResults],
    [data, extraResults],
  )
  const next = moreNext !== undefined ? moreNext : (data?.next ?? null)

  const showMore = async () => {
    if (!next) return
    setLoadingMore(true)
    try {
      const nextPage = await fetchUrl(next)
      setExtraResults((prev) => [...prev, ...nextPage.results])
      setMoreNext(nextPage.next)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <section className="PortfolioSection section">
      <div className="container">
        <h2 className="title mb-5">
          {t('portfolio.title')}<span>{t('portfolio.subtitle')}</span>
        </h2>

        {error ? (
          <p className="section-error">{t('state.error')}</p>
        ) : (
          <div className="row">
            {loading ? (
              <Skeleton
                count={SKELETON_COUNT}
                className="col-md-4 mb-4 card-skeleton"
                testId="portfolio-skeleton"
              />
            ) : items.length === 0 ? (
              <p className="section-empty">{t('portfolio.empty')}</p>
            ) : (
              items.map((project) => {
                const title = pickLocale(project, language, 'title')
                const image = mediaUrl(project.image)
                return (
                  <div className="col-md-4 mb-4" key={project.id}>
                    <NavLink to={`/portfolio/${project.id}`} className="ProjectCard">
                      {image && <img src={image} alt={title} />}
                      <span className="ProjectCard__date">{formatDate(project.date)}</span>
                      <h3>{title}</h3>
                      <p>{pickLocale(project, language, 'tizer')}</p>
                    </NavLink>
                  </div>
                )
              })
            )}
          </div>
        )}

        {next && (
          <div className="PortfolioSection__more">
            <button type="button" className="button" onClick={showMore} disabled={loadingMore}>
              {loadingMore ? t('state.loading') : t('portfolio.showMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
