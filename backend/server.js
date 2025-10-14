const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Создание пула соединений с базой данных
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

// Проверка подключения к базе данных
pool.getConnection()
  .then(connection => {
    console.log('✅ Успешное подключение к MariaDB');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к базе данных:', err);
  });

/**
 * POST /api/test-results
 * Сохранение результатов теста в базу данных
 */
app.post('/api/test-results', async (req, res) => {
  const { full_name, user_type, test_id, test_score } = req.body;

  // Валидация данных
  if (!full_name || !user_type || !test_id) {
    return res.status(400).json({
      success: false,
      error: 'Отсутствуют обязательные поля: full_name, user_type, test_id'
    });
  }

  try {
    // Преобразуем test_score в JSON строку если это объект
    const scoreData = typeof test_score === 'object' 
      ? JSON.stringify(test_score) 
      : test_score;

    const query = `
      INSERT INTO test_results 
      (full_name, user_type, test_id, test_score, completion_date) 
      VALUES (?, ?, ?, ?, NOW())
    `;

    const [result] = await pool.execute(query, [
      full_name,
      user_type,
      test_id,
      scoreData
    ]);

    res.status(201).json({
      success: true,
      message: 'Результаты теста успешно сохранены',
      data: {
        id: result.insertId,
        full_name,
        user_type,
        test_id
      }
    });
  } catch (error) {
    console.error('Ошибка сохранения результатов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при сохранении результатов',
      details: error.message
    });
  }
});

/**
 * GET /api/test-results
 * Получение всех результатов тестов
 */
app.get('/api/test-results', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM test_results ORDER BY completion_date DESC'
    );

    // Парсим JSON в test_score обратно в объект
    const results = rows.map(row => ({
      ...row,
      test_score: typeof row.test_score === 'string' 
        ? JSON.parse(row.test_score) 
        : row.test_score
    }));

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Ошибка получения результатов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении результатов'
    });
  }
});

/**
 * GET /api/test-results/:id
 * Получение результата теста по ID
 */
app.get('/api/test-results/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM test_results WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Результат теста не найден'
      });
    }

    const result = {
      ...rows[0],
      test_score: typeof rows[0].test_score === 'string'
        ? JSON.parse(rows[0].test_score)
        : rows[0].test_score
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Ошибка получения результата:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении результата'
    });
  }
});

/**
 * GET /api/test-results/user/:test_id
 * Получение результатов по test_id
 */
app.get('/api/test-results/user/:test_id', async (req, res) => {
  const { test_id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM test_results WHERE test_id = ? ORDER BY completion_date DESC',
      [test_id]
    );

    const results = rows.map(row => ({
      ...row,
      test_score: typeof row.test_score === 'string'
        ? JSON.parse(row.test_score)
        : row.test_score
    }));

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Ошибка получения результатов пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

/**
 * GET /api/statistics
 * Получение общей статистики
 */
app.get('/api/statistics', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tests,
        COUNT(DISTINCT test_id) as unique_users,
        AVG(JSON_EXTRACT(test_score, '$.overallScore')) as avg_score,
        user_type,
        COUNT(*) as count_by_type
      FROM test_results
      GROUP BY user_type
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 API доступен по адресу: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Остановка сервера...');
  await pool.end();
  process.exit(0);
});