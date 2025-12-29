const winston = require('winston');
const path = require('path');
const config = require('../config');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Custom format for console output
 */
const consoleFormat = printf(({ level, message, timestamp, requestId, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const reqId = requestId ? ` [${requestId}]` : '';
  return `${timestamp} [${config.serviceName}] ${level}:${reqId} ${message}${metaStr}`;
});

/**
 * Create transports based on environment
 */
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    )
  })
);

// File transports (production only)
if (config.env === 'production') {
  const logDir = path.resolve(process.cwd(), config.logging.dir);

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: combine(timestamp(), json())
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: combine(timestamp(), json())
    })
  );
}

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level,
  defaultMeta: { service: config.serviceName },
  format: combine(
    errors({ stack: true }),
    timestamp()
  ),
  transports,
  exitOnError: false
});

module.exports = logger;
