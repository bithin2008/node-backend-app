const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { format } = require('winston');

// Define custom colors for different log levels
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  verbose: 'blue',
  debug: 'cyan'
};
// Register the custom colors with Winston
winston.addColors(customColors);

// Create a Winston logger instance with the desired transports
const logger = winston.createLogger({
  level: 'error',
  format: format.combine(
    format.colorize(), // Apply colors to the output
    format.json() // Use JSON format for logs
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.Console({
      format: format.simple(), // Use a simple format for console output
      level: 'debug'
    })
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Log unhandled promise rejections
process.on('unhandledRejection', (ex) => {
  throw ex;
});

// Log uncaught exceptions
process.on('uncaughtException', (ex) => {
  logger.error(`Uncaught Exception: ${ex.message}`, { error: ex });
});

module.exports = logger;
