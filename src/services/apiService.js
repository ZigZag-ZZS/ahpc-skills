// src/services/apiService.js
import config from '../config/database';
import JsonStorage from '../storage/JsonStorage';
import DatabaseStorage from '../storage/DatabaseStorage';

/**
 * Сервис для работы с API и хранения результатов
 */
class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.storage = this.initializeStorage();
  }

  initializeStorage() {
    const storageType = config.storageType || 'json';
    
    console.log(`Initializing ${storageType} storage...`);
    
    switch (storageType) {
      case 'database':
        return new DatabaseStorage(this.baseUrl);
      case 'json':
      default:
        return new JsonStorage(config.json.filePath);
    }
  }

  generateTestId() {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async saveTestResults(results) {
    try {
      const saveResult = await this.storage.saveTestResults(results);
      console.log('Results saved via', config.storageType, ':', saveResult);
      return { success: true, id: saveResult.id };
    } catch (error) {
      console.error('Error saving results:', error);
      // В демо-режиме все равно возвращаем успех с локальным ID
      const localId = this.generateTestId();
      return { success: true, id: localId };
    }
  }

  async getTestResults(testId) {
    try {
      return await this.storage.getTestResults(testId);
    } catch (error) {
      console.error('Error fetching results:', error);
      return null;
    }
  }

  async getUserResults(userIdentifier) {
    try {
      return await this.storage.getUserResults(userIdentifier);
    } catch (error) {
      console.error('Error fetching user results:', error);
      return [];
    }
  }

  async getStatistics() {
    try {
      return await this.storage.getStatistics();
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

  // Метод для получения всех результатов (для админки)
  async getAllResults() {
    try {
      return await this.storage.getAllResults();
    } catch (error) {
      console.error('Error fetching all results:', error);
      return [];
    }
  }
}

// Создаем экземпляр сервиса
const apiService = new ApiService();

export default apiService;