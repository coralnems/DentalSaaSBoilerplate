const mongoose = require('mongoose');
const { logger } = require('../middleware/errorHandler');

/**
 * MongoDB connection configuration
 */
const connectDB = async () => {
  try {
    // Use the MONGODB_URI from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic';
    
    console.log('Attempting to connect to MongoDB at:', mongoURI);
    
    const options = {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    };

    await mongoose.connect(mongoURI, options);
    
    logger.info('MongoDB connected successfully');
    
    // Ping the database to verify connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    logger.info('MongoDB connection verified - Database responded to ping');
    
    // Set up event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    console.error('MongoDB connection error details:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 