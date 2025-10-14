const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  /**
   * Сохранение результатов теста в базу данных
   * @param {Object} testData - Данные теста
   * @returns {Promise<Object>}
   */
  async saveTestResults(testData) {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения результатов');
      }

      return data;
    } catch (error) {
      console.error('Ошибка сохранения результатов теста:', error);
      throw error;
    }
  }

  /**
   * Получение всех результатов тестов
   * @returns {Promise<Array>}
   */
  async getAllTestResults() {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка получения результатов');
      }

      return data.data;
    } catch (error) {
      console.error('Ошибка получения результатов:', error);
      throw error;
    }
  }

  /**
   * Получение результата теста по ID
   * @param {number} id - ID записи
   * @returns {Promise<Object>}
   */
  async getTestResultById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Результат не найден');
      }

      return data.data;
    } catch (error) {
      console.error('Ошибка получения результата:', error);
      throw error;
    }
  }

  /**
   * Получение результатов по test_id пользователя
   * @param {string} testId - ID теста пользователя
   * @returns {Promise<Array>}
   */
  async getTestResultsByUserId(testId) {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/user/${testId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Результаты не найдены');
      }

      return data.data;
    } catch (error) {
      console.error('Ошибка получения результатов пользователя:', error);
      throw error;
    }
  }

  /**
   * Получение общей статистики
   * @returns {Promise<Object>}
   */
  async getStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка получения статистики');
      }

      return data.data;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  /**
   * Генерация уникального test_id
   * @returns {string}
   */
  generateTestId() {
    return `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Проверка состояния API
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('API недоступен:', error);
      return false;
    }
  }
}

// Экспорт singleton instance
const apiService = new APIService();
export default apiService;

// Экспорт класса
export { APIService };