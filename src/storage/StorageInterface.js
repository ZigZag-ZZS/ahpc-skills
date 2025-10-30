// src/storage/StorageInterface.js
class StorageInterface {
  async saveTestResults(results) {
    throw new Error('Method not implemented');
  }
  
  async getTestResults(testId) {
    throw new Error('Method not implemented');
  }
  
  async getUserResults(userIdentifier) {
    throw new Error('Method not implemented');
  }
  
  async getStatistics() {
    throw new Error('Method not implemented');
  }
  
  async getAllResults() {
    throw new Error('Method not implemented');
  }
}

export default StorageInterface;