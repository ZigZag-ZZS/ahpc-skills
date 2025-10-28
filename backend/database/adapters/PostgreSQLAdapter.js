const { Pool } = require('pg');
const BaseAdapter = require('./BaseAdapter');

class PostgreSQLAdapter extends BaseAdapter {
  constructor(config) {
    super();
    this.config = config;
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = new Pool(this.config);
      
      const client = await this.pool.connect();
      console.log('✅ PostgreSQL connected');
      client.release();
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 PostgreSQL disconnected');
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
    const result = await this.pool.query(
      'SELECT * FROM test_results ORDER BY completion_date DESC'
    );
    return this._parseTestScores(result.rows);
  }

  async getTestResultById(id) {
    const result = await this.pool.query(
      'SELECT * FROM test_results WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error('Test result not found');
    }
    return this._parseTestScores(result.rows)[0];
  }

  async getTestResultsByTestId(testId) {
    const result = await this.pool.query(
      'SELECT * FROM test_results WHERE test_id = $1 ORDER BY completion_date DESC',
      [testId]
    );
    return this._parseTestScores(result.rows);
  }

  async createTestResult(testData) {
    const scoreData = typeof testData.test_score === 'object'
      ? JSON.stringify(testData.test_score)
      : testData.test_score;

    const result = await this.pool.query(
      `INSERT INTO test_results 
      (full_name, user_type, test_id, test_score, completion_date) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING *`,
      [testData.full_name, testData.user_type, testData.test_id, scoreData]
    );

    return this._parseTestScores(result.rows)[0];
  }

  async updateTestResult(id, updateData) {
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

    await this.pool.query(
      `UPDATE test_results SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return await this.getTestResultById(id);
  }

  async deleteTestResult(id) {
    const result = await this.pool.query(
      'DELETE FROM test_results WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error('Test result not found');
    }
    return this._parseTestScores(result.rows)[0];
  }

  async getStatistics() {
    const result = await this.pool.query(`
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

module.exports = PostgreSQLAdapter;