const fs = require('fs').promises;
const path = require('path');
const BaseAdapter = require('./BaseAdapter');

class JsonAdapter extends BaseAdapter {
  constructor(config) {
    super();
    this.dbPath = config.path;
    this.backupEnabled = config.backupEnabled;
    this.backupInterval = config.backupInterval;
    this.data = null;
  }

  async connect() {
    try {
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });

      try {
        await fs.access(this.dbPath);
        await this._load();
      } catch {
        this.data = this._getDefaultStructure();
        await this._save();
      }

      this.isConnected = true;

      if (this.backupEnabled) {
        this._startBackupSchedule();
      }

      console.log(`✅ JSON Database connected: ${this.dbPath}`);
      return true;
    } catch (error) {
      console.error('❌ JSON Database connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
    this.isConnected = false;
    console.log('🔌 JSON Database disconnected');
  }

  _getDefaultStructure() {
    return {
      test_results: [],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      counters: {
        test_results: 0
      }
    };
  }

  async _load() {
    const content = await fs.readFile(this.dbPath, 'utf8');
    this.data = JSON.parse(content);
  }

  async _save() {
    this.data.metadata.lastModified = new Date().toISOString();
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  async _createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = this.dbPath.replace('.json', `_backup_${timestamp}.json`);
    await fs.copyFile(this.dbPath, backupPath);
    console.log(`📦 Backup created: ${backupPath}`);
  }

  _startBackupSchedule() {
    setInterval(async () => {
      try {
        await this._createBackup();
      } catch (error) {
        console.error('❌ Backup failed:', error);
      }
    }, this.backupInterval);
  }

  _getNextId() {
    this.data.counters.test_results++;
    return this.data.counters.test_results;
  }

  async getAllTestResults() {
    return [...this.data.test_results].reverse();
  }

  async getTestResultById(id) {
    const result = this.data.test_results.find(r => r.id === parseInt(id));
    if (!result) {
      throw new Error('Test result not found');
    }
    return result;
  }

  async getTestResultsByTestId(testId) {
    return this.data.test_results
      .filter(r => r.test_id === testId)
      .reverse();
  }

  async createTestResult(testData) {
    const newResult = {
      id: this._getNextId(),
      full_name: testData.full_name,
      user_type: testData.user_type,
      test_id: testData.test_id,
      test_score: testData.test_score,
      completion_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    this.data.test_results.push(newResult);
    await this._save();

    return newResult;
  }

  async updateTestResult(id, updateData) {
    const index = this.data.test_results.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test result not found');
    }

    this.data.test_results[index] = {
      ...this.data.test_results[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    await this._save();
    return this.data.test_results[index];
  }

  async deleteTestResult(id) {
    const index = this.data.test_results.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test result not found');
    }

    const deleted = this.data.test_results.splice(index, 1)[0];
    await this._save();
    return deleted;
  }

  async getStatistics() {
    const results = this.data.test_results;
    const byUserType = {};

    results.forEach(r => {
      if (!byUserType[r.user_type]) {
        byUserType[r.user_type] = {
          user_type: r.user_type,
          count: 0,
          unique_users: new Set()
        };
      }
      byUserType[r.user_type].count++;
      byUserType[r.user_type].unique_users.add(r.test_id);
    });

    return {
      total_tests: results.length,
      unique_users: new Set(results.map(r => r.test_id)).size,
      by_user_type: Object.values(byUserType).map(stat => ({
        user_type: stat.user_type,
        count_by_type: stat.count,
        unique_users: stat.unique_users.size
      }))
    };
  }
}

module.exports = JsonAdapter;