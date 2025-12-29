const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 * اتصال به MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    
    logger.info(`MongoDB متصل شد: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('خطای MongoDB:', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('اتصال MongoDB قطع شد');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('اتصال مجدد MongoDB برقرار شد');
    });

    return conn;
  } catch (error) {
    logger.error('خطا در اتصال به MongoDB:', { error: error.message });
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * قطع اتصال از MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('اتصال MongoDB بسته شد');
  } catch (error) {
    logger.error('خطا در بستن اتصال MongoDB:', { error: error.message });
  }
};

module.exports = { connectDB, disconnectDB };
