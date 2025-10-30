// src/components/AdaptiveTestPage.js
import React, { useState, useEffect } from 'react';
import './TestPage.css';
import adaptiveTestingService from '../services/adaptiveTestingService';
import apiService from '../services/apiService';

function AdaptiveTestPage({ onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [testId, setTestId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [profileStep, setProfileStep] = useState(0);

  // Список доступных компетенций
  const availableCompetencies = [
    { id: 'graphic_design', name: '🎨 Графический дизайн', description: 'Работа с визуальным контентом, UI/UX дизайн' },
    { id: 'system_admin', name: '⚙️ Системное администрирование', description: 'Настройка серверов, сети, безопасность' },
    { id: 'web_dev', name: '🌐 Веб-разработка', description: 'Frontend и Backend разработка' },
    { id: 'mobile_dev', name: '📱 Мобильная разработка', description: 'iOS, Android, кроссплатформенные приложения' },
    { id: 'data_science', name: '📊 Data Science', description: 'Анализ данных, ML, визуализация' },
    { id: 'devops', name: '🔧 DevOps', description: 'CI/CD, контейнеризация, автоматизация' },
    { id: 'project_management', name: '📋 Управление проектами', description: 'Agile, Scrum, планирование' },
    { id: 'cybersecurity', name: '🛡️ Кибербезопасность', description: 'Защита данных, пентестинг' },
    { id: 'cloud_computing', name: '☁️ Облачные технологии', description: 'AWS, Azure, Google Cloud' },
    { id: 'programming', name: '💻 Программирование', description: 'Алгоритмы, структуры данных' }
  ];

  useEffect(() => {
    const newTestId = apiService.generateTestId();
    setTestId(newTestId);
    adaptiveTestingService.reset();
  }, []);

  const startTest = () => {
    if (profileStep === 0 && userName.trim()) {
      setProfileStep(1);
    } else if (profileStep === 1 && userRole) {
      setProfileStep(2);
    } else if (profileStep === 2 && selectedCompetencies.length > 0) {
      setProfileStep(3);
      adaptiveTestingService.setSelectedCompetencies(selectedCompetencies);
      loadNextQuestion();
    }
  };

  const toggleCompetency = (competencyId) => {
    setSelectedCompetencies(prev => 
      prev.includes(competencyId) 
        ? prev.filter(id => id !== competencyId)
        : [...prev, competencyId]
    );
  };

  const loadNextQuestion = () => {
    const nextQuestion = adaptiveTestingService.getNextQuestion();
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setUserAnswer(null);
      setShowFeedback(false);
    } else {
      finishTest();
    }
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer) return;

    const result = adaptiveTestingService.processAnswer(
      currentQuestion.id,
      userAnswer
    );

    setFeedbackData(result);
    setShowFeedback(true);

    setTimeout(() => {
      loadNextQuestion();
    }, 2000);
  };

  const finishTest = async () => {
    const results = adaptiveTestingService.getFinalResults();
    setTestResults(results);
    
    try {
      await apiService.saveTestResults({
        full_name: userName,
        user_type: userRole,
        test_id: testId,
        selected_competencies: selectedCompetencies,
        test_score: {
          overallScore: results.overallScore,
          totalQuestions: results.totalQuestions,
          correctAnswers: results.correctAnswers,
          competencyResults: results.competencyResults,
          testType: 'adaptive',
          completedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
    
    setShowResults(true);
  };

  const handleSkip = () => {
    adaptiveTestingService.processAnswer(currentQuestion.id, '');
    loadNextQuestion();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const progress = adaptiveTestingService.getProgress();

  // Экран 1: Ввод имени
  if (profileStep === 0) {
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
          <div className="nav-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
            <span className="gradient-text">Poly</span>Skills
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="question-text" style={{ marginBottom: '1rem' }}>
              👋 Добро пожаловать в адаптивное тестирование!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Система оценит ваши навыки по 100-балльной шкале и подберет вопросы на основе ваших знаний
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                color: 'white', 
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                Как вас зовут?
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="Введите ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '1rem 1.5rem',
                  fontSize: '1.1rem',
                  marginBottom: '0.5rem'
                }}
                onKeyPress={(e) => e.key === 'Enter' && userName.trim() && startTest()}
              />
              <div className="text-hint">
                💡 Это поможет персонализировать ваши результаты
              </div>
            </div>

            <button
              className="nav-btn primary"
              onClick={startTest}
              disabled={!userName.trim()}
              style={{ width: '100%' }}
            >
              Продолжить →
            </button>
          </div>
        </div>
      </div>
    );
  }

// Экран 2: Выбор роли
if (profileStep === 1) {
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
        <div className="nav-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
          <span className="gradient-text">Poly</span>Skills
        </div>
      </nav>

      <div className="test-container">
        <div className="question-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="question-text" style={{ marginBottom: '1rem' }}>
            Приятно познакомиться, {userName}! 👋
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Выберите вашу роль для персонализации тестирования
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            <button
              className={`option-btn ${userRole === 'Студент' ? 'active' : ''}`}
              onClick={() => setUserRole('Студент')}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <span className="option-check">✓</span>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                  🎓 Студент
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Я учусь и хочу оценить свои навыки
                </div>
              </div>
            </button>

            <button
              className={`option-btn ${userRole === 'Преподаватель' ? 'active' : ''}`}
              onClick={() => setUserRole('Преподаватель')}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <span className="option-check">✓</span>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                  👨‍🏫 Преподаватель
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Я преподаю и хочу оценить свои знания
                </div>
              </div>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="nav-btn secondary"
              onClick={() => setProfileStep(0)}
              style={{ flex: 1 }}
            >
              ← Назад
            </button>
            <button
              className="nav-btn primary"
              onClick={startTest}
              disabled={!userRole}
              style={{ flex: 2 }}
            >
              Далее →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

  // Экран 3: Выбор компетенций
  if (profileStep === 2) {
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
          <div className="nav-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
            <span className="gradient-text">Poly</span>Skills
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="question-text" style={{ marginBottom: '1rem' }}>
              🎯 Выберите области для тестирования
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Система адаптирует вопросы на основе выбранных компетенций. Выберите 2-5 направлений.
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {availableCompetencies.map(comp => (
                <button
                  key={comp.id}
                  className={`option-btn ${selectedCompetencies.includes(comp.id) ? 'active' : ''}`}
                  onClick={() => toggleCompetency(comp.id)}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left',
                    height: 'auto',
                    padding: '1.5rem'
                  }}
                >
                  <span className="option-check">✓</span>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.4' }}>
                      {comp.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ color: 'white', fontSize: '0.9rem' }}>
                <strong>ℹ️ Система адаптивного тестирования:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                  <li>Начинает со среднего уровня сложности</li>
                  <li>Адаптирует вопросы на основе ваших ответов</li>
                  <li>Оценивает каждую компетенцию по 100-балльной шкале</li>
                  <li>Определяет ваш уровень от Новичка до Эксперта</li>
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="nav-btn secondary"
                onClick={() => setProfileStep(1)}
                style={{ flex: 1 }}
              >
                ← Назад
              </button>
              <button
                className="nav-btn primary"
                onClick={startTest}
                disabled={selectedCompetencies.length === 0}
                style={{ flex: 2 }}
              >
                Начать тестирование 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

// Экран 4: Результаты
if (showResults && testResults) {
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
        <div className="nav-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
          <span className="gradient-text">Poly</span>Skills
        </div>
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#stats" onClick={() => setIsMenuOpen(false)}>Статистика</a>
          <a href="#courses" onClick={() => setIsMenuOpen(false)}>Курсы</a>
          <a href="#login" className="login-btn" onClick={() => setIsMenuOpen(false)}>Войти</a>
        </div>
      </nav>

      <div className="results-container">
        <div className="results-header">
          <div className="success-icon">🎓</div>
          <h1>Поздравляем, {userName}!</h1>
          <p>Адаптивное тестирование завершено. Ваши результаты готовы</p>
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem 1.5rem',
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '50px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            fontSize: '0.9rem',
            color: 'white'
          }}>
            {userRole === 'Студент' ? '🎒 Студент' : '👨‍🏫 Преподаватель'} • {selectedCompetencies.length} компетенций
          </div>
        </div>

        <div className="results-stats">
          <div className="result-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="result-icon">📊</div>
            <h3>Общий балл</h3>
            <div className="result-value" style={{ fontSize: '3rem', margin: '1rem 0' }}>
              {testResults.overallScore}
              <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>/100</span>
            </div>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              borderRadius: '50%',
              background: `conic-gradient(#10b981 ${testResults.overallScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(16, 185, 129, 0.9)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {Math.round(testResults.overallScore)}%
              </div>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Средняя оценка по всем направлениям
            </p>
          </div>

          <div className="result-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <div className="result-icon">✅</div>
            <h3>Точность ответов</h3>
            <div className="result-value" style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
              {Math.round((testResults.correctAnswers / testResults.totalQuestions) * 100)}%
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '1rem 0',
              padding: '0 1rem'
            }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {testResults.correctAnswers}
              </span>
              <span style={{ opacity: 0.7 }}>из</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {testResults.totalQuestions}
              </span>
            </div>
            <p>Правильных ответов</p>
          </div>

          <div className="result-card" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <div className="result-icon">🎯</div>
            <h3>Оценено навыков</h3>
            <div className="result-value" style={{ fontSize: '3rem', margin: '1rem 0' }}>
              {Object.keys(testResults.competencyResults).length}
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.3rem',
              justifyContent: 'center',
              margin: '1rem 0'
            }}>
              {selectedCompetencies.slice(0, 4).map(compId => {
                const comp = availableCompetencies.find(c => c.id === compId);
                return comp ? (
                  <span key={compId} style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {comp.name.split(' ')[0]}
                  </span>
                ) : null;
              })}
              {selectedCompetencies.length > 4 && (
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem'
                }}>
                  +{selectedCompetencies.length - 4}
                </span>
              )}
            </div>
            <p>Областей знаний протестировано</p>
          </div>
        </div>

        <div className="result-card" style={{ 
          marginBottom: '2rem', 
          textAlign: 'left',
          background: 'rgba(17, 25, 40, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '2rem', 
            fontSize: '1.8rem', 
            textAlign: 'center',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            📊 Детальная оценка компетенций
          </h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {Object.entries(testResults.competencyResults)
              .sort(([,a], [,b]) => b.score - a.score)
              .map(([competency, data], index) => (
                <div
                  key={competency}
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {index < 3 && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: index === 0 ? '#f59e0b' : index === 1 ? '#6b7280' : '#10b981',
                      color: 'white',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {index === 0 ? '🥇 Лучший' : index === 1 ? '🥈 Второй' : '🥉 Третий'}
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: 'white', 
                        fontSize: '1.3rem', 
                        margin: '0 0 0.5rem 0',
                        fontWeight: '600'
                      }}>
                        {availableCompetencies.find(c => c.id === competency)?.name || competency}
                      </h4>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        fontSize: '0.9rem',
                        margin: 0
                      }}>
                        {availableCompetencies.find(c => c.id === competency)?.description}
                      </p>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      flexShrink: 0
                    }}>
                      <span style={{
                        background: data.level === 'Эксперт' ? 'linear-gradient(135deg, #10b981, #34d399)' :
                                   data.level === 'Продвинутый' ? 'linear-gradient(135deg, #3b82f6, #0ea5e9)' :
                                   data.level === 'Средний' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                        color: 'white',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '25px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        minWidth: '120px',
                        textAlign: 'center'
                      }}>
                        {data.level}
                      </span>
                      <div style={{
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          background: data.score >= 80 ? 'linear-gradient(135deg, #10b981, #34d399)' :
                                     data.score >= 60 ? 'linear-gradient(135deg, #3b82f6, #0ea5e9)' :
                                     data.score >= 40 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #ef4444, #f87171)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          lineHeight: 1
                        }}>
                          {data.score}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginTop: '0.2rem'
                        }}>
                          из 100
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      marginBottom: '0.8rem'
                    }}>
                      <span>Прогресс освоения</span>
                      <span style={{ 
                        fontWeight: '600',
                        color: data.score >= 80 ? '#10b981' : 
                               data.score >= 60 ? '#3b82f6' :
                               data.score >= 40 ? '#f59e0b' : '#ef4444'
                      }}>
                        {data.score}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{
                        width: `${data.score}%`,
                        height: '100%',
                        background: data.score >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' :
                                   data.score >= 60 ? 'linear-gradient(90deg, #3b82f6, #0ea5e9)' :
                                   data.score >= 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)',
                        borderRadius: '10px',
                        transition: 'width 1.5s ease-in-out',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}></div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.6rem',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>📝</span>
                      <div>
                        <div style={{ fontWeight: '600' }}>Вопросов</div>
                        <div>{data.questionsAsked}</div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.6rem',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>✅</span>
                      <div>
                        <div style={{ fontWeight: '600' }}>Правильно</div>
                        <div>{data.correctAnswers}</div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.6rem',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>⚡</span>
                      <div>
                        <div style={{ fontWeight: '600' }}>Сложность</div>
                        <div>
                          {data.finalDifficulty === 'expert' ? 'Эксперт' :
                           data.finalDifficulty === 'intermediate' ? 'Средний' : 'Начальный'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="result-card" style={{ 
          marginBottom: '2rem', 
          textAlign: 'left',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '1.5rem', 
            fontSize: '1.6rem',
            textAlign: 'center'
          }}>
            💡 {userRole === 'Студент' ? 'Рекомендации для обучения' : 'Рекомендации для преподавания'}
          </h3>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.7' }}>
            {testResults.overallScore >= 80 ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Отличные результаты!
                </p>
                <p>
                  {userRole === 'Студент' 
                    ? 'Вы демонстрируете экспертный уровень знаний. Рекомендуем участвовать в продвинутых проектах и делиться опытом с другими студентами.'
                    : 'Ваши знания на высоком уровне. Используйте этот потенциал для разработки углубленных учебных программ и менторства.'
                  }
                </p>
              </div>
            ) : testResults.overallScore >= 60 ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Хорошие результаты!
                </p>
                <p>
                  {userRole === 'Студент'
                    ? 'У вас прочная база знаний. Сфокусируйтесь на практическом применении навыков в реальных проектах.'
                    : 'Вы обладаете solid знаниями. Рекомендуем внедрять практические кейсы в учебный процесс.'
                  }
                </p>
              </div>
            ) : testResults.overallScore >= 40 ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Стабильный прогресс
                </p>
                <p>
                  {userRole === 'Студент'
                    ? 'Продолжайте систематическое обучение. Рекомендуем больше практиковаться и участвовать в учебных проектах.'
                    : 'Рекомендуем обновить учебные материалы и включить больше практических заданий.'
                  }
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Начальный уровень
                </p>
                <p>
                  {userRole === 'Студент'
                    ? 'Рекомендуем начать с базовых курсов и постепенно наращивать сложность. Не бойтесь challenging задач!'
                    : 'Рекомендуем пройти дополнительные курсы по предмету и обновить методические материалы.'
                  }
                </p>
              </div>
            )}
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              padding: '1.5rem', 
              borderRadius: '12px',
              marginTop: '1.5rem'
            }}>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>
                🎯 Приоритетные направления для развития:
              </h4>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {Object.entries(testResults.competencyResults)
                  .filter(([, data]) => data.score < 70)
                  .sort(([,a], [,b]) => a.score - b.score)
                  .slice(0, 3)
                  .map(([comp, data]) => (
                    <div key={comp} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.8rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'white', fontSize: '0.9rem' }}>
                          {availableCompetencies.find(c => c.id === comp)?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          {data.recommendation}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.3)',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {data.score}/100
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="primary-btn" onClick={() => {
            adaptiveTestingService.reset();
            setShowResults(false);
            setProfileStep(0);
            setUserName('');
            setUserRole('');
            setSelectedCompetencies([]);
            setCurrentQuestion(null);
          }}>
            🔄 Пройти тест заново
          </button>
          <button className="secondary-btn" onClick={onBack}>
            🏠 Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}

  // Экран 5: Загрузка вопроса
  if (!currentQuestion) {
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
          <div className="nav-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
            <span className="gradient-text">Poly</span>Skills
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card" style={{ textAlign: 'center' }}>
            <h2 className="question-text">Подбираем вопросы...</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem', marginTop: '2rem' }}>
              🤖 Система адаптирует сложность под ваш уровень в {selectedCompetencies.length} областях
            </p>
            <div style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                justifyContent: 'center' 
              }}>
                {selectedCompetencies.map(compId => {
                  const comp = availableCompetencies.find(c => c.id === compId);
                  return comp ? (
                    <span key={compId} style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}>
                      {comp.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран 6: Основное тестирование
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
        <div className="nav-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
          <span className="gradient-text">Poly</span>Skills
        </div>
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#stats" onClick={() => setIsMenuOpen(false)}>Статистика</a>
          <a href="#courses" onClick={() => setIsMenuOpen(false)}>Курсы</a>
          <a href="#login" className="login-btn" onClick={() => setIsMenuOpen(false)}>Войти</a>
        </div>
      </nav>

      <div className="test-container">
        <div className="test-header">
          <button className="back-to-home" onClick={onBack}>
            ← Вернуться на главную
          </button>
          <div className="progress-info">
            <span className="question-counter">
              Вопрос {progress.current} из {progress.total}
            </span>
            <span className="category-badge">
              {availableCompetencies.find(c => c.id === currentQuestion.competency)?.name} • {
                currentQuestion.difficulty === 'expert' ? '🔥 Эксперт' :
                currentQuestion.difficulty === 'intermediate' ? '⚡ Средний' : '🌱 Начальный'
              }
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.percentage}%` }}></div>
          </div>
        </div>

        <div className="question-card">
          <h2 className="question-text">{currentQuestion.question}</h2>

          {showFeedback && feedbackData && (
            <div style={{
              background: feedbackData.isCorrect 
                ? 'rgba(16, 185, 129, 0.2)' 
                : 'rgba(239, 68, 68, 0.2)',
              border: `2px solid ${feedbackData.isCorrect ? '#10b981' : '#ef4444'}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              animation: 'cardAppear 0.3s ease-out'
            }}>
              <div style={{ 
                color: 'white', 
                fontSize: '1.2rem', 
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                {feedbackData.feedback}
              </div>
              {!feedbackData.isCorrect && feedbackData.correctAnswer && (
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
                  Правильный ответ: {feedbackData.correctAnswer}
                </div>
              )}
            </div>
          )}

          <div className="answer-section">
            {currentQuestion.type === 'rating' && (
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-btn ${userAnswer === rating ? 'active' : ''}`}
                    onClick={() => setUserAnswer(rating)}
                    disabled={showFeedback}
                  >
                    <span className="rating-number">{rating}</span>
                    <span className="rating-label">
                      {rating === 1 && 'Новичок'}
                      {rating === 2 && 'Базовый'}
                      {rating === 3 && 'Средний'}
                      {rating === 4 && 'Хороший'}
                      {rating === 5 && 'Отличный'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multiple' && currentQuestion.options && (
              <div className="multiple-container">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    className={`option-btn ${userAnswer === option ? 'active' : ''}`}
                    onClick={() => setUserAnswer(option)}
                    disabled={showFeedback}
                  >
                    <span className="option-check">✓</span>
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <div className="text-container">
                <textarea
                  className="text-input"
                  placeholder="Введите ваш развернутый ответ..."
                  value={userAnswer || ''}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={6}
                  disabled={showFeedback}
                />
                {currentQuestion.hint && (
                  <div className="text-hint">
                    💡 Подсказка: {currentQuestion.hint}
                  </div>
                )}
                <div className="text-hint">
                  Минимум 30 символов для засчитывания ответа
                </div>
              </div>
            )}
          </div>

          {!showFeedback && (
            <div className="navigation-buttons">
              <button
                className="nav-btn secondary"
                onClick={handleSkip}
              >
                Пропустить
              </button>
              <button
                className="nav-btn primary"
                onClick={handleAnswerSubmit}
                disabled={!userAnswer || (
                  currentQuestion.type === 'text' && 
                  userAnswer && 
                  userAnswer.trim().length < 30
                )}
              >
                Ответить →
              </button>
            </div>
          )}

          {showFeedback && (
            <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              Переход к следующему вопросу...
            </div>
          )}
        </div>

        <div className="test-footer">
          <p className="footer-text">
            🧠 Система адаптирует сложность вопросов на основе ваших ответов
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdaptiveTestPage;