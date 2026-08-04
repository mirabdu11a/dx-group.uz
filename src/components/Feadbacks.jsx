
const feedbacks = [
  {
    name: "Иван Петров",
    company: "СтройСервис",
    text: "Очень довольны сотрудничеством с вашей компанией. Работы выполнены качественно и в срок."
  },
  {
    name: "Мария Сидорова",
    company: "ДомСтрой",
    text: "Команда профессионалов! Рекомендую всем, кто ищет надежных подрядчиков."
  },
  {
    name: "Алексей Смирнов",
    company: "СтройКомплект",
    text: "Отличный сервис и прозрачные условия. Работаем с ними уже несколько лет."
  },
  {
    name: "Ольга Кузнецова",
    company: "МегаСтрой",
    text: "Очень понравилось взаимодействие. Все задачи решаются оперативно."
  }
];

export default function Feadbacks() {
  return (
    <section className="Feadbacks section">
      <div className="container">
        <h2 className="title mb-5">
          Отзывы наших клиентов
          <span>Наши клиенты доверяют нам и оставляют свои впечатления о сотрудничестве.</span>
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

