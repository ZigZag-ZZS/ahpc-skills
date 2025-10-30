// src/config/database.js
const config = {
  storageType: process.env.REACT_APP_STORAGE_TYPE || 'json', // 'json' или 'database'
  database: {
    host: process.env.REACT_APP_DB_HOST || 'localhost',
    port: process.env.REACT_APP_DB_PORT || 5432,
    name: process.env.REACT_APP_DB_NAME || 'skills_assessment',
    user: process.env.REACT_APP_DB_USER || 'postgres',
    password: process.env.REACT_APP_DB_PASSWORD || 'password',
    dialect: process.env.REACT_APP_DB_DIALECT || 'postgres'
  },
  json: {
    filePath: process.env.REACT_APP_JSON_FILE_PATH || './data/testResults.json'
  }
};

export default config;