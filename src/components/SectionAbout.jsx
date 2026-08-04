
export default function SectionAbout() {
  return (
    <section className='SectionAbout section'>
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h1 className='title'>Коротко о нас 
              <span>DX-GROU правильный выбор</span>
            </h1>
          </div>
          <div className="col-md-6">
            <h5> DX-GROUP — это компания, ориентированная на долгосрочное сотрудничество и устойчивое развитие. Наша миссия — предоставлять надежные и качественные решения, создавая реальную ценность для клиентов и партнеров.
Мы строим свою работу на принципах ответственности, профессионализма и открытости, постоянно совершенствуя процессы и внедряя современные технологии.
DX-GROUP стремится быть надежным партнером, которому доверяют — как сегодня, так и в будущем.</h5>
          
          <button className="details-btn">
            <span>Подробно</span>
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
