const mongoose = require('mongoose');
const logger = require('./logger');

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10
};

// Get MongoDB URI based on environment
const getMongoURI = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return process.env.MONGODB_URI;
    case 'test':
      return process.env.MONGODB_TEST_URI;
    default:
      return process.env.MONGODB_DEV_URI || 'mongodb://localhost:27017/app';
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = getMongoURI();
    await mongoose.connect(uri, mongoOptions);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// MongoDB event listeners
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing Mongoose connection:', error);
    process.exit(1);
  }
});

// Database monitoring
const monitorDB = () => {
  const stats = {
    collections: 0,
    documents: 0,
    indexes: 0,
    size: 0
  };

  return new Promise((resolve, reject) => {
    mongoose.connection.db.stats((err, result) => {
      if (err) {
        logger.error('Error getting database stats:', err);
        return reject(err);
      }

      stats.collections = result.collections;
      stats.documents = result.objects;
      stats.indexes = result.indexes;
      stats.size = result.dataSize;

      logger.info('Database stats:', stats);
      resolve(stats);
    });
  });
};

// Database health check
const checkDBHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return {
      status: 'healthy',
      latency: await measureDBLatency()
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Measure database latency
const measureDBLatency = async () => {
  const start = Date.now();
  await mongoose.connection.db.admin().ping();
  return Date.now() - start;
};

// Export database utilities
module.exports = {
  connectDB,
  monitorDB,
  checkDBHealth,
  measureDBLatency,
  mongoose
}; 