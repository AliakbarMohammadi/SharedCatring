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
    pool: config.database.pool,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`PostgreSQL متصل شد: ${config.database.host}:${config.database.port}`);
    
    if (config.env === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('مدل‌های دیتابیس همگام‌سازی شدند');
    }
    
    return sequelize;
  } catch (error) {
    logger.error('خطا در اتصال به PostgreSQL', { error: error.message });
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await sequelize.close();
    logger.info('اتصال PostgreSQL بسته شد');
  } catch (error) {
    logger.error('خطا در بستن اتصال PostgreSQL', { error: error.message });
  }
};

module.exports = { sequelize, connectDB, disconnectDB };
