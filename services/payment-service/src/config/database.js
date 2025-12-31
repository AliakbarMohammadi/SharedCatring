const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      timestamps: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`PostgreSQL متصل شد: ${config.database.host}:${config.database.port}`);
    
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('مدل‌های دیتابیس همگام‌سازی شدند');
    }
  } catch (error) {
    logger.error('خطا در اتصال به PostgreSQL', { error: error.message });
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
