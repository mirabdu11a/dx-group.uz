import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useApi } from '../hooks/useApi'
import { fetchProduct } from '../api/endpoints'
import { useLanguage } from '../context/LanguageContext'
import { pickLocale } from '../utils/locale'
import { mediaUrl } from '../api/client'

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data, loading, error } = useApi(() => fetchProduct(id), [id])

  // Which gallery image is shown as the main picture, tracked by id (not
  // URL, so two images that happen to share a URL stay distinguishable).
  // Reset synchronously whenever the route's `id` changes — adjusting state
  // during render, the same pattern CatalogSection uses for its "show more"
  // state. This component stays mounted across a `/products/:id` param
  // change (only the param differs, so React keeps the same instance), so
  // without this reset a thumbnail selected on the previous product would
  // still be "active" once the next product's data arrives, showing its
  // picture instead of the new product's first image.
  const [routeKey, setRouteKey] = useState(id)
  const [activeId, setActiveId] = useState(null)
  if (routeKey !== id) {
    setRouteKey(id)
    setActiveId(null)
  }

  if (error) {
    return (
      <section className="Detail section">
        <div className="container">
          <p className="section-error">{t('state.error')}</p>
        </div>
      </section>
    )
  }

  if (loading || !data) {
    return (
      <section className="Detail section">
        <div className="container">
          <p className="section-empty">{t('state.loading')}</p>
        </div>
      </section>
    )
  }

  const name = pickLocale(data, language, 'name')
  const gallery = data.images ?? []
  // The active gallery entry is shown as the main picture. The strip below
  // shows every gallery entry, including the active one — a conventional
  // gallery, where the active thumbnail is highlighted rather than removed.
  // Removing it would shift every other thumbnail's position on each click,
  // so the thumbnail a visitor just clicked would no longer be under their
  // cursor for the next click. When the gallery is empty this falls back to
  // the cover `image`, and when even that is null `main` is null and no
  // <img> is rendered at all.
  const activeItem = gallery.find((item) => item.id === activeId) ?? gallery[0]
  const main = mediaUrl(activeItem?.image ?? data.image)

  return (
    <section className="Detail section">
      <div className="container">
        <NavLink to="/products" className="Detail__back">← {t('product.back')}</NavLink>

        <div className="row">
          <div className="col-md-6">
            {main && (
              <img className="Detail__main" src={main} alt={name} data-testid="gallery-main" />
            )}

            {gallery.length > 1 && (
              <div className="Detail__thumbs">
                {gallery.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`Detail__thumb${item.id === activeItem?.id ? ' is-active' : ''}`}
                    data-testid={`gallery-thumb-${item.id}`}
                    onClick={() => setActiveId(item.id)}
                  >
                    <img src={mediaUrl(item.image)} alt={name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <h1 className="title">{name}</h1>
            {data.code && (
              <p className="Detail__code">{t('product.code')}: {data.code}</p>
            )}
            <p className="Detail__tizer">{pickLocale(data, language, 'tizer')}</p>
            {/* Safe here specifically because this HTML is authored by staff
                in the admin's WYSIWYG editor, never by a visitor. Do not
                point this at any field the public can write. */}
            <div
              className="Detail__description"
              dangerouslySetInnerHTML={{
                __html: pickLocale(data, language, 'description'),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
