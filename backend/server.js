const express = require('express');
const cors = require('cors');
const dbManager = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Инициализация базы данных при старте
let dbInitialized = false;

async function initializeDatabase() {
  try {
    await dbManager.initialize();
    dbInitialized = true;
    console.log(`📊 Using ${dbManager.getAdapterType()} adapter`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Middleware для проверки инициализации БД
function requireDbInit(req, res, next) {
  if (!dbInitialized) {
    return res.status(503).json({
      success: false,
      error: 'Database not initialized'
    });
  }
  next();
}

// POST /api/test-results
app.post('/api/test-results', requireDbInit, async (req, res) => {
  const { full_name, user_type, test_id, test_score } = req.body;

  if (!full_name || !user_type || !test_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: full_name, user_type, test_id'
    });
  }

  try {
    const result = await dbManager.createTestResult({
      full_name,
      user_type,
      test_id,
      test_score
    });

    res.status(201).json({
      success: true,
      message: 'Test results saved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error saving results:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while saving results',
      details: error.message
    });
  }
});

// GET /api/test-results
app.get('/api/test-results', requireDbInit, async (req, res) => {
  try {
    const results = await dbManager.getAllTestResults();
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching results'
    });
  }
});

// GET /api/test-results/:id
app.get('/api/test-results/:id', requireDbInit, async (req, res) => {
  try {
    const result = await dbManager.getTestResultById(req.params.id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/test-results/user/:test_id
app.get('/api/test-results/user/:test_id', requireDbInit, async (req, res) => {
  try {
    const results = await dbManager.getTestResultsByTestId(req.params.test_id);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// GET /api/statistics
app.get('/api/statistics', requireDbInit, async (req, res) => {
  try {
    const stats = await dbManager.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await dbManager.healthCheck();
  
  res.json({
    status: dbHealth ? 'OK' : 'DB_DOWN',
    database: dbManager.getAdapterType(),
    timestamp: new Date().toISOString()
  });
});

// Запуск сервера
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at: http://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await dbManager.close();
  process.exit(0);
});