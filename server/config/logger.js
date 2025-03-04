const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Create format for console and file logging
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  format
);

// Create file transports
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../logs/app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    fileTransport,
    errorFileTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  ],
  exitOnError: false
});

// Create stream for Morgan HTTP logging
logger.stream = {
  write: (message) => logger.http(message.trim())
};

module.exports = logger; 