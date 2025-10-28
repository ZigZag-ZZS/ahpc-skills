const DatabaseFactory = require('./DatabaseFactory');

class DatabaseManager {
  constructor() {
    this.adapter = null;
    this.isInitialized = false;
  }

  async initialize(dbType = null) {
    try {
      this.adapter = DatabaseFactory.createAdapter(dbType);
      await this.adapter.connect();
      this.isInitialized = true;
      
      console.log(`✅ Database initialized successfully`);
      return this.adapter;
    } catch (error) {
      console.error(`❌ Database initialization failed:`, error);
      throw error;
    }
  }

  async close() {
    if (this.adapter) {
      await this.adapter.disconnect();
      this.isInitialized = false;
    }
  }

  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  async getAllTestResults() {
    this._ensureInitialized();
    return await this.adapter.getAllTestResults();
  }

  async getTestResultById(id) {
    this._ensureInitialized();
    return await this.adapter.getTestResultById(id);
  }

  async getTestResultsByTestId(testId) {
    this._ensureInitialized();
    return await this.adapter.getTestResultsByTestId(testId);
  }

  async createTestResult(testData) {
    this._ensureInitialized();
    return await this.adapter.createTestResult(testData);
  }

  async updateTestResult(id, updateData) {
    this._ensureInitialized();
    return await this.adapter.updateTestResult(id, updateData);
  }

  async deleteTestResult(id) {
    this._ensureInitialized();
    return await this.adapter.deleteTestResult(id);
  }

  async getStatistics() {
    this._ensureInitialized();
    return await this.adapter.getStatistics();
  }

  async healthCheck() {
    if (!this.adapter) return false;
    return await this.adapter.healthCheck();
  }

  getAdapterType() {
    return this.adapter?.constructor.name || 'None';
  }
}

const dbManager = new DatabaseManager();

module.exports = dbManager;
module.exports.DatabaseManager = DatabaseManager;
module.exports.DatabaseFactory = DatabaseFactory;
