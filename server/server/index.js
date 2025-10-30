// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data/testResults.json');

// Ensure data directory exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
    console.log('Created data file:', DATA_FILE);
  }
}

// Read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Error reading data file, returning empty array');
    return [];
  }
}

// Write data to JSON file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Generate test ID
function generateTestId() {
  return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Routes
app.post('/api/results', async (req, res) => {
  try {
    await ensureDataFile();
    const existingResults = await readData();
    const newResult = {
      ...req.body,
      id: generateTestId(),
      timestamp: new Date().toISOString()
    };
    
    existingResults.push(newResult);
    const success = await writeData(existingResults);
    
    if (success) {
      console.log('Results saved successfully, total tests:', existingResults.length);
      res.json({ success: true, testId: newResult.id });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save results' });
    }
  } catch (error) {
    console.error('Error saving results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/results/:testId', async (req, res) => {
  try {
    const results = await readData();
    const result = results.find(r => r.id === req.params.testId || r.test_id === req.params.testId);
    
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Results not found' });
    }
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user-results/:userIdentifier', async (req, res) => {
  try {
    const results = await readData();
    const userResults = results.filter(r => r.full_name === req.params.userIdentifier);
    res.json(userResults);
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/statistics', async (req, res) => {
  try {
    const results = await readData();
    
    if (results.length === 0) {
      return res.json({
        totalTests: 0,
        averageScore: 0,
        popularCompetencies: [],
        recentTests: []
      });
    }

    const competencyStats = {};
    results.forEach(result => {
      Object.entries(result.test_score?.competencyResults || {}).forEach(([comp, data]) => {
        if (!competencyStats[comp]) {
          competencyStats[comp] = { total: 0, count: 0, scores: [] };
        }
        competencyStats[comp].total += data.score;
        competencyStats[comp].count++;
        competencyStats[comp].scores.push(data.score);
      });
    });

    const popularCompetencies = Object.entries(competencyStats)
      .map(([comp, stats]) => ({
        competency: comp,
        averageScore: Math.round(stats.total / stats.count),
        testCount: stats.count,
        popularity: Math.round((stats.count / results.length) * 100)
      }))
      .sort((a, b) => b.testCount - a.testCount)
      .slice(0, 5);

    const statistics = {
      totalTests: results.length,
      averageScore: Math.round(results.reduce((sum, r) => sum + (r.test_score?.overallScore || 0), 0) / results.length),
      popularCompetencies,
      recentTests: results.slice(-5).reverse()
    };

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/all-results', async (req, res) => {
  try {
    const results = await readData();
    res.json(results);
  } catch (error) {
    console.error('Error fetching all results:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});