import { useTranslation } from 'react-i18next';

export default function SectionAbout() {
  const { t } = useTranslation();

  return (
    <section className='SectionAbout section'>
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h1 className='title'>{t('homeAbout.title')}
              <span>{t('homeAbout.subtitle')}</span>
            </h1>
          </div>
          <div className="col-md-6">
            <h5>{t('homeAbout.text')}</h5>

          <button className="details-btn">
            <span>{t('homeAbout.more')}</span>
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
    </section>
  )
}
