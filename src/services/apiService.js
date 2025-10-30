// src/services/apiService.js

/**
 * Сервис для работы с API и хранения результатов
 */
class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.storageType = process.env.REACT_APP_STORAGE_TYPE || 'json';
  }

  generateTestId() {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async makeApiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async saveTestResults(results) {
    try {
      if (this.storageType === 'database' || this.storageType === 'json') {
        // Отправляем на сервер
        const response = await this.makeApiCall('/results', {
          method: 'POST',
          body: JSON.stringify(results)
        });
        
        // Также сохраняем в localStorage для быстрого доступа
        this.saveToLocalStorage(results, response.testId);
        
        return { success: true, id: response.testId };
      } else {
        // Только localStorage (старый режим)
        return this.saveToLocalStorage(results);
      }
    } catch (error) {
      console.error('Error saving results:', error);
      // Fallback to localStorage if API is unavailable
      return this.saveToLocalStorage(results);
    }
  }

  saveToLocalStorage(results, testId = null) {
    try {
      const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
      const newResult = {
        ...results,
        id: testId || this.generateTestId(),
        timestamp: new Date().toISOString()
      };
      
      existingResults.push(newResult);
      localStorage.setItem('testResults', JSON.stringify(existingResults));
      localStorage.setItem('lastTestResults', JSON.stringify(results));
      
      console.log('Results saved to localStorage:', newResult);
      return { success: true, id: newResult.id };
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return { success: false, error: error.message };
    }
  }

  async getTestResults(testId) {
    try {
      // Сначала пробуем получить с сервера
      if (this.storageType === 'database' || this.storageType === 'json') {
        try {
          return await this.makeApiCall(`/results/${testId}`);
        } catch (apiError) {
          console.log('API unavailable, falling back to localStorage');
        }
      }
      
      // Fallback to localStorage
      const results = JSON.parse(localStorage.getItem('testResults') || '[]');
      return results.find(r => r.id === testId || r.test_id === testId) || null;
    } catch (error) {
      console.error('Error fetching results:', error);
      return null;
    }
  }

  async getUserResults(userIdentifier) {
    try {
      // Сначала пробуем получить с сервера
      if (this.storageType === 'database' || this.storageType === 'json') {
        try {
          return await this.makeApiCall(`/user-results/${encodeURIComponent(userIdentifier)}`);
        } catch (apiError) {
          console.log('API unavailable, falling back to localStorage');
        }
      }
      
      // Fallback to localStorage
      const results = JSON.parse(localStorage.getItem('testResults') || '[]');
      return results.filter(r => r.full_name === userIdentifier);
    } catch (error) {
      console.error('Error fetching user results:', error);
      return [];
    }
  }

  async getStatistics() {
    try {
      // Сначала пробуем получить с сервера
      if (this.storageType === 'database' || this.storageType === 'json') {
        try {
          return await this.makeApiCall('/statistics');
        } catch (apiError) {
          console.log('API unavailable, falling back to localStorage');
        }
      }
      
      // Fallback to localStorage
      const results = JSON.parse(localStorage.getItem('testResults') || '[]');
      
      if (results.length === 0) {
        return {
          totalTests: 0,
          averageScore: 0,
          popularCompetencies: [],
          recentTests: []
        };
      }

      const competencyStats = {};
      results.forEach(result => {
        Object.entries(result.test_score?.competencyResults || {}).forEach(([comp, data]) => {
          if (!competencyStats[comp]) {
            competencyStats[comp] = { total: 0, count: 0, scores: [] };
          }
          competencyStats[comp].total += data.score;
          competencyStats[comp].count++;
          competencyStats[comp].scores.push(data.score);
        });
      });

      const popularCompetencies = Object.entries(competencyStats)
        .map(([comp, stats]) => ({
          competency: comp,
          averageScore: Math.round(stats.total / stats.count),
          testCount: stats.count,
          popularity: Math.round((stats.count / results.length) * 100)
        }))
        .sort((a, b) => b.testCount - a.testCount)
        .slice(0, 5);

      return {
        totalTests: results.length,
        averageScore: Math.round(results.reduce((sum, r) => sum + r.test_score.overallScore, 0) / results.length),
        popularCompetencies,
        recentTests: results.slice(-5).reverse()
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalTests: 0,
        averageScore: 0,
        popularCompetencies: [],
        recentTests: []
      };
    }
  }
}

// Создаем экземпляр сервиса
const apiService = new ApiService();

export default apiService;