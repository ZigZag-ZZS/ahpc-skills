const mysql = require('mysql2/promise');
const jsonDb = require('./jsonDb');

/**
 * Database Adapter Factory
 * Provides unified interface for different database types
 */
class DatabaseAdapter {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'json';
    this.connection = null;
    this.isInitialized = false;
  }

  /**
   * Initialize database connection based on DB_TYPE
   */
  async initialize() {
    console.log(`🔧 Initializing ${this.dbType.toUpperCase()} database...`);

    try {
      switch (this.dbType.toLowerCase()) {
        case 'json':
          await jsonDb.init();
          this.connection = jsonDb;
          break;

        case 'mariadb':
        case 'mysql':
          this.connection = await this._initializeMySQL();
          break;

        case 'postgresql':
          this.connection = await this._initializePostgreSQL();
          break;

        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      this.isInitialized = true;
      console.log(`✅ ${this.dbType.toUpperCase()} database initialized successfully`);
      
      return this.connection;
    } catch (error) {
      console.error(`❌ Error initializing ${this.dbType} database:`, error);
      throw error;
    }
  }

  /**
   * Initialize MySQL/MariaDB connection pool
   * @private
   */
  async _initializeMySQL() {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL/MariaDB connection established');
    connection.release();

    return pool;
  }

  /**
   * Initialize PostgreSQL connection
   * @private
   */
  async _initializePostgreSQL() {
    const { Pool } = require('pg');
    
    const pool = new Pool({
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT || 5432
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established');
    client.release();

    return pool;
  }

  // ==================== UNIFIED API ====================

  /**
   * Get all test results
   */
  async getAllTestResults() {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.getAllTestResults();
    } else if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
      const [rows] = await this.connection.execute(
        'SELECT * FROM test_results ORDER BY completion_date DESC'
      );
      return this._parseTestScores(rows);
    } else if (this.dbType === 'postgresql') {
      const result = await this.connection.query(
        'SELECT * FROM test_results ORDER BY completion_date DESC'
      );
      return this._parseTestScores(result.rows);
    }
  }

  /**
   * Get test result by ID
   */
  async getTestResultById(id) {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.getTestResultById(id);
    } else if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
      const [rows] = await this.connection.execute(
        'SELECT * FROM test_results WHERE id = ?',
        [id]
      );
      if (rows.length === 0) {
        throw new Error('Test result not found');
      }
      return this._parseTestScores(rows)[0];
    } else if (this.dbType === 'postgresql') {
      const result = await this.connection.query(
        'SELECT * FROM test_results WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        throw new Error('Test result not found');
      }
      return this._parseTestScores(result.rows)[0];
    }
  }

  /**
   * Get test results by test_id
   */
  async getTestResultsByTestId(testId) {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.getTestResultsByTestId(testId);
    } else if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
      const [rows] = await this.connection.execute(
        'SELECT * FROM test_results WHERE test_id = ? ORDER BY completion_date DESC',
        [testId]
      );
      return this._parseTestScores(rows);
    } else if (this.dbType === 'postgresql') {
      const result = await this.connection.query(
        'SELECT * FROM test_results WHERE test_id = $1 ORDER BY completion_date DESC',
        [testId]
      );
      return this._parseTestScores(result.rows);
    }
  }

  /**
   * Create new test result
   */
  async createTestResult(testData) {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.createTestResult(testData);
    } else if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
      const scoreData = typeof testData.test_score === 'object' 
        ? JSON.stringify(testData.test_score) 
        : testData.test_score;

      const [result] = await this.connection.execute(
        `INSERT INTO test_results 
        (full_name, user_type, test_id, test_score, completion_date) 
        VALUES (?, ?, ?, ?, NOW())`,
        [
          testData.full_name,
          testData.user_type,
          testData.test_id,
          scoreData
        ]
      );

      return {
        id: result.insertId,
        ...testData,
        completion_date: new Date().toISOString()
      };
    } else if (this.dbType === 'postgresql') {
      const scoreData = typeof testData.test_score === 'object' 
        ? JSON.stringify(testData.test_score) 
        : testData.test_score;

      const result = await this.connection.query(
        `INSERT INTO test_results 
        (full_name, user_type, test_id, test_score, completion_date) 
        VALUES ($1, $2, $3, $4, NOW()) 
        RETURNING *`,
        [
          testData.full_name,
          testData.user_type,
          testData.test_id,
          scoreData
        ]
      );

      return this._parseTestScores(result.rows)[0];
    }
  }

  /**
   * Update test result
   */
  async updateTestResult(id, updateData) {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.updateTestResult(id, updateData);
    } else if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(
            key === 'test_score' && typeof updateData[key] === 'object'
              ? JSON.stringify(updateData[key])
              : updateData[key]
          );
        }
      });

      values.push(id);

      await this.connection.execute(
        `UPDATE test_results SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getTestResultById(id);
    } else if (this.dbType === 'postgresql') {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updateData).forEach(key => {
        if (key !== 'id') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(
            key === 'test_score' && typeof updateData[key] === 'object'
              ? JSON.stringify(updateData[key])
              : updateData[key]
          );
          paramIndex++;
        }
      });

      values.push(id);

      await this.connection.query(
        `UPDATE test_results SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      );

      return await this.getTestResultById(id);
    }
  }

  /**
   * Delete test result
   */
  async deleteTestResult(id) {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.deleteTestResult(id);
    } else if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
      const result = await this.getTestResultById(id); // Get before delete
      await this.connection.execute('DELETE FROM test_results WHERE id = ?', [id]);
      return result;
    } else if (this.dbType === 'postgresql') {
      const result = await this.connection.query(
        'DELETE FROM test_results WHERE id = $1 RETURNING *',
        [id]
      );
      if (result.rows.length === 0) {
        throw new Error('Test result not found');
      }
      return this._parseTestScores(result.rows)[0];
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.getStatistics();
    } else if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
      const [stats] = await this.connection.execute(`
        SELECT 
          COUNT(*) as total_tests,
          COUNT(DISTINCT test_id) as unique_users,
          user_type,
          COUNT(*) as count_by_type
        FROM test_results
        GROUP BY user_type
      `);
      return { by_user_type: stats };
    } else if (this.dbType === 'postgresql') {
      const result = await this.connection.query(`
        SELECT 
          COUNT(*) as total_tests,
          COUNT(DISTINCT test_id) as unique_users,
          user_type,
          COUNT(*) as count_by_type
        FROM test_results
        GROUP BY user_type
      `);
      return { by_user_type: result.rows };
    }
  }

  /**
   * Parse test_score from JSON string to object
   * @private
   */
  _parseTestScores(rows) {
    return rows.map(row => ({
      ...row,
      test_score: typeof row.test_score === 'string'
        ? JSON.parse(row.test_score)
        : row.test_score
    }));
  }

  /**
   * Ensure database is initialized
   * @private
   */
  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  /**
   * Get database info
   */
  async getInfo() {
    this._ensureInitialized();

    if (this.dbType === 'json') {
      return await this.connection.getInfo();
    }

    return {
      type: this.dbType,
      connected: this.isInitialized
    };
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.connection) {
      if (this.dbType === 'mariadb' || this.dbType === 'mysql') {
        await this.connection.end();
      } else if (this.dbType === 'postgresql') {
        await this.connection.end();
      }
      console.log(`🔌 ${this.dbType.toUpperCase()} database connection closed`);
    }
  }
}

// Export singleton instance
const dbAdapter = new DatabaseAdapter();

module.exports = dbAdapter;
module.exports.DatabaseAdapter = DatabaseAdapter;