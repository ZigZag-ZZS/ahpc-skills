// src/components/AdaptiveTestPage.js
import React, { useState, useEffect } from 'react';
import './TestPage.css';
import adaptiveTestingService from '../services/adaptiveTestingService';
import apiService from '../services/apiService';
import courseRecommendationService from '../services/courseRecommendationService';

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
  const [courseRecommendations, setCourseRecommendations] = useState([]);

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
  
  // Получаем рекомендации курсов
  const recommendations = courseRecommendationService.getRecommendations(
    results,
    userRole,
    6
  );
  setCourseRecommendations(recommendations);
  
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
    console.log('Результаты успешно сохранены');
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
          <div className="nav-brand clickable" onClick={onBack}>
            <span className="gradient-text">Poly</span>Skills
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card welcome-card">
            <h2 className="question-text welcome-title">
              👋 Добро пожаловать в адаптивное тестирование!
            </h2>
            <p className="welcome-subtitle">
              Система оценит ваши навыки по 100-балльной шкале и подберет вопросы на основе ваших знаний
            </p>
            
            <div className="input-group">
              <label className="input-label">
                Как вас зовут?
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="Введите ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userName.trim() && startTest()}
              />
              <div className="text-hint">
                💡 Это поможет персонализировать ваши результаты
              </div>
            </div>

            <button
              className="nav-btn primary full-width-btn"
              onClick={startTest}
              disabled={!userName.trim()}
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
          <div className="nav-brand clickable" onClick={onBack}>
            <span className="gradient-text">Poly</span>Skills
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card welcome-card">
            <h2 className="question-text welcome-title">
              Приятно познакомиться, {userName}! 👋
            </h2>
            <p className="welcome-subtitle">
              Выберите вашу роль для персонализации тестирования
            </p>

            <div className="role-grid">
              <button
                className={`option-btn role-option ${userRole === 'Студент' ? 'active' : ''}`}
                onClick={() => setUserRole('Студент')}
              >
                <span className="option-check">✓</span>
                <div>
                  <div className="role-title">
                    🎓 Студент
                  </div>
                  <div className="role-description">
                    Я учусь и хочу оценить свои навыки
                  </div>
                </div>
              </button>

              <button
                className={`option-btn role-option ${userRole === 'Преподаватель' ? 'active' : ''}`}
                onClick={() => setUserRole('Преподаватель')}
              >
                <span className="option-check">✓</span>
                <div>
                  <div className="role-title">
                    👨‍🏫 Преподаватель
                  </div>
                  <div className="role-description">
                    Я преподаю и хочу оценить свои знания
                  </div>
                </div>
              </button>
            </div>

            <div className="button-row">
              <button
                className="nav-btn secondary flex-1"
                onClick={() => setProfileStep(0)}
              >
                ← Назад
              </button>
              <button
                className="nav-btn primary flex-2"
                onClick={startTest}
                disabled={!userRole}
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
          <div className="nav-brand clickable" onClick={onBack}>
            <span className="gradient-text">Poly</span>Skills
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card competency-card">
            <h2 className="question-text">
              🎯 Выберите области для тестирования
            </h2>
            <p className="welcome-subtitle">
              Система адаптирует вопросы на основе выбранных компетенций. Выберите 2-5 направлений.
            </p>

            <div className="competency-grid">
              {availableCompetencies.map(comp => (
                <button
                  key={comp.id}
                  className={`option-btn competency-option ${selectedCompetencies.includes(comp.id) ? 'active' : ''}`}
                  onClick={() => toggleCompetency(comp.id)}
                >
                  <span className="option-check">✓</span>
                  <div>
                    <div className="competency-name">
                      {comp.name}
                    </div>
                    <div className="competency-description">
                      {comp.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="info-box">
              <div className="info-title">
                <strong>ℹ️ Система адаптивного тестирования:</strong>
              </div>
              <ul className="info-list">
                <li>Начинает со среднего уровня сложности</li>
                <li>Адаптирует вопросы на основе ваших ответов</li>
                <li>Оценивает каждую компетенцию по 100-балльной шкале</li>
                <li>Определяет ваш уровень от Новичка до Эксперта</li>
              </ul>
            </div>

            <div className="button-row">
              <button
                className="nav-btn secondary flex-1"
                onClick={() => setProfileStep(1)}
              >
                ← Назад
              </button>
              <button
                className="nav-btn primary flex-2"
                onClick={startTest}
                disabled={selectedCompetencies.length === 0}
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
          <div className="nav-brand clickable" onClick={onBack}>
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
            <div className="user-role-badge">
              {userRole === 'Студент' ? '🎒 Студент' : '👨‍🏫 Преподаватель'} • {selectedCompetencies.length} компетенций
            </div>
          </div>

          <div className="results-stats">
            <div className="result-card">
              <div className="result-icon">📊</div>
              <h3>Общий балл</h3>
              <div className="result-value">
                {testResults.overallScore}
                <span>/100</span>
              </div>
              <div className="score-circle" style={{
                background: `conic-gradient(#10b981 ${testResults.overallScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
              }}>
                <div className="score-circle-inner">
                  {Math.round(testResults.overallScore)}%
                </div>
              </div>
              <p>Средняя оценка по всем направлениям</p>
            </div>

            <div className="result-card">
              <div className="result-icon">✅</div>
              <h3>Точность ответов</h3>
              <div className="result-value">
                {Math.round((testResults.correctAnswers / testResults.totalQuestions) * 100)}%
              </div>
              <div className="result-stat-flex">
                <span className="result-stat-number">
                  {testResults.correctAnswers}
                </span>
                <span className="result-stat-separator">из</span>
                <span className="result-stat-number">
                  {testResults.totalQuestions}
                </span>
              </div>
              <p>Правильных ответов</p>
            </div>

            <div className="result-card">
              <div className="result-icon">🎯</div>
              <h3>Оценено навыков</h3>
              <div className="result-value">
                {Object.keys(testResults.competencyResults).length}
              </div>
              <div className="competency-tags">
                {selectedCompetencies.slice(0, 4).map(compId => {
                  const comp = availableCompetencies.find(c => c.id === compId);
                  return comp ? (
                    <span key={compId} className="competency-tag">
                      {comp.name.split(' ')[0]}
                    </span>
                  ) : null;
                })}
                {selectedCompetencies.length > 4 && (
                  <span className="competency-tag-more">
                    +{selectedCompetencies.length - 4}
                  </span>
                )}
              </div>
              <p>Областей знаний протестировано</p>
            </div>
          </div>

          <div className="detailed-results-section">
            <h3 className="section-title">
              Детальная оценка компетенций
            </h3>
            <div className="competency-details-grid">
              {Object.entries(testResults.competencyResults)
                .sort(([,a], [,b]) => b.score - a.score)
                .map(([competency, data], index) => (
                  <div key={competency} className="competency-detail-card">

                    
                    <div className="competency-header">
                      <div className="competency-info">
                        <h4 className="competency-title">
                          {availableCompetencies.find(c => c.id === competency)?.name || competency}
                        </h4>
                        <p className="competency-subtitle">
                          {availableCompetencies.find(c => c.id === competency)?.description}
                        </p>
                      </div>
                      <div className="competency-metrics">
                        <span className={`level-badge ${
                          data.level === 'Эксперт' ? 'expert' :
                          data.level === 'Продвинутый' ? 'advanced' :
                          data.level === 'Средний' ? 'intermediate' : 'beginner'
                        }`}>
                          {data.level}
                        </span>
                        <div className="score-display">
                          <div className={`score-number ${
                            data.score >= 80 ? 'high' :
                            data.score >= 60 ? 'medium' :
                            data.score >= 40 ? 'low' : 'very-low'
                          }`}>
                            {data.score}
                          </div>
                          <div className="score-label">
                            из 100
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Прогресс освоения</span>
                        <span className={`progress-percentage ${
                          data.score >= 80 ? 'high' :
                          data.score >= 60 ? 'medium' :
                          data.score >= 40 ? 'low' : 'very-low'
                        }`}>
                          {data.score}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className={`progress-bar-fill ${
                          data.score >= 80 ? 'high' :
                          data.score >= 60 ? 'medium' :
                          data.score >= 40 ? 'low' : 'very-low'
                        }`} style={{ width: `${data.score}%` }}></div>
                      </div>
                    </div>

                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-icon">📝</span>
                        <div className="stat-content">
                          <span className="stat-label">Вопросов</span>
                          <div className="stat-value">{data.questionsAsked}</div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">✅</span>
                        <div className="stat-content">
                          <span className="stat-label">Правильно</span>
                          <div className="stat-value">{data.correctAnswers}</div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">⚡</span>
                        <div className="stat-content">
                          <span className="stat-label">Сложность</span>
                          <div className="stat-value">
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



<div className="courses-recommendations-section">
  <h3 className="section-title">
     Рекомендуемые курсы для развития
  </h3>
  <p className="courses-intro">
    На основе ваших результатов мы подобрали курсы, которые помогут улучшить навыки в приоритетных областях
  </p>

  {courseRecommendations.length > 0 ? (
    <div className="courses-grid">
      {courseRecommendations.map((recommendation, index) => (
        <div key={recommendation.competency} className="course-recommendation-block">
          <div className="course-block-header">
            <div className="course-competency-info">
              <h4 className="course-competency-name">
                {availableCompetencies.find(c => c.id === recommendation.competency)?.name}
              </h4>
              <div className="course-score-indicator">
                <span className="score-label">Ваш уровень:</span>
                <span className={`score-badge ${
                  recommendation.score >= 70 ? 'high' :
                  recommendation.score >= 40 ? 'medium' : 'low'
                }`}>
                  {recommendation.score}/100
                </span>
              </div>
            </div>
            <span className={`priority-indicator ${
              index === 0 ? 'high' : index === 1 ? 'medium' : 'normal'
            }`}>
              {index === 0 ? '🔥 Приоритет' : index === 1 ? '⭐ Важно' : '💡 Рекомендуем'}
            </span>
          </div>

          {recommendation.courses.length > 0 ? (
            <div className="courses-list">
              {recommendation.courses.slice(0, 2).map((course, courseIndex) => (
                <div key={courseIndex} className="course-card-compact">
                  <div className="course-card-content">
                    <h5 className="course-title">{course.title}</h5>
                    <p className="course-description">
                      {course.description?.substring(0, 120)}...
                    </p>
                    <div className="course-reason">
                      <span className="reason-icon">💡</span>
                      <span className="reason-text">{course.recommendationReason}</span>
                    </div>
                  </div>
                  <a 
                    href={course.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="course-link-btn"
                  >
                    Перейти к курсу →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-courses-message">
              <p>К сожалению, курсы по этой компетенции пока не найдены</p>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="no-recommendations">
      <p>Рекомендации курсов временно недоступны</p>
    </div>
  )}
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
          <div className="nav-brand clickable" onClick={onBack}>
            <span className="gradient-text">Poly</span>Skills
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card loading-container">
            <h2 className="question-text">Подбираем вопросы...</h2>
            <p className="loading-text">
              🤖 Система адаптирует сложность под ваш уровень в {selectedCompetencies.length} областях
            </p>
            <div className="competency-badges-container">
              <div className="competency-badges">
                {selectedCompetencies.map(compId => {
                  const comp = availableCompetencies.find(c => c.id === compId);
                  return comp ? (
                    <span key={compId} className="competency-badge">
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
        <div className="nav-brand clickable" onClick={onBack}>
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
            <div className={`feedback-box ${feedbackData.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="feedback-message">
                {feedbackData.feedback}
              </div>
              {!feedbackData.isCorrect && feedbackData.correctAnswer && (
                <div className="feedback-answer">
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
            <div className="transition-message">
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