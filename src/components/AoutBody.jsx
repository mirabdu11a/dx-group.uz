import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AboutBody() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const [start, setStart] = useState(false);

  const stats = [
    { value: 120, label: t('aboutPage.stats.projects') },
    { value: 85, label: t('aboutPage.stats.clients') },
    { value: 10, label: t('aboutPage.stats.years') },
    { value: 15, label: t('aboutPage.stats.partners') },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
  }, []);

  return (
    <section className="About" ref={sectionRef}>
      <div className="container">
        <div className="about-content">
          <h2 className="title">
            {t('aboutPage.title')} <span>DX-GROUP</span>
          </h2>

          <p className="text">
            {t('aboutPage.text')}
          </p>
        </div>

        <div className="stats">
          {stats.map((item, i) => (
            <StatCard key={i} item={item} start={start} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ item, start }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const increment = Math.ceil(item.value / 60);

    const timer = setInterval(() => {
      current += increment;
      if (current >= item.value) {
        current = item.value;
        clearInterval(timer);
      }
      setCount(current);
    }, 20);

    return () => clearInterval(timer);
  }, [start, item.value]);

  return (
    <div className="stat-card">
      <h3>{count}+</h3>
      <p>{item.label}</p>
    </div>
  );
}
