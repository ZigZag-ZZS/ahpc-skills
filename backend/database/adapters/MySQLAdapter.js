const mysql = require('mysql2/promise');
const BaseAdapter = require('./BaseAdapter');

class MySQLAdapter extends BaseAdapter {
  constructor(config) {
    super();
    this.config = config;
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool(this.config);
      
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL/MariaDB connected');
      connection.release();
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ MySQL connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 MySQL disconnected');
    }
  }

  _parseTestScores(rows) {
    return rows.map(row => ({
      ...row,
      test_score: typeof row.test_score === 'string'
        ? JSON.parse(row.test_score)
        : row.test_score
    }));
  }

  async getAllTestResults() {
    const [rows] = await this.pool.execute(
      'SELECT * FROM test_results ORDER BY completion_date DESC'
    );
    return this._parseTestScores(rows);
  }

  async getTestResultById(id) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM test_results WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Test result not found');
    }
    return this._parseTestScores(rows)[0];
  }

  async getTestResultsByTestId(testId) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM test_results WHERE test_id = ? ORDER BY completion_date DESC',
      [testId]
    );
    return this._parseTestScores(rows);
  }

  async createTestResult(testData) {
    const scoreData = typeof testData.test_score === 'object'
      ? JSON.stringify(testData.test_score)
      : testData.test_score;

    const [result] = await this.pool.execute(
      `INSERT INTO test_results 
      (full_name, user_type, test_id, test_score, completion_date) 
      VALUES (?, ?, ?, ?, NOW())`,
      [testData.full_name, testData.user_type, testData.test_id, scoreData]
    );

    return {
      id: result.insertId,
      ...testData,
      completion_date: new Date().toISOString()
    };
  }

  async updateTestResult(id, updateData) {
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

    await this.pool.execute(
      `UPDATE test_results SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getTestResultById(id);
  }

  async deleteTestResult(id) {
    const result = await this.getTestResultById(id);
    await this.pool.execute('DELETE FROM test_results WHERE id = ?', [id]);
    return result;
  }

  async getStatistics() {
    const [stats] = await this.pool.execute(`
      SELECT 
        COUNT(*) as total_tests,
        COUNT(DISTINCT test_id) as unique_users,
        user_type,
        COUNT(*) as count_by_type
      FROM test_results
      GROUP BY user_type
    `);
    return { by_user_type: stats };
  }
}

module.exports = MySQLAdapter;