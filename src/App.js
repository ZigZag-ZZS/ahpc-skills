import './App.css';
import { useState } from 'react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="nav-brand">
          <span className="gradient-text">Skills</span>Test
        </div>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#start">Тестирование</a>
          <a href="#stats">Статистика</a>
          <a href="#courses">Курсы</a>
          <a href="#login" className="login-btn">Войти</a>
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Развивайте свои <span className="gradient-text">навыки</span></h1>
            <p className="hero-text">
              Используйте силу искусственного интеллекта для оценки и развития ваших компетенций
            </p>
            <button className="start-test-btn">Пройти тестирование</button>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Активных пользователей</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Курсов</p>
            </div>
            <div className="stat-card">
              <h3>95%</h3>
              <p>Точность оценки</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Почему мы?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>ИИ Анализ</h3>
              <p>Персонализированная оценка на основе ИИ</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Детальная статистика</h3>
              <p>Подробный анализ ваших навыков</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Рекомендации</h3>
              <p>Индивидуальный план развития</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Курсы Learna</h3>
              <p>Доступ к лучшим образовательным ресурсам</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Готовы начать?</h2>
            <p>Присоединяйтесь к нашей платформе и развивайте свои навыки</p>
            <button className="cta-btn">Зарегистрироваться</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
