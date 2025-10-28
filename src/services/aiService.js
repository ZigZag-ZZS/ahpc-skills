const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class AIService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.REACT_APP_GEMINI_API_KEY;
    this.conversationHistory = [];
    this.userProfile = {
      strengths: [],
      weaknesses: [],
      interests: [],
      responses: []
    };
  }

  /**
   * НОВЫЙ МЕТОД: Генерация следующего вопроса на основе истории ответов
   * @param {Array} previousAnswers - Массив предыдущих ответов с вопросами
   * @param {number} questionNumber - Номер текущего вопроса
   * @returns {Promise<Object>} Следующий вопрос
   */
  async generateNextQuestion(previousAnswers, questionNumber) {
    // Первые два вопроса - профильные (остаются неизменными)
    if (questionNumber === 0) {
      return {
        id: 'profile_name',
        question: "Давайте познакомимся! Как вас зовут?",
        type: "text",
        category: "Знакомство",
        isProfileQuestion: true
      };
    }

    if (questionNumber === 1) {
      return {
        id: 'profile_role',
        question: "Кто вы: студент или преподаватель?",
        type: "multiple",
        options: ["Студент", "Преподаватель"],
        category: "Профиль",
        isProfileQuestion: true,
        singleChoice: true
      };
    }

    // Начиная с 3-го вопроса - ИИ анализирует и задаёт адаптивные вопросы
    const prompt = this._buildAdaptiveQuestionPrompt(previousAnswers, questionNumber);
    
    try {
      const response = await this._callGeminiAPI(prompt);
      const question = this._parseQuestionFromResponse(response, questionNumber);
      
      // Сохраняем в историю
      this.conversationHistory.push({
        questionNumber,
        question: question.question,
        timestamp: new Date().toISOString()
      });
      
      return question;
    } catch (error) {
      console.error('Ошибка генерации вопроса:', error);
      return this._getFallbackQuestion(questionNumber);
    }
  }

  /**
   * Построение промпта для адаптивного вопроса
   * @private
   */
  _buildAdaptiveQuestionPrompt(previousAnswers, questionNumber) {
    const answersContext = previousAnswers.map((item, idx) => ({
      questionNum: idx + 1,
      question: item.question,
      answer: item.answer,
      category: item.category
    }));

    const totalQuestions = 12; // Общее количество вопросов в тесте
    const progress = Math.round((questionNumber / totalQuestions) * 100);

    return `Ты - интеллектуальный профориентационный ассистент. Твоя задача - глубоко понять сильные и слабые стороны пользователя через умные вопросы.

КОНТЕКСТ БЕСЕДЫ:
Прогресс: ${progress}% (вопрос ${questionNumber} из ${totalQuestions})

ПРЕДЫДУЩИЕ ОТВЕТЫ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(answersContext, null, 2)}

АНАЛИЗ ПОЛЬЗОВАТЕЛЯ НА ОСНОВЕ ОТВЕТОВ:
- Имя: ${previousAnswers[0]?.answer || 'Не указано'}
- Роль: ${previousAnswers[1]?.answer?.[0] || 'Не указано'}

ТВОЯ ЗАДАЧА:
1. Проанализируй предыдущие ответы
2. Определи, что тебе еще нужно узнать о пользователе
3. Задай ОДИН конкретный вопрос, который поможет:
   - Выявить скрытые таланты
   - Понять мотивацию и интересы
   - Оценить текущий уровень навыков
   - Определить зоны роста

СТРАТЕГИЯ ВОПРОСОВ:
- Вопросы 3-5: Общие интересы и опыт (широкий охват)
- Вопросы 6-8: Углубление в конкретные области на основе ответов
- Вопросы 9-12: Детальная оценка навыков и выявление пробелов

ПРАВИЛА:
- Вопрос должен логически следовать из предыдущих ответов
- Будь естественным и разговорным
- Задавай вопросы, которые реально помогут оценить человека
- Избегай слишком общих или абстрактных вопросов

ФОРМАТ ОТВЕТА (строго JSON):
{
  "question": "Твой умный вопрос здесь",
  "type": "rating|multiple|text",
  "category": "Технические навыки|Soft Skills|Интересы|Опыт|Мотивация",
  "options": ["вариант1", "вариант2", "вариант3", "вариант4"],
  "reasoning": "Почему ты задаёшь именно этот вопрос (для отладки)"
}

Примеры хороших адаптивных вопросов:
- Если пользователь - студент IT: "Какие проекты ты создавал самостоятельно?"
- Если показал интерес к творчеству: "Что тебя больше вдохновляет: решение технических задач или создание чего-то нового?"
- Если упомянул работу в команде: "Какую роль ты обычно берёшь на себя в групповых проектах?"

ВАЖНО: Отвечай ТОЛЬКО JSON без дополнительного текста!`;
  }

  /**
   * Парсинг вопроса из ответа AI
   * @private
   */
  _parseQuestionFromResponse(response, questionNumber) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `adaptive_q${questionNumber}`,
          question: parsed.question,
          type: parsed.type || "text",
          category: parsed.category || "Общие",
          options: parsed.options,
          reasoning: parsed.reasoning // Для отладки
        };
      }
      throw new Error('JSON не найден в ответе');
    } catch (error) {
      console.error('Ошибка парсинга вопроса:', error);
      return this._getFallbackQuestion(questionNumber);
    }
  }

  /**
   * Fallback вопрос если AI не сработал
   * @private
   */
  _getFallbackQuestion(questionNumber) {
    const fallbackQuestions = [
      {
        id: `fallback_${questionNumber}`,
        question: "Какие навыки вы хотели бы развить в первую очередь?",
        type: "multiple",
        options: ["Программирование", "Коммуникация", "Управление проектами", "Аналитика", "Дизайн"],
        category: "Интересы"
      },
      {
        id: `fallback_${questionNumber}`,
        question: "Как вы оцениваете свою способность быстро обучаться новому?",
        type: "rating",
        category: "Soft Skills"
      },
      {
        id: `fallback_${questionNumber}`,
        question: "Расскажите о проекте, которым вы больше всего гордитесь",
        type: "text",
        category: "Опыт"
      }
    ];

    return fallbackQuestions[questionNumber % fallbackQuestions.length];
  }

  /**
   * УЛУЧШЕННЫЙ АНАЛИЗ: Глубокий анализ всех ответов с учётом адаптивности
   * @param {Object} answers - Все ответы пользователя
   * @param {Array} questions - Все заданные вопросы
   * @returns {Promise<Object>}
   */
  async analyzeAnswers(answers, questions) {
    const userName = answers['profile_name'] || 'Пользователь';
    const userRole = answers['profile_role']?.[0] || 'Специалист';
    
    // Подготавливаем детальный контекст для анализа
    const conversationFlow = questions.map((q, idx) => ({
      questionNumber: idx + 1,
      question: q.question,
      category: q.category,
      type: q.type,
      answer: answers[q.id],
      reasoning: q.reasoning // Если есть от AI
    }));

    const prompt = `Ты - эксперт по оценке профессиональных компетенций. Проведи ГЛУБОКИЙ анализ пользователя.

ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ:
- Имя: ${userName}
- Роль: ${userRole}

ПОЛНАЯ ИСТОРИЯ ДИАЛОГА И ОТВЕТОВ:
${JSON.stringify(conversationFlow, null, 2)}

ЗАДАЧА:
Проанализируй ответы пользователя и создай детальный профиль с оценкой:

1. СИЛЬНЫЕ СТОРОНЫ - что пользователь уже умеет хорошо
2. СЛАБЫЕ СТОРОНЫ - где есть пробелы
3. СКРЫТЫЕ ТАЛАНТЫ - что может не осознавать сам
4. МОТИВАЦИЯ И ИНТЕРЕСЫ - что его вдохновляет
5. РЕКОМЕНДАЦИИ ПО РАЗВИТИЮ

ФОРМАТ ОТВЕТА (строго JSON):
{
  "overallScore": число от 0 до 100,
  "categoryScores": {
    "Технические навыки": число 0-100,
    "Soft Skills": число 0-100,
    "Лидерство": число 0-100,
    "Креативность": число 0-100,
    "Аналитика": число 0-100
  },
  "strengths": [
    "Конкретная сильная сторона с примером из ответов",
    "Ещё одна сильная сторона"
  ],
  "weaknesses": [
    "Конкретная слабая сторона",
    "Область для развития"
  ],
  "hiddenTalents": [
    "Скрытый талант, который стоит развивать"
  ],
  "personalityTraits": [
    "Черта характера выявленная из ответов"
  ],
  "level": "Начинающий|Развивающийся|Компетентный|Опытный|Эксперт",
  "detailedFeedback": "Подробный персонализированный анализ с конкретными примерами из ответов пользователя",
  "motivationFactors": ["что мотивирует этого человека"],
  "learningStyle": "Описание предпочитаемого стиля обучения"
}

ВАЖНО: Будь конкретным, используй информацию из ответов, не используй общие фразы!`;

    try {
      const response = await this._callGeminiAPI(prompt);
      const analysis = this._parseAnalysisFromResponse(response);
      
      return {
        ...analysis,
        userName,
        userRole
      };
    } catch (error) {
      console.error('Ошибка анализа:', error);
      return {
        ...this._getFallbackAnalysis(),
        userName,
        userRole
      };
    }
  }

  /**
   * УЛУЧШЕННЫЕ РЕКОМЕНДАЦИИ с учётом глубокого анализа
   */
  async generateRecommendations(analysis) {
    const prompt = `На основе детального анализа создай ПЕРСОНАЛЬНЫЕ рекомендации для пользователя.

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(analysis, null, 2)}

ЗАДАЧА:
Создай план развития, который:
1. Учитывает сильные стороны пользователя
2. Работает над слабыми сторонами
3. Развивает скрытые таланты
4. Соответствует стилю обучения
5. Учитывает мотивацию

ФОРМАТ ОТВЕТА (строго JSON):
{
  "courses": [
    {
      "title": "Название курса",
      "description": "Почему именно этот курс подходит ЭТОМУ пользователю",
      "category": "Категория",
      "priority": "high|medium|low",
      "estimatedTime": "X часов",
      "matchReason": "Конкретная причина на основе анализа",
      "skills": ["навык1", "навык2"]
    }
  ],
  "skillsToImprove": [
    {
      "skill": "Конкретный навык",
      "currentLevel": "Текущий уровень из анализа",
      "targetLevel": "Целевой уровень",
      "actions": [
        "Конкретное действие 1",
        "Конкретное действие 2"
      ],
      "resources": ["Ресурс 1", "Ресурс 2"]
    }
  ],
  "careerPath": {
    "current": "Текущая позиция",
    "potential": [
      "Реалистичная позиция 1 на основе анализа",
      "Реалистичная позиция 2"
    ],
    "roadmap": "Детальный план с этапами и сроками"
  },
  "shortTermGoals": [
    "Цель на 1-3 месяца"
  ],
  "longTermGoals": [
    "Цель на 6-12 месяцев"
  ],
  "personalizedAdvice": "Персональный совет на основе личности и мотивации пользователя"
}

Рекомендуй курсы от: Learna, Coursera, Udemy, местных университетов.
ВАЖНО: Все рекомендации должны быть КОНКРЕТНЫМИ и основанными на анализе!`;

    try {
      const response = await this._callGeminiAPI(prompt);
      return this._parseRecommendationsFromResponse(response);
    } catch (error) {
      console.error('Ошибка генерации рекомендаций:', error);
      return this._getFallbackRecommendations(analysis.userRole);
    }
  }

  /**
   * Основной метод для вызова Gemini API
   * @private
   */
  async _callGeminiAPI(prompt) {
    if (!this.apiKey) {
      throw new Error('API ключ Gemini не установлен');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8, // Увеличена для более креативных вопросов
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Парсинг анализа из ответа AI
   * @private
   */
  _parseAnalysisFromResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Ошибка парсинга анализа:', error);
      return this._getFallbackAnalysis();
    }
  }

  /**
   * Парсинг рекомендаций из ответа AI
   * @private
   */
  _parseRecommendationsFromResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Ошибка парсинга рекомендаций:', error);
      return this._getFallbackRecommendations();
    }
  }

  /**
   * Fallback анализ
   * @private
   */
  _getFallbackAnalysis() {
    return {
      overallScore: 75,
      categoryScores: {
        "Технические навыки": 70,
        "Soft Skills": 75,
        "Лидерство": 65,
        "Креативность": 80,
        "Аналитика": 70
      },
      strengths: [
        "Демонстрирует интерес к обучению и развитию",
        "Хорошие базовые знания в выбранной области"
      ],
      weaknesses: [
        "Требуется больше практического опыта",
        "Развитие структурированного подхода к решению задач"
      ],
      hiddenTalents: [
        "Потенциал в аналитическом мышлении"
      ],
      level: "Развивающийся",
      detailedFeedback: "На основе ваших ответов видно, что вы находитесь на стадии активного развития навыков.",
      motivationFactors: ["Личностный рост", "Профессиональное развитие"]
    };
  }

  /**
   * Fallback рекомендации
   * @private
   */
  _getFallbackRecommendations(userRole = 'Специалист') {
    return {
      courses: [
        {
          title: "Основы профессионального развития",
          description: "Комплексный курс для построения карьеры",
          category: "Карьера",
          priority: "high",
          estimatedTime: "30 часов",
          matchReason: "Подходит для вашего уровня"
        }
      ],
      skillsToImprove: [
        {
          skill: "Тайм-менеджмент",
          currentLevel: "Базовый",
          targetLevel: "Продвинутый",
          actions: ["Планирование дня", "Приоритизация задач"]
        }
      ],
      careerPath: {
        current: userRole,
        potential: ["Специалист среднего уровня", "Руководитель проектов"],
        roadmap: "Сфокусируйтесь на развитии ключевых навыков в течение следующих 6 месяцев"
      }
    };
  }

  /**
   * Очистка истории
   */
  clearHistory() {
    this.conversationHistory = [];
    this.userProfile = {
      strengths: [],
      weaknesses: [],
      interests: [],
      responses: []
    };
  }
}

// Экспорт singleton instance
const aiService = new AIService();
export default aiService;

export { AIService };