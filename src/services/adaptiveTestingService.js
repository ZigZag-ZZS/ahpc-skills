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
    id: 'do_b_2',
    competency: 'devops',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое контейнер в контексте Docker?',
    type: 'multiple',
    options: [
      'Изолированная среда для запуска приложений',
      'Виртуальная машина',
      'Система управления версиями',
      'База данных'
    ],
    correctAnswer: 'Изолированная среда для запуска приложений',
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
  },
  {
    id: 'do_i_2',
    competency: 'devops',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Какие инструменты используются для мониторинга в DevOps?',
    type: 'text',
    hint: 'Упомяните популярные решения и их возможности',
    points: 20,
    minLength: 15
  },
  {
    id: 'do_e_1',
    competency: 'devops',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как реализовать blue-green deployment и в чем его преимущества?',
    type: 'text',
    hint: 'Опишите процесс и сравните с другими стратегиями развертывания',
    points: 30,
    minLength: 15
  },

  // Управление проектами
  {
    id: 'pm_b_1',
    competency: 'project_management',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое Agile методология?',
    type: 'multiple',
    options: [
      'Итеративный подход к разработке с гибкостью',
      'Жесткий план проекта без изменений',
      'Метод управления финансами',
      'Система контроля версий'
    ],
    correctAnswer: 'Итеративный подход к разработке с гибкостью',
    points: 10
  },
  {
    id: 'pm_b_2',
    competency: 'project_management',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое спринт в Scrum?',
    type: 'multiple',
    options: [
      'Фиксированный период времени для выполнения задач',
      'Финальная стадия проекта',
      'Тип встречи команды',
      'Документ с требованиями'
    ],
    correctAnswer: 'Фиксированный период времени для выполнения задач',
    points: 10
  },
  {
    id: 'pm_i_1',
    competency: 'project_management',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните разницу между Scrum и Kanban',
    type: 'text',
    hint: 'Сравните подходы к планированию, ролям и процессам',
    points: 20,
    minLength: 15
  },
  {
    id: 'pm_i_2',
    competency: 'project_management',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как вы управляете рисками в проекте?',
    type: 'text',
    hint: 'Опишите процесс идентификации, оценки и митигации',
    points: 20,
    minLength: 15
  },
  {
    id: 'pm_e_1',
    competency: 'project_management',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как масштабировать Agile на уровне организации?',
    type: 'text',
    hint: 'Рассмотрите фреймворки SAFe, LeSS или другие подходы',
    points: 30,
    minLength: 15
  },

  // Кибербезопасность
  {
    id: 'cs_b_1',
    competency: 'cybersecurity',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое SQL-инъекция?',
    type: 'multiple',
    options: [
      'Внедрение вредоносного SQL-кода в запросы',
      'Метод оптимизации базы данных',
      'Способ шифрования данных',
      'Тип резервного копирования'
    ],
    correctAnswer: 'Внедрение вредоносного SQL-кода в запросы',
    points: 10
  },
  {
    id: 'cs_b_2',
    competency: 'cybersecurity',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое двухфакторная аутентификация?',
    type: 'multiple',
    options: [
      'Использование двух методов подтверждения личности',
      'Двойная проверка пароля',
      'Шифрование в два этапа',
      'Резервная копия данных'
    ],
    correctAnswer: 'Использование двух методов подтверждения личности',
    points: 10
  },
  {
    id: 'cs_i_1',
    competency: 'cybersecurity',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Опишите основные принципы защиты веб-приложений',
    type: 'text',
    hint: 'Рассмотрите OWASP Top 10 и методы защиты',
    points: 20,
    minLength: 15
  },
  {
    id: 'cs_i_2',
    competency: 'cybersecurity',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как работает XSS атака и как от нее защититься?',
    type: 'text',
    hint: 'Объясните механизм и методы предотвращения',
    points: 20,
    minLength: 15
  },
  {
    id: 'cs_e_1',
    competency: 'cybersecurity',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Разработайте стратегию реагирования на инциденты безопасности',
    type: 'text',
    hint: 'Включите обнаружение, анализ, сдерживание и восстановление',
    points: 30,
    minLength: 15
  },

  // Облачные технологии
  {
    id: 'cc_b_1',
    competency: 'cloud_computing',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое IaaS (Infrastructure as a Service)?',
    type: 'multiple',
    options: [
      'Предоставление виртуализированных вычислительных ресурсов',
      'Готовое программное обеспечение в облаке',
      'Платформа для разработки приложений',
      'Система хранения данных'
    ],
    correctAnswer: 'Предоставление виртуализированных вычислительных ресурсов',
    points: 10
  },
  {
    id: 'cc_b_2',
    competency: 'cloud_computing',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое автомасштабирование в облаке?',
    type: 'multiple',
    options: [
      'Автоматическое изменение ресурсов по нагрузке',
      'Увеличение размера хранилища',
      'Обновление программного обеспечения',
      'Резервное копирование данных'
    ],
    correctAnswer: 'Автоматическое изменение ресурсов по нагрузке',
    points: 10
  },
  {
    id: 'cc_i_1',
    competency: 'cloud_computing',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните разницу между IaaS, PaaS и SaaS',
    type: 'text',
    hint: 'Приведите примеры сервисов для каждой модели',
    points: 20,
    minLength: 15
  },
  {
    id: 'cc_i_2',
    competency: 'cloud_computing',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как оптимизировать затраты на облачную инфраструктуру?',
    type: 'text',
    hint: 'Рассмотрите резервирование, автомасштабирование, мониторинг',
    points: 20,
    minLength: 15
  },
  {
    id: 'cc_e_1',
    competency: 'cloud_computing',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Разработайте multi-cloud стратегию для enterprise приложения',
    type: 'text',
    hint: 'Учитывайте отказоустойчивость, безопасность, управление',
    points: 30,
    minLength: 15
  },

  // Программирование
  {
    id: 'pr_b_1',
    competency: 'programming',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое переменная в программировании?',
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
    id: 'pr_b_2',
    competency: 'programming',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое массив?',
    type: 'multiple',
    options: [
      'Упорядоченная коллекция элементов',
      'Тип цикла',
      'Условный оператор',
      'Функция обработки строк'
    ],
    correctAnswer: 'Упорядоченная коллекция элементов',
    points: 10
  },
  {
    id: 'pr_i_1',
    competency: 'programming',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните концепцию рекурсии и приведите пример использования',
    type: 'text',
    hint: 'Опишите базовый и рекурсивный случаи',
    points: 20,
    minLength: 15
  },
  {
    id: 'pr_i_2',
    competency: 'programming',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'В чем разница между стеком и очередью?',
    type: 'text',
    hint: 'Опишите принципы работы и примеры применения',
    points: 20,
    minLength: 15
  },
  {
    id: 'pr_e_1',
    competency: 'programming',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Объясните принципы SOLID и их применение в ООП',
    type: 'text',
    hint: 'Раскройте каждый принцип с примерами',
    points: 30,
    minLength: 15
  },

  // Дополнительные вопросы для существующих компетенций
  
  // Графический дизайн - дополнительные
  {
    id: 'gd_b_3',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое типографика?',
    type: 'multiple',
    options: [
      'Искусство оформления текста',
      'Редактор изображений',
      'Цветовая схема',
      'Формат файла'
    ],
    correctAnswer: 'Искусство оформления текста',
    points: 10
  },
  {
    id: 'gd_i_2',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните принцип золотого сечения в дизайне',
    type: 'text',
    hint: 'Опишите применение и визуальное воздействие',
    points: 20,
    minLength: 15
  },
  {
    id: 'gd_e_2',
    competency: 'graphic_design',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Разработайте дизайн-систему для крупного проекта',
    type: 'text',
    hint: 'Включите компоненты, цвета, типографику, иконки',
    points: 30,
    minLength: 15
  },

  // Системное администрирование - дополнительные
  {
    id: 'sa_b_3',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое IP-адрес?',
    type: 'multiple',
    options: [
      'Уникальный идентификатор устройства в сети',
      'Пароль доступа к системе',
      'Тип протокола',
      'Версия операционной системы'
    ],
    correctAnswer: 'Уникальный идентификатор устройства в сети',
    points: 10
  },
  {
    id: 'sa_i_2',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как настроить автоматическое резервное копирование?',
    type: 'text',
    hint: 'Опишите инструменты и стратегию бэкапов',
    points: 20,
    minLength: 15
  },
  {
    id: 'sa_e_2',
    competency: 'system_admin',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Создайте план миграции сервисов в новый дата-центр',
    type: 'text',
    hint: 'Учитывайте минимизацию простоя и тестирование',
    points: 30,
    minLength: 15
  },

  // Веб-разработка - дополнительные
  {
    id: 'wd_b_3',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое responsive design?',
    type: 'multiple',
    options: [
      'Адаптация интерфейса под разные устройства',
      'Быстрая загрузка страниц',
      'Интерактивные элементы',
      'Анимация на сайте'
    ],
    correctAnswer: 'Адаптация интерфейса под разные устройства',
    points: 10
  },
  {
    id: 'wd_i_2',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните принципы работы REST API',
    type: 'text',
    hint: 'Опишите HTTP методы и структуру запросов',
    points: 20,
    minLength: 15
  },
  {
    id: 'wd_e_2',
    competency: 'web_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Как оптимизировать производительность веб-приложения?',
    type: 'text',
    hint: 'Рассмотрите кэширование, lazy loading, оптимизацию запросов',
    points: 30,
    minLength: 15
  },

  // Мобильная разработка - дополнительные
  {
    id: 'md_b_2',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое Activity в Android?',
    type: 'multiple',
    options: [
      'Экран приложения с пользовательским интерфейсом',
      'База данных приложения',
      'Фоновый сервис',
      'Системное уведомление'
    ],
    correctAnswer: 'Экран приложения с пользовательским интерфейсом',
    points: 10
  },
  {
    id: 'md_i_2',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Объясните жизненный цикл мобильного приложения',
    type: 'text',
    hint: 'Опишите состояния и переходы между ними',
    points: 20,
    minLength: 15
  },
  {
    id: 'md_e_1',
    competency: 'mobile_dev',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Разработайте архитектуру offline-first приложения',
    type: 'text',
    hint: 'Учитывайте синхронизацию, конфликты данных, хранение',
    points: 30,
    minLength: 15
  },

  // Data Science - дополнительные
  {
    id: 'ds_b_2',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    question: 'Что такое датасет в машинном обучении?',
    type: 'multiple',
    options: [
      'Набор данных для обучения модели',
      'Алгоритм обработки данных',
      'Инструмент визуализации',
      'Тип нейронной сети'
    ],
    correctAnswer: 'Набор данных для обучения модели',
    points: 10
  },
  {
    id: 'ds_i_2',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    question: 'Как провести feature engineering для улучшения модели?',
    type: 'text',
    hint: 'Опишите методы создания и отбора признаков',
    points: 20,
    minLength: 15
  },
  {
    id: 'ds_e_1',
    competency: 'data_science',
    difficulty: DIFFICULTY_LEVELS.EXPERT,
    question: 'Разработайте pipeline для production ML модели',
    type: 'text',
    hint: 'Включите обучение, валидацию, деплой, мониторинг',
    points: 30,
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