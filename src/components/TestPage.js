import React, { useState } from 'react';
import './TestPage.css';

function TestPage({ onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Пример вопросов теста
  const questions = [
    {
      id: 1,
      question: "Как вы оцениваете свои навыки программирования?",
      type: "rating",
      category: "Технические навыки"
    },
    {
      id: 2,
      question: "Какие языки программирования вы знаете?",
      type: "multiple",
      options: ["JavaScript", "Python", "Java", "C++", "Go", "Ruby"],
      category: "Технические навыки"
    },
    {
      id: 3,
      question: "Опишите ваш опыт работы в команде",
      type: "text",
      category: "Soft Skills"
    },
    {
      id: 4,
      question: "Насколько хорошо вы владеете английским языком?",
      type: "rating",
      category: "Языковые навыки"
    },
    {
      id: 5,
      question: "Какие фреймворки вы использовали?",
      type: "multiple",
      options: ["React", "Vue", "Angular", "Django", "Flask", "Spring"],
      category: "Технические навыки"
    }
  ];

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
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
          <div className="nav-brand">
            <span className="gradient-text">Skills</span>Test
          </div>
        </nav>

        <div className="results-container">
          <div className="results-header">
            <div className="success-icon">✓</div>
            <h1>Тестирование завершено!</h1>
            <p>Ваши результаты обрабатываются нашим ИИ</p>
          </div>

          <div className="results-stats">
            <div className="result-card">
              <div className="result-icon">🎯</div>
              <h3>Точность анализа</h3>
              <div className="result-value">95%</div>
              <p>Высокая достоверность результатов</p>
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
              <div className="result-value">12</div>
              <p>Курсов подобрано для вас</p>
            </div>
          </div>

          <div className="results-actions">
            <button className="primary-btn">Посмотреть результаты</button>
            <button className="secondary-btn" onClick={onBack}>
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
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
        <div className="nav-brand">
          <span className="gradient-text">Skills</span>Test
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

            {currentQ.type === 'multiple' && (
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
              {currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее →'}
            </button>
          </div>
        </div>

        <div className="test-footer">
          <p className="footer-text">
            💡 Совет: Отвечайте честно для получения наиболее точных рекомендаций
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestPage;