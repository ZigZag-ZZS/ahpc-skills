// src/storage/JsonStorage.js
import StorageInterface from './StorageInterface';

class JsonStorage extends StorageInterface {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    // В браузере используем localStorage, путь файла игнорируем
    this.isBrowser = typeof window !== 'undefined';
  }

  async saveTestResults(results) {
    try {
      if (this.isBrowser) {
        // В браузере используем localStorage
        const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
        const newResult = {
          ...results,
          id: this.generateTestId(),
          timestamp: new Date().toISOString()
        };
        
        existingResults.push(newResult);
        localStorage.setItem('testResults', JSON.stringify(existingResults));
        localStorage.setItem('lastTestResults', JSON.stringify(results));
        
        return { 
          success: true, 
          id: newResult.id,
          result: newResult
        };
      } else {
        // На сервере можно реализовать запись в файл
        // Для демо просто возвращаем успех
        const testId = this.generateTestId();
        return { success: true, id: testId };
      }
    } catch (error) {
      console.error('Error saving to JSON storage:', error);
      return { success: false, error: error.message };
    }
  }

  async getTestResults(testId) {
    try {
      if (this.isBrowser) {
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        return results.find(r => r.id === testId || r.test_id === testId) || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching from JSON storage:', error);
      return null;
    }
  }

  async getUserResults(userIdentifier) {
    try {
      if (this.isBrowser) {
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        return results.filter(r => r.full_name === userIdentifier);
      }
      return [];
    } catch (error) {
      console.error('Error fetching user results:', error);
      return [];
    }
  }

  async getAllResults() {
    try {
      if (this.isBrowser) {
        return JSON.parse(localStorage.getItem('testResults') || '[]');
      }
      return [];
    } catch (error) {
      console.error('Error fetching all results:', error);
      return [];
    }
  }

  async getStatistics() {
    try {
      const results = await this.getAllResults();
      
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
        averageScore: Math.round(results.reduce((sum, r) => sum + (r.test_score?.overallScore || 0), 0) / results.length),
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

  generateTestId() {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export default JsonStorage;