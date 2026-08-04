import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 120, label: "Успешных проектов" },
  { value: 85, label: "Довольных клиентов" },
  { value: 10, label: "Лет на рынке" },
  { value: 15, label: "Партнёрских компаний" },
];

export default function AboutBody() {
  const sectionRef = useRef(null);
  const [start, setStart] = useState(false);

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
            О компании <span>DX-GROUP</span>
          </h2>

          <p className="text">
            DX-GROUP — это надёжная строительная компания, которая на протяжении
            многих лет успешно реализует проекты различной сложности. Мы ценим
            качество, сроки и доверие наших клиентов.
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
