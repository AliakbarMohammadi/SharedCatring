const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json, splat } = winston.format;

/**
 * Custom format for console output
 */
const consoleFormat = printf(({ level, message, timestamp, service, requestId, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const reqId = requestId ? ` [${requestId}]` : '';
  return `${timestamp} [${service}] ${level}:${reqId} ${message}${metaStr}`;
});

/**
 * Create logger instance
 * @param {string} serviceName - Name of the service
 * @param {Object} options - Logger options
 * @returns {winston.Logger}
 */
const createLogger = (serviceName, options = {}) => {
  const {
    level = process.env.LOG_LEVEL || 'info',
    logDir = process.env.LOG_DIR || 'logs',
    enableConsole = true,
    enableFile = process.env.NODE_ENV === 'production',
    enableJson = process.env.NODE_ENV === 'production'
  } = options;

  const transports = [];

  // Console transport
  if (enableConsole) {
    transports.push(
      new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          splat(),
          consoleFormat
        )
      })
    );
  }

  // File transports for production
  if (enableFile) {
    const logPath = path.resolve(process.cwd(), logDir);

    // Error log file (rotated daily)
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: path.join(logPath, `${serviceName}-error-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: combine(timestamp(), json())
      })
    );

    // Combined log file (rotated daily)
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: path.join(logPath, `${serviceName}-combined-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: combine(timestamp(), json())
      })
    );
  }

  const logger = winston.createLogger({
    level,
    defaultMeta: { service: serviceName },
    format: combine(
      errors({ stack: true }),
      timestamp(),
      enableJson ? json() : consoleFormat
    ),
    transports,
    exitOnError: false
  });

  // Add helper methods
  logger.logRequest = function(req, res, duration) {
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    };

    if (res.statusCode >= 500) {
      this.error('درخواست HTTP - خطای سرور', logData);
    } else if (res.statusCode >= 400) {
      this.warn('درخواست HTTP - خطای کلاینت', logData);
    } else {
      this.info('درخواست HTTP', logData);
    }
  };

  logger.logError = function(error, context = {}) {
    this.error(error.message, {
      errorCode: error.errorCode,
      statusCode: error.statusCode,
      stack: error.stack,
      ...context
    });
  };

  logger.logEvent = function(eventName, data = {}) {
    this.info(`رویداد: ${eventName}`, { event: eventName, ...data });
  };

  return logger;
};

/**
 * Create child logger with additional context
 * @param {winston.Logger} logger - Parent logger
 * @param {Object} context - Additional context
 * @returns {winston.Logger}
 */
const createChildLogger = (logger, context) => {
  return logger.child(context);
};

module.exports = {
  createLogger,
  createChildLogger
};
