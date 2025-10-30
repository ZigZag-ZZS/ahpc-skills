// src/services/adaptiveTestingService.js

/**
 * Сервис для адаптивного тестирования с 100-балльной системой оценки
 * Подбирает вопросы на основе выбранных компетенций и уровня пользователя
 */

const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
};

// Банк вопросов с компетенциями и сложностью
const QUESTION_BANK = [
  // Графический дизайн
  {
    id: 'gd_b_1',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое цветовая модель RGB и где она применяется?',
    type: 'multiple',
    options: [
      'Модель для цифровых экранов',
      'Модель для печати',
      'Модель для веб-безопасных цветов',
      'Модель для черно-белой графики'
    ],
    correctAnswer: 'Модель для цифровых экранов',
    points: 10
  },
  {
    id: 'gd_b_2',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое разрешение изображения?',
    type: 'multiple',
    options: [
      'Количество пикселей на дюйм',
      'Размер файла изображения',
      'Цветовая глубина',
      'Физический размер изображения'
    ],
    correctAnswer: 'Количество пикселей на дюйм',
    points: 10
  },
  {
    id: 'gd_i_1',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните разницу между векторной и растровой графикой',
    type: 'text',
    hint: 'Опишите основные характеристики и области применения',
    points: 20,
    minLength: 15
  },
  {
    id: 'gd_e_1',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Какие принципы accessibility важны для веб-дизайна?',
    type: 'text',
    hint: 'Учитывайте контраст, навигацию, семантику',
    points: 30,
    minLength: 15
  },

  // Системное администрирование
  {
    id: 'sa_b_1',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое DNS и какова его основная функция?',
    type: 'multiple',
    options: [
      'Преобразование доменных имен в IP-адреса',
      'Защита от сетевых атак',
      'Ускорение загрузки веб-страниц',
      'Управление базами данных'
    ],
    correctAnswer: 'Преобразование доменных имен в IP-адреса',
    points: 10
  },
  {
    id: 'sa_b_2',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Для чего используется команда ping?',
    type: 'multiple',
    options: [
      'Проверка доступности сетевого узла',
      'Настройка сети',
      'Установка соединения',
      'Измерение скорости интернета'
    ],
    correctAnswer: 'Проверка доступности сетевого узла',
    points: 10
  },
  {
    id: 'sa_i_1',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Опишите процесс диагностики проблемы с высокой загрузкой CPU',
    type: 'text',
    hint: 'Какие команды и инструменты вы используете?',
    points: 20,
    minLength: 15
  },
  {
    id: 'sa_e_1',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Какие компоненты включаются в отказоустойчивую инфраструктуру для веб-приложения?',
    type: 'text',
    hint: 'Рассмотрите балансировщики нагрузки, репликацию, мониторинг',
    points: 30,
    minLength: 15
  },

  // Веб-разработка
  {
    id: 'wd_b_1',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое HTML и для чего он используется?',
    type: 'multiple',
    options: [
      'Язык разметки для создания структуры веб-страниц',
      'Язык программирования для серверной части',
      'База данных для хранения контента',
      'Фреймворк для стилизации'
    ],
    correctAnswer: 'Язык разметки для создания структуры веб-страниц',
    points: 10
  },
  {
    id: 'wd_b_2',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое CSS?',
    type: 'multiple',
    options: [
      'Язык для описания внешнего вида документов',
      'Язык программирования',
      'Система управления базами данных',
      'Фреймворк для JavaScript'
    ],
    correctAnswer: 'Язык для описания внешнего вида документов',
    points: 10
  },
  {
    id: 'wd_i_1',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните концепцию Virtual DOM в React и ее преимущества',
    type: 'text',
    hint: 'Сравните с прямыми манипуляциями DOM',
    points: 20,
    minLength: 15
  },
  {
    id: 'wd_e_1',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'В чем преимущества микросервисной архитектуры?',
    type: 'text',
    hint: 'Сравните с монолитной архитектурой',
    points: 30,
    minLength: 15
  },

  // Мобильная разработка
  {
    id: 'md_b_1',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'В чем основное различие между нативной и кроссплатформенной разработкой?',
    type: 'multiple',
    options: [
      'Нативная использует специфичные для платформы языки',
      'Кроссплатформенная требует больше ресурсов',
      'Нативная медленнее работает',
      'Кроссплатформенная не поддерживает аппаратные функции'
    ],
    correctAnswer: 'Нативная использует специфичные для платформы языки',
    points: 10
  },
  {
    id: 'md_i_1',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как вы оптимизируете производительность мобильного приложения?',
    type: 'text',
    hint: 'Рассмотрите аспекты памяти, сети и UI',
    points: 20,
    minLength: 15
  },

  // Data Science
  {
    id: 'ds_b_1',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое переобучение (overfitting) в машинном обучении?',
    type: 'multiple',
    options: [
      'Модель слишком хорошо учится на тренировочных данных',
      'Модель не может обучиться на данных',
      'Модель использует слишком много признаков',
      'Модель работает слишком медленно'
    ],
    correctAnswer: 'Модель слишком хорошо учится на тренировочных данных',
    points: 10
  },
  {
    id: 'ds_i_1',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните разницу между supervised и unsupervised learning',
    type: 'text',
    hint: 'Приведите примеры алгоритмов для каждого типа',
    points: 20,
    minLength: 15
  },

  // DevOps
  {
    id: 'do_b_1',
    competency: 'devops',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое CI/CD и какова его основная цель?',
    type: 'multiple',
    options: [
      'Автоматизация процессов разработки и развертывания',
      'Управление базами данных',
      'Мониторинг производительности',
      'Тестирование безопасности'
    ],
    correctAnswer: 'Автоматизация процессов разработки и развертывания',
    points: 10
  },
  {
    id: 'do_i_1',
    competency: 'devops',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Опишите преимущества использования контейнеризации с Docker',
    type: 'text',
    hint: 'Рассмотрите изоляцию, переносимость и масштабируемость',
    points: 20,
    minLength: 15
  }
];

class AdaptiveTestingService {
  constructor() {
    this.questionBank = QUESTION_BANK;
    this.reset();
  }

  reset() {
    this.userCompetencies = new Map();
    this.askedQuestions = new Set();
    this.currentQuestionIndex = 0;
    this.selectedCompetencies = [];
    this.testHistory = [];
    this.competencyRotation = [];
  }

  setSelectedCompetencies(competencies) {
    this.selectedCompetencies = competencies;
    this.competencyRotation = [...competencies];
    
    // Инициализируем tracking для каждой выбранной компетенции
    competencies.forEach(comp => {
      this.userCompetencies.set(comp, {
        level: DIFFICULTY_LEVELS.BEGINNER,
        questionsAsked: 0,
        correctAnswers: 0,
        currentDifficulty: DIFFICULTY_LEVELS.BEGINNER,
        score: 0,
        maxPossibleScore: 0,
        completed: false
      });
    });
  }

  getNextQuestion() {
    // Проверяем максимальное количество вопросов
    const MAX_QUESTIONS = 15;
    if (this.currentQuestionIndex >= MAX_QUESTIONS) {
      console.log('Maximum questions reached:', MAX_QUESTIONS);
      return null;
    }

    if (this.selectedCompetencies.length === 0) {
      console.error('No competencies selected');
      return null;
    }

    // Используем ротацию компетенций для равномерного распределения
    let attempts = 0;
    const maxAttempts = this.selectedCompetencies.length * 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Получаем следующую компетенцию из ротации
      const nextCompetency = this.competencyRotation[0];
      if (!nextCompetency) {
        console.log('No competency in rotation');
        break;
      }

      const competencyData = this.userCompetencies.get(nextCompetency);
      
      // Если компетенция завершена, переходим к следующей
      if (competencyData.completed) {
        this.rotateCompetency();
        continue;
      }

      const difficulty = competencyData.currentDifficulty;

      // Ищем доступные вопросы для этой компетенции и уровня сложности
      const availableQuestions = this.questionBank.filter(q => 
        q.competency === nextCompetency && 
        q.difficulty === difficulty &&
        !this.askedQuestions.has(q.id)
      );

      if (availableQuestions.length > 0) {
        // Выбираем случайный вопрос из доступных
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.askedQuestions.add(question.id);
        competencyData.questionsAsked++;
        competencyData.maxPossibleScore += question.points;
        this.currentQuestionIndex++;
        
        // Перемещаем компетенцию в конец ротации
        this.rotateCompetency();
        
        console.log(`Question ${this.currentQuestionIndex}: ${question.competency} - ${question.difficulty}`);
        return question;
      } else {
        // Если нет вопросов для текущей сложности, пытаемся найти вопросы других сложностей
        const anyAvailableQuestions = this.questionBank.filter(q => 
          q.competency === nextCompetency &&
          !this.askedQuestions.has(q.id)
        );

        if (anyAvailableQuestions.length > 0) {
          // Повышаем сложность и пробуем снова
          this.adaptDifficulty(nextCompetency, true);
        } else {
          // Если совсем нет вопросов, помечаем компетенцию как завершенную
          competencyData.completed = true;
          console.log(`No questions available for ${nextCompetency}, marking as completed`);
        }
        
        this.rotateCompetency();
      }
    }

    console.log('No questions found after all attempts');
    return null;
  }

  rotateCompetency() {
    if (this.competencyRotation.length > 1) {
      const first = this.competencyRotation.shift();
      this.competencyRotation.push(first);
    }
  }

  adaptDifficulty(competency, forceIncrease = false) {
    const data = this.userCompetencies.get(competency);
    if (!data) return;

    if (forceIncrease) {
      // Принудительное повышение сложности при отсутствии вопросов
      const difficulties = Object.values(DIFFICULTY_LEVELS);
      const currentIndex = difficulties.indexOf(data.currentDifficulty);
      if (currentIndex < difficulties.length - 1) {
        data.currentDifficulty = difficulties[currentIndex + 1];
        console.log(`Forced difficulty increase to ${data.currentDifficulty} for ${competency}`);
      } else {
        data.completed = true;
        console.log(`Competency ${competency} reached maximum difficulty`);
      }
      return;
    }

    // Адаптация на основе точности ответов
    const accuracy = data.questionsAsked > 0 ? data.correctAnswers / data.questionsAsked : 0;

    if (accuracy > 0.7 && data.currentDifficulty !== DIFFICULTY_LEVELS.EXPERT) {
      // Повышаем сложность если точность высокая
      const difficulties = Object.values(DIFFICULTY_LEVELS);
      const currentIndex = difficulties.indexOf(data.currentDifficulty);
      if (currentIndex < difficulties.length - 1) {
        data.currentDifficulty = difficulties[currentIndex + 1];
        console.log(`Increased difficulty to ${data.currentDifficulty} for ${competency}`);
      }
    } else if (accuracy < 0.4 && data.questionsAsked >= 2 && data.currentDifficulty !== DIFFICULTY_LEVELS.BEGINNER) {
      // Понижаем сложность если точность низкая и есть достаточно ответов
      const difficulties = Object.values(DIFFICULTY_LEVELS);
      const currentIndex = difficulties.indexOf(data.currentDifficulty);
      if (currentIndex > 0) {
        data.currentDifficulty = difficulties[currentIndex - 1];
        console.log(`Decreased difficulty to ${data.currentDifficulty} for ${competency}`);
      }
    }
  }

  processAnswer(questionId, userAnswer) {
    const question = this.questionBank.find(q => q.id === questionId);
    if (!question) {
      console.error('Question not found:', questionId);
      return { isCorrect: false, feedback: 'Ошибка системы' };
    }

    const competencyData = this.userCompetencies.get(question.competency);
    let isCorrect = false;
    let feedback = '';

    // Оценка ответа в зависимости от типа вопроса
    switch (question.type) {
      case 'multiple':
        isCorrect = userAnswer === question.correctAnswer;
        feedback = isCorrect 
          ? '✅ Правильно! Отличный ответ.' 
          : `❌ Неверно. Правильный ответ: ${question.correctAnswer}`;
        break;

      case 'text':
        // Для текстовых ответов проверяем минимальную длину как базовый критерий
        const minLength = question.minLength || 15;
        const meetsLength = userAnswer && userAnswer.trim().length >= minLength;
        isCorrect = meetsLength;
        
        if (meetsLength) {
          const lengthBonus = Math.min((userAnswer.length / minLength) - 1, 0.3);
          const basePoints = question.points * 0.7;
          const bonusPoints = question.points * 0.3 * lengthBonus;
          competencyData.score += basePoints + bonusPoints;
          feedback = '✅ Ответ принят! Спасибо за развернутый ответ.';
        } else {
          feedback = `❌ Ответ слишком краткий. Минимум ${minLength} символов.`;
        }
        break;

      case 'rating':
        isCorrect = userAnswer >= 4;
        const ratingFeedback = {
          1: 'Нужно больше практики в этой области',
          2: 'Базовое понимание присутствует',
          3: 'Средний уровень знаний',
          4: 'Хорошее владение темой',
          5: 'Отличное понимание предмета'
        };
        feedback = ratingFeedback[userAnswer] || 'Спасибо за оценку!';
        
        if (isCorrect) {
          competencyData.score += question.points * (userAnswer / 5);
        }
        break;

      default:
        console.warn('Unknown question type:', question.type);
        isCorrect = false;
        feedback = 'Неизвестный тип вопроса';
        break;
    }

    // Обновляем статистику
    if (isCorrect && question.type !== 'text') {
      competencyData.correctAnswers++;
      competencyData.score += question.points;
    }

    // Адаптируем сложность после ответа
    this.adaptDifficulty(question.competency);

    this.testHistory.push({
      questionId,
      userAnswer,
      isCorrect,
      timestamp: new Date().toISOString(),
      competency: question.competency
    });

    return {
      isCorrect,
      feedback,
      correctAnswer: question.correctAnswer,
      pointsEarned: isCorrect ? question.points : 0
    };
  }

  getProgress() {
    const MAX_QUESTIONS = 15;
    return {
      current: this.currentQuestionIndex,
      total: MAX_QUESTIONS,
      percentage: Math.min((this.currentQuestionIndex / MAX_QUESTIONS) * 100, 100)
    };
  }

  getFinalResults() {
    const competencyResults = {};
    let totalScore = 0;
    let totalQuestions = 0;
    let totalCorrectAnswers = 0;

    this.userCompetencies.forEach((data, competency) => {
      // Нормализуем score к 100-балльной системе
      const normalizedScore = data.maxPossibleScore > 0 
        ? Math.min((data.score / data.maxPossibleScore) * 100, 100)
        : 0;

      // Определяем уровень владения
      const level = normalizedScore >= 85 ? 'Эксперт' :
                   normalizedScore >= 70 ? 'Продвинутый' :
                   normalizedScore >= 50 ? 'Средний' : 'Начинающий';

      // Рекомендации на основе уровня
      const recommendations = {
        'Эксперт': 'Продолжайте углублять знания и делиться опытом',
        'Продвинутый': 'Развивайте практические навыки через реальные проекты',
        'Средний': 'Систематизируйте знания и практикуйтесь регулярно',
        'Начинающий': 'Начните с базовых курсов и простых проектов'
      };

      competencyResults[competency] = {
        score: Math.round(normalizedScore),
        level,
        questionsAsked: data.questionsAsked,
        correctAnswers: data.correctAnswers,
        finalDifficulty: data.currentDifficulty,
        recommendation: recommendations[level]
      };

      totalScore += normalizedScore;
      totalQuestions += data.questionsAsked;
      totalCorrectAnswers += data.correctAnswers;
    });

    const overallScore = this.userCompetencies.size > 0 
      ? Math.round(totalScore / this.userCompetencies.size)
      : 0;

    return {
      overallScore,
      totalQuestions,
      correctAnswers: totalCorrectAnswers,
      competencyResults,
      testHistory: this.testHistory
    };
  }

  getAvailableCompetencies() {
    return [...new Set(this.questionBank.map(q => q.competency))];
  }
}

// Создаем экземпляр сервиса
const adaptiveTestingService = new AdaptiveTestingService();

// Экспортируем сервис и константы
export { AdaptiveTestingService, DIFFICULTY_LEVELS };
export default adaptiveTestingService;