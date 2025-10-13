const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class AIService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.REACT_APP_GEMINI_API_KEY;
    this.conversationHistory = [];
  }

  /**
   * Генерация вопросов для тестирования на основе профиля пользователя
   * @param {Object} userProfile - Профиль пользователя (область, уровень)
   * @param {number} questionCount - Количество вопросов
   * @returns {Promise<Array>} Массив сгенерированных вопросов
   */
  async generateQuestions(userProfile, questionCount = 10) {
    const prompt = this._buildQuestionPrompt(userProfile, questionCount);
    
    try {
      const response = await this._callGeminiAPI(prompt);
      const questions = this._parseQuestionsFromResponse(response);
      return questions;
    } catch (error) {
      console.error('Ошибка генерации вопросов:', error);
      return this._getFallbackQuestions();
    }
  }

  /**
   * Анализ ответов пользователя и генерация статистики
   * @param {Object} answers - Ответы пользователя
   * @param {Array} questions - Заданные вопросы
   * @returns {Promise<Object>} Статистика и рекомендации
   */
  async analyzeAnswers(answers, questions) {
    const prompt = this._buildAnalysisPrompt(answers, questions);
    
    try {
      const response = await this._callGeminiAPI(prompt);
      const analysis = this._parseAnalysisFromResponse(response);
      return analysis;
    } catch (error) {
      console.error('Ошибка анализа ответов:', error);
      return this._getFallbackAnalysis();
    }
  }

  /**
   * Генерация персональных рекомендаций
   * @param {Object} analysis - Результаты анализа
   * @returns {Promise<Object>} Рекомендации по курсам и развитию
   */
  async generateRecommendations(analysis) {
    const prompt = this._buildRecommendationsPrompt(analysis);
    
    try {
      const response = await this._callGeminiAPI(prompt);
      const recommendations = this._parseRecommendationsFromResponse(response);
      return recommendations;
    } catch (error) {
      console.error('Ошибка генерации рекомендаций:', error);
      return this._getFallbackRecommendations();
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
          temperature: 0.7,
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
   * Построение промпта для генерации вопросов
   * @private
   */
  _buildQuestionPrompt(userProfile, questionCount) {
    return `Ты - эксперт по оценке профессиональных навыков. Создай ${questionCount} вопросов для тестирования навыков в области "${userProfile.field || 'IT'}".

Требования к вопросам:
1. Разные типы вопросов: rating (оценка 1-5), multiple (множественный выбор), text (текстовый ответ)
2. Охватывать разные категории: технические навыки, soft skills, языковые навыки
3. Вопросы должны быть конкретными и измеримыми
4. Уровень сложности: ${userProfile.level || 'средний'}

ВАЖНО: Ответ должен быть СТРОГО в формате JSON без дополнительного текста:
[
  {
    "id": 1,
    "question": "Текст вопроса",
    "type": "rating|multiple|text",
    "category": "Категория",
    "options": ["вариант1", "вариант2"] // только для multiple
  }
]`;
  }

  /**
   * Построение промпта для анализа ответов
   * @private
   */
  _buildAnalysisPrompt(answers, questions) {
    const answersSummary = questions.map((q, idx) => ({
      question: q.question,
      category: q.category,
      type: q.type,
      answer: answers[q.id]
    }));

    return `Проанализируй результаты тестирования пользователя и предоставь детальную оценку.

Вопросы и ответы:
${JSON.stringify(answersSummary, null, 2)}

Предоставь анализ в формате JSON:
{
  "overallScore": число от 0 до 100,
  "categoryScores": {
    "Технические навыки": число,
    "Soft Skills": число,
    "Языковые навыки": число
  },
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "weaknesses": ["слабая сторона 1", "слабая сторона 2"],
  "level": "Начинающий|Средний|Продвинутый|Эксперт",
  "detailedFeedback": "Детальный анализ с выводами"
}`;
  }

  /**
   * Построение промпта для рекомендаций
   * @private
   */
  _buildRecommendationsPrompt(analysis) {
    return `На основе результатов анализа навыков пользователя подбери персональные рекомендации.

Результаты анализа:
${JSON.stringify(analysis, null, 2)}

Предоставь рекомендации в формате JSON:
{
  "courses": [
    {
      "title": "Название курса",
      "description": "Описание курса",
      "category": "Категория",
      "priority": "high|medium|low",
      "estimatedTime": "Время прохождения"
    }
  ],
  "skillsToImprove": [
    {
      "skill": "Навык",
      "currentLevel": "текущий уровень",
      "targetLevel": "целевой уровень",
      "actions": ["действие 1", "действие 2"]
    }
  ],
  "careerPath": {
    "current": "Текущая позиция",
    "potential": ["Возможная позиция 1", "Возможная позиция 2"],
    "roadmap": "Краткий план развития карьеры"
  }
}`;
  }

  /**
   * Парсинг вопросов из ответа AI
   * @private
   */
  _parseQuestionsFromResponse(response) {
    try {
      // Извлекаем JSON из ответа (может быть обернут в markdown)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Ошибка парсинга вопросов:', error);
      return this._getFallbackQuestions();
    }
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
   * Fallback вопросы при ошибке API
   * @private
   */
  _getFallbackQuestions() {
    return [
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
  }

  /**
   * Fallback анализ при ошибке API
   * @private
   */
  _getFallbackAnalysis() {
    return {
      overallScore: 75,
      categoryScores: {
        "Технические навыки": 80,
        "Soft Skills": 70,
        "Языковые навыки": 75
      },
      strengths: [
        "Хорошие базовые знания технологий",
        "Готовность к обучению"
      ],
      weaknesses: [
        "Требуется больше практического опыта",
        "Развитие коммуникативных навыков"
      ],
      level: "Средний",
      detailedFeedback: "Вы показали хорошие базовые знания. Рекомендуется больше практики и работы над реальными проектами."
    };
  }

  /**
   * Fallback рекомендации при ошибке API
   * @private
   */
  _getFallbackRecommendations() {
    return {
      courses: [
        {
          title: "Продвинутый JavaScript",
          description: "Глубокое погружение в современный JavaScript",
          category: "Технические навыки",
          priority: "high",
          estimatedTime: "40 часов"
        },
        {
          title: "Эффективная коммуникация в IT",
          description: "Развитие soft skills для IT-специалистов",
          category: "Soft Skills",
          priority: "medium",
          estimatedTime: "20 часов"
        }
      ],
      skillsToImprove: [
        {
          skill: "React",
          currentLevel: "Средний",
          targetLevel: "Продвинутый",
          actions: [
            "Создать 3 проекта с использованием React Hooks",
            "Изучить продвинутые паттерны React"
          ]
        }
      ],
      careerPath: {
        current: "Junior Developer",
        potential: ["Middle Developer", "Frontend Specialist"],
        roadmap: "Фокус на углубление знаний JavaScript и React, участие в открытых проектах"
      }
    };
  }

  /**
   * Сохранение контекста беседы для более персональных рекомендаций
   */
  addToHistory(userMessage, aiResponse) {
    this.conversationHistory.push({
      user: userMessage,
      ai: aiResponse,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Очистка истории беседы
   */
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Экспорт singleton instance
const aiService = new AIService();
export default aiService;

// Экспорт класса для создания отдельных инстансов
export { AIService };