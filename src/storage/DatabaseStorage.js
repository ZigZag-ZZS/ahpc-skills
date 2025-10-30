// src/storage/DatabaseStorage.js
import StorageInterface from './StorageInterface';

class DatabaseStorage extends StorageInterface {
  constructor(apiUrl) {
    super();
    this.apiUrl = apiUrl || 'http://localhost:3001/api';
  }

  async makeApiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
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
      const response = await this.makeApiCall('/results', {
        method: 'POST',
        body: JSON.stringify(results)
      });
      
      return {
        success: true,
        id: response.testId
      };
    } catch (error) {
      console.error('Error saving to database:', error);
      // Fallback to localStorage if API is unavailable
      const jsonStorage = new (await import('./JsonStorage')).default();
      return await jsonStorage.saveTestResults(results);
    }
  }

  async getTestResults(testId) {
    try {
      return await this.makeApiCall(`/results/${testId}`);
    } catch (error) {
      console.error('Error fetching from database:', error);
      // Fallback to localStorage
      const jsonStorage = new (await import('./JsonStorage')).default();
      return await jsonStorage.getTestResults(testId);
    }
  }

  async getUserResults(userIdentifier) {
    try {
      return await this.makeApiCall(`/user-results/${encodeURIComponent(userIdentifier)}`);
    } catch (error) {
      console.error('Error fetching user results:', error);
      const jsonStorage = new (await import('./JsonStorage')).default();
      return await jsonStorage.getUserResults(userIdentifier);
    }
  }

  async getStatistics() {
    try {
      return await this.makeApiCall('/statistics');
    } catch (error) {
      console.error('Error fetching statistics:', error);
      const jsonStorage = new (await import('./JsonStorage')).default();
      return await jsonStorage.getStatistics();
    }
  }

  async getAllResults() {
    try {
      return await this.makeApiCall('/all-results');
    } catch (error) {
      console.error('Error fetching all results:', error);
      const jsonStorage = new (await import('./JsonStorage')).default();
      return await jsonStorage.getAllResults();
    }
  }
}

export default DatabaseStorage;