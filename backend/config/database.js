require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const databaseConfig = {
  // Тип базы данных: 'json', 'mysql', 'mariadb', 'postgresql'
  type: process.env.DB_TYPE || 'json',

  // Конфигурация для MySQL/MariaDB
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'polyskills',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // Конфигурация для PostgreSQL
  postgresql: {
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || 'polyskills',
    port: parseInt(process.env.PG_PORT) || 5432,
    max: 10,
    idleTimeoutMillis: 30000
  },

  // Конфигурация для JSON базы данных
  json: {
    path: process.env.JSON_DB_PATH || './data/db.json',
    backupEnabled: process.env.JSON_DB_BACKUP_ENABLED === 'true',
    backupInterval: parseInt(process.env.JSON_DB_BACKUP_INTERVAL) || 3600000
  }
};

module.exports = databaseConfig;