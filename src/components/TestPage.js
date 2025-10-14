import React, { useState, useEffect } from 'react';
import './TestPage.css';
import aiService from '../services/aiService';

function TestPage({ onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Загрузка вопросов при монтировании компонента
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const userProfile = {
        field: 'IT',
        level: 'средний'
      };
      
      const generatedQuestions = await aiService.generateQuestions(userProfile, 10);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Ошибка загрузки вопросов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    });
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await finishTest();
    }
  };

  const finishTest = async () => {
    setIsLoading(true);
    try {
      // Анализ ответов
      const analysisResult = await aiService.analyzeAnswers(answers, questions);
      setAnalysis(analysisResult);
      
      // Генерация рекомендаций
      const recs = await aiService.generateRecommendations(analysisResult);
      setRecommendations(recs);
      
      setShowResults(true);
    } catch (error) {
      console.error('Ошибка анализа:', error);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (isLoading && questions.length === 0) {
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
            <span className="gradient-text">Skills</span>Test
          </div>
        </nav>

        <div className="test-container">
          <div className="question-card" style={{ textAlign: 'center' }}>
            <h2 className="question-text">Генерируем персональные вопросы...</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem', marginTop: '2rem' }}>
              🤖 ИИ анализирует ваш профиль и подбирает оптимальные вопросы
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const displayAnalysis = analysis || {
      overallScore: 75,
      categoryScores: {},
      strengths: [],
      weaknesses: [],
      level: 'Средний'
    };

    const displayRecommendations = recommendations || {
      courses: [],
      skillsToImprove: []
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
          <div className="nav-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
            <span className="gradient-text">Skills</span>Test
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
            <h1>Тестирование завершено!</h1>
            <p>Ваш уровень: <strong>{displayAnalysis.level}</strong></p>
          </div>

          <div className="results-stats">
            <div className="result-card">
              <div className="result-icon">🎯</div>
              <h3>Общий балл</h3>
              <div className="result-value">{displayAnalysis.overallScore}%</div>
              <p>Оценка ваших навыков</p>
            </div>
            <div className="result-card">
              <div className="result-icon">📊</div>
              <h3>Проанализировано</h3>
              <div className="result-value">{questions.length}</div>
              <p>Компетенций оценено</p>
            </div>
            <div className="result-card">
              <div className="result-icon">🚀</div>
              <h3>Рекомендации</h3>
              <div className="result-value">{displayRecommendations.courses?.length || 0}</div>
              <p>Курсов подобрано для вас</p>
            </div>
          </div>

          {displayAnalysis.strengths?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>💪 Ваши сильные стороны</h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8' }}>
                {displayAnalysis.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {displayAnalysis.weaknesses?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>📈 Области для развития</h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8' }}>
                {displayAnalysis.weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {displayRecommendations.courses?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>📚 Рекомендованные курсы</h3>
              {displayRecommendations.courses.slice(0, 3).map((course, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{course.title}</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                    {course.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                    <span style={{ 
                      color: course.priority === 'high' ? '#ef4444' : 
                             course.priority === 'medium' ? '#f59e0b' : '#10b981'
                    }}>
                      ⭐ Приоритет: {course.priority === 'high' ? 'Высокий' : 
                                     course.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      ⏱️ {course.estimatedTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="results-actions">
            <button className="primary-btn">Получить полный отчет</button>
            <button className="secondary-btn" onClick={onBack}>
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

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
          <span className="gradient-text">Skills</span>Test
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
              Вопрос {currentQuestion + 1} из {questions.length}
            </span>
            <span className="category-badge">{currentQ.category}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="question-card">
          <h2 className="question-text">{currentQ.question}</h2>

          <div className="answer-section">
            {currentQ.type === 'rating' && (
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-btn ${currentAnswer === rating ? 'active' : ''}`}
                    onClick={() => handleAnswerChange(rating)}
                  >
                    <span className="rating-number">{rating}</span>
                    <span className="rating-label">
                      {rating === 1 && 'Начинающий'}
                      {rating === 2 && 'Базовый'}
                      {rating === 3 && 'Средний'}
                      {rating === 4 && 'Продвинутый'}
                      {rating === 5 && 'Эксперт'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'multiple' && currentQ.options && (
              <div className="multiple-container">
                {currentQ.options.map((option) => (
                  <button
                    key={option}
                    className={`option-btn ${
                      currentAnswer?.includes(option) ? 'active' : ''
                    }`}
                    onClick={() => {
                      const current = currentAnswer || [];
                      if (current.includes(option)) {
                        handleAnswerChange(current.filter((a) => a !== option));
                      } else {
                        handleAnswerChange([...current, option]);
                      }
                    }}
                  >
                    <span className="option-check">✓</span>
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'text' && (
              <div className="text-container">
                <textarea
                  className="text-input"
                  placeholder="Введите ваш ответ здесь..."
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  rows={6}
                />
                <div className="text-hint">
                  Минимум 50 символов для качественного анализа
                </div>
              </div>
            )}
          </div>

          <div className="navigation-buttons">
            <button
              className="nav-btn secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              ← Назад
            </button>
            <button
              className="nav-btn primary"
              onClick={handleNext}
              disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
            >
              {isLoading ? '⏳ Обработка...' : 
               currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее →'}
            </button>
          </div>
        </div>

        <div className="test-footer">
          <p className="footer-text">
            💡 Совет: Отвечайте честно для получения наиболее точных рекомендаций от ИИ
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestPage;