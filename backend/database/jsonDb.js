const fs = require('fs').promises;
const path = require('path');

/**
 * JSON Database Handler
 * Provides file-based database functionality using JSON
 */
class JsonDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath || process.env.JSON_DB_PATH || './data/db.json';
    this.data = null;
    this.isInitialized = false;
    this.backupEnabled = process.env.JSON_DB_BACKUP_ENABLED === 'true';
    this.backupInterval = parseInt(process.env.JSON_DB_BACKUP_INTERVAL) || 3600000;
  }

  /**
   * Initialize database - create file if not exists with default structure
   */
  async init() {
    try {
      // Ensure data directory exists
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });

      // Check if database file exists
      try {
        await fs.access(this.dbPath);
        // File exists, load it
        await this.load();
      } catch (error) {
        // File doesn't exist, create with default structure
        this.data = this._getDefaultStructure();
        await this.save();
      }

      this.isInitialized = true;

      // Setup automatic backups if enabled
      if (this.backupEnabled) {
        this._startBackupSchedule();
      }

      console.log(`✅ JSON Database initialized at: ${this.dbPath}`);
      return true;
    } catch (error) {
      console.error('❌ Error initializing JSON database:', error);
      throw error;
    }
  }

  /**
   * Get default database structure
   * @private
   */
  _getDefaultStructure() {
    return {
      test_results: [],
      users: [],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      counters: {
        test_results: 0,
        users: 0
      }
    };
  }

  /**
   * Load database from file
   */
  async load() {
    try {
      const fileContent = await fs.readFile(this.dbPath, 'utf8');
      this.data = JSON.parse(fileContent);
      console.log('📖 JSON Database loaded successfully');
    } catch (error) {
      console.error('❌ Error loading JSON database:', error);
      throw error;
    }
  }

  /**
   * Save database to file
   */
  async save() {
    try {
      if (!this.data) {
        throw new Error('No data to save');
      }

      this.data.metadata.lastModified = new Date().toISOString();
      
      const jsonContent = JSON.stringify(this.data, null, 2);
      await fs.writeFile(this.dbPath, jsonContent, 'utf8');
      
      console.log('💾 JSON Database saved successfully');
    } catch (error) {
      console.error('❌ Error saving JSON database:', error);
      throw error;
    }
  }

  /**
   * Create backup of database
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.dbPath.replace('.json', `_backup_${timestamp}.json`);
      
      await fs.copyFile(this.dbPath, backupPath);
      console.log(`📦 Backup created: ${backupPath}`);
      
      return backupPath;
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Start automatic backup schedule
   * @private
   */
  _startBackupSchedule() {
    setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error);
      }
    }, this.backupInterval);

    console.log(`⏰ Automatic backups enabled (every ${this.backupInterval / 1000 / 60} minutes)`);
  }

  /**
   * Get next ID for a collection
   * @private
   */
  _getNextId(collection) {
    this.data.counters[collection] = (this.data.counters[collection] || 0) + 1;
    return this.data.counters[collection];
  }

  // ==================== TEST RESULTS OPERATIONS ====================

  /**
   * Get all test results
   */
  async getAllTestResults() {
    this._ensureInitialized();
    return this.data.test_results || [];
  }

  /**
   * Get test result by ID
   */
  async getTestResultById(id) {
    this._ensureInitialized();
    const result = this.data.test_results.find(r => r.id === parseInt(id));
    if (!result) {
      throw new Error('Test result not found');
    }
    return result;
  }

  /**
   * Get test results by test_id (user's test ID)
   */
  async getTestResultsByTestId(testId) {
    this._ensureInitialized();
    return this.data.test_results.filter(r => r.test_id === testId);
  }

  /**
   * Get test results by user type
   */
  async getTestResultsByUserType(userType) {
    this._ensureInitialized();
    return this.data.test_results.filter(r => r.user_type === userType);
  }

  /**
   * Create new test result
   */
  async createTestResult(testData) {
    this._ensureInitialized();

    const newResult = {
      id: this._getNextId('test_results'),
      full_name: testData.full_name,
      user_type: testData.user_type,
      test_id: testData.test_id,
      test_score: testData.test_score,
      completion_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    this.data.test_results.push(newResult);
    await this.save();

    return newResult;
  }

  /**
   * Update test result
   */
  async updateTestResult(id, updateData) {
    this._ensureInitialized();

    const index = this.data.test_results.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test result not found');
    }

    this.data.test_results[index] = {
      ...this.data.test_results[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    await this.save();
    return this.data.test_results[index];
  }

  /**
   * Delete test result
   */
  async deleteTestResult(id) {
    this._ensureInitialized();

    const index = this.data.test_results.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test result not found');
    }

    const deleted = this.data.test_results.splice(index, 1)[0];
    await this.save();

    return deleted;
  }

  // ==================== STATISTICS ====================

  /**
   * Get database statistics
   */
  async getStatistics() {
    this._ensureInitialized();

    const testResults = this.data.test_results;
    
    // Calculate statistics
    const totalTests = testResults.length;
    const uniqueUsers = new Set(testResults.map(r => r.test_id)).size;
    
    // Calculate average scores by user type
    const userTypeStats = {};
    testResults.forEach(result => {
      const userType = result.user_type;
      if (!userTypeStats[userType]) {
        userTypeStats[userType] = {
          user_type: userType,
          total_tests: 0,
          unique_users: new Set(),
          avg_score: 0,
          count_by_type: 0
        };
      }
      
      userTypeStats[userType].total_tests++;
      userTypeStats[userType].unique_users.add(result.test_id);
      userTypeStats[userType].count_by_type++;
      
      // Calculate average score if test_score has overallScore
      if (result.test_score && result.test_score.overallScore) {
        if (!userTypeStats[userType].scores) {
          userTypeStats[userType].scores = [];
        }
        userTypeStats[userType].scores.push(result.test_score.overallScore);
      }
    });

    // Calculate averages
    Object.keys(userTypeStats).forEach(userType => {
      const stats = userTypeStats[userType];
      stats.unique_users = stats.unique_users.size;
      
      if (stats.scores && stats.scores.length > 0) {
        stats.avg_score = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
      }
      
      delete stats.scores; // Remove temporary array
    });

    return {
      total_tests: totalTests,
      unique_users: uniqueUsers,
      by_user_type: Object.values(userTypeStats),
      database_size: JSON.stringify(this.data).length,
      last_test_date: testResults.length > 0 
        ? testResults[testResults.length - 1].completion_date 
        : null
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Search test results
   */
  async searchTestResults(query) {
    this._ensureInitialized();

    const lowerQuery = query.toLowerCase();
    return this.data.test_results.filter(result => 
      result.full_name.toLowerCase().includes(lowerQuery) ||
      result.test_id.toLowerCase().includes(lowerQuery) ||
      result.user_type.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get test results with pagination
   */
  async getTestResultsPaginated(page = 1, limit = 10) {
    this._ensureInitialized();

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const results = this.data.test_results.slice(startIndex, endIndex);
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: this.data.test_results.length,
        totalPages: Math.ceil(this.data.test_results.length / limit)
      }
    };
  }

  /**
   * Clear all test results (use with caution)
   */
  async clearAllTestResults() {
    this._ensureInitialized();
    
    // Create backup before clearing
    await this.createBackup();
    
    this.data.test_results = [];
    this.data.counters.test_results = 0;
    
    await this.save();
    
    console.log('🗑️ All test results cleared');
  }

  /**
   * Export database to JSON string
   */
  async exportToJson() {
    this._ensureInitialized();
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Import database from JSON string
   */
  async importFromJson(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      
      // Create backup before importing
      await this.createBackup();
      
      this.data = importedData;
      await this.save();
      
      console.log('📥 Database imported successfully');
    } catch (error) {
      console.error('❌ Error importing database:', error);
      throw error;
    }
  }

  /**
   * Ensure database is initialized
   * @private
   */
  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
  }

  /**
   * Get database info
   */
  async getInfo() {
    this._ensureInitialized();
    
    return {
      path: this.dbPath,
      version: this.data.metadata.version,
      createdAt: this.data.metadata.createdAt,
      lastModified: this.data.metadata.lastModified,
      collections: {
        test_results: this.data.test_results.length,
        users: this.data.users.length
      },
      size: JSON.stringify(this.data).length,
      backupEnabled: this.backupEnabled
    };
  }
}

// Export singleton instance
const jsonDb = new JsonDatabase();

module.exports = jsonDb;
module.exports.JsonDatabase = JsonDatabase;