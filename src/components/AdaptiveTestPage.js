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
  const [profileStep, setProfileStep] = useState(0);

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
      loadNextQuestion();
    }
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
              👋 Добро пожаловать!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Давайте познакомимся перед началом адаптивного тестирования
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
                Начать тестирование 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран 3: Результаты
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
            <div className="success-icon">✓</div>
            <h1>Тестирование завершено, {userName}!</h1>
            <p>Результаты адаптивного тестирования готовы</p>
          </div>

          <div className="results-stats">
            <div className="result-card">
              <div className="result-icon">🎯</div>
              <h3>Общий результат</h3>
              <div className="result-value">{testResults.overallScore}%</div>
              <p>{testResults.correctAnswers} из {testResults.totalQuestions} правильных</p>
            </div>
            <div className="result-card">
              <div className="result-icon">📊</div>
              <h3>Компетенций оценено</h3>
              <div className="result-value">
                {Object.keys(testResults.competencyResults).filter(
                  k => testResults.competencyResults[k].questionsAsked > 0
                ).length}
              </div>
              <p>Детальный анализ навыков</p>
            </div>
            <div className="result-card">
              <div className="result-icon">🚀</div>
              <h3>Роль</h3>
              <div className="result-value" style={{ fontSize: '1.8rem' }}>{userRole}</div>
              <p>Ваш текущий статус</p>
            </div>
          </div>

          <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.8rem', textAlign: 'center' }}>
              📈 Ваши компетенции
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {Object.entries(testResults.competencyResults)
                .filter(([_, data]) => data.questionsAsked > 0)
                .map(([competency, data]) => (
                  <div
                    key={competency}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h4 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>
                        {competency}
                      </h4>
                      <span style={{
                        background: data.level === 'Эксперт' ? '#10b981' :
                                   data.level === 'Продвинутый' ? '#3b82f6' :
                                   data.level === 'Средний' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {data.level}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '0.8rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span>Точность</span>
                        <span>{data.score}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        borderRadius: '50px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${data.score}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)',
                          borderRadius: '50px',
                          transition: 'width 1s ease'
                        }}></div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9rem'
                    }}>
                      <span>📝 Вопросов: {data.questionsAsked}</span>
                      <span>✅ Правильно: {data.correctAnswers}</span>
                      <span>⚡ Сложность: {
                        data.difficulty === 'expert' ? 'Эксперт' :
                        data.difficulty === 'intermediate' ? 'Средний' : 'Начальный'
                      }</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              💡 Персональные рекомендации для {userRole === 'Студент' ? 'студента' : userRole === 'Преподаватель' ? 'преподавателя' : 'специалиста'}
            </h3>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8' }}>
              {userRole === 'Студент' ? (
                <>
                  <p style={{ marginBottom: '1rem' }}>
                    На основе ваших результатов мы рекомендуем:
                  </p>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>Сфокусируйтесь на развитии компетенций с низким уровнем</li>
                    <li>Практикуйте полученные знания на реальных проектах</li>
                    <li>Присоединитесь к учебным группам и хакатонам</li>
                    <li>Регулярно проходите тестирование для отслеживания прогресса</li>
                  </ul>
                </>
              ) : userRole === 'Преподаватель' ? (
                <>
                  <p style={{ marginBottom: '1rem' }}>
                    Рекомендации для повышения эффективности преподавания:
                  </p>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>Используйте адаптивное тестирование для оценки студентов</li>
                    <li>Адаптируйте учебные материалы под выявленные слабые зоны</li>
                    <li>Внедряйте интерактивные методы обучения</li>
                    <li>Регулярно обновляйте свои знания в области технологий</li>
                  </ul>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '1rem' }}>
                    Рекомендации для профессионального развития:
                  </p>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>Углубите знания в областях с высокими результатами</li>
                    <li>Пройдите специализированные курсы по слабым компетенциям</li>
                    <li>Делитесь опытом с коллегами через менторство</li>
                    <li>Следите за трендами в вашей профессиональной области</li>
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="results-actions">
            <button className="primary-btn" onClick={() => {
              adaptiveTestingService.reset();
              setShowResults(false);
              setProfileStep(0);
              setUserName('');
              setUserRole('');
              setCurrentQuestion(null);
            }}>
              Пройти тест заново
            </button>
            <button className="secondary-btn" onClick={onBack}>
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Экран 4: Загрузка вопроса
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
            <h2 className="question-text">Загрузка следующего вопроса...</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem', marginTop: '2rem' }}>
              🤖 Система адаптирует сложность под ваш уровень
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Экран 5: Основное тестирование
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
              {currentQuestion.competency} • {
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