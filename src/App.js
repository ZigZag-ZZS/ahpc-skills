import './App.css';
import { useState } from 'react';
import TestPage from './components/TestPage';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTest, setShowTest] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const startTest = () => {
    setShowTest(true);
    setIsMenuOpen(false);
  };

  const backToHome = () => {
    setShowTest(false);
  };

  if (showTest) {
    return <TestPage onBack={backToHome} />;
  }

  return (
    <div className="App">
      {/* Анимированный фон с волнами и частицами */}
      <div className="animated-background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="floating-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      <nav className="main-nav" style={{ padding: '1rem 4rem' }}>
        <div className="nav-brand" onClick={backToHome} style={{ cursor: 'pointer' }}>
          <span className="gradient-text">Poly</span>Skills
        </div>
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#start" onClick={(e) => { e.preventDefault(); startTest(); }}>Тестирование</a>
          <a href="#stats" onClick={() => setIsMenuOpen(false)}>Статистика</a>
          <a href="#courses" onClick={() => setIsMenuOpen(false)}>Курсы</a>
          <a href="#login" className="login-btn" onClick={() => setIsMenuOpen(false)}>Войти</a>
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Откройте новые горизонты с <span className="gradient-text">PolySkills</span></h1>
            <p className="hero-text">
              Погрузитесь в мир профессионального развития с передовыми технологиями искусственного интеллекта. 
              Наша платформа анализирует ваши компетенции с точностью до 95%, выявляет скрытые таланты и 
              предлагает персонализированный путь к успеху. Присоединяйтесь к тысячам профессионалов, 
              которые уже достигли новых карьерных высот благодаря нашему инновационному подходу.
            </p>
            <button className="start-test-btn" onClick={startTest}>Начать путешествие</button>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Успешных специалистов выросли вместе с нами</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Экспертных курсов от ведущих профессионалов</p>
            </div>
            <div className="stat-card">
              <h3>95%</h3>
              <p>Точность ИИ-анализа ваших навыков и потенциала</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Почему выбирают нас?</h2>
          <p className="features-subtitle">
            Узнайте, как наши уникальные технологии помогут вам достичь профессионального совершенства
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Умный ИИ Анализ</h3>
              <p>
                Революционные алгоритмы машинного обучения анализируют ваши ответы в режиме реального времени, 
                выявляя не только текущий уровень навыков, но и скрытый потенциал для роста в различных направлениях.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Детальная Аналитика</h3>
              <p>
                Получайте глубокие инсайты о своих сильных и слабых сторонах через интерактивные графики и отчеты. 
                Визуализация прогресса поможет вам отслеживать развитие компетенций день за днем.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Персональный Путь</h3>
              <p>
                Индивидуальная дорожная карта развития, составленная на основе ваших целей, текущих навыков и 
                желаемой карьерной траектории. Каждая рекомендация адаптируется под ваш темп обучения.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Курсы от Экспертов</h3>
              <p>
                Эксклюзивный доступ к библиотеке премиальных курсов от Learna и ведущих специалистов индустрии. 
                Обучайтесь у лучших, получайте сертификаты и расширяйте профессиональную сеть контактов.
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Готовы изменить свою карьеру?</h2>
            <p>
              Начните бесплатное тестирование прямо сейчас и получите персональный план развития от наших экспертов. 
              Ваше будущее начинается здесь!
            </p>
            <button className="cta-btn" onClick={startTest}>Создать аккаунт бесплатно</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;