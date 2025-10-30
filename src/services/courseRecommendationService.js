// src/services/courseRecommendationService.js

import coursesData from '../data/courses.json';

/**
 * Сервис для рекомендации курсов на основе результатов тестирования
 */
class CourseRecommendationService {
  constructor() {
    this.courses = coursesData;
    
    // Маппинг компетенций на ключевые слова для поиска курсов
    this.competencyKeywords = {
      'graphic_design': ['дизайн', 'графический', 'иллюстр', 'photoshop', 'illustrator', 'figma', 'веб-дизайн', 'motion', 'UX/UI'],
      'system_admin': ['администр', 'linux', 'сервер', 'сеть', 'devops', 'инфраструктур'],
      'web_dev': ['веб-разработ', 'frontend', 'backend', 'fullstack', 'javascript', 'react', 'html', 'css', 'php', 'python'],
      'mobile_dev': ['мобильн', 'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin'],
      'data_science': ['data', 'данных', 'аналитик', 'machine learning', 'python', 'sql', 'analyst', 'scientist', 'BI', 'power bi', 'tableau'],
      'devops': ['devops', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'автоматизац'],
      'project_management': ['проект', 'менеджер', 'управлен', 'agile', 'scrum', 'product', 'продакт'],
      'cybersecurity': ['безопасност', 'кибербезопасност', 'защит', 'хакер', 'пентест'],
      'cloud_computing': ['облачн', 'cloud', 'aws', 'azure', 'google cloud'],
      'programming': ['программирован', 'разработ', 'developer', 'c++', 'java', 'python', 'c#', '1c']
    };

    // Уровни сложности курсов
    this.courseLevels = {
      beginner: ['с нуля', 'базов', 'начинающ', 'основы', 'введение', 'start'],
      intermediate: ['продвинут', 'pro', 'middle', 'практик'],
      expert: ['эксперт', 'senior', 'мастер', 'professional', 'advanced']
    };
  }

  /**
   * Получить рекомендации курсов на основе результатов тестирования
   */
  getRecommendations(testResults, userRole = 'Студент', maxCourses = 6) {
    const recommendations = [];
    const competencyResults = testResults.competencyResults || {};

    // Сортируем компетенции по приоритету (от низких баллов к высоким)
    const sortedCompetencies = Object.entries(competencyResults)
      .sort(([, a], [, b]) => a.score - b.score);

    sortedCompetencies.forEach(([competency, data]) => {
      const level = this.mapScoreToLevel(data.score);
      const coursesForCompetency = this.findCoursesForCompetency(
        competency, 
        level,
        data.score
      );

      recommendations.push({
        competency,
        competencyName: this.getCompetencyName(competency),
        score: data.score,
        level: data.level,
        recommendedLevel: level,
        courses: coursesForCompetency.slice(0, 3),
        priority: this.calculatePriority(data.score, data.questionsAsked)
      });
    });

    // Сортируем по приоритету и ограничиваем количество
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxCourses);
  }

  /**
   * Маппинг баллов на уровень сложности курса
   */
  mapScoreToLevel(score) {
    if (score < 40) return 'beginner';
    if (score < 70) return 'intermediate';
    return 'expert';
  }

  /**
   * Расчет приоритета компетенции для рекомендаций
   */
  calculatePriority(score, questionsAsked) {
    // Низкие баллы = высокий приоритет для обучения
    const scorePriority = 100 - score;
    // Больше вопросов = больше данных = выше приоритет
    const questionsPriority = Math.min(questionsAsked * 10, 50);
    
    return scorePriority + questionsPriority;
  }

  /**
   * Поиск курсов для конкретной компетенции
   */
  findCoursesForCompetency(competency, targetLevel, score) {
    const keywords = this.competencyKeywords[competency] || [];
    const levelKeywords = this.courseLevels[targetLevel] || [];

    // Поиск курсов по ключевым словам
    const matchedCourses = this.courses
      .map(course => {
        const searchText = (course.title + ' ' + course.description).toLowerCase();
        
        // Подсчет совпадений по компетенции
        const competencyMatches = keywords.filter(keyword => 
          searchText.includes(keyword.toLowerCase())
        ).length;

        // Подсчет совпадений по уровню
        const levelMatches = levelKeywords.filter(keyword =>
          searchText.includes(keyword.toLowerCase())
        ).length;

        // Общий скор релевантности
        const relevanceScore = (competencyMatches * 3) + (levelMatches * 2);

        return {
          ...course,
          relevanceScore,
          competencyMatches,
          levelMatches
        };
      })
      .filter(course => course.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Добавляем информацию о том, почему курс рекомендован
    return matchedCourses.map(course => ({
      ...course,
      recommendationReason: this.getRecommendationReason(score, targetLevel, course)
    }));
  }

  /**
   * Получить причину рекомендации курса
   */
  getRecommendationReason(score, level, course) {
    if (score < 40) {
      return `Начальный курс для освоения основ. Ваш текущий уровень: ${score}/100`;
    } else if (score < 70) {
      return `Курс для углубления знаний и перехода на продвинутый уровень. Текущий уровень: ${score}/100`;
    } else {
      return `Курс для экспертов, чтобы оставаться на передовой. Ваш уровень: ${score}/100`;
    }
  }

  /**
   * Получить человекочитаемое название компетенции
   */
  getCompetencyName(competency) {
    const names = {
      'graphic_design': 'Графический дизайн',
      'system_admin': 'Системное администрирование',
      'web_dev': 'Веб-разработка',
      'mobile_dev': 'Мобильная разработка',
      'data_science': 'Data Science',
      'devops': 'DevOps',
      'project_management': 'Управление проектами',
      'cybersecurity': 'Кибербезопасность',
      'cloud_computing': 'Облачные технологии',
      'programming': 'Программирование'
    };
    return names[competency] || competency;
  }

  /**
   * Получить топ курсов по всем компетенциям
   */
  getTopCourses(limit = 10) {
    // Возвращаем случайную выборку популярных курсов
    const shuffled = [...this.courses].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  /**
   * Поиск курсов по запросу
   */
  searchCourses(query, limit = 10) {
    const searchText = query.toLowerCase();
    
    return this.courses
      .filter(course => {
        const courseText = (course.title + ' ' + course.description).toLowerCase();
        return courseText.includes(searchText);
      })
      .slice(0, limit);
  }

  /**
   * Получить курсы по конкретной компетенции
   */
  getCoursesByCompetency(competency, limit = 5) {
    const keywords = this.competencyKeywords[competency] || [];
    
    return this.courses
      .map(course => {
        const searchText = (course.title + ' ' + course.description).toLowerCase();
        const matches = keywords.filter(keyword => 
          searchText.includes(keyword.toLowerCase())
        ).length;

        return { ...course, matches };
      })
      .filter(course => course.matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, limit);
  }

  /**
   * Получить персонализированные рекомендации с учетом роли
   */
  getPersonalizedRecommendations(testResults, userRole, preferences = {}) {
    const baseRecommendations = this.getRecommendations(testResults, userRole);

    // Добавляем фильтрацию по предпочтениям
    let filtered = baseRecommendations;

    if (preferences.focusAreas && preferences.focusAreas.length > 0) {
      // Приоритизируем определенные области
      filtered = filtered.map(rec => ({
        ...rec,
        priority: preferences.focusAreas.includes(rec.competency) 
          ? rec.priority * 1.5 
          : rec.priority
      })).sort((a, b) => b.priority - a.priority);
    }

    if (preferences.maxDuration) {
      // Фильтруем по длительности (если есть информация в описании)
      filtered = filtered.map(rec => ({
        ...rec,
        courses: rec.courses.filter(course => {
          // Простая эвристика - ищем упоминания сроков в описании
          const durationMatch = course.description?.match(/(\d+)\s*(месяц|недел)/i);
          if (!durationMatch) return true; // Если нет информации, включаем курс
          
          const duration = parseInt(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          
          const durationInMonths = unit.includes('недел') ? duration / 4 : duration;
          return durationInMonths <= preferences.maxDuration;
        })
      }));
    }

    return filtered;
  }

  /**
   * Получить статистику по курсам
   */
  getCoursesStats() {
    const categories = new Set();
    const providers = new Set();

    this.courses.forEach(course => {
      // Определяем категорию из URL
      const urlParts = course.link.split('/');
      const provider = urlParts[urlParts.length - 1].split('-')[0];
      providers.add(provider);

      // Определяем категорию из названия
      Object.entries(this.competencyKeywords).forEach(([comp, keywords]) => {
        const searchText = (course.title + ' ' + course.description).toLowerCase();
        if (keywords.some(kw => searchText.includes(kw.toLowerCase()))) {
          categories.add(comp);
        }
      });
    });

    return {
      totalCourses: this.courses.length,
      categories: Array.from(categories),
      providers: Array.from(providers),
      categoriesCount: categories.size,
      providersCount: providers.size
    };
  }
}

// Создаем экземпляр сервиса
const courseRecommendationService = new CourseRecommendationService();

export default courseRecommendationService;