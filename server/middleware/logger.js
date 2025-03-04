const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for response time in a more readable format
morgan.token('response-time', (req, res) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const time = diff[0] * 1e3 + diff[1] * 1e-6;
  return time.toFixed(3);
});

// Custom format string
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Create different logger middleware for development and production
const developmentLogger = morgan('dev');
const productionLogger = morgan(morganFormat, { stream: accessLogStream });

// Export the appropriate logger based on environment
const logger = process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;

module.exports = logger; 