import React, { useState, useEffect } from 'react';
import './TestPage.css';
import aiService from '../services/aiService';
import apiService from '../services/apiService';

function TestPage({ onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [testId, setTestId] = useState(null);
  const [savedToDb, setSavedToDb] = useState(false);

  const TOTAL_QUESTIONS = 12; // Общее количество вопросов

  // Генерация первого вопроса при монтировании
  useEffect(() => {
    const newTestId = apiService.generateTestId();
    setTestId(newTestId);
    loadFirstQuestion();
  }, []);

  /**
   * Загрузка первого вопроса
   */
  const loadFirstQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const firstQuestion = await aiService.generateNextQuestion([], 0);
      setQuestions([firstQuestion]);
    } catch (error) {
      console.error('Ошибка загрузки первого вопроса:', error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  /**
   * Генерация следующего вопроса на основе предыдущих ответов
   */
  const generateNextQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      // Подготовка контекста предыдущих ответов
      const previousAnswers = questions.map((q) => ({
        question: q.question,
        answer: answers[q.id],
        category: q.category,
        type: q.type
      }));

      const nextQuestion = await aiService.generateNextQuestion(
        previousAnswers,
        questions.length
      );

      setQuestions([...questions, nextQuestion]);
    } catch (error) {
      console.error('Ошибка генерации следующего вопроса:', error);
    } finally {
      setIsGeneratingQuestion(false);
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
      // Переход к следующему уже загруженному вопросу
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentQuestion < TOTAL_QUESTIONS - 1) {
      // Генерация нового вопроса
      await generateNextQuestion();
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Завершение теста
      await finishTest();
    }
  };

  const finishTest = async () => {
    setIsLoading(true);
    try {
      // Анализ всех ответов
      const analysisResult = await aiService.analyzeAnswers(answers, questions);
      setAnalysis(analysisResult);
      
      // Генерация персональных рекомендаций
      const recs = await aiService.generateRecommendations(analysisResult);
      setRecommendations(recs);
      
      // Сохранение в БД
      await saveResultsToDatabase(analysisResult, recs);
      
      setShowResults(true);
    } catch (error) {
      console.error('Ошибка анализа:', error);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveResultsToDatabase = async (analysisResult, recs) => {
    try {
      const testData = {
        full_name: analysisResult.userName || 'Неизвестный пользователь',
        user_type: analysisResult.userRole || 'Специалист',
        test_id: testId,
        test_score: {
          overallScore: analysisResult.overallScore,
          level: analysisResult.level,
          categoryScores: analysisResult.categoryScores,
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
          hiddenTalents: analysisResult.hiddenTalents,
          personalityTraits: analysisResult.personalityTraits,
          detailedFeedback: analysisResult.detailedFeedback,
          recommendations: {
            courses: recs.courses?.slice(0, 3),
            skillsToImprove: recs.skillsToImprove,
            careerPath: recs.careerPath,
            shortTermGoals: recs.shortTermGoals,
            longTermGoals: recs.longTermGoals
          },
          completedAt: new Date().toISOString()
        }
      };

      const response = await apiService.saveTestResults(testData);
      
      if (response.success) {
        console.log('✅ Результаты сохранены:', response.data);
        setSavedToDb(true);
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
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

  const progress = TOTAL_QUESTIONS > 0 ? ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100 : 0;

  // Экран загрузки вопроса
  if (isGeneratingQuestion && questions.length === 0) {
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
            <h2 className="question-text">🤖 Подготавливаем умное тестирование...</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem', marginTop: '2rem' }}>
              ИИ готовится задавать вам персональные вопросы
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Экран результатов
  if (showResults) {
    const displayAnalysis = analysis || {
      overallScore: 75,
      categoryScores: {},
      strengths: [],
      weaknesses: [],
      hiddenTalents: [],
      level: 'Развивающийся'
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
            <h1>Тестирование завершено, {displayAnalysis.userName}!</h1>
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
              <p>Курсов подобрано</p>
            </div>
          </div>

          {/* Детальная оценка по категориям */}
          {displayAnalysis.categoryScores && Object.keys(displayAnalysis.categoryScores).length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>📈 Оценка по категориям</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {Object.entries(displayAnalysis.categoryScores).map(([category, score]) => (
                  <div key={category} style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    padding: '1rem', 
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'white', fontWeight: '600' }}>{category}</span>
                      <span style={{ 
                        color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444',
                        fontWeight: '700',
                        fontSize: '1.2rem'
                      }}>{score}%</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: 'rgba(59, 130, 246, 0.2)', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${score}%`, 
                        height: '100%', 
                        background: `linear-gradient(90deg, ${score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}, #3b82f6)`,
                        transition: 'width 1s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Сильные стороны */}
          {displayAnalysis.strengths?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>💪 Ваши сильные стороны</h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
                {displayAnalysis.strengths.map((strength, idx) => (
                  <li key={idx} style={{ 
                    padding: '0.8rem', 
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderLeft: '3px solid #10b981',
                    marginBottom: '0.5rem',
                    borderRadius: '4px'
                  }}>✓ {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Скрытые таланты */}
          {displayAnalysis.hiddenTalents?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>✨ Скрытые таланты</h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
                {displayAnalysis.hiddenTalents.map((talent, idx) => (
                  <li key={idx} style={{ 
                    padding: '0.8rem', 
                    background: 'rgba(168, 85, 247, 0.1)',
                    borderLeft: '3px solid #a855f7',
                    marginBottom: '0.5rem',
                    borderRadius: '4px'
                  }}>⭐ {talent}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Области для развития */}
          {displayAnalysis.weaknesses?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>📈 Области для развития</h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
                {displayAnalysis.weaknesses.map((weakness, idx) => (
                  <li key={idx} style={{ 
                    padding: '0.8rem', 
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderLeft: '3px solid #3b82f6',
                    marginBottom: '0.5rem',
                    borderRadius: '4px'
                  }}>→ {weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Детальная обратная связь */}
          {displayAnalysis.detailedFeedback && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>💡 Детальный анализ</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                {displayAnalysis.detailedFeedback}
              </p>
            </div>
          )}

          {/* Рекомендованные курсы */}
          {displayRecommendations.courses?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>📚 Персональные рекомендации курсов</h3>
              {displayRecommendations.courses.slice(0, 3).map((course, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{course.title}</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.8rem', lineHeight: '1.6' }}>
                    {course.description}
                  </p>
                  {course.matchReason && (
                    <p style={{ 
                      color: 'rgba(168, 85, 247, 0.9)', 
                      fontSize: '0.95rem', 
                      fontStyle: 'italic',
                      marginBottom: '0.8rem',
                      padding: '0.5rem',
                      background: 'rgba(168, 85, 247, 0.1)',
                      borderRadius: '6px'
                    }}>
                      💡 {course.matchReason}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      color: course.priority === 'high' ? '#ef4444' : 
                             course.priority === 'medium' ? '#f59e0b' : '#10b981',
                      fontWeight: '600'
                    }}>
                      ⭐ {course.priority === 'high' ? 'Высокий приоритет' : 
                          course.priority === 'medium' ? 'Средний приоритет' : 'Рекомендуется'}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      ⏱️ {course.estimatedTime}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      📂 {course.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Навыки для развития */}
          {displayRecommendations.skillsToImprove?.length > 0 && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🎯 План развития навыков</h3>
              {displayRecommendations.skillsToImprove.map((skill, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <h4 style={{ color: 'white', marginBottom: '0.8rem' }}>{skill.skill}</h4>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', marginRight: '1rem' }}>
                      Текущий: <strong style={{ color: '#f59e0b' }}>{skill.currentLevel}</strong>
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Цель: <strong style={{ color: '#10b981' }}>{skill.targetLevel}</strong>
                    </span>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Действия:
                    </p>
                    <ul style={{ color: 'rgba(255, 255, 255, 0.7)', paddingLeft: '1.5rem' }}>
                      {skill.actions.map((action, actionIdx) => (
                        <li key={actionIdx} style={{ marginBottom: '0.3rem' }}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Карьерный путь */}
          {displayRecommendations.careerPath && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🚀 Карьерный путь</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>Текущая позиция:</p>
                <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                  {displayRecommendations.careerPath.current}
                </p>
              </div>
              {displayRecommendations.careerPath.potential?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>Потенциальные направления:</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {displayRecommendations.careerPath.potential.map((path, idx) => (
                      <span key={idx} style={{ 
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(14, 165, 233, 0.3))',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '0.95rem',
                        border: '1px solid rgba(59, 130, 246, 0.4)'
                      }}>
                        {path}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {displayRecommendations.careerPath.roadmap && (
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  borderLeft: '3px solid #3b82f6'
                }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                    {displayRecommendations.careerPath.roadmap}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Персональный совет */}
          {displayRecommendations.personalizedAdvice && (
            <div className="result-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>💬 Персональный совет</h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                lineHeight: '1.8', 
                fontSize: '1.05rem',
                fontStyle: 'italic',
                padding: '1rem',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '8px',
                borderLeft: '3px solid #a855f7'
              }}>
                {displayRecommendations.personalizedAdvice}
              </p>
            </div>
          )}

          <div className="results-actions">
            <button className="primary-btn">Получить полный PDF-отчет</button>
            <button className="secondary-btn" onClick={onBack}>
              Вернуться на главную
            </button>
          </div>

          {savedToDb && (
            <p style={{ 
              color: '#10b981', 
              marginTop: '2rem', 
              textAlign: 'center',
              fontSize: '0.95rem'
            }}>
              ✅ Результаты сохранены в вашем профиле
            </p>
          )}
        </div>
      </div>
    );
  }

  // Основной интерфейс тестирования
  if (questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ?.id];

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
              Вопрос {currentQuestion + 1} из {TOTAL_QUESTIONS}
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
                      currentQ.singleChoice 
                        ? currentAnswer?.[0] === option ? 'active' : ''
                        : currentAnswer?.includes(option) ? 'active' : ''
                    }`}
                    onClick={() => {
                      if (currentQ.singleChoice) {
                        // Один вариант ответа
                        handleAnswerChange([option]);
                      } else {
                        // Множественный выбор
                        const current = currentAnswer || [];
                        if (current.includes(option)) {
                          handleAnswerChange(current.filter((a) => a !== option));
                        } else {
                          handleAnswerChange([...current, option]);
                        }
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
                  💡 Чем подробнее ваш ответ, тем точнее будут рекомендации
                </div>
              </div>
            )}
          </div>

          <div className="navigation-buttons">
            <button
              className="nav-btn secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || isGeneratingQuestion}
            >
              ← Назад
            </button>
            <button
              className="nav-btn primary"
              onClick={handleNext}
              disabled={
                !currentAnswer || 
                (Array.isArray(currentAnswer) && currentAnswer.length === 0) ||
                isGeneratingQuestion ||
                isLoading
              }
            >
              {isLoading ? '⏳ Анализируем...' : 
               isGeneratingQuestion ? '🤖 Генерация вопроса...' :
               currentQuestion === TOTAL_QUESTIONS - 1 ? 'Завершить тест' : 'Далее →'}
            </button>
          </div>
        </div>

        <div className="test-footer">
          <p className="footer-text">
            {currentQ.isProfileQuestion 
              ? '👋 Давайте познакомимся поближе'
              : '🤖 ИИ адаптирует следующий вопрос на основе ваших ответов'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestPage;