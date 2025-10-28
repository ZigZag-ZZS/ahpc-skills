import coursesData from '../courses.json';

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
    this.courses = coursesData; // Загружаем курсы из файла
  }

  /**
   * Генерация следующего вопроса на основе истории ответов
   */
  async generateNextQuestion(previousAnswers, questionNumber) {
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

    const prompt = this._buildAdaptiveQuestionPrompt(previousAnswers, questionNumber);
    
    try {
      const response = await this._callGeminiAPI(prompt);
      const question = this._parseQuestionFromResponse(response, questionNumber);
      
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
   */
  _buildAdaptiveQuestionPrompt(previousAnswers, questionNumber) {
    const answersContext = previousAnswers.map((item, idx) => ({
      questionNum: idx + 1,
      question: item.question,
      answer: item.answer,
      category: item.category
    }));

    const totalQuestions = 12;
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

ВАЖНО: Отвечай ТОЛЬКО JSON без дополнительного текста!`;
  }

  /**
   * Парсинг вопроса из ответа AI
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
          reasoning: parsed.reasoning
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
   * Глубокий анализ всех ответов
   */
  async analyzeAnswers(answers, questions) {
    const userName = answers['profile_name'] || 'Пользователь';
    const userRole = answers['profile_role']?.[0] || 'Специалист';
    
    const conversationFlow = questions.map((q, idx) => ({
      questionNumber: idx + 1,
      question: q.question,
      category: q.category,
      type: q.type,
      answer: answers[q.id],
      reasoning: q.reasoning
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
  "learningStyle": "Описание предпочитаемого стиля обучения",
  "interestAreas": [
    "Область интереса 1 (для подбора курсов)",
    "Область интереса 2"
  ]
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
   * НОВЫЙ МЕТОД: Подбор курсов из базы на основе анализа
   */
  _matchCoursesToProfile(analysis) {
    const interestAreas = analysis.interestAreas || [];
    const weaknesses = analysis.weaknesses || [];
    const strengths = analysis.strengths || [];
    
    // Собираем ключевые слова для поиска
    const keywords = [
      ...interestAreas,
      ...weaknesses.map(w => w.toLowerCase()),
      ...strengths.map(s => s.toLowerCase())
    ].join(' ');

    // Маппинг ключевых слов к областям курсов
    const searchTerms = {
      'программирование': ['python', 'разработчик', 'программирование', 'javascript', 'java', 'frontend', 'backend'],
      'дизайн': ['дизайн', 'ui', 'ux', 'графический', 'веб-дизайн', 'иллюстрация'],
      'аналитика': ['аналитик', 'data', 'данных', 'sql', 'excel', 'bi'],
      'маркетинг': ['маркетинг', 'smm', 'реклама', 'продвижение', 'контент'],
      'управление': ['менеджер', 'управление', 'проект', 'продакт', 'лидерство'],
      'тестирование': ['тестирование', 'qa', 'тестировщик'],
      'финансы': ['финансы', 'бухгалтер', 'инвестиции', 'экономика']
    };

    // Определяем области интересов пользователя
    const userInterests = [];
    for (const [area, terms] of Object.entries(searchTerms)) {
      if (terms.some(term => keywords.toLowerCase().includes(term))) {
        userInterests.push(area);
      }
    }

    // Если не нашли интересов, используем общие курсы
    if (userInterests.length === 0) {
      userInterests.push('программирование', 'аналитика');
    }

    // Фильтруем и ранжируем курсы
    const matchedCourses = this.courses
      .map(course => {
        let relevanceScore = 0;
        const courseText = `${course.title} ${course.description}`.toLowerCase();
        
        // Подсчитываем релевантность
        userInterests.forEach(interest => {
          const terms = searchTerms[interest] || [];
          terms.forEach(term => {
            if (courseText.includes(term)) {
              relevanceScore += 10;
            }
          });
        });

        // Бонус за упоминание слабых сторон
        weaknesses.forEach(weakness => {
          const weaknessWords = weakness.toLowerCase().split(' ');
          weaknessWords.forEach(word => {
            if (word.length > 3 && courseText.includes(word)) {
              relevanceScore += 5;
            }
          });
        });

        return {
          ...course,
          relevanceScore
        };
      })
      .filter(course => course.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Топ-5 курсов

    return matchedCourses;
  }

  /**
   * УЛУЧШЕННЫЙ МЕТОД: Генерация рекомендаций с реальными курсами
   */
  async generateRecommendations(analysis) {
    // Сначала подбираем подходящие курсы из базы
    const matchedCourses = this._matchCoursesToProfile(analysis);
    
    // Формируем список курсов для передачи в промпт
    const coursesContext = matchedCourses.map(c => ({
      title: c.title,
      description: c.description || 'Курс для развития навыков',
      link: c.link
    }));

    const prompt = `На основе детального анализа создай ПЕРСОНАЛЬНЫЕ рекомендации для пользователя.

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(analysis, null, 2)}

ДОСТУПНЫЕ КУРСЫ ИЗ БАЗЫ:
${JSON.stringify(coursesContext, null, 2)}

ЗАДАЧА:
Выбери из ДОСТУПНЫХ КУРСОВ самые подходящие для пользователя и создай план развития.

ВАЖНО: 
- Используй ТОЛЬКО курсы из списка "ДОСТУПНЫЕ КУРСЫ ИЗ БАЗЫ"
- Для каждого курса объясни, ПОЧЕМУ он подходит этому конкретному пользователю
- Расставь приоритеты на основе слабых сторон и интересов

ФОРМАТ ОТВЕТА (строго JSON):
{
  "courses": [
    {
      "title": "Точное название курса из базы",
      "description": "Оригинальное описание курса",
      "link": "Ссылка на курс",
      "category": "Определи категорию курса",
      "priority": "high|medium|low - на основе срочности для пользователя",
      "estimatedTime": "Предположительное время",
      "matchReason": "ДЕТАЛЬНОЕ объяснение почему ЭТОТ курс подходит ЭТОМУ пользователю с учетом его сильных/слабых сторон и интересов",
      "skills": ["навык1", "навык2"]
    }
  ],
  "skillsToImprove": [
    {
      "skill": "Конкретный навык из анализа",
      "currentLevel": "Текущий уровень из анализа",
      "targetLevel": "Целевой уровень",
      "actions": [
        "Конкретное действие 1",
        "Конкретное действие 2"
      ],
      "recommendedCourses": ["Название курса из списка который поможет"]
    }
  ],
  "careerPath": {
    "current": "Текущая позиция пользователя",
    "potential": [
      "Реалистичная позиция 1 на основе анализа",
      "Реалистичная позиция 2"
    ],
    "roadmap": "Детальный план развития с этапами"
  },
  "shortTermGoals": [
    "Цель на 1-3 месяца с привязкой к курсам"
  ],
  "longTermGoals": [
    "Цель на 6-12 месяцев"
  ],
  "personalizedAdvice": "Персональный совет на основе личности и мотивации пользователя"
}

КРИТИЧЕСКИ ВАЖНО: 
- Выбери 3-5 САМЫХ ПОДХОДЯЩИХ курсов из списка
- НЕ выдумывай курсы - используй только из базы
- Объясни matchReason максимально конкретно под этого пользователя`;

    try {
      const response = await this._callGeminiAPI(prompt);
      const recommendations = this._parseRecommendationsFromResponse(response);
      
      // Проверяем, что все рекомендованные курсы есть в нашей базе
      if (recommendations.courses) {
        recommendations.courses = recommendations.courses
          .map(recCourse => {
            const originalCourse = matchedCourses.find(
              c => c.title.toLowerCase().includes(recCourse.title.toLowerCase()) ||
                   recCourse.title.toLowerCase().includes(c.title.toLowerCase())
            );
            
            if (originalCourse) {
              return {
                ...recCourse,
                link: originalCourse.link, // Используем оригинальную ссылку
                description: originalCourse.description || recCourse.description
              };
            }
            return null;
          })
          .filter(c => c !== null)
          .slice(0, 5); // Максимум 5 курсов
      }
      
      return recommendations;
    } catch (error) {
      console.error('Ошибка генерации рекомендаций:', error);
      return this._getFallbackRecommendationsWithCourses(analysis, matchedCourses);
    }
  }

  /**
   * Fallback рекомендации с реальными курсами
   */
  _getFallbackRecommendationsWithCourses(analysis, matchedCourses) {
    const topCourses = matchedCourses.slice(0, 3).map(course => ({
      title: course.title,
      description: course.description || 'Курс для развития профессиональных навыков',
      link: course.link,
      category: this._detectCourseCategory(course.title),
      priority: 'high',
      estimatedTime: '20-40 часов',
      matchReason: `Этот курс поможет вам развить навыки в области ${this._detectCourseCategory(course.title).toLowerCase()}`,
      skills: ['Профессиональное развитие']
    }));

    return {
      courses: topCourses,
      skillsToImprove: [
        {
          skill: analysis.weaknesses?.[0] || "Профессиональное развитие",
          currentLevel: "Базовый",
          targetLevel: "Продвинутый",
          actions: ["Пройти рекомендованные курсы", "Практиковать полученные знания"],
          recommendedCourses: topCourses.map(c => c.title)
        }
      ],
      careerPath: {
        current: analysis.userRole,
        potential: ["Специалист среднего уровня", "Руководитель проектов"],
        roadmap: "Сфокусируйтесь на развитии ключевых навыков через практику и обучение"
      },
      shortTermGoals: [`Начать обучение на курсе "${topCourses[0]?.title}"`],
      longTermGoals: ["Достичь уровня эксперта в выбранной области"],
      personalizedAdvice: `Рекомендуем начать с курса "${topCourses[0]?.title}" для укрепления базовых навыков.`
    };
  }

  /**
   * Определение категории курса по названию
   */
  _detectCourseCategory(title) {
    const categories = {
      'Программирование': ['python', 'javascript', 'java', 'разработчик', 'developer', 'программирование'],
      'Дизайн': ['дизайн', 'ui', 'ux', 'графический', 'веб-дизайн'],
      'Аналитика': ['аналитик', 'data', 'данных', 'аналитика', 'sql'],
      'Маркетинг': ['маркетинг', 'smm', 'реклама', 'продвижение'],
      'Управление': ['менеджер', 'управление', 'проект', 'продакт'],
      'Финансы': ['финансы', 'бухгалтер', 'инвестиции']
    };

    const lowerTitle = title.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return category;
      }
    }
    return 'Профессиональное развитие';
  }

  /**
   * Вызов Gemini API
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
          temperature: 0.8,
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
      motivationFactors: ["Личностный рост", "Профессиональное развитие"],
      interestAreas: ["Программирование", "Аналитика"]
    };
  }

  /**
   * Fallback рекомендации
   */
  _getFallbackRecommendations(userRole = 'Специалист') {
    const randomCourses = this.courses
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(course => ({
        title: course.title,
        description: course.description || 'Курс для профессионального развития',
        link: course.link,
        category: this._detectCourseCategory(course.title),
        priority: 'medium',
        estimatedTime: '30 часов',
        matchReason: "Подходит для вашего уровня развития"
      }));

    return {
      courses: randomCourses,
      skillsToImprove: [
        {
          skill: "Профессиональное развитие",
          currentLevel: "Базовый",
          targetLevel: "Продвинутый",
          actions: ["Пройти рекомендованные курсы", "Практиковать навыки"]
        }
      ],
      careerPath: {
        current: userRole,
        potential: ["Специалист среднего уровня"],
        roadmap: "Развивайте навыки постепенно"
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

const aiService = new AIService();
export default aiService;

export { AIService };