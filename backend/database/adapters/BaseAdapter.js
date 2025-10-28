class BaseAdapter {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    throw new Error('Method connect() must be implemented');
  }

  async disconnect() {
    throw new Error('Method disconnect() must be implemented');
  }

  async getAllTestResults() {
    throw new Error('Method getAllTestResults() must be implemented');
  }

  async getTestResultById(id) {
    throw new Error('Method getTestResultById() must be implemented');
  }

  async getTestResultsByTestId(testId) {
    throw new Error('Method getTestResultsByTestId() must be implemented');
  }

  async createTestResult(testData) {
    throw new Error('Method createTestResult() must be implemented');
  }

  async updateTestResult(id, updateData) {
    throw new Error('Method updateTestResult() must be implemented');
  }

  async deleteTestResult(id) {
    throw new Error('Method deleteTestResult() must be implemented');
  }

  async getStatistics() {
    throw new Error('Method getStatistics() must be implemented');
  }

  async healthCheck() {
    return this.isConnected;
  }
}

module.exports = BaseAdapter;