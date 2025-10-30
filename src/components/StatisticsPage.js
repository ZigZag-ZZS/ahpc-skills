import React, { useState, useEffect } from 'react';
import './TestPage.css';
import apiService from '../services/apiService'; // Импортируем реальный API сервис

function StatisticsPage({ onBack }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Используем реальный API сервис вместо мок-данных
      const data = await apiService.getStatistics();
      
      console.log('Statistics loaded:', data);
      setStats(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Не удалось загрузить статистику. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getCompetencyName = (id) => {
    const names = {
      'graphic_design': '🎨 Графический дизайн',
      'system_admin': '⚙️ Системное администрирование',
      'web_dev': '🌐 Веб-разработка',
      'mobile_dev': '📱 Мобильная разработка',
      'data_science': '📊 Data Science',
      'devops': '🔧 DevOps',
      'project_management': '📋 Управление проектами',
      'cybersecurity': '🛡️ Кибербезопасность',
      'cloud_computing': '☁️ Облачные технологии',
      'programming': '💻 Программирование'
    };
    return names[id] || id;
  };

  return (
    <div className="test-page">
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

      <nav className="main-nav">
        <div className="nav-brand clickable" onClick={onBack}>
          <span className="gradient-text">Poly</span>Skills
        </div>
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#start" onClick={(e) => { e.preventDefault(); onBack(); }}>Тестирование</a>
          <a href="#stats" onClick={() => setIsMenuOpen(false)}>Статистика</a>
          <a href="https://www.lerna.kz/">Курсы</a>
        </div>
      </nav>

      <div className="results-container" style={{ maxWidth: '1400px' }}>
        <div className="results-header">
          <div className="success-icon">📊</div>
          <h1>Статистика платформы</h1>
          <p>Общая аналитика тестирований и компетенций</p>
          <button 
            className="back-to-home" 
            onClick={onBack}
            style={{ marginTop: '1rem' }}
          >
            ← Вернуться на главную
          </button>
        </div>

        {loading && (
          <div className="question-card loading-container">
            <h2 className="question-text">Загрузка статистики...</h2>
            <p className="loading-text">
              🤖 Собираем данные о тестированиях из базы данных...
            </p>
          </div>
        )}

        {error && (
          <div className="question-card" style={{ textAlign: 'center' }}>
            <h2 className="question-text" style={{ color: '#ef4444' }}>⚠️ Ошибка</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
              {error}
            </p>
            <button 
              className="nav-btn primary" 
              onClick={loadStatistics}
              style={{ marginTop: '2rem' }}
            >
              🔄 Попробовать снова
            </button>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Общая статистика */}
            <div className="results-stats">
              <div className="result-card">
                <div className="result-icon">🎯</div>
                <h3>Всего тестирований</h3>
                <div className="result-value">
                  {stats.totalTests}
                </div>
                <p>Пройдено за всё время</p>
              </div>

              <div className="result-card">
                <div className="result-icon">⭐</div>
                <h3>Средний балл</h3>
                <div className="result-value">
                  {stats.averageScore}
                  <span style={{ fontSize: '1.5rem' }}>/100</span>
                </div>
                <div className="score-circle" style={{
                  background: `conic-gradient(#10b981 ${stats.averageScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                  marginTop: '1rem'
                }}>
                  <div className="score-circle-inner">
                    {stats.averageScore}%
                  </div>
                </div>
                <p style={{ marginTop: '1rem' }}>По всем компетенциям</p>
              </div>

              <div className="result-card">
                <div className="result-icon">🏆</div>
                <h3>Компетенций</h3>
                <div className="result-value">
                  {stats.popularCompetencies?.length || 0}
                </div>
                <p>Доступно для оценки</p>
              </div>
            </div>

            {/* Популярные компетенции */}
            {stats.popularCompetencies && stats.popularCompetencies.length > 0 ? (
              <div className="detailed-results-section">
                <h3 className="section-title">
                  🔥 Популярные компетенции
                </h3>
                <p style={{ 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '2rem'
                }}>
                  Наиболее часто тестируемые направления
                </p>

                <div className="competency-details-grid">
                  {stats.popularCompetencies.map((comp, index) => (
                    <div key={comp.competency} className="competency-detail-card">
                      <div className="competency-header">
                        <div className="competency-info">
                          <h4 className="competency-title">
                            {getCompetencyName(comp.competency)}
                          </h4>
                          <p className="competency-subtitle">
                            {comp.testCount} {comp.testCount === 1 ? 'тестирование' : comp.testCount < 5 ? 'тестирования' : 'тестирований'}
                          </p>
                        </div>
                        <div className="competency-metrics">
                          {index === 0 && (
                            <span className="level-badge expert">
                              👑 ТОП-1
                            </span>
                          )}
                          {index === 1 && (
                            <span className="level-badge advanced">
                              🥈 ТОП-2
                            </span>
                          )}
                          {index === 2 && (
                            <span className="level-badge intermediate">
                              🥉 ТОП-3
                            </span>
                          )}
                          <div className="score-display">
                            <div className={`score-number ${
                              comp.averageScore >= 80 ? 'high' :
                              comp.averageScore >= 60 ? 'medium' :
                              comp.averageScore >= 40 ? 'low' : 'very-low'
                            }`}>
                              {comp.averageScore}
                            </div>
                            <div className="score-label">
                              средний балл
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Популярность</span>
                          <span className={`progress-percentage ${
                            comp.popularity >= 80 ? 'high' :
                            comp.popularity >= 60 ? 'medium' :
                            comp.popularity >= 40 ? 'low' : 'very-low'
                          }`}>
                            {comp.popularity}%
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div className={`progress-bar-fill ${
                            comp.popularity >= 80 ? 'high' :
                            comp.popularity >= 60 ? 'medium' :
                            comp.popularity >= 40 ? 'low' : 'very-low'
                          }`} style={{ width: `${comp.popularity}%` }}></div>
                        </div>
                      </div>

                      <div className="stats-grid">
                        <div className="stat-item">
                          <span className="stat-icon">📝</span>
                          <div className="stat-content">
                            <span className="stat-label">Тестов</span>
                            <div className="stat-value">{comp.testCount}</div>
                          </div>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">📈</span>
                          <div className="stat-content">
                            <span className="stat-label">Средний балл</span>
                            <div className="stat-value">{comp.averageScore}</div>
                          </div>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">🎯</span>
                          <div className="stat-content">
                            <span className="stat-label">Популярность</span>
                            <div className="stat-value">{comp.popularity}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="question-card" style={{ textAlign: 'center' }}>
                <h2 className="question-text">📭 Нет данных</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
                  Пока нет тестирований в базе данных. Будьте первым!
                </p>
              </div>
            )}

            {/* Информация о системе */}
            <div className="detailed-results-section" style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <h3 className="section-title">
                 О платформе
              </h3>
              <div style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.8',
                fontSize: '1rem'
              }}>
                <p style={{ marginBottom: '1rem' }}>
                  <strong>PolySkills</strong> — революционная платформа адаптивного тестирования на базе ИИ.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  Система автоматически подбирает вопросы под ваш уровень, точно определяет компетенции и формирует персональный план развития.
                </p>
                <p>
                  Пройдите 25 умных вопросов и получите детальный анализ навыков с рекомендациями от экспертов.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="results-actions">
          <button className="primary-btn" onClick={onBack}>
            🏠 Вернуться на главную
          </button>
          <button className="secondary-btn" onClick={loadStatistics}>
            🔄 Обновить статистику
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;