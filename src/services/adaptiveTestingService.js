// src/services/adaptiveTestingService.js

/**
 * Сервис для адаптивного тестирования
 * Подбирает вопросы на основе компетенций и уровня пользователя
 */

const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
};

const DIFFICULTY_SCORES = {
  [DIFFICULTY_LEVELS.BEGINNER]: 1,
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 2,
  [DIFFICULTY_LEVELS.EXPERT]: 3
};

// Банк вопросов с компетенциями и сложностью
const QUESTION_BANK = [
  // JavaScript - Beginner
  {
    id: 'js_b_1',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое переменная в JavaScript?',
    type: 'multiple',
    options: [
      'Контейнер для хранения данных',
      'Функция для вычислений',
      'Тип данных',
      'Оператор сравнения'
    ],
    correctAnswer: 'Контейнер для хранения данных',
    points: 10
  },
  {
    id: 'js_b_2',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Какой оператор используется для присваивания значения?',
    type: 'multiple',
    options: ['=', '==', '===', '=>'],
    correctAnswer: '=',
    points: 10
  },
  {
    id: 'js_b_3',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Как вывести текст в консоль?',
    type: 'multiple',
    options: ['console.log()', 'print()', 'echo()', 'alert()'],
    correctAnswer: 'console.log()',
    points: 10
  },

  // JavaScript - Intermediate
  {
    id: 'js_i_1',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое замыкание (closure) в JavaScript?',
    type: 'text',
    correctAnswer: 'closure',
    points: 20,
    hint: 'Функция, которая имеет доступ к переменным внешней функции'
  },
  {
    id: 'js_i_2',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Чем отличается let от var?',
    type: 'multiple',
    options: [
      'let имеет блочную область видимости',
      'let работает быстрее',
      'let не может быть переопределена',
      'Нет разницы'
    ],
    correctAnswer: 'let имеет блочную область видимости',
    points: 20
  },
  {
    id: 'js_i_3',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что вернет typeof null?',
    type: 'multiple',
    options: ['object', 'null', 'undefined', 'number'],
    correctAnswer: 'object',
    points: 20
  },

  // JavaScript - Expert
  {
    id: 'js_e_1',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Объясните Event Loop в JavaScript',
    type: 'text',
    correctAnswer: 'event loop',
    points: 30,
    hint: 'Механизм обработки асинхронных операций'
  },
  {
    id: 'js_e_2',
    competency: 'JavaScript',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Что такое Symbol в JavaScript и зачем он нужен?',
    type: 'text',
    correctAnswer: 'symbol',
    points: 30,
    hint: 'Уникальный и неизменяемый примитивный тип данных'
  },

  // React - Beginner
  {
    id: 'react_b_1',
    competency: 'React',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое JSX?',
    type: 'multiple',
    options: [
      'Синтаксическое расширение JavaScript',
      'Новый язык программирования',
      'Библиотека для стилизации',
      'Фреймворк для бэкенда'
    ],
    correctAnswer: 'Синтаксическое расширение JavaScript',
    points: 10
  },
  {
    id: 'react_b_2',
    competency: 'React',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Какой хук используется для создания состояния?',
    type: 'multiple',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correctAnswer: 'useState',
    points: 10
  },

  // React - Intermediate
  {
    id: 'react_i_1',
    competency: 'React',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'В чем разница между props и state?',
    type: 'text',
    correctAnswer: 'props state',
    points: 20,
    hint: 'props приходят извне, state управляется внутри компонента'
  },
  {
    id: 'react_i_2',
    competency: 'React',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Когда выполняется useEffect без зависимостей?',
    type: 'multiple',
    options: [
      'После каждого рендера',
      'Только один раз',
      'Перед каждым рендером',
      'Никогда'
    ],
    correctAnswer: 'После каждого рендера',
    points: 20
  },

  // React - Expert
  {
    id: 'react_e_1',
    competency: 'React',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Объясните работу виртуального DOM и алгоритма reconciliation',
    type: 'text',
    correctAnswer: 'virtual dom',
    points: 30,
    hint: 'Оптимизация обновления реального DOM'
  },

  // Python - Beginner
  {
    id: 'py_b_1',
    competency: 'Python',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Какой тип данных используется для хранения последовательности элементов?',
    type: 'multiple',
    options: ['list', 'int', 'str', 'bool'],
    correctAnswer: 'list',
    points: 10
  },
  {
    id: 'py_b_2',
    competency: 'Python',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Как создать функцию в Python?',
    type: 'multiple',
    options: ['def function():', 'function():', 'create function():', 'func():'],
    correctAnswer: 'def function():',
    points: 10
  },

  // Python - Intermediate
  {
    id: 'py_i_1',
    competency: 'Python',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое list comprehension?',
    type: 'text',
    correctAnswer: 'comprehension',
    points: 20,
    hint: 'Компактный способ создания списков'
  },
  {
    id: 'py_i_2',
    competency: 'Python',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Чем отличается tuple от list?',
    type: 'multiple',
    options: [
      'tuple неизменяемый',
      'tuple быстрее',
      'tuple больше',
      'Нет разницы'
    ],
    correctAnswer: 'tuple неизменяемый',
    points: 20
  },

  // Python - Expert
  {
    id: 'py_e_1',
    competency: 'Python',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Объясните GIL (Global Interpreter Lock) в Python',
    type: 'text',
    correctAnswer: 'gil',
    points: 30,
    hint: 'Механизм синхронизации в CPython'
  },

  // Soft Skills - Beginner
  {
    id: 'soft_b_1',
    competency: 'Коммуникация',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Оцените свои навыки работы в команде',
    type: 'rating',
    points: 10
  },
  {
    id: 'soft_b_2',
    competency: 'Коммуникация',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Как часто вы делитесь знаниями с коллегами?',
    type: 'multiple',
    options: ['Регулярно', 'Иногда', 'Редко', 'Никогда'],
    correctAnswer: null,
    points: 10
  },

  // Soft Skills - Intermediate
  {
    id: 'soft_i_1',
    competency: 'Коммуникация',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Опишите ситуацию, когда вам пришлось разрешить конфликт в команде',
    type: 'text',
    correctAnswer: null,
    points: 20,
    hint: 'Подробно опишите вашу роль и результат'
  },

  // Soft Skills - Expert
  {
    id: 'soft_e_1',
    competency: 'Лидерство',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Опишите ваш опыт менторства и руководства командой',
    type: 'text',
    correctAnswer: null,
    points: 30,
    hint: 'Примеры проектов и достижений команды'
  },

  // Базы данных - Beginner
  {
    id: 'db_b_1',
    competency: 'Базы данных',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое SQL?',
    type: 'multiple',
    options: [
      'Язык структурированных запросов',
      'База данных',
      'Сервер',
      'Протокол передачи данных'
    ],
    correctAnswer: 'Язык структурированных запросов',
    points: 10
  },

  // Базы данных - Intermediate
  {
    id: 'db_i_1',
    competency: 'Базы данных',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'В чем разница между INNER JOIN и LEFT JOIN?',
    type: 'text',
    correctAnswer: 'join',
    points: 20,
    hint: 'Как обрабатываются несовпадающие записи'
  },

  // Базы данных - Expert
  {
    id: 'db_e_1',
    competency: 'Базы данных',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Объясните принципы нормализации баз данных',
    type: 'text',
    correctAnswer: 'нормализация',
    points: 30,
    hint: '1NF, 2NF, 3NF и их назначение'
  }
];

class AdaptiveTestingService {
  constructor() {
    this.questionBank = QUESTION_BANK;
    this.competencies = [...new Set(QUESTION_BANK.map(q => q.competency))];
    this.reset();
  }

  /**
   * Сброс состояния теста
   */
  reset() {
    this.currentState = {
      askedQuestions: [],
      competencyLevels: {},
      competencyScores: {},
      totalQuestions: 0,
      correctAnswers: 0,
      userAnswers: {}
    };

    // Инициализация уровней компетенций (начинаем со среднего)
    this.competencies.forEach(comp => {
      this.currentState.competencyLevels[comp] = DIFFICULTY_LEVELS.INTERMEDIATE;
      this.currentState.competencyScores[comp] = {
        total: 0,
        correct: 0,
        questions: []
      };
    });
  }

  /**
   * Получение следующего вопроса на основе текущего состояния
   */
  getNextQuestion() {
    const MAX_QUESTIONS = 25;
    
    if (this.currentState.totalQuestions >= MAX_QUESTIONS) {
      return null;
    }

    // Выбираем компетенцию для следующего вопроса
    const targetCompetency = this._selectNextCompetency();
    const targetDifficulty = this.currentState.competencyLevels[targetCompetency];

    // Находим подходящий вопрос
    const availableQuestions = this.questionBank.filter(q => 
      q.competency === targetCompetency &&
      q.difficulty === targetDifficulty &&
      !this.currentState.askedQuestions.includes(q.id)
    );

    // Если нет вопросов нужной сложности, берем ближайшие
    let question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    if (!question) {
      question = this._findAlternativeQuestion(targetCompetency);
    }

    if (question) {
      this.currentState.askedQuestions.push(question.id);
      this.currentState.totalQuestions++;
    }

    return question;
  }

  /**
   * Выбор следующей компетенции для тестирования
   * Приоритет отдается компетенциям с меньшим количеством вопросов
   */
  _selectNextCompetency() {
    const competencyQuestionCounts = {};
    
    this.competencies.forEach(comp => {
      competencyQuestionCounts[comp] = 
        this.currentState.competencyScores[comp].questions.length;
    });

    // Сортируем по количеству заданных вопросов
    const sortedCompetencies = Object.entries(competencyQuestionCounts)
      .sort((a, b) => a[1] - b[1]);

    return sortedCompetencies[0][0];
  }

  /**
   * Поиск альтернативного вопроса, если нет вопросов нужной сложности
   */
  _findAlternativeQuestion(competency) {
    const availableQuestions = this.questionBank.filter(q => 
      q.competency === competency &&
      !this.currentState.askedQuestions.includes(q.id)
    );

    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }

  /**
   * Обработка ответа пользователя
   */
  processAnswer(questionId, userAnswer) {
    const question = this.questionBank.find(q => q.id === questionId);
    if (!question) return null;

    const isCorrect = this._evaluateAnswer(question, userAnswer);
    const competency = question.competency;

    // Сохраняем ответ
    this.currentState.userAnswers[questionId] = {
      answer: userAnswer,
      correct: isCorrect,
      question: question
    };

    // Обновляем статистику компетенции
    this.currentState.competencyScores[competency].total++;
    if (isCorrect) {
      this.currentState.competencyScores[competency].correct++;
      this.currentState.correctAnswers++;
    }
    
    this.currentState.competencyScores[competency].questions.push({
      questionId,
      correct: isCorrect,
      difficulty: question.difficulty,
      points: isCorrect ? question.points : 0
    });

    // Адаптация сложности
    this._adaptDifficulty(competency, isCorrect);

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      feedback: this._generateFeedback(question, isCorrect)
    };
  }

  /**
   * Оценка правильности ответа
   */
  _evaluateAnswer(question, userAnswer) {
    if (question.type === 'rating') {
      return true; // Рейтинговые вопросы всегда засчитываются
    }

    if (question.type === 'multiple' && question.correctAnswer) {
      return userAnswer === question.correctAnswer;
    }

    if (question.type === 'text' && question.correctAnswer) {
      const answer = userAnswer.toLowerCase().trim();
      const correct = question.correctAnswer.toLowerCase();
      // Проверяем наличие ключевых слов
      return answer.includes(correct) && answer.length >= 30;
    }

    return true; // Для открытых вопросов без правильного ответа
  }

  /**
   * Адаптация сложности вопросов
   */
  _adaptDifficulty(competency, isCorrect) {
    const currentLevel = this.currentState.competencyLevels[competency];
    const scores = this.currentState.competencyScores[competency];
    
    // Получаем последние 3 ответа по этой компетенции
    const recentAnswers = scores.questions.slice(-3);
    const recentCorrect = recentAnswers.filter(a => a.correct).length;

    // Логика адаптации
    if (recentCorrect >= 2) {
      // Повышаем сложность
      if (currentLevel === DIFFICULTY_LEVELS.BEGINNER) {
        this.currentState.competencyLevels[competency] = DIFFICULTY_LEVELS.INTERMEDIATE;
      } else if (currentLevel === DIFFICULTY_LEVELS.INTERMEDIATE) {
        this.currentState.competencyLevels[competency] = DIFFICULTY_LEVELS.EXPERT;
      }
    } else if (recentCorrect === 0 && recentAnswers.length >= 2) {
      // Понижаем сложность
      if (currentLevel === DIFFICULTY_LEVELS.EXPERT) {
        this.currentState.competencyLevels[competency] = DIFFICULTY_LEVELS.INTERMEDIATE;
      } else if (currentLevel === DIFFICULTY_LEVELS.INTERMEDIATE) {
        this.currentState.competencyLevels[competency] = DIFFICULTY_LEVELS.BEGINNER;
      }
    }
  }

  /**
   * Генерация обратной связи по ответу
   */
  _generateFeedback(question, isCorrect) {
    if (isCorrect) {
      const feedbacks = [
        '✅ Отлично! Вы хорошо разбираетесь в этой теме.',
        '🎯 Правильно! Продолжайте в том же духе.',
        '⭐ Верно! Вы демонстрируете отличные знания.',
        '💪 Превосходно! Так держать!'
      ];
      return feedbacks[Math.floor(Math.random() * feedbacks.length)];
    } else {
      return '📚 Не совсем верно. Рекомендуем изучить эту тему подробнее.';
    }
  }

  /**
   * Получение финальных результатов
   */
  getFinalResults() {
    const results = {
      totalQuestions: this.currentState.totalQuestions,
      correctAnswers: this.currentState.correctAnswers,
      overallScore: Math.round(
        (this.currentState.correctAnswers / this.currentState.totalQuestions) * 100
      ),
      competencyResults: {}
    };

    // Анализ по каждой компетенции
    Object.keys(this.currentState.competencyScores).forEach(comp => {
      const score = this.currentState.competencyScores[comp];
      
      if (score.total === 0) {
        results.competencyResults[comp] = {
          level: 'Не оценивалось',
          score: 0,
          questionsAsked: 0,
          correctAnswers: 0
        };
        return;
      }

      const accuracy = (score.correct / score.total) * 100;
      const finalLevel = this.currentState.competencyLevels[comp];
      
      // Определяем финальный уровень на основе точности и текущей сложности
      let level = 'Начинающий';
      if (finalLevel === DIFFICULTY_LEVELS.EXPERT && accuracy >= 70) {
        level = 'Эксперт';
      } else if (finalLevel === DIFFICULTY_LEVELS.EXPERT || 
                (finalLevel === DIFFICULTY_LEVELS.INTERMEDIATE && accuracy >= 70)) {
        level = 'Продвинутый';
      } else if (finalLevel === DIFFICULTY_LEVELS.INTERMEDIATE || accuracy >= 50) {
        level = 'Средний';
      }

      results.competencyResults[comp] = {
        level,
        score: Math.round(accuracy),
        questionsAsked: score.total,
        correctAnswers: score.correct,
        difficulty: finalLevel
      };
    });

    return results;
  }

  /**
   * Получение прогресса теста
   */
  getProgress() {
    const MAX_QUESTIONS = 25;
    return {
      current: this.currentState.totalQuestions,
      total: MAX_QUESTIONS,
      percentage: Math.round((this.currentState.totalQuestions / MAX_QUESTIONS) * 100)
    };
  }

  /**
   * Получение статистики компетенций
   */
  getCompetencyStats() {
    return this.currentState.competencyScores;
  }
}

// Экспорт singleton
const adaptiveTestingService = new AdaptiveTestingService();
export default adaptiveTestingService;

// Экспорт констант и класса
export { AdaptiveTestingService, DIFFICULTY_LEVELS, DIFFICULTY_SCORES };