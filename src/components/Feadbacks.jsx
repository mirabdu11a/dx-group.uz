import { useTranslation } from 'react-i18next';

export default function Feadbacks() {
  const { t } = useTranslation();
  const feedbacks = t('reviews.items', { returnObjects: true });

  return (
    <section className="Feadbacks section">
      <div className="container">
        <h2 className="title mb-5">
          {t('reviews.title')}
          <span>{t('reviews.subtitle')}</span>
        </h2>
      </div>

      <div className="slider">
        <div className="slider-track">
          {[...feedbacks, ...feedbacks].map((fb, idx) => (
            <div className="slide" key={idx}>
              <p className="text">"{fb.text}"</p>
              <h4 className="name">{fb.name}</h4>
              <span className="company">{fb.company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
