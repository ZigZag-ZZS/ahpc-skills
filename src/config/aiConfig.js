export const AI_CONFIG = {
  // Настройки API
  api: {
    provider: 'gemini', // gemini, openai, claude
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    timeout: 30000, // 30 секунд
    retryAttempts: 3,
    retryDelay: 1000 // 1 секунда
  },

  // Настройки генерации
  generation: {
    temperature: 0.7, // Креативность (0-1)
    maxTokens: 2048,
    topP: 0.95,
    topK: 40
  },

  // Категории навыков
  categories: [
    'Технические навыки',
    'Soft Skills',
    'Языковые навыки',
    'Управление проектами',
    'Аналитические навыки',
    'Дизайн и UX',
    'Маркетинг',
    'Продажи'
  ],

  // Типы вопросов
  questionTypes: {
    rating: {
      label: 'Оценка',
      description: 'Оценка по шкале от 1 до 5'
    },
    multiple: {
      label: 'Множественный выбор',
      description: 'Выбор нескольких вариантов'
    },
    text: {
      label: 'Текстовый ответ',
      description: 'Развернутый ответ'
    },
    singleChoice: {
      label: 'Единственный выбор',
      description: 'Выбор одного варианта'
    }
  },

  // Уровни навыков
  skillLevels: [
    { value: 'beginner', label: 'Начинающий', score: 0 },
    { value: 'basic', label: 'Базовый', score: 25 },
    { value: 'intermediate', label: 'Средний', score: 50 },
    { value: 'advanced', label: 'Продвинутый', score: 75 },
    { value: 'expert', label: 'Эксперт', score: 100 }
  ],

  // Приоритеты рекомендаций
  priorities: {
    high: { label: 'Высокий', color: '#ef4444' },
    medium: { label: 'Средний', color: '#f59e0b' },
    low: { label: 'Низкий', color: '#10b981' }
  }
};