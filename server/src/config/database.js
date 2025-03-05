const mongoose = require('mongoose');
const { logger } = require('../middleware/errorHandler');

/**
 * MongoDB connection configuration
 */
function connectDB() {
  // Use either MONGODB_URI or MONGO_URI from environment variables
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dental-clinic';
  
  console.log('Attempting to connect to MongoDB at:', mongoURI);
  
  const options = {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    }
  };

  return mongoose.connect(mongoURI, options)
    .then(function() {
      logger.info('MongoDB connected successfully');
      
      // Ping the database to verify connection
      return mongoose.connection.db.admin().command({ ping: 1 });
    })
    .then(function() {
      logger.info('MongoDB connection verified - Database responded to ping');
      
      // Set up event listeners
      mongoose.connection.on('error', function(err) {
        logger.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', function() {
        logger.warn('MongoDB disconnected');
      });
      
      // Handle application termination
      process.on('SIGINT', function() {
        mongoose.connection.close()
          .then(function() {
            logger.info('MongoDB connection closed due to app termination');
            process.exit(0);
          });
      });
      
      return mongoose.connection;
    })
    .catch(function(error) {
      logger.error('MongoDB connection error:', error);
      console.error('MongoDB connection error details:', error);
      process.exit(1);
    });
}

module.exports = connectDB; 