const JsonAdapter = require('./adapters/JsonAdapter');
const MySQLAdapter = require('./adapters/MySQLAdapter');
const PostgreSQLAdapter = require('./adapters/PostgreSQLAdapter');
const databaseConfig = require('../config/database');

class DatabaseFactory {
  static createAdapter(type = null) {
    const dbType = (type || databaseConfig.type).toLowerCase();

    console.log(`🔧 Creating ${dbType.toUpperCase()} database adapter...`);

    switch (dbType) {
      case 'json':
        return new JsonAdapter(databaseConfig.json);

      case 'mysql':
      case 'mariadb':
        return new MySQLAdapter(databaseConfig.mysql);

      case 'postgresql':
      case 'postgres':
        return new PostgreSQLAdapter(databaseConfig.postgresql);

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  static getSupportedTypes() {
    return ['json', 'mysql', 'mariadb', 'postgresql'];
  }
}

module.exports = DatabaseFactory;