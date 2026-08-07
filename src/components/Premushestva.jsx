import { useTranslation } from 'react-i18next';

export default function Premushestva() {
  const { t } = useTranslation();
  const items = t('advantages.items', { returnObjects: true });

  return (
    <section className='Premushestva section'>
      <div className="container">
        <h2 className="title mb-5">
          {t('advantages.title')}
          <span>{t('advantages.subtitle')}</span>
        </h2>
        <div className="row">
          {items.map((item, index) => (
            <div className="col-md-4 mb-3" key={index}>
              <div className="card">
                <div className="card-body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
