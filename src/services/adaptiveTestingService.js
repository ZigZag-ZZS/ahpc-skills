// src/services/adaptiveTestingService.js

/**
 * Сервис для адаптивного тестирования с 100-балльной системой оценки
 * Подбирает вопросы на основе выбранных компетенций и уровня пользователя
 */

// Функция для перемешивания массива (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
};


// Обновлённый банк вопросов (по 15 в каждой компетенции)
const QUESTION_BANK = [
  // === ГРАФИЧЕСКИЙ ДИЗАЙН ===
  {
    id: 'gd_b_1',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое цветовая модель RGB и где она применяется?',
    type: 'multiple',
    options: ['Модель для цифровых экранов', 'Модель для печати', 'Модель для веб-безопасных цветов'],
    correctAnswer: 'Модель для цифровых экранов',
    points: 10
  },
  {
    id: 'gd_b_2',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое типографика?',
    type: 'multiple',
    options: ['Искусство оформления текста', 'Система цветов', 'Формат изображения', 'Тип бумаги'],
    correctAnswer: 'Искусство оформления текста',
    points: 10
  },
  {
    id: 'gd_b_3',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что означает понятие “макет” в дизайне?',
    type: 'multiple',
    options: ['Структура и расположение элементов', 'Тип шрифта', 'Цветовая схема'],
    correctAnswer: 'Структура и расположение элементов',
    points: 10
  },
  {
    id: 'gd_b_4',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое растровое изображение?',
    type: 'multiple',
    options: ['Изображение, состоящее из пикселей', 'Изображение, основанное на формулах', 'Сжатый видеофайл'],
    correctAnswer: 'Изображение, состоящее из пикселей',
    points: 10
  },
  {
    id: 'gd_b_5',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое CMYK и где используется эта модель?',
    type: 'multiple',
    options: ['Для печати', 'Для экранов', 'Для 3D-графики'],
    correctAnswer: 'Для печати',
    points: 10
  },
  {
    id: 'gd_i_1',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните принцип контраста и его роль в дизайне',
    type: 'text',
    hint: 'Контраст усиливает визуальную иерархию и читаемость',
    points: 20,
    minLength: 15
  },
  {
    id: 'gd_i_2',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как правильно подбирать цветовую палитру?',
    type: 'text',
    hint: 'Используйте теорию цвета, гармонию и контраст',
    points: 20,
    minLength: 15
  },
  {
    id: 'gd_i_3',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Каково назначение сетки (grid) в макете?',
    type: 'multiple',
    options: ['Организация элементов', 'Выбор шрифтов', 'Оптимизация изображений'],
    correctAnswer: 'Организация элементов',
    points: 20
  },
  {
    id: 'gd_i_4',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое UI Kit?',
    type: 'multiple',
    options: ['Набор интерфейсных компонентов', 'Генератор шрифтов', 'Плагин для Figma'],
    correctAnswer: 'Набор интерфейсных компонентов',
    points: 20
  },
  {
    id: 'gd_i_5',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Опишите принципы композиции в дизайне',
    type: 'text',
    hint: 'Равновесие, центр внимания, ритм, пропорции',
    points: 20,
    minLength: 15
  },
  {
    id: 'gd_e_1',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как разработать дизайн-систему для крупного бренда?',
    type: 'text',
    hint: 'Определите токены, компоненты, документацию',
    points: 30,
    minLength: 15
  },
  {
    id: 'gd_e_2',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как принципы accessibility влияют на UI/UX?',
    type: 'text',
    hint: 'Цветовой контраст, навигация, альтернативный текст',
    points: 30,
    minLength: 15
  },
  {
    id: 'gd_e_3',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Какие метрики используются для оценки эффективности дизайна?',
    type: 'multiple',
    options: ['CTR, Bounce Rate, Time on Page', 'Размер файла', 'Тип макета'],
    correctAnswer: 'CTR, Bounce Rate, Time on Page',
    points: 30
  },
  {
    id: 'gd_e_4',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Опишите процесс бренд-дизайна от идеи до реализации',
    type: 'text',
    hint: 'Анализ, концепт, визуализация, тестирование',
    points: 30,
    minLength: 15
  },
  {
    id: 'gd_e_5',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как использовать motion design для усиления UX?',
    type: 'multiple',
    options: [
      'Добавляет динамику и обратную связь',
      'Снижает читаемость',
      'Заменяет шрифты'
    ],
    correctAnswer: 'Добавляет динамику и обратную связь',
    points: 30
  },

  // === СИСТЕМНОЕ АДМИНИСТРИРОВАНИЕ ===
  {
    id: 'sa_b_1',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое DNS и какова его основная функция?',
    type: 'multiple',
    options: [
      'Преобразование доменных имен в IP-адреса',
      'Мониторинг сети',
      'Резервное копирование'
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
      'Проверка доступности узла',
      'Настройка сети',
      'Измерение скорости'
    ],
    correctAnswer: 'Проверка доступности узла',
    points: 10
  },
  {
    id: 'sa_b_3',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что делает команда ipconfig / ifconfig?',
    type: 'multiple',
    options: [
      'Показывает сетевые настройки устройства',
      'Изменяет права доступа',
      'Очищает кэш DNS'
    ],
    correctAnswer: 'Показывает сетевые настройки устройства',
    points: 10
  },
  {
    id: 'sa_b_4',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое локальная сеть (LAN)?',
    type: 'multiple',
    options: [
      'Сеть внутри одного офиса или здания',
      'Глобальная сеть интернет',
      'Беспроводная технология Bluetooth'
    ],
    correctAnswer: 'Сеть внутри одного офиса или здания',
    points: 10
  },
  {
    id: 'sa_b_5',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое IP-адрес?',
    type: 'multiple',
    options: ['Уникальный идентификатор устройства в сети', 'Пароль', 'Сетевой протокол'],
    correctAnswer: 'Уникальный идентификатор устройства в сети',
    points: 10
  },
  {
    id: 'sa_i_1',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Опишите процесс диагностики проблемы с высокой загрузкой CPU',
    type: 'text',
    hint: 'Используйте top, ps, perf, dstat',
    points: 20,
    minLength: 15
  },
  {
    id: 'sa_i_2',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как настроить автоматическое резервное копирование?',
    type: 'text',
    hint: 'Cron, rsync, snapshot, облачные решения',
    points: 20,
    minLength: 15
  },
  {
    id: 'sa_i_3',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое RAID и какие у него типы?',
    type: 'multiple',
    options: ['RAID 0, 1, 5, 10', 'TCP/IP, UDP', 'HTTP, HTTPS'],
    correctAnswer: 'RAID 0, 1, 5, 10',
    points: 20
  },
  {
    id: 'sa_i_4',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как работает SSH и для чего он используется?',
    type: 'multiple',
    options: [
      'Безопасное удалённое подключение к серверу',
      'Мониторинг сетевого трафика',
      'Передача файлов по HTTP'
    ],
    correctAnswer: 'Безопасное удалённое подключение к серверу',
    points: 20
  },
  {
    id: 'sa_i_5',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как настроить firewall в Linux?',
    type: 'text',
    hint: 'Используйте ufw или iptables, настройте входящие и исходящие правила',
    points: 20,
    minLength: 15
  },
  {
    id: 'sa_e_1',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как построить отказоустойчивую инфраструктуру для веб-приложения?',
    type: 'text',
    hint: 'Используйте балансировщики нагрузки, репликацию, мониторинг',
    points: 30,
    minLength: 15
  },
  {
    id: 'sa_e_2',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Что такое кластеризация и зачем она нужна?',
    type: 'multiple',
    options: [
      'Объединение серверов для повышения производительности и отказоустойчивости',
      'Объединение пользователей в группы',
      'Метод сжатия данных'
    ],
    correctAnswer: 'Объединение серверов для повышения производительности и отказоустойчивости',
    points: 30
  },
  {
    id: 'sa_e_3',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как реализовать мониторинг инфраструктуры?',
    type: 'text',
    hint: 'Используйте Prometheus, Zabbix, Grafana, опишите метрики',
    points: 30,
    minLength: 15
  },
  {
    id: 'sa_e_4',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как выполняется миграция сервисов между дата-центрами?',
    type: 'text',
    hint: 'Оценка, синхронизация данных, тестирование, cutover',
    points: 30,
    minLength: 15
  },
  {
    id: 'sa_e_5',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Какие системы управления конфигурациями вы знаете?',
    type: 'multiple',
    options: ['Ansible, Puppet, Chef', 'MySQL, PostgreSQL', 'React, Vue'],
    correctAnswer: 'Ansible, Puppet, Chef',
    points: 30
  },

  // === ВЕБ-РАЗРАБОТКА ===
  {
    id: 'wd_b_1',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое HTML?',
    type: 'multiple',
    options: ['Язык разметки для структуры страниц', 'Язык программирования', 'База данных'],
    correctAnswer: 'Язык разметки для структуры страниц',
    points: 10
  },
  {
    id: 'wd_b_2',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что делает CSS?',
    type: 'multiple',
    options: ['Отвечает за внешний вид страниц', 'Создает сервер', 'Сохраняет данные'],
    correctAnswer: 'Отвечает за внешний вид страниц',
    points: 10
  },
  {
    id: 'wd_b_3',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое JavaScript?',
    type: 'multiple',
    options: ['Язык программирования для логики веб-страниц', 'Язык для работы с базами данных', 'Фреймворк для дизайна'],
    correctAnswer: 'Язык программирования для логики веб-страниц',
    points: 10
  },
  {
    id: 'wd_b_4',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое адаптивный дизайн (responsive design)?',
    type: 'multiple',
    options: ['Подстройка интерфейса под разные устройства', 'Быстрая загрузка сайта', 'Использование 3D-графики'],
    correctAnswer: 'Подстройка интерфейса под разные устройства',
    points: 10
  },
  {
    id: 'wd_b_5',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое DOM в контексте веб-разработки?',
    type: 'multiple',
    options: ['Структура HTML-документа в виде дерева объектов', 'Фреймворк для серверов', 'Система логирования'],
    correctAnswer: 'Структура HTML-документа в виде дерева объектов',
    points: 10
  },
  {
    id: 'wd_i_1',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как работает Virtual DOM в React?',
    type: 'text',
    hint: 'Сравнение виртуального и реального дерева, обновление диффами',
    points: 20,
    minLength: 15
  },
  {
    id: 'wd_i_2',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое REST API и принципы его построения?',
    type: 'text',
    hint: 'Использование HTTP-методов, статус-кодов и ресурсов',
    points: 20,
    minLength: 15
  },
  {
    id: 'wd_i_3',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое кроссбраузерность?',
    type: 'multiple',
    options: ['Совместимость сайта с разными браузерами', 'Скорость загрузки сайта', 'Тип серверной архитектуры'],
    correctAnswer: 'Совместимость сайта с разными браузерами',
    points: 20
  },
  {
    id: 'wd_i_4',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Для чего используется Webpack?',
    type: 'multiple',
    options: ['Сборка модулей и оптимизация фронтенда', 'Создание API', 'Управление базами данных'],
    correctAnswer: 'Сборка модулей и оптимизация фронтенда',
    points: 20
  },
  {
    id: 'wd_i_5',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Опишите принципы MVC архитектуры в веб-разработке',
    type: 'text',
    hint: 'Model — данные, View — представление, Controller — логика',
    points: 20,
    minLength: 15
  },
  {
    id: 'wd_e_1',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как реализовать SSR (Server Side Rendering)?',
    type: 'text',
    hint: 'Next.js, Nuxt, преимущества SEO и скорости загрузки',
    points: 30,
    minLength: 15
  },
  {
    id: 'wd_e_2',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Что такое микросервисная архитектура?',
    type: 'text',
    hint: 'Разделение приложения на независимые сервисы',
    points: 30,
    minLength: 15
  },
  {
    id: 'wd_e_3',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Какие методы оптимизации производительности сайта существуют?',
    type: 'multiple',
    options: ['Кэширование, lazy loading, сжатие', 'Добавление шрифтов', 'Удаление JS'],
    correctAnswer: 'Кэширование, lazy loading, сжатие',
    points: 30
  },
  {
    id: 'wd_e_4',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как обеспечить безопасность REST API?',
    type: 'text',
    hint: 'Аутентификация, валидация данных, ограничение запросов',
    points: 30,
    minLength: 15
  },
  {
    id: 'wd_e_5',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Что такое Progressive Web App и её преимущества?',
    type: 'multiple',
    options: ['Работа офлайн, push-уведомления, установка на экран', 'Быстрая индексация в Google', 'Разработка на Python'],
    correctAnswer: 'Работа офлайн, push-уведомления, установка на экран',
    points: 30
  },

  // === МОБИЛЬНАЯ РАЗРАБОТКА ===
  {
    id: 'md_b_1',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'В чем разница между нативной и кроссплатформенной разработкой?',
    type: 'multiple',
    options: [
      'Нативная использует языки платформы',
      'Кроссплатформенная не поддерживает UI',
      'Нативная требует сервер'
    ],
    correctAnswer: 'Нативная использует языки платформы',
    points: 10
  },
  {
    id: 'md_b_2',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое Activity в Android?',
    type: 'multiple',
    options: [
      'Экран приложения с пользовательским интерфейсом',
      'Фоновая служба',
      'Сценарий запуска приложения'
    ],
    correctAnswer: 'Экран приложения с пользовательским интерфейсом',
    points: 10
  },
  {
    id: 'md_b_3',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что делает View в Android?',
    type: 'multiple',
    options: ['Отображает элемент интерфейса', 'Запускает сервер', 'Хранит базу данных'],
    correctAnswer: 'Отображает элемент интерфейса',
    points: 10
  },
  {
    id: 'md_b_4',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое Intent в Android?',
    type: 'multiple',
    options: ['Механизм взаимодействия компонентов приложения', 'Тип данных', 'Файл конфигурации'],
    correctAnswer: 'Механизм взаимодействия компонентов приложения',
    points: 10
  },
  {
    id: 'md_b_5',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое storyboard в iOS-разработке?',
    type: 'multiple',
    options: ['Визуальный редактор экранов и переходов', 'Файл конфигурации', 'Сценарий анимации'],
    correctAnswer: 'Визуальный редактор экранов и переходов',
    points: 10
  },
  {
    id: 'md_i_1',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как оптимизировать производительность мобильного приложения?',
    type: 'text',
    hint: 'Оптимизация памяти, запросов и интерфейса',
    points: 20,
    minLength: 15
  },
  {
    id: 'md_i_2',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните жизненный цикл Activity в Android',
    type: 'text',
    hint: 'onCreate, onStart, onResume, onPause, onStop, onDestroy',
    points: 20,
    minLength: 15
  },
  {
    id: 'md_i_3',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое ViewModel в архитектуре MVVM?',
    type: 'multiple',
    options: [
      'Компонент, управляющий логикой и состоянием UI',
      'Файл макета экрана',
      'API-интерфейс'
    ],
    correctAnswer: 'Компонент, управляющий логикой и состоянием UI',
    points: 20
  },
  {
    id: 'md_i_4',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как реализуется локальное хранение данных?',
    type: 'multiple',
    options: ['SQLite, SharedPreferences, Room', 'HTTP, JSON, XML', 'Docker, Nginx, Redis'],
    correctAnswer: 'SQLite, SharedPreferences, Room',
    points: 20
  },
  {
    id: 'md_i_5',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как реализовать push-уведомления в приложении?',
    type: 'text',
    hint: 'Используйте FCM, OneSignal или APNS',
    points: 20,
    minLength: 15
  },
  {
    id: 'md_e_1',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Разработайте архитектуру offline-first приложения',
    type: 'text',
    hint: 'Учитывайте кэширование, синхронизацию, конфликты данных',
    points: 30,
    minLength: 15
  },
  {
    id: 'md_e_2',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как реализовать CI/CD для мобильного проекта?',
    type: 'multiple',
    options: ['Использовать GitHub Actions, Fastlane, Firebase App Distribution', 'Загружать вручную', 'Коммитить без тестов'],
    correctAnswer: 'Использовать GitHub Actions, Fastlane, Firebase App Distribution',
    points: 30
  },
  {
    id: 'md_e_3',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как улучшить безопасность мобильного приложения?',
    type: 'text',
    hint: 'Обфускация, проверка подписи, безопасное хранение токенов',
    points: 30,
    minLength: 15
  },
  {
    id: 'md_e_4',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как реализовать архитектуру Clean Architecture?',
    type: 'text',
    hint: 'Разделите уровни: data, domain, presentation',
    points: 30,
    minLength: 15
  },
  {
    id: 'md_e_5',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как оптимизировать сетевые запросы?',
    type: 'multiple',
    options: ['Кэширование, батчинг, компрессия', 'Добавление логов', 'Удаление API'],
    correctAnswer: 'Кэширование, батчинг, компрессия',
    points: 30
  },

  // === DATA SCIENCE ===
  {
    id: 'ds_b_1',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое переобучение (overfitting)?',
    type: 'multiple',
    options: ['Модель слишком хорошо учится на обучающих данных', 'Недостаток данных', 'Ошибка ввода'],
    correctAnswer: 'Модель слишком хорошо учится на обучающих данных',
    points: 10
  },
  {
    id: 'ds_b_2',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое датасет?',
    type: 'multiple',
    options: ['Набор данных для обучения', 'Модель нейронной сети', 'Библиотека Python'],
    correctAnswer: 'Набор данных для обучения',
    points: 10
  },
  {
    id: 'ds_b_3',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что делает библиотека Pandas?',
    type: 'multiple',
    options: ['Работает с таблицами и анализом данных', 'Создает графики', 'Рисует изображения'],
    correctAnswer: 'Работает с таблицами и анализом данных',
    points: 10
  },
  {
    id: 'ds_b_4',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое NumPy?',
    type: 'multiple',
    options: ['Библиотека для численных вычислений', 'Фреймворк для UI', 'Язык программирования'],
    correctAnswer: 'Библиотека для численных вычислений',
    points: 10
  },
  {
    id: 'ds_b_5',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что делает функция train_test_split?',
    type: 'multiple',
    options: ['Разделяет данные на обучающую и тестовую выборки', 'Удаляет пустые значения', 'Сохраняет модель'],
    correctAnswer: 'Разделяет данные на обучающую и тестовую выборки',
    points: 10
  },
  {
    id: 'ds_i_1',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните разницу между supervised и unsupervised learning',
    type: 'text',
    hint: 'Supervised использует метки, unsupervised — нет',
    points: 20,
    minLength: 15
  },
  {
    id: 'ds_i_2',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что такое feature engineering?',
    type: 'text',
    hint: 'Создание и отбор признаков для улучшения модели',
    points: 20,
    minLength: 15
  },
  {
    id: 'ds_i_3',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Какие метрики применяются для классификации?',
    type: 'multiple',
    options: ['Accuracy, Precision, Recall, F1', 'Mean, Median', 'Loss'],
    correctAnswer: 'Accuracy, Precision, Recall, F1',
    points: 20
  },
  {
    id: 'ds_i_4',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Что делает библиотека Scikit-learn?',
    type: 'multiple',
    options: ['Инструменты для машинного обучения', 'Генератор визуализаций', 'Редактор данных'],
    correctAnswer: 'Инструменты для машинного обучения',
    points: 20
  },
  {
    id: 'ds_i_5',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как обрабатывать пропущенные значения в данных?',
    type: 'text',
    hint: 'Удаление, заполнение средним, медианой или предсказанием',
    points: 20,
    minLength: 15
  },
  {
    id: 'ds_e_1',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Разработайте ML pipeline для продакшена',
    type: 'text',
    hint: 'Этапы: сбор данных, обучение, деплой, мониторинг',
    points: 30,
    minLength: 15
  },
  {
    id: 'ds_e_2',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как оптимизировать гиперпараметры модели?',
    type: 'multiple',
    options: ['GridSearchCV, RandomSearch, Bayesian Optimization', 'Random Forest', 'Dropout'],
    correctAnswer: 'GridSearchCV, RandomSearch, Bayesian Optimization',
    points: 30
  },
  {
    id: 'ds_e_3',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как использовать кросс-валидацию и зачем она нужна?',
    type: 'text',
    hint: 'Для проверки обобщающей способности модели',
    points: 30,
    minLength: 15
  },
  {
    id: 'ds_e_4',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как реализовать мониторинг качества ML модели в продакшене?',
    type: 'text',
    hint: 'Используйте drift detection, retraining pipeline',
    points: 30,
    minLength: 15
  },
  {
    id: 'ds_e_5',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Какие типы нейронных сетей применяются для разных задач?',
    type: 'multiple',
    options: ['CNN — изображение, RNN — текст, GAN — генерация', 'SQL — анализ', 'HTML — структура'],
    correctAnswer: 'CNN — изображение, RNN — текст, GAN — генерация',
    points: 30
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
        if (question.type === 'multiple' && question.options) {
          question.shuffledOptions = shuffleArray(question.options);
        }
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