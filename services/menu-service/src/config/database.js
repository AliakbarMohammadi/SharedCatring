const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info(`MongoDB متصل شد: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('خطا در اتصال به MongoDB', { error: error.message });
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('اتصال MongoDB قطع شد');
});

mongoose.connection.on('error', (err) => {
  logger.error('خطای MongoDB', { error: err.message });
});

module.exports = connectDB;
