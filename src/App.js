// src/App.js
import './App.css';
import { useState } from 'react';
import AdaptiveTestPage from './components/AdaptiveTestPage';

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
    return <AdaptiveTestPage onBack={backToHome} />;
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
              Революционная платформа адаптивного тестирования на базе ИИ. 
              Система автоматически подбирает вопросы под ваш уровень, точно определяет 
              компетенции и формирует персональный план развития. Пройдите 25 умных вопросов 
              и получите детальный анализ навыков с рекомендациями от экспертов.
            </p>
            <button className="start-test-btn" onClick={startTest}>
              🚀 Начать адаптивное тестирование
            </button>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Пользователей уже оценили свои навыки</p>
            </div>
            <div className="stat-card">
              <h3>10+</h3>
              <p>Компетенций оцениваются системой</p>
            </div>
            <div className="stat-card">
              <h3>95%</h3>
              <p>Точность адаптивного алгоритма</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Как работает адаптивное тестирование?</h2>
          <p className="features-subtitle">
            Умная система оценки, которая адаптируется под ваш уровень в режиме реального времени
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Персональный подход</h3>
              <p>
                Тест начинается с вопросов среднего уровня и автоматически адаптируется: 
                правильный ответ → сложнее, неправильный → проще. Каждый получает уникальный опыт тестирования.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Оценка по компетенциям</h3>
              <p>
                Система анализирует ваши навыки по каждой компетенции отдельно: JavaScript, React, Python, 
                базы данных, коммуникация и другие. Получите детальную карту ваших знаний.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Умный алгоритм</h3>
              <p>
                Адаптивная система анализирует последние 3 ответа по каждой компетенции и 
                динамически подбирает оптимальный уровень сложности для максимально точной оценки.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Быстро и эффективно</h3>
              <p>
                Всего 25 вопросов для полной оценки всех компетенций. Система автоматически 
                определяет ваш уровень: Начинающий, Средний, Продвинутый или Эксперт.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Моментальная обратная связь</h3>
              <p>
                Получайте feedback сразу после каждого ответа. Видите, где ошиблись, 
                и понимаете, на что обратить внимание. Учитесь прямо во время тестирования.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Детальная аналитика</h3>
              <p>
                По результатам теста вы получите: процент точности по каждой компетенции, 
                текущий уровень сложности, персональные рекомендации по развитию навыков.
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Готовы узнать свой реальный уровень?</h2>
            <p>
              Пройдите бесплатное адаптивное тестирование прямо сейчас. 
              Система подберет вопросы специально для вас и даст точную оценку ваших компетенций.
            </p>
            <button className="cta-btn" onClick={startTest}>
              Начать тестирование
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;