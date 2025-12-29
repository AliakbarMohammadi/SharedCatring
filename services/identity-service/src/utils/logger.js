const winston = require('winston');
const path = require('path');
const config = require('../config');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let log = `${timestamp} [${service || config.serviceName}] ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: config.serviceName },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat)
    })
  ]
});

if (config.env === 'production') {
  logger.add(new winston.transports.File({
    filename: path.join(config.logging.dir, 'error.log'),
    level: 'error'
  }));
  logger.add(new winston.transports.File({
    filename: path.join(config.logging.dir, 'combined.log')
  }));
}

module.exports = logger;
